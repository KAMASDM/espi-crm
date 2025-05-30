import { useState } from "react";
import { useForm } from "react-hook-form";
import { COUNTRIES, COURSE_LEVELS, CURRENCIES } from "../../utils/constants";
import { universityService } from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const UniversityForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editData || {
      moi_accepted: false,
      Active: true,
    },
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const universityData = {
        ...data,
        assigned_users: user.uid,
        createdBy: user.uid,
      };

      if (editData) {
        await universityService.update(editData.id, universityData);
        toast.success("University updated successfully!");
      } else {
        await universityService.create(universityData);
        toast.success("University created successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving university:", error);
      toast.error("Failed to save university. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Name *
            </label>
            <input
              type="text"
              {...register("univ_name", {
                required: "University name is required",
              })}
              className="input-field"
            />
            {errors.univ_name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.univ_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              {...register("country", { required: "Country is required" })}
              className="input-field"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-600 text-sm mt-1">
                {errors.country.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              {...register("deadline")}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register("univ_phone")}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("univ_email")}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              {...register("univ_website")}
              className="input-field"
              placeholder="https://university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Fee
            </label>
            <input
              type="number"
              step="0.01"
              {...register("Application_fee")}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Description
            </label>
            <textarea
              {...register("univ_desc")}
              rows={4}
              className="input-field"
              placeholder="Brief description of the university..."
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Levels Offered
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
              {COURSE_LEVELS.map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    value={level}
                    {...register("levels")}
                    className="mr-2"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backlogs Allowed
            </label>
            <input
              type="number"
              {...register("Backlogs_allowed")}
              className="input-field"
              placeholder="Maximum number of backlogs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Requirements
            </label>
            <textarea
              {...register("Admission_Requirements")}
              rows={4}
              className="input-field"
              placeholder="Detailed admission requirements..."
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("moi_accepted")}
              className="mr-3"
            />
            <label className="text-sm font-medium text-gray-700">
              Medium of Instruction Accepted
            </label>
          </div>

          <div className="flex items-center">
            <input type="checkbox" {...register("Active")} className="mr-3" />
            <label className="text-sm font-medium text-gray-700">
              Active University
            </label>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Form Link
            </label>
            <input
              type="url"
              {...register("Application_form_link")}
              className="input-field"
              placeholder="https://university.edu/apply"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("Remark")}
              rows={3}
              className="input-field"
              placeholder="Additional notes about the university..."
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
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Saving..."
            : editData
            ? "Update University"
            : "Create University"}
        </button>
      </div>
    </form>
  );
};

export default UniversityForm;
