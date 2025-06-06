import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { USER_ROLE_LIST, USER_ROLES } from "../../utils/constants";
import { userService, branchService } from "../../services/firestore";

const UserForm = ({
  onClose,
  onSuccess,
  editData = null,
  currentUserProfile,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      role: USER_ROLES.COUNSELLOR,
      branchId: currentUserProfile?.branchId || "",
      isActive: true,
      ...editData,
    },
  });

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const watchedRole = watch("role");
  const isSuperAdmin = currentUserProfile?.role === USER_ROLES.SUPERADMIN;
  const isBranchAdmin = currentUserProfile?.role === USER_ROLES.BRANCH_ADMIN;

  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return USER_ROLE_LIST;
    } else if (isBranchAdmin) {
      return USER_ROLE_LIST.filter(
        (role) =>
          role !== USER_ROLES.SUPERADMIN && role !== USER_ROLES.BRANCH_ADMIN
      );
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  useEffect(() => {
    if (isSuperAdmin) {
      const fetchBranches = async () => {
        try {
          const fetchedBranches = await branchService.getAll();
          setBranches(fetchedBranches);
        } catch (error) {
          console.log("error", error);
        }
      };
      fetchBranches();
    }

    if (editData) {
      setValue("displayName", editData.displayName || "");
      setValue("email", editData.email || "");
      setValue("role", editData.role || USER_ROLES.COUNSELLOR);
      setValue("branchId", editData.branchId || "");
      setValue("isActive", editData.isActive !== false);
    }
  }, [editData, setValue, isSuperAdmin]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!isSuperAdmin && !isBranchAdmin) {
        console.log("You don't have permission to manage users.");
        return;
      }

      const userData = {
        displayName: data.displayName.trim(),
        email: data.email.toLowerCase().trim(),
        role: data.role,
        isActive: data.isActive,
        branchId: data.branchId || null,
      };

      if (isBranchAdmin && !isSuperAdmin) {
        userData.branchId = currentUserProfile.branchId;
      } else if (isSuperAdmin) {
        userData.branchId = data.branchId || null;
      }

      if (userData.role === USER_ROLES.SUPERADMIN) {
        userData.branchId = null;
      }

      if (editData) {
        const userId = editData.uid || editData.id;
        if (!userId) {
          throw new Error("User ID not found for update operation");
        }

        await userService.update(userId, userData);
        toast.success("User updated successfully!");
      } else {
        const tempUid = `user_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        await userService.create({
          ...userData,
          uid: tempUid,
          createdBy: currentUserProfile.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        toast.success("User profile created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowBranchSelection = () => {
    return (
      isSuperAdmin || (watchedRole && watchedRole !== USER_ROLES.SUPERADMIN)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <input
            type="text"
            {...register("displayName", {
              required: "Display name is required",
              minLength: {
                value: 2,
                message: "Display name must be at least 2 characters",
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter full name"
          />
          {errors.displayName && (
            <p className="text-red-600 text-sm mt-1">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/i,
                message: "Invalid email address",
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
            readOnly={!!editData}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
          {editData && (
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed after user creation
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            {...register("role", { required: "Role is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {shouldShowBranchSelection() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch {watchedRole === USER_ROLES.SUPERADMIN ? "" : "*"}
            </label>
            <select
              {...register("branchId", {
                required:
                  watchedRole !== USER_ROLES.SUPERADMIN
                    ? "Branch is required"
                    : false,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isBranchAdmin && !isSuperAdmin}
            >
              <option value="">
                {isSuperAdmin
                  ? "No specific branch (for Superadmin)"
                  : "Select Branch"}
              </option>
              {isSuperAdmin
                ? branches
                    .filter((branch) => branch.isActive)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </option>
                    ))
                : currentUserProfile?.branchId && (
                    <option value={currentUserProfile.branchId}>
                      Your Branch ({currentUserProfile.branchId.slice(0, 8)}...)
                    </option>
                  )}
            </select>
            {errors.branchId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.branchId.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isSuperAdmin
                ? "Superadmin users don't need a specific branch assignment"
                : "User will be assigned to your branch"}
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("isActive")}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              User is Active
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Inactive users cannot log in to the system
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          <X size={16} className="inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          <Save size={16} className="inline mr-1" />
          {loading ? "Saving..." : editData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
