import React, { useState } from "react";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { serviceService } from "../../services/firestore";

const ServiceForm = ({ onClose, onSuccess, editData = null }) => {
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
        await serviceService.update(editData.id, data);
        toast.success("Service updated successfully!");
      } else {
        await serviceService.create(data);
        toast.success("Service created successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(
        `Failed to ${editData ? "update" : "create"} service: ${
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
          Service Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              {...register("serviceName", {
                required: "Service name is required",
              })}
              className="input-field"
            />
            {errors.serviceName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.serviceName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Price *
            </label>
            <input
              type="number"
              {...register("servicePrice", {
                required: "Service price is required",
              })}
              className="input-field"
            />
            {errors.servicePrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.servicePrice.message}
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
                Service is Active
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
          {loading
            ? "Saving..."
            : editData
            ? "Update Service"
            : "Create Service"}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
