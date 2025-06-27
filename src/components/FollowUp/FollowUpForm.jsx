import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { followUpService } from "../../services/firestore";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_STEPS } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const FollowUpForm = ({
  onClose,
  onSuccess,
  studentId,
  studentName,
  step,
  editData = null,
}) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editData
      ? {
          ...editData,
          nextFollowUpDate: editData.nextFollowUpDate
            ? new Date(editData.nextFollowUpDate?.toDate())
                .toISOString()
                .split("T")[0]
            : "",
        }
      : {
          followUpNotes: "",
          nextFollowUpDate: new Date().toISOString().split("T")[0],
          followUpStatus: "Pending",
          step: step || "Enquiry",
        },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const followUpData = {
        ...data,
        studentId,
        studentName,
        nextFollowUpDate: new Date(data.nextFollowUpDate),
        updatedBy: user.uid,
      };

      if (editData) {
        await followUpService.update(editData.id, followUpData);
        toast.success("Follow-up updated successfully!");
      } else {
        await followUpService.create(followUpData);
        toast.success("Follow-up added successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving follow-up:", error);
      toast.error("Failed to save follow-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Follow-Up for {studentName}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-Up Notes *
            </label>
            <textarea
              {...register("followUpNotes", {
                required: "Notes are required",
              })}
              rows={4}
              className="input-field"
              placeholder="Enter notes for the follow-up..."
            />
            {errors.followUpNotes && (
              <p className="text-red-600 text-sm mt-1">
                {errors.followUpNotes.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Follow-Up Date *
            </label>
            <input
              type="date"
              {...register("nextFollowUpDate", {
                required: "Next follow-up date is required",
              })}
              className="input-field"
            />
            {errors.nextFollowUpDate && (
              <p className="text-red-600 text-sm mt-1">
                {errors.nextFollowUpDate.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              {...register("followUpStatus", {
                required: "Status is required",
              })}
              className="input-field"
            >
              {FOLLOW_UP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Process Step *
            </label>
            <select
              {...register("step", { required: "Step is required" })}
              className="input-field"
            >
              {FOLLOW_UP_STEPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
          {loading ? "Saving..." : "Save Follow-Up"}
        </button>
      </div>
    </form>
  );
};

export default FollowUpForm;
