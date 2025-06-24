import React, { useState } from "react";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { applicationStatusService } from "../../services/firestore";
import toast from "react-hot-toast";
import { COUNTRIES } from "../../utils/constants";

const ApplicationStatusForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editData || { isActive: true },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData) {
        await applicationStatusService.update(editData.id, data);
      } else {
        await applicationStatusService.create(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving status:", error);
      toast.error(
        `Failed to ${editData ? "update" : "create"} status: ${
          error.message || "An unexpected error occurred."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Status Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select {...register("country")} className="input-field">
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Name *
            </label>
            <input
              type="text"
              {...register("applicationStatus", {
                required: "Status name is required",
              })}
              className="input-field"
            />
            {errors.applicationStatus && (
              <p className="text-red-600 text-sm mt-1">
                {errors.applicationStatus.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sequence *
            </label>
            <input
              type="number"
              {...register("sequence", {
                required: "Sequence is required",
                valueAsNumber: true,
              })}
              className="input-field"
            />
            {errors.sequence && (
              <p className="text-red-600 text-sm mt-1">
                {errors.sequence.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Status is Active
              </span>
            </label>
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
          {loading ? "Saving..." : editData ? "Update Status" : "Create Status"}
        </button>
      </div>
    </form>
  );
};

export default ApplicationStatusForm;
