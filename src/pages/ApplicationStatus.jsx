import React, { useState } from "react";
import { Plus, AlertTriangle, XCircle, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Common/Modal";
import { USER_ROLES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import ApplicationStatusForm from "../components/ApplicationStatus/ApplicationStatusForm";
import ApplicationStatusTable from "../components/ApplicationStatus/ApplicationStatusTable";
import { applicationStatusService } from "../services/firestore";
import { useApplicationStatus } from "../hooks/useFirestore";

const ApplicationStatus = () => {
  const { userProfile } = useAuth();
  const { data: applicationStatuses, loading, error } = useApplicationStatus();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusToDeleteId, setStatusToDeleteId] = useState(null);
  const [statusToDeleteName, setStatusToDeleteName] = useState("");

  const handleEdit = (status) => {
    setSelectedStatus(status);
    setShowEditModal(true);
  };

  const handleDelete = (statusId) => {
    const status = applicationStatuses.find((s) => s.id === statusId);
    if (status) {
      setStatusToDeleteId(statusId);
      setStatusToDeleteName(status.applicationStatus);
      setShowDeleteModal(true);
    } else {
      toast.error("Application status not found.");
    }
  };

  const confirmDeleteStatus = async () => {
    if (!statusToDeleteId) return;

    try {
      await applicationStatusService.delete(statusToDeleteId);
      toast.success(`Status "${statusToDeleteName}" deleted successfully!`);
    } catch (err) {
      console.error("Error deleting status:", err);
      toast.error(
        `Failed to delete status "${statusToDeleteName}". ${err.message || ""}`
      );
    } finally {
      setShowDeleteModal(false);
      setStatusToDeleteId(null);
      setStatusToDeleteName("");
    }
  };

  const handleFormSuccess = (action = "submitted") => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedStatus(null);
    toast.success(`Status ${action} successfully!`);
  };

  const totalStatusesCount = applicationStatuses.length;
  const activeStatusesCount = applicationStatuses.filter(
    (s) => s.isActive
  ).length;
  const inactiveStatusesCount = applicationStatuses.filter(
    (s) => !s.isActive
  ).length;

  const handleVisibility = userProfile.role === USER_ROLES.SUPERADMIN;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Statuses
        </h2>
        <p className="text-red-500 mb-4">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Application Status
          </h1>
          <p className="text-sm text-gray-600">
            Manage all application statuses
          </p>
        </div>
        {handleVisibility && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={loading}
          >
            <Plus size={18} className="mr-1.5" /> Add Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-sky-100 rounded-lg">
              <CheckCircle2 className="text-sky-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Total Statuses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalStatusesCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Active Statuses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : activeStatusesCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Inactive Statuses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : inactiveStatusesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <ApplicationStatusTable
          applicationStatuses={applicationStatuses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          handleVisibility={handleVisibility}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Status"
        size="large"
      >
        <ApplicationStatusForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => handleFormSuccess("added")}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStatus(null);
        }}
        title="Edit Status"
        size="large"
      >
        {selectedStatus && (
          <ApplicationStatusForm
            editData={selectedStatus}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStatus(null);
            }}
            onSuccess={() => handleFormSuccess("updated")}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStatusToDeleteId(null);
          setStatusToDeleteName("");
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Status: {statusToDeleteName}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              Are you sure you want to delete this status? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteStatus}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationStatus;
