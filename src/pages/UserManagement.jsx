import { useState, useEffect } from "react";
import { Plus, Users as UsersIcon, UserCheck, UserX } from "lucide-react";
import Modal from "../components/common/Modal";
import UserForm from "../components/forms/UserForm";
import UsersTable from "../components/tables/UsersTable";
import { userService } from "../services/firestore";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../utils/constants";
import toast from "react-hot-toast";

const UserManagement = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await userService.getAll();
      console.log("Fetched users:", fetchedUsers);
      setUsers(fetchedUsers || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userToEdit) => {
    console.log("Editing user:", userToEdit);
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find((user) => (user.id || user.uid) === userId);

    if (!userToDelete) {
      toast.error("User not found");
      return;
    }

    const confirmMessage =
      "Are you sure you want to deactivate this user? They will no longer be able to access the system.";

    if (window.confirm(confirmMessage)) {
      try {
        await userService.update(userId, {
          isActive: false,
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: userProfile?.uid,
        });
        toast.success("User deactivated successfully!");
        fetchUsers();
      } catch (err) {
        console.error("Error deactivating user:", err);
        toast.error("Failed to deactivate user.");
      }
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const allUsers = users || [];
  const activeUsers = allUsers.filter((u) => u.isActive !== false);
  const inactiveUsers = allUsers.filter((u) => u.isActive === false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          Error loading users: {error.message}
        </div>
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

  console.log("Rendering UserManagement with users:", allUsers);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage staff accounts and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="text-blue-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{allUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{activeUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="text-red-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Inactive Users
              </p>
              <p className="text-2xl font-bold">{inactiveUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            Debug: Found {allUsers.length} users. Current user role:{" "}
            {userProfile?.role}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Users List
          </h3>
          {allUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <UsersTable
              users={allUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserProfile={userProfile}
            />
          )}
        </div>
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
            onSuccess={handleFormSuccess}
            currentUserProfile={userProfile}
          />
        </Modal>
      )}

      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="large"
        >
          <UserForm
            editData={selectedUser}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            currentUserProfile={userProfile}
          />
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
