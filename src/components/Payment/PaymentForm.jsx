import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  PAYMENT_MODES,
  AVAILABLE_SERVICES,
} from "../../utils/constants";
import { useEnquiries } from "../../hooks/useFirestore";
import { paymentService } from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import { Upload, FileText, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "../../services/firebase";
import Loading from "../Common/Loading";

const storage = getStorage(app);

const PAYMENT_DOCUMENT_FIELD_NAME = "payment_document";

const PaymentForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: editData
      ? { ...editData }
      : {
          payment_date: new Date().toISOString().split("T")[0],
          [PAYMENT_DOCUMENT_FIELD_NAME]: "",
          Memo_For: "",
          Payment_Type: "",
          payment_amount: "",
          payment_mode: "",
          payment_status: "",
          Payment_For: [],
          payment_id: "",
          payment_reference: "",
          payment_remarks: "",
        },
  });

  const { user } = useAuth();
  const { data: enquiries, isLoading: enquiriesLoading } = useEnquiries();
  const [loading, setLoading] = useState(false);

  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileDisplayName, setFileDisplayName] = useState("");
  const [originalFileUrl, setOriginalFileUrl] = useState("");

  const selectedServices = watch("Payment_For") || [];

  useEffect(() => {
    if (editData) {
      for (const key in editData) {
        if (Object.prototype.hasOwnProperty.call(editData, key)) {
          if (key === "payment_date" && editData[key]) {
            setValue(key, new Date(editData[key]).toISOString().split("T")[0]);
          } else {
            setValue(key, editData[key]);
          }
        }
      }

      const docUrl = editData[PAYMENT_DOCUMENT_FIELD_NAME];
      if (
        docUrl &&
        typeof docUrl === "string" &&
        docUrl.startsWith("https://firebasestorage.googleapis.com")
      ) {
        setFileToUpload(docUrl);
        setOriginalFileUrl(docUrl);
        setValue(PAYMENT_DOCUMENT_FIELD_NAME, docUrl);

        try {
          const url = new URL(docUrl);
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
          setFileDisplayName(displayName || "Payment Document");
        } catch (e) {
          console.warn("Error parsing filename from URL:", docUrl, e);
          setFileDisplayName("Payment Document");
        }
      } else {
        setFileToUpload(null);
        setFileDisplayName("");
        setOriginalFileUrl("");
        setValue(PAYMENT_DOCUMENT_FIELD_NAME, "");
      }
    } else {
      setValue("payment_date", new Date().toISOString().split("T")[0]);
      setFileToUpload(null);
      setFileDisplayName("");
      setOriginalFileUrl("");
      setValue(PAYMENT_DOCUMENT_FIELD_NAME, "");
    }
  }, [editData, setValue]);

  const handleFileUpload = (file) => {
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, JPEG, and PNG files are allowed");
        return;
      }
      setFileToUpload(file);
      setFileDisplayName(file.name);
      setValue(PAYMENT_DOCUMENT_FIELD_NAME, file.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(`${file.name} selected. Ready for upload.`);
    }
  };

  const removeDocument = () => {
    setFileToUpload(null);
    setFileDisplayName("");
    setValue(PAYMENT_DOCUMENT_FIELD_NAME, "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.info("Payment document removed.");
  };

  const onSubmit = async (dataFromForm) => {
    console.log("Form data from RHF:", dataFromForm);
    setLoading(true);
    const toastId = toast.loading(
      editData ? "Updating payment..." : "Recording payment..."
    );

    try {
      const finalPaymentData = { ...dataFromForm };
      let documentUrlToSave = "";

      if (fileToUpload instanceof File) {
        const file = fileToUpload;
        if (editData && originalFileUrl && originalFileUrl !== fileToUpload) {
          try {
            const oldFileRef = ref(storage, originalFileUrl);
            await deleteObject(oldFileRef);
            console.log(`Old payment document ${originalFileUrl} deleted.`);
          } catch (deleteError) {
            console.warn(
              `Could not delete old file ${originalFileUrl}:`,
              deleteError
            );
          }
        }

        const parentIdForPath =
          editData?.id || finalPaymentData.Memo_For || user.uid;
        const uploadPath = `payments/${parentIdForPath}/${PAYMENT_DOCUMENT_FIELD_NAME}/${Date.now()}_${
          file.name
        }`;

        const storageReference = ref(storage, uploadPath);
        const uploadTask = uploadBytesResumable(storageReference, file);

        const fileToastId = "upload-toast-payment-doc";
        toast.loading(`Uploading ${file.name}...`, { id: fileToastId });

        try {
          const snapshot = await uploadTask;
          documentUrlToSave = await getDownloadURL(snapshot.ref);
          toast.success(`${file.name} uploaded successfully!`, {
            id: fileToastId,
          });
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          toast.error(`Failed to upload ${file.name}.`, { id: fileToastId });
          throw uploadError;
        }
      } else if (
        typeof fileToUpload === "string" &&
        fileToUpload.startsWith("https://firebasestorage.googleapis.com")
      ) {
        documentUrlToSave = fileToUpload;
      } else {
        documentUrlToSave = "";
        if (editData && originalFileUrl) {
          try {
            const oldFileRef = ref(storage, originalFileUrl);
            await deleteObject(oldFileRef);
            console.log(
              `Old payment document ${originalFileUrl} deleted as it was removed.`
            );
          } catch (deleteError) {
            console.warn(
              `Could not delete removed old file ${originalFileUrl}:`,
              deleteError
            );
          }
        }
      }

      finalPaymentData[PAYMENT_DOCUMENT_FIELD_NAME] = documentUrlToSave;

      if (editData) {
        finalPaymentData.updatedBy = user.uid;
        finalPaymentData.createdBy = editData.createdBy || user.uid;
        finalPaymentData.payment_received_by =
          editData.payment_received_by || user.uid;
      } else {
        finalPaymentData.createdBy = user.uid;
        finalPaymentData.payment_received_by = user.uid;
        delete finalPaymentData.updatedBy;
      }

      if (editData) {
        await paymentService.update(editData.id, finalPaymentData);
        toast.success("Payment updated successfully!", { id: toastId });
      } else {
        await paymentService.create(finalPaymentData);
        toast.success("Payment recorded successfully!", { id: toastId });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error(
        error.message || "Failed to save payment. Please try again.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateServiceTotal = () => {
    return selectedServices.reduce((total, serviceName) => {
      const service = AVAILABLE_SERVICES.find((s) => s.name === serviceName);
      return total + (service ? service.price : 0);
    }, 0);
  };

  if (enquiriesLoading && !editData) {
    return <Loading size="default" />;
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
      className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto"
    >
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="Memo_For_Payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Student <span className="text-red-500">*</span>
            </label>
            <select
              id="Memo_For_Payment"
              {...register("Memo_For", {
                required: "Student selection is required",
              })}
              className={`input-field ${
                errors.Memo_For ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Student</option>
              {(enquiries).map((enquiry) => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.student_First_Name} {enquiry.student_Last_Name}
                </option>
              ))}
            </select>
            {errors.Memo_For && (
              <p className="text-red-600 text-sm mt-1">
                {errors.Memo_For.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_id_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment ID
            </label>
            <input
              id="payment_id_payment"
              type="text"
              {...register("payment_id")}
              className="input-field"
              placeholder="Auto-generated or external ID"
            />
          </div>

          <div>
            <label
              htmlFor="Payment_Type_Payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Type <span className="text-red-500">*</span>
            </label>
            <select
              id="Payment_Type_Payment"
              {...register("Payment_Type", {
                required: "Payment type is required",
              })}
              className={`input-field ${
                errors.Payment_Type ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Payment Type</option>
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.Payment_Type && (
              <p className="text-red-600 text-sm mt-1">
                {errors.Payment_Type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_date_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              id="payment_date_payment"
              type="date"
              {...register("payment_date", {
                required: "Payment date is required",
              })}
              className={`input-field ${
                errors.payment_date ? "border-red-500" : ""
              }`}
            />
            {errors.payment_date && (
              <p className="text-red-600 text-sm mt-1">
                {errors.payment_date.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_amount_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="payment_amount_payment"
              type="number"
              step="0.01"
              {...register("payment_amount", {
                required: "Payment amount is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
              className={`input-field ${
                errors.payment_amount ? "border-red-500" : ""
              }`}
              placeholder="0.00"
            />
            {errors.payment_amount && (
              <p className="text-red-600 text-sm mt-1">
                {errors.payment_amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_mode_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Mode <span className="text-red-500">*</span>
            </label>
            <select
              id="payment_mode_payment"
              {...register("payment_mode", {
                required: "Payment mode is required",
              })}
              className={`input-field ${
                errors.payment_mode ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Payment Mode</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            {errors.payment_mode && (
              <p className="text-red-600 text-sm mt-1">
                {errors.payment_mode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_status_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Status <span className="text-red-500">*</span>
            </label>
            <select
              id="payment_status_payment"
              {...register("payment_status", {
                required: "Payment status is required",
              })}
              className={`input-field ${
                errors.payment_status ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Payment Status</option>
              {PAYMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.payment_status && (
              <p className="text-red-600 text-sm mt-1">
                {errors.payment_status.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_reference_payment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Reference
            </label>
            <input
              id="payment_reference_payment"
              type="text"
              {...register("payment_reference")}
              className="input-field"
              placeholder="Transaction ID, Cheque number, etc."
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Services</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment For <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg">
              {AVAILABLE_SERVICES.map((service) => (
                <label
                  key={service.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      value={service.name}
                      {...register("Payment_For", {
                        required: "Please select at least one service",
                      })}
                      className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {service.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ₹{service.price.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
            {errors.Payment_For && (
              <p className="text-red-600 text-sm mt-1">
                {errors.Payment_For.message}
              </p>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h5 className="font-medium text-blue-800 mb-2">
                Selected Services Total
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                ₹{calculateServiceTotal().toLocaleString()}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Based on {selectedServices.length} selected service
                {selectedServices.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Document
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {fileDisplayName ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText
                    className="text-green-600 flex-shrink-0"
                    size={24}
                  />
                  <span
                    className="text-sm text-green-600 truncate max-w-xs"
                    title={fileDisplayName}
                  >
                    {fileDisplayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeDocument}
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
                    htmlFor="payment-document-file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload payment receipt</span>
                    <input
                      id="payment-document-file-input"
                      name={PAYMENT_DOCUMENT_FIELD_NAME}
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                        e.target.value = null;
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG, JPEG, PNG up to 10MB
                </p>
              </>
            )}
          </div>
        </div>
        {errors[PAYMENT_DOCUMENT_FIELD_NAME] && (
          <p className="text-red-600 text-sm mt-1">
            {errors[PAYMENT_DOCUMENT_FIELD_NAME].message}
          </p>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div>
          <label
            htmlFor="payment_remarks_payment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Remarks
          </label>
          <textarea
            id="payment_remarks_payment"
            {...register("payment_remarks")}
            rows={4}
            className="input-field"
            placeholder="Add any additional notes about the payment..."
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
          <Save size={16} className="inline mr-1" />
          {loading ? "Saving..." : editData ? "Update " : "Create "}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
