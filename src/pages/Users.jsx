import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Users as UsersIcon,
  UserCheck,
  UserX,
  AlertTriangle,
  X,
} from "lucide-react";
import Modal from "../components/Common/Modal";
import { USER_ROLES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/firestore";
import UserForm from "../components/Users/UserForm";
import UsersTable from "../components/Users/UsersTable";

const Users = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userToDeactivateId, setUserToDeactivateId] = useState(null);
  const [userToDeactivateName, setUserToDeactivateName] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await userService.getAll();
      setUsers(fetchedUsers);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDelete = (userId) => {
    const userToDelete = users.find(
      (user) => (user.id || user.uid) === userId
    );
    if (userToDelete) {
      setUserToDeactivateId(userId);
      setUserToDeactivateName(userToDelete.displayName || userToDelete.email);
      setShowDeactivateModal(true);
    } else {
      toast.error("User not found.");
      console.error("User not found for deactivation:", userId);
    }
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivateId) return;

    try {
      await userService.update(userToDeactivateId, {
        isActive: false,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: userProfile?.uid,
      });
      toast.success(`User ${userToDeactivateName} deactivated successfully!`);
      fetchUsers();
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error(
        `Failed to deactivate user ${userToDeactivateName}. Please try again.`
      );
    } finally {
      setShowDeactivateModal(false);
      setUserToDeactivateId(null);
      setUserToDeactivateName("");
    }
  };

  const handleFormSuccess = (message = "User operation successful!") => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers();
    toast.success(message);
  };

  const allUsers = users || [];
  const activeUsers = allUsers.filter((u) => u.isActive !== false);
  const inactiveUsers = allUsers.filter((u) => u.isActive === false);

  if (error && !allUsers.length) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Users
        </h2>
        <p className="text-red-500 mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const canManageUsers =
    userProfile?.role === USER_ROLES.SUPERADMIN ||
    userProfile?.role === USER_ROLES.BRANCH_ADMIN;

  if (!canManageUsers) {
    return (
      <div className="text-center py-12">
        <UserX className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage staff accounts and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
          disabled={loading} 
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <UsersIcon className="text-blue-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : allUsers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : activeUsers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <UserX className="text-red-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Inactive Users
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : inactiveUsers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          All Users
        </h3>
        <UsersTable
          users={allUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUserProfile={userProfile}
          loading={loading}
          totalUsersCount={allUsers.length}
        />
      </div>

      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New User"
          size="large"
        >
          <UserForm
            onClose={() => setShowAddModal(false)}
            onSuccess={() => handleFormSuccess("User added successfully!")}
            currentUserProfile={userProfile}
          />
        </Modal>
      )}

      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title="Edit User"
          size="large"
        >
          <UserForm
            editData={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => handleFormSuccess("User updated successfully!")}
            currentUserProfile={userProfile}
          />
        </Modal>
      )}

      <Modal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setUserToDeactivateId(null);
          setUserToDeactivateName("");
        }}
        title="Confirm Deactivation"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />{" "}
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Deactivate User: {userToDeactivateName}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              Are you sure you want to deactivate this user? They will no longer
              be able to access the system.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeactivateModal(false);
                setUserToDeactivateId(null);
                setUserToDeactivateName("");
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeactivateUser}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;