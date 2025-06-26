/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Upload, FileText, X, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  useAssessments,
  useApplications,
  useVisaDocuments,
} from "../../hooks/useFirestore";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "../../services/firebase";
import { visaApplicationService } from "../../services/firestore";

const VisaApplicationForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const { user } = useAuth();
  const storage = getStorage(app);
  const [loading, setLoading] = useState(false);
  const { data: assessments } = useAssessments();
  const { data: applications } = useApplications();
  const { data: visaDocuments } = useVisaDocuments();

  const [filesToUpload, setFilesToUpload] = useState({});
  const [fileDisplayNames, setFileDisplayNames] = useState({});
  const [originalFileUrls, setOriginalFileUrls] = useState({});
  const [requiredDocuments, setRequiredDocuments] = useState([]);

  const selectedStudentId =
    watch("studentId") || (editData ? editData.studentId : "");
  const selectedCountry = watch("country");

  const documentRequirementsMap = useMemo(() => {
    if (!visaDocuments) return {};
    return visaDocuments.reduce((acc, doc) => {
      acc[doc.countryCode] = doc.requirements;
      return acc;
    }, {});
  }, [visaDocuments]);

  const completedStudents =
    applications
      ?.filter((student) => student.application_status === "Completed")
      ?.map((student) => {
        const assessment = assessments?.find(
          (a) => a.id === student.assessmentId
        );
        return {
          ...student,
          interestedCountry: assessment?.student_country,
          studentDisplayName: student.studentDisplayName,
        };
      }) || [];

  const selectedStudent = completedStudents?.find(
    (s) => s.id === selectedStudentId
  );
  console.log("selectedStudent data:", selectedStudent);

  useEffect(() => {
    if (editData) {
      reset({
        studentId: editData.studentId,
        country: editData.country,
        notes: editData.notes,
      });
    } else {
      // Also good practice to reset the form when it closes or switches to create mode
      reset();
    }
  }, [editData, reset]);

  useEffect(() => {
    if (
      editData &&
      editData.country &&
      Object.keys(documentRequirementsMap).length > 0
    ) {
      const docsForCountry = documentRequirementsMap[editData.country] || [];
      setRequiredDocuments(docsForCountry);

      const initialFiles = {};
      const initialDisplayNames = {};
      const initialOriginalUrls = {};

      if (editData.documents) {
        Object.entries(editData.documents).forEach(([docType, url]) => {
          if (url && typeof url === "string") {
            initialFiles[docType] = url;
            initialOriginalUrls[docType] = url;
            try {
              const urlObj = new URL(url);
              const pathParts = urlObj.pathname.split("/");
              let displayName = decodeURIComponent(
                pathParts[pathParts.length - 1].split("?")[0]
              );
              const underscoreIndex = displayName.indexOf("_");
              if (underscoreIndex > -1) {
                const prefix = displayName.substring(0, underscoreIndex);
                if (!isNaN(prefix)) {
                  displayName = displayName.substring(underscoreIndex + 1);
                }
              }
              initialDisplayNames[docType] =
                displayName || docType.replace(/_/g, " ");
            } catch (e) {
              console.log("Error parsing filename from URL:", url, e);
              initialDisplayNames[docType] = docType.replace(/_/g, " ");
            }
          }
        });
      }

      setFilesToUpload(initialFiles);
      setFileDisplayNames(initialDisplayNames);
      setOriginalFileUrls(initialOriginalUrls);
    } else {
      setRequiredDocuments([]);
      setFilesToUpload({});
      setFileDisplayNames({});
      setOriginalFileUrls({});
    }
  }, [editData, documentRequirementsMap]);

  useEffect(() => {
    if (!editData && selectedStudentId) {
      const student = completedStudents.find((s) => s.id === selectedStudentId);
      if (student && student.interestedCountry) {
        setValue("country", student.interestedCountry);
        const docsForCountry =
          documentRequirementsMap[student.interestedCountry] || [];
        setRequiredDocuments(docsForCountry);

        setFilesToUpload({});
        setFileDisplayNames({});
        setOriginalFileUrls({});
      }
    }
  }, [selectedStudentId, editData, documentRequirementsMap, setValue]);

  useEffect(() => {
    if (selectedCountry && !editData) {
      const docsForCountry = documentRequirementsMap[selectedCountry] || [];
      setRequiredDocuments(docsForCountry);
    }
  }, [selectedCountry, documentRequirementsMap, editData]);

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      setFilesToUpload((prev) => ({ ...prev, [fieldName]: file }));
      setFileDisplayNames((prev) => ({ ...prev, [fieldName]: file.name }));
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
    toast.info(`File for ${fieldName.replace(/_/g, " ")} removed.`);
  };

  const onSubmit = async (data) => {
    if (!user || !user.uid) {
      toast.error("Authentication Error. Please log in again.");
      return;
    }

    if (!data.country) {
      toast.error(
        "The selected student does not have an interested country specified."
      );
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      editData ? "Updating visa application..." : "Creating visa application..."
    );

    try {
      const finalData = {
        ...data,
        studentName: selectedStudent?.studentDisplayName,
        studentId: selectedStudentId,
        country: data.country,
        studentEnquiryId: selectedStudent?.studentEnquiry,
      };
      const uploadPromises = [];

      for (const docType of requiredDocuments) {
        const fileOrUrl = filesToUpload[docType];

        if (fileOrUrl instanceof File) {
          const file = fileOrUrl;

          if (
            editData &&
            originalFileUrls[docType] &&
            originalFileUrls[docType] !== fileOrUrl
          ) {
            try {
              const oldFileRef = ref(storage, originalFileUrls[docType]);
              await deleteObject(oldFileRef);
            } catch (error) {
              console.log(
                `Could not delete old file ${originalFileUrls[docType]}:`,
                error
              );
            }
          }

          const uploadPath = `visa-applications/${
            editData?.id || data.studentId
          }/${docType}/${Date.now()}_${file.name}`;
          const storageRef = ref(storage, uploadPath);
          const uploadTask = uploadBytesResumable(storageRef, file);

          toast.loading(`Uploading ${file.name}...`, {
            id: `upload-toast-${docType}`,
          });

          const promise = uploadTask
            .then((snapshot) => getDownloadURL(snapshot.ref))
            .then((downloadURL) => {
              finalData.documents = finalData.documents || {};
              finalData.documents[docType] = downloadURL;
              toast.success(`${file.name} uploaded!`, {
                id: `upload-toast-${docType}`,
              });
            })
            .catch((error) => {
              console.error(`Error uploading ${file.name}:`, error);
              toast.error(`Failed to upload ${file.name}.`, {
                id: `upload-toast-${docType}`,
              });
              throw error;
            });

          uploadPromises.push(promise);
        } else if (
          typeof fileOrUrl === "string" &&
          fileOrUrl.startsWith("https://firebasestorage.googleapis.com")
        ) {
          finalData.documents = finalData.documents || {};
          finalData.documents[docType] = fileOrUrl;
        } else if (editData && originalFileUrls[docType]) {
          try {
            const oldFileRef = ref(storage, originalFileUrls[docType]);
            await deleteObject(oldFileRef);
          } catch (error) {
            console.log(
              `Could not delete removed old file ${originalFileUrls[docType]}:`,
              error
            );
          }
        }
      }

      await Promise.all(uploadPromises);

      if (editData) {
        finalData.updatedAt = new Date().toISOString();
        finalData.updatedBy = user.uid;
        finalData.createdAt = editData.createdAt || new Date().toISOString();
        finalData.createdBy = editData.createdBy || user.uid;
      } else {
        finalData.createdAt = new Date().toISOString();
        finalData.createdBy = user.uid;
      }

      if (editData) {
        await visaApplicationService.update(editData.id, finalData);
        toast.success("Visa application updated successfully!", {
          id: toastId,
        });
      } else {
        await visaApplicationService.create(finalData);
        toast.success("Visa application created successfully!", {
          id: toastId,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving visa application:", error);
      toast.error(
        "Failed to save visa application. Check console for details.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({
    name,
    label,
    accept = ".pdf,.jpg,.jpeg,.png",
  }) => {
    const currentFileDisplayName = fileDisplayNames[name];

    const triggerFileInput = () => {
      const fileInput = document.getElementById(`${name}-file-input`);
      if (fileInput) {
        fileInput.click();
      }
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">{label}</h3>
            {currentFileDisplayName ? (
              <div className="flex items-center space-x-2">
                <FileText className="text-green-600 flex-shrink-0" size={16} />
                <span className="text-sm text-green-600 truncate">
                  {currentFileDisplayName.length > 30
                    ? `${currentFileDisplayName.slice(0, 10)}...`
                    : currentFileDisplayName}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(name)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No file uploaded</p>
            )}
          </div>
          <button
            type="button"
            onClick={triggerFileInput}
            className="ml-4 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
          >
            <Upload size={20} />
          </button>
        </div>

        <input
          id={`${name}-file-input`}
          name={name}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(name, e.target.files[0]);
            }
            e.target.value = null;
          }}
        />
      </div>
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto p-1"
      >
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                {...register("studentId", {
                  required: "Student selection is required",
                })}
                className={`input-field ${
                  errors.studentId ? "border-red-500" : ""
                } `}
              >
                <option value="">Select Student</option>
                {completedStudents.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                    selected={selectedStudent?.id === student.id}
                  >
                    {`${student.studentDisplayName} - ${
                      student.interestedCountry || "N/A"
                    }`}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.studentId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedCountry && requiredDocuments.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Required Visa Documents for {selectedCountry}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requiredDocuments.map((docType) => (
                <FileUploadField
                  key={docType}
                  name={docType}
                  label={docType.replace(/_/g, " ")}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-4">
            Additional Information
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="input-field"
              placeholder="Add any additional notes about the visa application process..."
            />
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
            {loading ? (
              <Loader2 size={16} className="inline mr-1 animate-spin" />
            ) : (
              <Save size={16} className="inline mr-1" />
            )}
            {loading ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </>
  );
};

export default VisaApplicationForm;
