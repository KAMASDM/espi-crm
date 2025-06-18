import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import Loading from "../Common/Loading";
import { useAuth } from "../../context/AuthContext";
import {
  assessmentService,
  notificationService,
  userService,
} from "../../services/firestore";
import {
  INTAKES,
  COUNTRIES,
  CURRENCIES,
  COURSE_LEVELS,
  ASSESSMENT_STATUS,
  USER_ROLES,
} from "../../utils/constants";
import {
  useCourses,
  useDetailEnquiries,
  useEnquiries,
  useUniversities,
} from "../../hooks/useFirestore";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const AssessmentForm = ({
  onClose,
  onSuccess,
  editData = null,
  studentId = null,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({});
  const { user, userProfile } = useAuth();
  const { data: detailEnquiries } = useDetailEnquiries();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: enquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: universities, loading: universitiesLoading } =
    useUniversities();

  const [loading, setLoading] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [selectedEnquiryDetails, setSelectedEnquiryDetails] = useState(null);
  const [users, setUsers] = useState([]); // Added: state for all users

  const selectedEnquiryId = watch("enquiry");
  const selectedCountry = watch("student_country");
  const selectedUniversityId = watch("university");
  const selectedLevel = watch("level_applying_for");
  const selectedCourseId = watch("course_interested");
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAll();
        setUsers(fetchedUsers || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Could not load user data for notifications.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editData) {
      reset(editData);
      if (editData.enquiry && enquiries && !enquiriesLoading) {
        const initialEnquiry = enquiries.find(
          (enq) => enq.id === editData.enquiry
        );
        setSelectedEnquiryDetails(initialEnquiry);
      }
    } else {
      const initialEnquiryId = studentId || "";
      reset({
        enquiry: initialEnquiryId,
        student_country: "",
        university: "",
        level_applying_for: "",
        course_interested: "",
        intake_interested: "",
        specialisation: "",
        duration: "",
        course_link: "",
        application_fee: "",
        tution_fee: "",
        fee_currency: "",
        ass_status: "Pending",
        notes: "",
      });
      if (initialEnquiryId && enquiries) {
        const initialEnquiry = enquiries.find(
          (enq) => enq.id === initialEnquiryId
        );
        setSelectedEnquiryDetails(initialEnquiry);
      } else {
        setSelectedEnquiryDetails(null);
      }
    }
  }, [editData, studentId, reset, enquiries, enquiriesLoading]);

  useEffect(() => {
    if (universitiesLoading) return;

    if (selectedCountry) {
      const filtered = universities.filter(
        (uni) => uni.country === selectedCountry && uni.Active
      );
      setFilteredUniversities(filtered);
    } else {
      const activeUniversities = universities.filter((uni) => uni.Active);
      setFilteredUniversities(activeUniversities || []);
    }
  }, [selectedCountry, universities, universitiesLoading]);

  useEffect(() => {
    if (coursesLoading) return;

    const filtered = (courses || []).filter(
      (course) =>
        course.Active &&
        (!selectedUniversityId || course.university === selectedUniversityId) &&
        (!selectedLevel || course.course_levels === selectedLevel)
    );

    setFilteredCourses(filtered);
  }, [selectedUniversityId, selectedLevel, courses, coursesLoading]);

  useEffect(() => {
    if (selectedEnquiryId && enquiries) {
      const selectedEnquiry = enquiries.find(
        (enq) => enq.id === selectedEnquiryId
      );
      setSelectedEnquiryDetails(selectedEnquiry);

      if (selectedEnquiry) {
        if (
          selectedEnquiry.country_interested &&
          selectedEnquiry.country_interested.length > 0
        ) {
          setValue("student_country", selectedEnquiry.country_interested[0]);
        } else if (!watch("student_country")) {
          setValue("student_country", "");
        }

        if (selectedEnquiry.intake_interested) {
          setValue("intake_interested", selectedEnquiry.intake_interested);
        } else if (!watch("intake_interested")) {
          setValue("intake_interested", "");
        }
      }
    } else if (!selectedEnquiryId && !editData) {
      setValue("student_country", "");
      setValue("intake_interested", "");
      setSelectedEnquiryDetails(null);
    }
  }, [selectedEnquiryId, enquiries, setValue, editData, watch]);

  useEffect(() => {
    if (selectedUniversityId && universities) {
      const selectedUniversity = universities.find(
        (uni) => uni.id === selectedUniversityId
      );
      if (selectedUniversity?.Application_fee) {
        setValue("application_fee", selectedUniversity.Application_fee);
      }
    } else if (!selectedUniversityId && !editData) {
      setValue("application_fee", "");
    }
  }, [selectedUniversityId, universities, setValue]);

  useEffect(() => {
    if (selectedCourseId && courses) {
      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
      );
      if (selectedCourse) {
        setValue("specialisation", selectedCourse.specialisation_tag || "");
        setValue(
          "application_fee",
          selectedCourse.Application_fee || watch("application_fee")
        );
        setValue("tution_fee", selectedCourse.Yearly_Tuition_fee || "");
        setValue("fee_currency", selectedCourse.Application_fee_currency || "");
      }
    } else if (!selectedCourseId && !editData) {
      setValue("specialisation", "");
      setValue("tution_fee", "");
      setValue("fee_currency", "");
    }
  }, [selectedCourseId, courses, setValue, editData, watch]);
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
      const errorMsg = "EmailJS Public Key is not configured.";
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

  const onSubmit = async (dataFromForm) => {
    if (!user || !user.uid) {
      toast.error("Authentication Error. Please log in again.");
      return;
    }
    if (!selectedEnquiryDetails) {
      toast.error("Cannot proceed without student details.");
      return;
    }
    setLoading(true);
    try {
      const assessmentPayload = {
        ...dataFromForm,
        assigned_users: user.uid,
        branchId: selectedEnquiryDetails?.branchId || null,
        updatedAt: new Date(),
      };

      let assessmentId;
      if (editData && editData.id) {
        assessmentId = editData.id;
        await assessmentService.update(assessmentId, assessmentPayload);
        toast.success("Assessment updated successfully!");
      } else {
        assessmentId = await assessmentService.create(assessmentPayload);
        toast.success("Assessment created successfully!");
      }
      const studentFullName = `${
        selectedEnquiryDetails.student_First_Name || ""
      } ${selectedEnquiryDetails.student_Last_Name || ""}`.trim();

      const notificationTitle = editData
        ? "Assessment Updated"
        : "New Assessment Created";
      const notificationBody = editData
        ? `Assessment for ${studentFullName} has been updated by ${userProfile.displayName}.`
        : `A new assessment for ${studentFullName} has been created by ${userProfile.displayName}.`;
      const notificationLink = `/assessments/${assessmentId}/details`;

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

      const studentBranchId = selectedEnquiryDetails?.branchId;
      if (studentBranchId) {
        const branchAdmin = users.find(
          (u) =>
            u.role === USER_ROLES.BRANCH_ADMIN &&
            u.branchId === studentBranchId &&
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
          "assessment",
          notificationLink
        );
      }

      const finalEmailRecipients = Array.from(emailRecipients.values());
      if (finalEmailRecipients.length > 0) {
        const templateParams = {
          actionText: notificationTitle,
          bodyText: notificationBody,
          studentName: studentFullName,
          enquiryId: assessmentId,
          link: `${window.location.origin}${notificationLink}`,
        };
        await Promise.all(
          finalEmailRecipients.map((recipient) =>
            sendEmailNotification(recipient, templateParams)
          )
        );
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.log("error", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  function getEnquiriesWithDetailEnquiry(enquiries, detailEnquiries) {
    const detailEnquiryIds = new Set();
    if (detailEnquiries) {
      detailEnquiries.forEach((detail) => {
        if (detail.Current_Enquiry) {
          detailEnquiryIds.add(detail.Current_Enquiry);
        }
      });
    }
    const filteredEnquiryOptions = [];
    if (enquiries) {
      enquiries.forEach((enquiry) => {
        if (detailEnquiryIds.has(enquiry.id)) {
          let fullName = "";
          if (enquiry.student_First_Name && enquiry.student_Last_Name) {
            fullName = `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`;
          } else if (enquiry.student_First_Name) {
            fullName = enquiry.student_First_Name;
          } else if (enquiry.student_Last_Name) {
            fullName = enquiry.student_Last_Name;
          }
          filteredEnquiryOptions.push({
            id: enquiry.id,
            fullName: fullName,
          });
        }
      });
    }
    return filteredEnquiryOptions;
  }

  const enquiriesForDropdown = getEnquiriesWithDetailEnquiry(
    enquiries,
    detailEnquiries
  );

  if (enquiriesLoading || universitiesLoading || coursesLoading) {
    return <Loading size="default" />;
  }

  const renderDetail = (label, value) => {
    if (!value) return null;
    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    } else if (value instanceof Date) {
      displayValue = value.toLocaleDateString();
    } else if (
      typeof value === "object" &&
      value.seconds &&
      value.nanoseconds
    ) {
      const date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
      displayValue = date.toLocaleDateString();
    }
    return (
      <div className="py-2 px-4">
        <p className="text-sm text-gray-800 break-words">
          <span className="font-semibold">{label}:</span> {displayValue}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {selectedEnquiryDetails && (
        <div className="md:w-1/3 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Student Details
              </h3>
            </div>
            <div className="space-y-4 p-2">
              <div className="bg-gray-50 rounded-lg shadow-sm">
                <div className="p-3 border-b border-gray-200 bg-gray-100">
                  <h4 className="text-md font-medium text-gray-800">
                    Personal Information
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {renderDetail(
                    "First Name",
                    selectedEnquiryDetails.student_First_Name
                  )}
                  {renderDetail(
                    "Last Name",
                    selectedEnquiryDetails.student_Last_Name
                  )}
                  {renderDetail(
                    "Passport",
                    selectedEnquiryDetails.student_passport
                  )}
                  {renderDetail(
                    "Enquiry Status",
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEnquiryDetails.enquiry_status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : selectedEnquiryDetails.enquiry_status ===
                            "Follow Up"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedEnquiryDetails.enquiry_status ===
                            "Converted"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedEnquiryDetails.enquiry_status}
                    </span>
                  )}
                  {renderDetail(
                    "Source of Enquiry",
                    selectedEnquiryDetails.Source_Enquiry
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-100">
                  <h4 className="text-md font-medium text-gray-800">
                    Contact Information
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {renderDetail("Phone", selectedEnquiryDetails.student_phone)}
                  {renderDetail(
                    "Alternate Phone",
                    selectedEnquiryDetails.alternate_phone
                  )}
                  {renderDetail(
                    "Email",
                    <a
                      href={`mailto:${selectedEnquiryDetails.student_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedEnquiryDetails.student_email}
                    </a>
                  )}
                  {renderDetail(
                    "Address",
                    selectedEnquiryDetails.student_address
                  )}
                  {renderDetail("City", selectedEnquiryDetails.student_city)}
                  {renderDetail("State", selectedEnquiryDetails.student_state)}
                  {renderDetail(
                    "Country",
                    selectedEnquiryDetails.student_country
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-100">
                  <h4 className="text-md font-medium text-gray-800">
                    Education & Interest
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {renderDetail(
                    "Current Education",
                    selectedEnquiryDetails.current_education
                  )}
                  {renderDetail(
                    "Interested Services",
                    selectedEnquiryDetails.Interested_Services
                  )}
                  {renderDetail(
                    "Countries Interested",
                    selectedEnquiryDetails.country_interested
                  )}
                  {renderDetail(
                    "Intake Interested",
                    selectedEnquiryDetails.intake_interested
                  )}
                  {renderDetail(
                    "University",
                    universities.find(
                      (uni) =>
                        uni.id === selectedEnquiryDetails.university_interested
                    )?.univ_name
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${
          selectedEnquiryDetails ? "md:w-2/3" : "md:w-full"
        } space-y-6 flex flex-col`}
      >
        <div className="flex-grow overflow-y-auto pr-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Student & Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  {...register("enquiry", {
                    required: "Student selection is required",
                  })}
                  className="input-field"
                  disabled={!!studentId || !!editData}
                >
                  <option value="">Select Student</option>
                  {enquiriesForDropdown.map((enquiry) => (
                    <option key={enquiry.id} value={enquiry.id}>
                      {enquiry.fullName}
                    </option>
                  ))}
                </select>
                {errors.enquiry && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.enquiry.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country of Interest *
                </label>
                <select
                  {...register("student_country", {
                    required: "Country is required",
                  })}
                  className="input-field"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.student_country && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.student_country.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University *
                </label>
                <select
                  {...register("university", {
                    required: "University is required",
                  })}
                  className="input-field"
                >
                  <option value="">Select University</option>
                  {filteredUniversities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.univ_name}
                    </option>
                  ))}
                </select>
                {errors.university && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.university.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level Applying For *
                </label>
                <select
                  {...register("level_applying_for", {
                    required: "Level is required",
                  })}
                  className="input-field"
                >
                  <option value="">Select Level</option>
                  {COURSE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.level_applying_for && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.level_applying_for.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  {...register("course_interested")}
                  className="input-field"
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intake Interested
                </label>
                <select
                  {...register("intake_interested")}
                  className="input-field"
                >
                  <option value="">Select Intake</option>
                  {INTAKES.map((intake) => (
                    <option key={intake.name} value={intake.name}>
                      {intake.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-4">
              Course Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  {...register("specialisation")}
                  className="input-field"
                  placeholder="e.g., Computer Science, Data Analytics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  {...register("duration")}
                  className="input-field"
                  placeholder="e.g., 2 years, 18 months"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Link
                </label>
                <input
                  type="url"
                  {...register("course_link")}
                  className="input-field"
                  placeholder="https://university.edu/course"
                />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-4">
              Financial Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Fee
                </label>
                <input
                  type="text"
                  {...register("application_fee")}
                  className="input-field"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuition Fee
                </label>
                <input
                  type="text"
                  {...register("tution_fee")}
                  className="input-field"
                  placeholder="e.g., 25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Currency
                </label>
                <select {...register("fee_currency")} className="input-field">
                  <option value="">Select Currency</option>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-4">
              Assessment Status & Notes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select {...register("ass_status")} className="input-field">
                  <option value="">Select Status</option>
                  {ASSESSMENT_STATUS.map((status) => (
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
                  placeholder="Add detailed assessment notes, recommendations, eligibility analysis, etc..."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-auto">
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
    </div>
  );
};

export default AssessmentForm;
