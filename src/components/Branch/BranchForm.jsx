import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { USER_ROLES } from "../../utils/constants";
import { branchService, userService } from "../../services/firestore";

const BranchForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: editData || { isActive: true },
  });
  const [loading, setLoading] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);

  useEffect(() => {
    const fetchPotentialAdmins = async () => {
      try {
        const users = await userService.getAll();
        setAvailableAdmins(
          users.filter(
            (u) =>
              u.isActive &&
              (u.role === USER_ROLES.ADMIN ||
                u.role === USER_ROLES.BRANCH_MANAGER ||
                u.role === USER_ROLES.COUNSELLOR ||
                !u.role)
          )
        );
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchPotentialAdmins();

    if (editData) {
      setValue("branchName", editData.branchName);
      setValue("branchAdminId", editData.branchAdminId || "");
      setValue("address", editData.address || "");
      setValue("contactPerson", editData.contactPerson || "");
      setValue("contactEmail", editData.contactEmail || "");
      setValue("contactPhone", editData.contactPhone || "");
      setValue(
        "isActive",
        editData.isActive !== undefined ? editData.isActive : true
      );
    }
  }, [editData, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const branchData = {
        branchName: data.branchName,
        branchAdminId: data.branchAdminId || null,
        address: data.address,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        isActive: data.isActive,
      };

      if (editData) {
        await branchService.update(editData.id, branchData);
        if (editData.branchAdminId !== data.branchAdminId) {
          if (editData.branchAdminId)
            await userService.update(editData.branchAdminId, {
              role: USER_ROLES.COUNSELLOR,
            });
          if (data.branchAdminId)
            await userService.update(data.branchAdminId, {
              role: USER_ROLES.BRANCH_ADMIN,
              branchId: editData.id,
            });
        }
        toast.success("Branch updated successfully!");
      } else {
        const newBranchId = await branchService.create(branchData);
        if (data.branchAdminId) {
          await userService.update(data.branchAdminId, {
            role: USER_ROLES.BRANCH_ADMIN,
            branchId: newBranchId,
          });
        }
        toast.success("Branch created successfully!");
      }
      onSuccess();
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Branch Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name *
            </label>
            <input
              type="text"
              {...register("branchName", {
                required: "Branch name is required",
              })}
              className="input-field"
            />
            {errors.branchName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.branchName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Admin (Optional)
            </label>
            <select {...register("branchAdminId")} className="input-field">
              <option value="">Select Branch Admin</option>
              {availableAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.displayName} ({admin.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Assigning an admin will update their role to 'Branch Admin'.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              {...register("address", { required: "Address is required" })}
              rows={3}
              className="input-field"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              {...register("contactPerson")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              {...register("contactEmail", {
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="input-field"
            />
            {errors.contactEmail && (
              <p className="text-red-600 text-sm mt-1">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              {...register("contactPhone")}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Branch is Active
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
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : editData ? "Update Branch" : "Create Branch"}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;
