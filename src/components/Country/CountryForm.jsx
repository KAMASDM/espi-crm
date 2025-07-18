import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, X, Save, Loader2, Upload, FileText } from "lucide-react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { countryService } from "../../services/firestore";
import { useCountries } from "../../hooks/useFirestore";

const COURSE_LEVELS = [
  "Certificate",
  "Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree",
  "Professional Degree",
];

const CountryForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editData || { courseLevels: [], attachment: "" },
  });

  const { data: existingCountries, loading: countriesLoading } = useCountries();
  const [loading, setLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileDisplayName, setFileDisplayName] = useState("");

  useEffect(() => {
    if (editData) {
      if (editData.attachment) {
        setFileDisplayName("Existing attachment");
      }
    }
  }, [editData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setFileDisplayName(file.name);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Prevent duplicate country names
      const countryName = data.country.trim().toLowerCase();
      const isDuplicate = existingCountries.some(
        (c) => c.country.toLowerCase() === countryName && c.id !== editData?.id
      );

      if (isDuplicate) {
        toast.error("A country with this name already exists.");
        setLoading(false);
        return;
      }

      let attachmentUrl = editData?.attachment || "";

      if (fileToUpload) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `countries/attachments/${fileToUpload.name}`
        );
        const uploadTask = await uploadBytesResumable(storageRef, fileToUpload);
        attachmentUrl = await getDownloadURL(uploadTask.ref);
      }

      const countryData = { ...data, attachment: attachmentUrl };

      if (editData) {
        await countryService.update(editData.id, countryData);
        toast.success("Country updated successfully!");
      } else {
        await countryService.create(countryData);
        toast.success("Country created successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving country:", error);
      toast.error("Failed to save country.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country Name
          </label>
          <input
            {...register("country", { required: "Country name is required" })}
            className="input-field"
            placeholder="e.g., United States"
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <input
            {...register("currency", { required: "Currency is required" })}
            className="input-field"
            placeholder="e.g., USD"
          />
          {errors.currency && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currency.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country Code
          </label>
          <input
            {...register("countryCode", { required: "Country code is required" })}
            className="input-field"
            placeholder="e.g., US"
          />
          {errors.countryCode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.countryCode.message}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Levels Offered
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg">
            {COURSE_LEVELS.map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  value={level}
                  {...register("courseLevels")}
                  className="mr-2"
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachment
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {fileDisplayName ? (
                <div className="flex items-center space-x-2">
                  <FileText className="text-green-500" />
                  <span className="text-sm text-gray-700">
                    {fileDisplayName}
                  </span>
                </div>
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading || countriesLoading}
        >
          <X size={16} className="inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || countriesLoading}
        >
          {loading || countriesLoading ? (
            <Loader2 size={16} className="inline mr-1 animate-spin" />
          ) : (
            <Save size={16} className="inline mr-1" />
          )}
          {loading || countriesLoading ? "Saving..." : "Save Country"}
        </button>
      </div>
    </form>
  );
};

export default CountryForm;
