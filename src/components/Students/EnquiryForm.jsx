import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import {
  INTAKES,
  COUNTRIES,
  USER_ROLES,
  INDIAN_STATES,
  ENQUIRY_STATUS,
  ENQUIRY_SOURCES,
  EDUCATION_LEVELS,
} from "../../utils/constants";
import {
  userService,
  branchService,
  enquiryService,
  notificationService,
} from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import { useServices, useUniversities } from "../../hooks/useFirestore";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const EnquiryForm = ({
  onClose,
  onSuccess,
  editData = null,
  allUsers = [],
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: editData || {},
  });
  const { user, userProfile } = useAuth();
  const { data: services } = useServices();
  const { data: universities } = useUniversities();
  const [users, setUsers] = useState(allUsers);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [filteredUniversities, setFilteredUniversities] = useState([]);

  const selectedBranchId = watch("branchId");
  const selectedCountries = watch("country_interested");

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setBranchesLoading(true);
        const fetchedBranches = await branchService.getAll();
        setBranches(fetchedBranches || []);
        setBranchesLoading(false);
      } catch (error) {
        console.log("error", error);
      }

      if (allUsers.length === 0) {
        try {
          setUsersLoading(true);
          const fetchedUsers = await userService.getAll();
          setUsers(fetchedUsers || []);
          setUsersLoading(false);
        } catch (error) {
          console.log("error", error);
        }
      } else {
        setUsersLoading(false);
        setUsers(allUsers);
      }
    };

    fetchReferenceData();
  }, [allUsers]);

  useEffect(() => {
    if (userProfile && !editData) {
      if (userProfile.branchId && userProfile.role !== USER_ROLES.SUPERADMIN) {
        setValue("branchId", userProfile.branchId);
      }
      setValue("assignedUserId", userProfile.uid);
    } else if (editData) {
      Object.keys(editData).forEach((key) => {
        setValue(key, editData[key]);
      });
    }
  }, [userProfile, editData, setValue]);

  useEffect(() => {
    if (selectedCountries && selectedCountries.length > 0) {
      const filtered = universities.filter((uni) =>
        selectedCountries.includes(uni.country)
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities([]);
    }
  }, [selectedCountries, universities]);

  const sendEmailNotification = async (recipient, templateParams) => {
    if (!recipient.email) {
      console.warn(
        `Skipping email for ${
          recipient.displayName || "user"
        } as they have no email address.`
      );
      return;
    }

    if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" || !EMAILJS_PUBLIC_KEY) {
      const errorMsg =
        "EmailJS Public Key is not configured. Please update it in EnquiryForm.jsx.";
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    try {
      const emailParams = {
        ...templateParams,
        recipient_email: recipient.email,
        recipientName: recipient.displayName || "Admin",
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      toast.error(
        `Failed to send email to ${recipient.displayName}. Details: ${
          error.text || error.message
        }`
      );
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const enquiryData = {
        ...data,
        branchId: data.branchId || userProfile?.branchId,
        assignedUserId: data.assignedUserId || userProfile?.uid,
        assigned_users: data.assignedUserId || userProfile?.uid,
        createdBy: user.uid,
        updatedAt: new Date(),
      };

      if (!user || !user.uid) {
        throw new Error("Authentication error: User not logged in.");
      }
      if (
        !enquiryData.branchId &&
        userProfile?.role !== USER_ROLES.SUPERADMIN
      ) {
        throw new Error("Please assign the enquiry to a branch.");
      }

      let enquiryId;
      if (editData) {
        enquiryId = editData.id;
        await enquiryService.update(enquiryId, enquiryData);
        toast.success("Enquiry updated successfully!");
      } else {
        enquiryId = await enquiryService.create(enquiryData);
        toast.success("Enquiry created successfully!");
      }

      const studentFullName = `${data.student_First_Name || ""} ${
        data.student_Last_Name || ""
      }`.trim();
      const notificationTitle = editData
        ? "Enquiry Updated"
        : "New Enquiry Created";
      const notificationBody = editData
        ? `Enquiry for ${studentFullName} has been updated by ${userProfile.displayName}.`
        : `A new enquiry for ${studentFullName} has been created by ${userProfile.displayName}.`;
      const notificationLink = `/students/${enquiryId}/details`;

      const notificationRecipientIds = new Set();
      const emailRecipients = new Map();

      const superadmins = users.filter(
        (u) =>
          u.role === USER_ROLES.SUPERADMIN && u.isActive && u.id !== user.uid
      );
      superadmins.forEach((sa) => {
        notificationRecipientIds.add(sa.id);
        if (!emailRecipients.has(sa.id)) emailRecipients.set(sa.id, sa);
      });

      if (enquiryData.branchId) {
        const branchAdmin = users.find(
          (u) =>
            u.role === USER_ROLES.BRANCH_ADMIN &&
            u.branchId === enquiryData.branchId &&
            u.isActive &&
            u.id !== user.uid
        );
        if (branchAdmin) {
          notificationRecipientIds.add(branchAdmin.id);
          if (!emailRecipients.has(branchAdmin.id))
            emailRecipients.set(branchAdmin.id, branchAdmin);
        }
      }

      const finalRecipientIds = Array.from(notificationRecipientIds);
      if (finalRecipientIds.length > 0) {
        await notificationService.send(
          notificationTitle,
          notificationBody,
          finalRecipientIds,
          "enquiry",
          notificationLink
        );
      }

      const finalEmailRecipients = Array.from(emailRecipients.values());
      if (finalEmailRecipients.length > 0) {
        const templateParams = {
          actionText: notificationTitle,
          bodyText: notificationBody,
          studentName: studentFullName,
          enquiryId: enquiryId,
          link: `${window.location.origin}${notificationLink}`,
        };

        await Promise.all(
          finalEmailRecipients.map((recipient) =>
            sendEmailNotification(recipient, templateParams)
          )
        );
      } else {
        console.log("No notification recipients found.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableUsers = () => {
    if (!users || users.length === 0) return [];
    if (userProfile?.role === USER_ROLES.SUPERADMIN) {
      if (selectedBranchId) {
        return users.filter(
          (user) =>
            user.isActive &&
            (user.branchId === selectedBranchId ||
              user.role === USER_ROLES.SUPERADMIN)
        );
      }
      return users.filter((user) => user.isActive);
    } else if (userProfile?.branchId) {
      return users.filter(
        (user) =>
          user.isActive &&
          (user.branchId === userProfile.branchId ||
            user.role === USER_ROLES.SUPERADMIN)
      );
    }
    return users.filter((user) => user.isActive);
  };

  const getAvailableBranches = () => {
    if (!branches || branches.length === 0) return [];
    if (
      userProfile?.role === USER_ROLES.SUPERADMIN ||
      userProfile?.role === USER_ROLES.AGENT
    ) {
      return branches.filter((branch) => branch.isActive);
    } else if (userProfile?.branchId) {
      return branches.filter(
        (branch) => branch.isActive && branch.id === userProfile.branchId
      );
    }
    return [];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Assignment Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(userProfile?.role === USER_ROLES.SUPERADMIN ||
            userProfile?.role === USER_ROLES.AGENT) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch{" "}
                {userProfile?.role !== USER_ROLES.SUPERADMIN
                  ? "*"
                  : "(Optional)"}
              </label>

              <select
                {...register("branchId", {
                  required:
                    userProfile?.role !== USER_ROLES.SUPERADMIN
                      ? "Branch is required"
                      : false,
                })}
                className="input-field"
                disabled={
                  branchesLoading ||
                  (userProfile?.role !== USER_ROLES.SUPERADMIN &&
                    userProfile?.role !== USER_ROLES.AGENT)
                }
              >
                <option value="">
                  {userProfile?.role === USER_ROLES.SUPERADMIN
                    ? "Select Branch (Optional)"
                    : userProfile?.role === USER_ROLES.AGENT
                    ? "Select Branch"
                    : "Loading..."}
                </option>
                {getAvailableBranches().map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName ||
                      branch.name ||
                      `Branch ${branch.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>

              {errors.branchId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.branchId.message}
                </p>
              )}
              {userProfile?.role === USER_ROLES.AGENT ? (
                <p className="text-xs text-gray-500 mt-1">
                  Select the branch this enquiry belongs to.
                </p>
              ) : (
                userProfile?.role !== USER_ROLES.SUPERADMIN && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enquiry will be assigned to your branch.
                  </p>
                )
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To *
            </label>

            <select
              {...register("assignedUserId", {
                required: "Please assign this enquiry to someone",
              })}
              className="input-field"
              disabled={usersLoading}
              value={
                userProfile?.role === USER_ROLES.SUPERADMIN
                  ? watch("assignedUserId")
                  : userProfile?.uid || ""
              }
              onChange={
                userProfile?.role === USER_ROLES.SUPERADMIN
                  ? (e) => setValue("assignedUserId", e.target.value)
                  : () => {}
              }
            >
              {userProfile?.role === USER_ROLES.SUPERADMIN ? (
                <>
                  <option value="">Select User</option>
                  {getAvailableUsers().map((user, index) => (
                    <option key={index} value={user.id || user.uid}>
                      {user.displayName || user.email}
                      {user.role && ` (${user.role})`}
                    </option>
                  ))}
                </>
              ) : (
                <option value={userProfile?.uid}>
                  {userProfile?.displayName || userProfile?.email}
                  {userProfile?.role && ` (${userProfile?.role})`}
                </option>
              )}
            </select>

            {errors.assignedUserId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.assignedUserId.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              {...register("student_First_Name", {
                required: "First name is required",
              })}
              className="input-field"
            />
            {errors.student_First_Name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.student_First_Name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              {...register("student_Last_Name", {
                required: "Last name is required",
              })}
              className="input-field"
            />
            {errors.student_Last_Name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.student_Last_Name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport Number
            </label>
            <input
              type="text"
              {...register("student_passport")}
              className="input-field"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enquiry Source
            </label>
            <select {...register("Source_Enquiry")} className="input-field">
              {ENQUIRY_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register("student_phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
              className="input-field"
            />
            {errors.student_phone && (
              <p className="text-red-600 text-sm mt-1">
                {errors.student_phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              {...register("alternate_phone")}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              {...register("student_email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email address",
                },
              })}
              className="input-field"
            />
            {errors.student_email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.student_email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select {...register("student_country")} className="input-field">
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select {...register("student_state")} className="input-field">
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              {...register("student_city")}
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register("student_address")}
              rows={3}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Education & Interest
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Education *
            </label>
            <select
              {...register("current_education", {
                required: "Current education is required",
              })}
              className="input-field"
            >
              <option value="">Select Education Level</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.current_education && (
              <p className="text-red-600 text-sm mt-1">
                {errors.current_education.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intake Interested
            </label>
            <select {...register("intake_interested")} className="input-field">
              <option value="">Select Intake</option>
              {INTAKES.map((intake) => (
                <option key={intake.name} value={intake.name}>
                  {intake.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Countries Interested *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg">
              {COUNTRIES.map((country) => (
                <label key={country.code} className="flex items-center">
                  <input
                    type="checkbox"
                    value={country.code}
                    {...register("country_interested", {
                      required: "Please select at least one country",
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">{country.name}</span>
                </label>
              ))}
            </div>
            {errors.country_interested && (
              <p className="text-red-600 text-sm mt-1">
                {errors.country_interested.message}
              </p>
            )}
          </div>

          {filteredUniversities.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University Interested
              </label>
              <select
                {...register("university_interested")}
                className="input-field"
              >
                <option value="">Select University</option>
                {filteredUniversities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.univ_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services Interested
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg">
              {services
                .filter((service) => service.isActive)
                .map(({ serviceName, servicePrice }, index) => (
                  <label
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        value={serviceName}
                        {...register("Interested_Services", {
                          required: "Please select at least one service",
                        })}
                        className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-2"
                      />
                      <span className="text-sm">{serviceName}</span>
                    </div>
                    {/* <span className="text-sm text-gray-500">
                      (₹{servicePrice.toLocaleString()})
                    </span> */}
                  </label>
                ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("coaching_interested")}
                className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Coaching Interested
              </span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Status Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select {...register("enquiry_status")} className="input-field">
              {ENQUIRY_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="input-field"
              placeholder="Add any additional notes about the enquiry..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          <X size={16} className="inline mr-1" />
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Save size={16} className="inline mr-1" />
          {loading ? "Saving..." : editData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default EnquiryForm;
