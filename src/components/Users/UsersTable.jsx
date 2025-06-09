import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";
import { branchService } from "../../services/firestore";
import { USER_ROLE_LIST, USER_ROLES } from "../../utils/constants";

const UsersTable = ({
  users = [],
  onEdit,
  onDelete,
  currentUserProfile,
  loading,
  totalUsersCount,
}) => {
  const [branches, setBranches] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchesLoading, setBranchesLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const fetchedBranches = await branchService.getAll();
        setBranches(fetchedBranches || []);
      } catch (error) {
        console.error("Error fetching branches for users table:", error);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const branchMap = branches.reduce((acc, branch) => {
    acc[branch.id] = branch.branchName || branch.name;
    return acc;
  }, {});

  const getBranchName = (branchId) => {
    if (!branchId) return "No Branch";
    if (branchesLoading) return "Loading...";
    return branchMap[branchId] || "Unknown Branch";
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && user.isActive !== false) ||
      (statusFilter === "inactive" && user.isActive === false);

    if (currentUserProfile?.role === USER_ROLES.BRANCH_ADMIN) {
      if (user.role === USER_ROLES.SUPERADMIN) {
        return matchesSearch && matchesRole && matchesStatus;
      }
      return (
        user.branchId === currentUserProfile.branchId &&
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (isActive) => {
    return isActive !== false ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle size={12} className="mr-1" /> Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    if (role === USER_ROLES.SUPERADMIN) {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else if (role === USER_ROLES.BRANCH_ADMIN) {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
    } else if (
      role === USER_ROLES.COUNSELLOR ||
      role === USER_ROLES.PROCESSOR
    ) {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
    } else if (
      role === USER_ROLES.RECEPTION ||
      role === USER_ROLES.ACCOUNTANT
    ) {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    } else if (role === USER_ROLES.AGENT) {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        <Shield size={12} className="mr-1" /> {role || "Unknown"}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return "N/A";

      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        return new Date(timestamp.toDate()).toLocaleDateString();
      }

      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }

      if (typeof timestamp === "string") {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString();
      }

      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const generateAvatarUrl = (displayName) => {
    const name = displayName?.replace(/\s/g, "+");
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
  };

  const colSpan = onEdit || onDelete ? 7 : 6;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {USER_ROLE_LIST.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {safeUsers.length} users
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading users...</p>
                </td>
              </tr>
            ) : totalUsersCount === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <UsersIcon className="mx-auto mb-2 text-gray-300" size={40} />
                  <p className="text-gray-500">No users added yet.</p>
                  {(currentUserProfile?.role === USER_ROLES.SUPERADMIN ||
                    currentUserProfile?.role === USER_ROLES.BRANCH_ADMIN) && (
                    <p className="text-sm text-gray-400 mt-2">
                      Click "Add User" above to get started.
                    </p>
                  )}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <Shield className="mx-auto mb-2 text-gray-300" size={40} />
                  <p className="text-gray-500">
                    No users found matching your criteria.
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id || user.uid || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-3 object-cover"
                        src={
                          user.photoURL || generateAvatarUrl(user.displayName)
                        }
                        alt={user.displayName}
                        onError={(e) => {
                          e.target.src = generateAvatarUrl(user.displayName);
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.displayName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      {getBranchName(user.branchId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(user.updatedAt)}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit &&
                          (currentUserProfile?.role === USER_ROLES.SUPERADMIN ||
                            (currentUserProfile?.role ===
                              USER_ROLES.BRANCH_ADMIN &&
                              user.role !== USER_ROLES.SUPERADMIN &&
                              user.branchId ===
                                currentUserProfile.branchId)) && (
                            <button
                              onClick={() => onEdit(user)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        {onDelete &&
                          user.role !== USER_ROLES.SUPERADMIN &&
                          (currentUserProfile?.role === USER_ROLES.SUPERADMIN ||
                            (currentUserProfile?.role ===
                              USER_ROLES.BRANCH_ADMIN &&
                              user.branchId === currentUserProfile.branchId &&
                              user.role !== USER_ROLES.BRANCH_ADMIN)) && (
                            <button
                              onClick={() => onDelete(user.id || user.uid)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Deactivate User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
