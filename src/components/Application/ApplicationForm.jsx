import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { APPLICATION_STATUS } from "../../utils/constants"; // Assuming this constant exists
import { useAssessments } from "../../hooks/useFirestore"; // Assuming this custom hook exists
import { applicationService } from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import { Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject, // Import for deleting old files if replaced
} from "firebase/storage";
import app from "../../services/firebase"; // Your Firebase app initialization

// Initialize Firebase Storage
const storage = getStorage(app);

// Define a list of field names that are expected to be file uploads
// These should match the 'name' prop of your FileUploadFieldComponent instances
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

const ApplicationForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch, // Watch for changes if needed, e.g., for conditional logic
  } = useForm();

  const { user } = useAuth();
  // Assuming useAssessments returns { data: assessmentsArray, isLoading: boolean }
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
  const [loading, setLoading] = useState(false);

  // State to hold File objects for new uploads or string URLs for existing files
  const [filesToUpload, setFilesToUpload] = useState({});
  // State to hold display names for files in the UI
  const [fileDisplayNames, setFileDisplayNames] = useState({});
  // State to store original file URLs from editData to handle deletion of old files on replacement
  const [originalFileUrls, setOriginalFileUrls] = useState({});

  useEffect(() => {
    const defaultFormValues = {};
    const initialFilesToUpload = {};
    const initialFileDisplayNames = {};
    const initialOriginalFileUrls = {};

    if (editData) {
      for (const key in editData) {
        if (Object.prototype.hasOwnProperty.call(editData, key)) {
          // For React Hook Form, use assessmentId for the dropdown value
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
            initialFilesToUpload[key] = fileUrl; // Store existing URL
            initialOriginalFileUrls[key] = fileUrl; // Store original URL for potential deletion
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
                // Check if prefix is likely a timestamp
                displayName = displayName.substring(underscoreIndex + 1);
              }
              initialFileDisplayNames[key] = displayName || "Attached Document";
            } catch (e) {
              console.warn("Error parsing filename from URL:", fileUrl, e);
              initialFileDisplayNames[key] = "Attached Document";
            }
          }
        }
      }
    } else {
      // Initialize with default empty values for a new form
      defaultFormValues.assessmentId = "";
      defaultFormValues.application_status =
        APPLICATION_STATUS.length > 0 ? APPLICATION_STATUS[0] : "";
      defaultFormValues.notes = "";
      FILE_FIELD_NAMES.forEach((name) => {
        defaultFormValues[name] = ""; // For RHF state
      });
    }

    // Set all form values for React Hook Form
    for (const key in defaultFormValues) {
      setValue(key, defaultFormValues[key]);
    }

    setFilesToUpload(initialFilesToUpload);
    setFileDisplayNames(initialFileDisplayNames);
    setOriginalFileUrls(initialOriginalFileUrls);
  }, [editData, setValue]);

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      setFilesToUpload((prev) => ({
        ...prev,
        [fieldName]: file, // Store the File object
      }));
      setFileDisplayNames((prev) => ({
        ...prev,
        [fieldName]: file.name, // Store the file name for display
      }));
      setValue(fieldName, file.name, {
        shouldValidate: true,
        shouldDirty: true,
      }); // Update RHF state
      toast.success(`${file.name} selected. Ready for upload.`);
    }
  };

  const removeFile = (fieldName) => {
    // If there was an original file, we might want to delete it from storage on final submit if it's removed here.
    // For now, just clear from local state. Actual deletion from storage will be handled in onSubmit if a file is replaced.
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
    setValue(fieldName, "", { shouldValidate: true, shouldDirty: true }); // Clear RHF state for this field
    toast.info(`File for ${fieldName.replace(/_/g, " ")} removed.`);
  };

  const onSubmit = async (dataFromForm) => {
    setLoading(true);
    const toastId = toast.loading(
      editData ? "Updating application..." : "Creating application..."
    );

    try {
      const finalApplicationData = { ...dataFromForm };
      const uploadPromises = [];

      // Map assessmentId from form to 'application' for Firestore
      if (dataFromForm.assessmentId) {
        finalApplicationData.application = dataFromForm.assessmentId;
        // delete finalApplicationData.assessmentId; // Optional: remove assessmentId if only 'application' is needed
      } else if (!editData) {
        // If new form and no assessmentId, it's an error based on rules
        toast.error("Assessment ID is missing.", { id: toastId });
        setLoading(false);
        return;
      }

      for (const fieldName of FILE_FIELD_NAMES) {
        const fileOrUrl = filesToUpload[fieldName];

        if (fileOrUrl instanceof File) {
          // New file to upload
          const file = fileOrUrl;
          // If editing and there was an old file for this field, delete it from storage
          if (
            editData &&
            originalFileUrls[fieldName] &&
            originalFileUrls[fieldName] !== fileOrUrl
          ) {
            try {
              const oldFileRef = ref(storage, originalFileUrls[fieldName]);
              await deleteObject(oldFileRef);
              console.log(`Old file ${originalFileUrls[fieldName]} deleted.`);
            } catch (deleteError) {
              // Log error but don't necessarily block new upload unless critical
              console.warn(
                `Could not delete old file ${originalFileUrls[fieldName]}:`,
                deleteError
              );
            }
          }

          const parentId =
            editData?.id || finalApplicationData.application || user.uid; // Use application ID or assessment ID or user ID for path
          const uploadPath = `applications/${parentId}/${fieldName}/${Date.now()}_${
            file.name
          }`;
          const storageRef = ref(storage, uploadPath);
          const uploadTask = uploadBytesResumable(storageRef, file);

          const promise = uploadTask
            .then((snapshot) => getDownloadURL(snapshot.ref))
            .then((downloadURL) => {
              finalApplicationData[fieldName] = downloadURL; // Set the URL in data to be saved
              toast.success(`${file.name} uploaded!`, {
                id: `upload-toast-${fieldName}`,
              });
            })
            .catch((error) => {
              console.error(`Error uploading ${file.name}:`, error);
              toast.error(`Failed to upload ${file.name}.`, {
                id: `upload-toast-${fieldName}`,
              });
              throw error; // Propagate error to stop submission if critical
            });
          uploadPromises.push(promise);
          toast.loading(`Uploading ${file.name}...`, {
            id: `upload-toast-${fieldName}`,
          });
        } else if (
          typeof fileOrUrl === "string" &&
          fileOrUrl.startsWith("https://firebasestorage.googleapis.com")
        ) {
          // Existing URL, keep it if it's still in filesToUpload
          finalApplicationData[fieldName] = fileOrUrl;
        } else {
          // File was removed or never set for this field
          finalApplicationData[fieldName] = ""; // Set to empty string if removed
          // If editing and an original file existed and was removed (fileOrUrl is now empty/undefined)
          if (editData && originalFileUrls[fieldName]) {
            try {
              const oldFileRef = ref(storage, originalFileUrls[fieldName]);
              await deleteObject(oldFileRef);
              console.log(
                `Old file ${originalFileUrls[fieldName]} deleted as it was removed.`
              );
            } catch (deleteError) {
              console.warn(
                `Could not delete removed old file ${originalFileUrls[fieldName]}:`,
                deleteError
              );
            }
          }
        }
      }

      await Promise.all(uploadPromises);

      // Clean up RHF specific field if it's different from Firestore field
      if (
        finalApplicationData.assessmentId &&
        finalApplicationData.application &&
        finalApplicationData.assessmentId === finalApplicationData.application
      ) {
        // delete finalApplicationData.assessmentId; // Keep if your service/backend doesn't mind or if you use it for other UI purposes
      }

      if (editData) {
        finalApplicationData.updatedBy = user.uid;
        // Ensure createdBy is not lost if it existed
        if (editData.createdBy) {
          finalApplicationData.createdBy = editData.createdBy;
        }
        await applicationService.update(editData.id, finalApplicationData);
        toast.success("Application updated successfully!", { id: toastId });
      } else {
        finalApplicationData.createdBy = user.uid; // Already set by service, but good for clarity
        await applicationService.create(finalApplicationData);
        toast.success("Application created successfully!", { id: toastId });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error(
        error.message || "Failed to save application. Please try again.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const FileUploadFieldComponent = ({ name, label, accept = "*/*" }) => {
    const currentFileDisplayName = fileDisplayNames[name];
    // Register the field with RHF, especially if you add validation rules later
    // register(name); // You might not need to explicitly register if setValue is used and no RHF validation on the input itself

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
                    {currentFileDisplayName}
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
                    htmlFor={`${name}-file-input-applicationform`} // Ensure unique ID
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id={`${name}-file-input-applicationform`} // Unique ID
                      name={name} // RHF uses this name if registered
                      type="file"
                      className="sr-only"
                      accept={accept}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(name, e.target.files[0]);
                        }
                        e.target.value = null; // Reset input to allow re-uploading the same file
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
        {errors[name] && ( // Display RHF errors if the field is registered and has validation
          <p className="text-red-600 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    );
  };

  if (assessmentsLoading && !editData) {
    return <div className="p-6 text-center">Loading assessment data...</div>;
  }
  if (!user) {
    return (
      <div className="p-6 text-center">
        User not authenticated. Please log in.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-4 max-h-[calc(100vh-100px)] overflow-y-auto"
    >
      {/* Basic Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment <span className="text-red-500">*</span>
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
              {(assessments || []).map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {`ID: ...${assessment.id.slice(-6)} (For: ${
                    assessment.studentName || "N/A"
                  }, Enq: ...${assessment.enquiryId?.slice(-6) || "N/A"})`}
                </option>
              ))}
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
            <select {...register("application_status")} className="input-field">
              {APPLICATION_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Document Uploads
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <FileUploadFieldComponent
            name="passport"
            label="Passport"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="diploma_marksheet"
            label="Diploma Marksheet"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="bachelor_marksheet"
            label="Bachelor's Marksheet"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="master_marksheet"
            label="Master's Marksheet"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="ielts"
            label="IELTS Score Report"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="toefl"
            label="TOEFL Score Report"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="gre"
            label="GRE Score Report"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="gmat"
            label="GMAT Score Report"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="pte"
            label="PTE Score Report"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="sop"
            label="Statement of Purpose (SOP)"
            accept=".pdf,.doc,.docx"
          />
          <FileUploadFieldComponent
            name="cv"
            label="CV/Resume"
            accept=".pdf,.doc,.docx"
          />
          <FileUploadFieldComponent
            name="work_experience"
            label="Work Experience Letter"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <FileUploadFieldComponent
            name="other_documents"
            label="Other Documents"
            accept="*/*"
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Notes
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Saving..."
            : editData
            ? "Update Application"
            : "Create Application"}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
