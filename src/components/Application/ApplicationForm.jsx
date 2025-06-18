import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { Upload, FileText, X, Save } from "lucide-react";
import Loading from "../Common/Loading";
import app, { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { useApplicationStatus, useAssessments } from "../../hooks/useFirestore";
import { APPLICATION_STATUS, USER_ROLES } from "../../utils/constants";
import {
  applicationService,
  notificationService,
  userService,
} from "../../services/firestore";
import {
  ref,
  getStorage,
  deleteObject,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const FILE_FIELD_NAMES = [
  "passport",
  "diploma_marksheet",
  "bachelor_marksheet",
  "master_marksheet",
  "ielts",
  "toefl",
  "gre",
  "gmat",
  "pte",
  "sop",
  "cv",
  "work_experience",
  "other_documents",
];

const ApplicationForm = ({
  onClose,
  onSuccess,
  editData = null,
  studentId = null,
}) => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const { user, userProfile } = useAuth();
  const storage = getStorage(app);
  const [loading, setLoading] = useState(false);
  const [enquiriesData, setEnquiriesData] = useState([]);
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
  const [users, setUsers] = useState([]);
  const { data: applicationStatuses } = useApplicationStatus();
  const selectedAssessmentId = watch("assessmentId");
  const selectedAssessment = assessments?.find(
    (ass) => ass.id === selectedAssessmentId
  );
  const [filesToUpload, setFilesToUpload] = useState({});
  const [fileDisplayNames, setFileDisplayNames] = useState({});
  const [originalFileUrls, setOriginalFileUrls] = useState({});

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
    const fetchEnquiries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "enquiries"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnquiriesData(data);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
        toast.error("Could not load enquiries data.");
      }
    };
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const defaultFormValues = {};
    const initialFilesToUpload = {};
    const initialFileDisplayNames = {};
    const initialOriginalFileUrls = {};

    if (editData) {
      for (const key in editData) {
        if (Object.prototype.hasOwnProperty.call(editData, key)) {
          if (key === "application" && editData.application) {
            defaultFormValues["assessmentId"] = editData.application;
          } else {
            defaultFormValues[key] = editData[key];
          }

          if (
            FILE_FIELD_NAMES.includes(key) &&
            typeof editData[key] === "string" &&
            editData[key].startsWith("https://firebasestorage.googleapis.com")
          ) {
            const fileUrl = editData[key];
            initialFilesToUpload[key] = fileUrl;
            initialOriginalFileUrls[key] = fileUrl;
            try {
              const url = new URL(fileUrl);
              const pathParts = url.pathname.split("/");
              let displayName = decodeURIComponent(
                pathParts[pathParts.length - 1].split("?")[0]
              );
              const underscoreIndex = displayName.indexOf("_");
              if (
                displayName.substring(0, underscoreIndex).match(/^\d+$/) &&
                underscoreIndex > -1 &&
                underscoreIndex < 20
              ) {
                displayName = displayName.substring(underscoreIndex + 1);
              }
              initialFileDisplayNames[key] = displayName || "Attached Document";
            } catch (e) {
              console.log("Error parsing filename from URL:", fileUrl, e);
              initialFileDisplayNames[key] = "Attached Document";
            }
          }
        }
      }
    } else {
      if (studentId && assessments && assessments.length > 0) {
        const studentAssessment = assessments.find((assessment) => {
          const studentEnquiry = enquiriesData.find(
            (enq) => enq.id === assessment.enquiry
          );
          return studentEnquiry && studentEnquiry.id === studentId;
        });

        if (studentAssessment) {
          defaultFormValues.assessmentId = studentAssessment.id;
        } else {
          defaultFormValues.assessmentId = "";
        }
      } else {
        defaultFormValues.assessmentId = "";
      }

      defaultFormValues.application_status =
        APPLICATION_STATUS.length > 0 ? APPLICATION_STATUS[0] : "";
      defaultFormValues.notes = "";
      FILE_FIELD_NAMES.forEach((name) => {
        defaultFormValues[name] = "";
      });
    }

    for (const key in defaultFormValues) {
      setValue(key, defaultFormValues[key]);
    }

    setFilesToUpload(initialFilesToUpload);
    setFileDisplayNames(initialFileDisplayNames);
    setOriginalFileUrls(initialOriginalFileUrls);
  }, [editData, setValue, studentId, assessments, enquiriesData]);

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      setFilesToUpload((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
      setFileDisplayNames((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
      setValue(fieldName, file.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(`${file.name} selected. Ready for upload.`);
    }
  };

  const removeFile = (fieldName) => {
    setFilesToUpload((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setFileDisplayNames((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setValue(fieldName, "", { shouldValidate: true, shouldDirty: true });
    toast.info(`File for ${fieldName.replace(/_/g, " ")} removed.`);
  };
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

  const sendNotifications = async (
    applicationId,
    studentName,
    isUpdate = false
  ) => {
    const notificationRecipientIds = new Set();
    const emailRecipients = new Map();

    const superadmins = users.filter(
      (u) => u.role === USER_ROLES.SUPERADMIN && u.isActive && u.id !== user.uid
    );
    superadmins.forEach((sa) => {
      notificationRecipientIds.add(sa.id);
      if (!emailRecipients.has(sa.id)) emailRecipients.set(sa.id, sa);
    });

    const studentBranchId = selectedAssessment?.branchId;
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
        if (!emailRecipients.has(branchAdmin.id)) {
          emailRecipients.set(branchAdmin.id, branchAdmin);
        }
      }
    }

    const finalRecipientIds = Array.from(notificationRecipientIds);
    const finalEmailRecipients = Array.from(emailRecipients.values());

    const notificationTitle = isUpdate
      ? "Application Updated"
      : "New Application Created";
    const notificationBody = isUpdate
      ? `Application for ${studentName} has been updated by ${userProfile.displayName}.`
      : `A new application for ${studentName} has been created by ${userProfile.displayName}.`;
    const notificationLink = `/applications/${applicationId}/details`;

    if (finalRecipientIds.length > 0) {
      await notificationService.send(
        notificationTitle,
        notificationBody,
        finalRecipientIds,
        "application",
        notificationLink
      );
    }

    if (finalEmailRecipients.length > 0) {
      const templateParams = {
        actionText: notificationTitle,
        bodyText: notificationBody,
        studentName,
        enquiryId: applicationId,
        link: `${window.location.origin}${notificationLink}`,
      };
      await Promise.all(
        finalEmailRecipients.map((recipient) =>
          sendEmailNotification(recipient, templateParams)
        )
      );
    }
  };

  const onSubmit = async (dataFromForm) => {
    if (!user || !user.uid) {
      toast.error("Authentication Error. Please log in again.");
      return;
    }
    if (!selectedAssessmentId && !editData) {
      toast.error("Cannot proceed without student details.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading(
      editData ? "Updating application..." : "Creating application..."
    );

    try {
      const finalApplicationData = { ...dataFromForm };
      const uploadPromises = [];

      if (dataFromForm.assessmentId) {
        finalApplicationData.application = dataFromForm.assessmentId;

        const selectedAssessment = (assessments || []).find(
          (ass) => ass.id === dataFromForm.assessmentId
        );

        if (selectedAssessment && selectedAssessment.enquiry) {
          const studentEnquiry = (enquiriesData || []).find(
            (enq) => enq.id === selectedAssessment.enquiry
          );
          if (studentEnquiry) {
            const firstName = studentEnquiry.student_First_Name || "";
            const lastName = studentEnquiry.student_Last_Name || "";
            const fullName = `${firstName} ${lastName}`.trim();

            finalApplicationData.studentDisplayName = fullName || "N/A";
          } else {
            finalApplicationData.studentDisplayName = "N/A";
          }
        } else {
          finalApplicationData.studentDisplayName = "N/A";
        }
      } else if (!editData) {
        toast.error("Please select an assessment.", { id: toastId });
        setLoading(false);
        return;
      }

      for (const fieldName of FILE_FIELD_NAMES) {
        const fileOrUrl = filesToUpload[fieldName];

        if (fileOrUrl instanceof File) {
          const file = fileOrUrl;
          if (
            editData &&
            originalFileUrls[fieldName] &&
            originalFileUrls[fieldName] !== fileOrUrl
          ) {
            try {
              const oldFileRef = ref(storage, originalFileUrls[fieldName]);
              await deleteObject(oldFileRef);
              console.log(`Old file ${originalFileUrls[fieldName]} deleted.`);
            } catch (error) {
              console.log(
                `Could not delete old file ${originalFileUrls[fieldName]}:`,
                error
              );
            }
          }

          const parentId =
            editData?.id || finalApplicationData.application || user.uid;
          const uploadPath = `applications/${parentId}/${fieldName}/${Date.now()}_${
            file.name
          }`;
          const storageRef = ref(storage, uploadPath);
          const uploadTask = uploadBytesResumable(storageRef, file);

          toast.loading(`Uploading ${file.name}...`, {
            id: `upload-toast-${fieldName}`,
          });

          const promise = uploadTask
            .then((snapshot) => getDownloadURL(snapshot.ref))
            .then((downloadURL) => {
              finalApplicationData[fieldName] = downloadURL;
              toast.success(`${file.name} uploaded!`, {
                id: `upload-toast-${fieldName}`,
              });
            })
            .catch((error) => {
              console.error(`Error uploading ${file.name}:`, error);
              toast.error(`Failed to upload ${file.name}.`, {
                id: `upload-toast-${fieldName}`,
              });
              throw error;
            });
          uploadPromises.push(promise);
        } else if (
          typeof fileOrUrl === "string" &&
          fileOrUrl.startsWith("https://firebasestorage.googleapis.com")
        ) {
          finalApplicationData[fieldName] = fileOrUrl;
        } else {
          finalApplicationData[fieldName] = "";
          if (editData && originalFileUrls[fieldName]) {
            try {
              const oldFileRef = ref(storage, originalFileUrls[fieldName]);
              await deleteObject(oldFileRef);
              console.log(
                `Old file ${originalFileUrls[fieldName]} deleted as it was removed.`
              );
            } catch (error) {
              console.log(
                `Could not delete removed old file ${originalFileUrls[fieldName]}:`,
                error
              );
            }
          }
        }
      }

      await Promise.all(uploadPromises);

      const updatedFilesToUpload = {};
      const updatedFileDisplayNames = {};
      const updatedOriginalFileUrls = {};

      for (const fieldName of FILE_FIELD_NAMES) {
        if (finalApplicationData[fieldName]) {
          const fileUrl = finalApplicationData[fieldName];
          updatedFilesToUpload[fieldName] = fileUrl;
          updatedOriginalFileUrls[fieldName] = fileUrl;

          if (
            fileDisplayNames[fieldName] &&
            !fileUrl.includes("firebasestorage.googleapis.com")
          ) {
            updatedFileDisplayNames[fieldName] = fileDisplayNames[fieldName];
          } else {
            try {
              const url = new URL(fileUrl);
              const pathParts = url.pathname.split("/");
              let displayName = decodeURIComponent(
                pathParts[pathParts.length - 1].split("?")[0]
              );
              const underscoreIndex = displayName.indexOf("_");
              if (
                displayName.substring(0, underscoreIndex).match(/^\d+$/) &&
                underscoreIndex > -1 &&
                underscoreIndex < 20
              ) {
                displayName = displayName.substring(underscoreIndex + 1);
              }
              updatedFileDisplayNames[fieldName] =
                displayName || "Attached Document";
            } catch (e) {
              console.log("Error parsing filename from URL:", fileUrl, e);
              updatedFileDisplayNames[fieldName] = "Attached Document";
            }
          }
        }
      }

      setFilesToUpload(updatedFilesToUpload);
      setFileDisplayNames(updatedFileDisplayNames);
      setOriginalFileUrls(updatedOriginalFileUrls);

      let applicationId;
      const studentName = finalApplicationData.studentDisplayName || "N/A";

      if (editData) {
        finalApplicationData.updatedBy = user.uid;
        if (editData.createdBy) {
          finalApplicationData.createdBy = editData.createdBy;
        }
        if (
          !finalApplicationData.studentDisplayName &&
          editData.studentDisplayName
        ) {
          finalApplicationData.studentDisplayName = editData.studentDisplayName;
        } else if (
          !finalApplicationData.studentDisplayName &&
          !editData.studentDisplayName &&
          !dataFromForm.assessmentId &&
          editData.application
        ) {
          const selectedAssessment = (assessments || []).find(
            (ass) => ass.id === editData.application
          );
          if (selectedAssessment && selectedAssessment.enquiry) {
            const studentEnquiry = (enquiriesData || []).find(
              (enq) => enq.id === selectedAssessment.enquiry
            );
            if (studentEnquiry) {
              const firstName = studentEnquiry.student_First_Name || "";
              const lastName = studentEnquiry.student_Last_Name || "";
              const fullName = `${firstName} ${lastName}`.trim();
              finalApplicationData.studentDisplayName = fullName || "N/A";
            }
          }
        }
        applicationId = editData.id;
        await applicationService.update(applicationId, finalApplicationData);
        toast.success("Application updated successfully!", { id: toastId });

        await sendNotifications(applicationId, studentName, true);
      } else {
        finalApplicationData.createdBy = user.uid;
        applicationId = await applicationService.create(finalApplicationData);
        toast.success("Application created successfully!", { id: toastId });

        await sendNotifications(applicationId, studentName);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("Failed to save application. Check console for details.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStatuses = () => {
    if (!selectedAssessment || !applicationStatuses) return [];

    const assessmentCountry = selectedAssessment.student_country;
    if (!assessmentCountry) return [];

    return applicationStatuses
      .filter((status) => status.country === assessmentCountry)
      .map((status) => status.applicationStatus);
  };

  const filteredStatuses = getFilteredStatuses();

  const filteredAssessments = studentId
    ? assessments.filter((assessment) => {
        const studentEnquiry = enquiriesData.find(
          (enq) => enq.id === assessment.enquiry
        );
        return (
          studentEnquiry &&
          studentEnquiry.id === studentId &&
          assessment.ass_status === "Completed"
        );
      })
    : assessments.filter((assessment) => assessment.ass_status === "Completed");

  const FileUploadFieldComponent = ({ name, label, accept = ".pdf" }) => {
    const currentFileDisplayName = fileDisplayNames[name];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {currentFileDisplayName ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText
                    className="text-green-600 flex-shrink-0"
                    size={24}
                  />
                  <span
                    className="text-sm text-green-600 truncate max-w-xs"
                    title={currentFileDisplayName}
                  >
                    {currentFileDisplayName.length > 25
                      ? `${currentFileDisplayName.slice(0, 22)}...`
                      : currentFileDisplayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(name)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium py-1 px-2 rounded-md bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <X size={14} className="inline mr-1" /> Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-gray-400" size={24} />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor={`${name}-file-input-applicationform`}
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id={`${name}-file-input-applicationform`}
                      name={name}
                      type="file"
                      className="sr-only"
                      accept={accept}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(name, e.target.files[0]);
                        }
                        e.target.value = null;
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {accept
                    .split(",")
                    .map((type) => type.replace(/\./g, "").trim().toUpperCase())
                    .join(" / ")}
                </p>
              </>
            )}
          </div>
        </div>
        {errors[name] && (
          <p className="text-red-600 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    );
  };

  if (assessmentsLoading && !editData) {
    return <Loading size="default" />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto"
    >
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment
            </label>
            <select
              {...register("assessmentId", {
                required: "Assessment selection is required",
              })}
              className={`input-field ${
                errors.assessmentId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Assessment</option>
              {filteredAssessments.map((assessment, index) => {
                const studentEnquiry = enquiriesData.find(
                  (enq) => enq.id === assessment.enquiry
                );

                let studentNameToDisplay = "";
                if (studentEnquiry) {
                  const firstName = studentEnquiry.student_First_Name || "";
                  const lastName = studentEnquiry.student_Last_Name || "";
                  studentNameToDisplay = `${firstName} ${lastName}`.trim();
                }

                return (
                  <option key={assessment.id} value={assessment.id}>
                    {`${index + 1}. ${
                      studentNameToDisplay + "-" + assessment.student_country ||
                      "N/A"
                    }`}
                  </option>
                );
              })}
            </select>

            {errors.assessmentId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.assessmentId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Status
            </label>
            <select
              {...register("application_status")}
              className={`input-field ${
                !selectedAssessmentId ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={!selectedAssessmentId}
            >
              <option value="">
                {selectedAssessmentId
                  ? "Select Status"
                  : "Select Assessment First"}
              </option>
              {filteredStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Document Uploads
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <FileUploadFieldComponent
            name="passport"
            label="Passport"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="diploma_marksheet"
            label="Diploma Marksheet"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="bachelor_marksheet"
            label="Bachelor's Marksheet"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="master_marksheet"
            label="Master's Marksheet"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="ielts"
            label="IELTS Score Report"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="toefl"
            label="TOEFL Score Report"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="gre"
            label="GRE Score Report"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="gmat"
            label="GMAT Score Report"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="pte"
            label="PTE Score Report"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="sop"
            label="Statement of Purpose (SOP)"
            accept=".pdf"
          />
          <FileUploadFieldComponent name="cv" label="CV/Resume" accept=".pdf" />
          <FileUploadFieldComponent
            name="work_experience"
            label="Work Experience Letter"
            accept=".pdf"
          />
          <FileUploadFieldComponent
            name="other_documents"
            label="Other Documents"
            accept=".pdf"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="input-field"
              placeholder="Add any additional notes about the application process, deadlines, special requirements, etc..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
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
          {loading ? "Saving..." : editData ? "Update " : "Create "}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
