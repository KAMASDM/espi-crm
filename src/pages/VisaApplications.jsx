import React, { useState } from "react";
import { Plus, AlertTriangle, X } from "lucide-react";
import Modal from "../components/Common/Modal";
import VisaApplicationForm from "../components/VisaApplication/VisaApplicationForm";
import { useVisaApplications, useAssessments } from "../hooks/useFirestore";
import VisaApplicationTable from "../components/VisaApplication/VisaApplicationTable";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../utils/constants";
import toast from "react-hot-toast";
import VisaApplicationDetails from "../components/VisaApplication/VisaApplicationDetail";

const VisaApplication = () => {
  const { userProfile } = useAuth();
  const {
    data: visaApplications,
    delete: deleteVisaApplication,
    loading,
    error,
  } = useVisaApplications();
  const { data: assessments } = useAssessments();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisaApplication, setSelectedVisaApplication] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [visaAppToDeleteId, setVisaAppToDeleteId] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const handleEdit = (visaApplication) => {
    setSelectedVisaApplication(visaApplication);
    setShowEditModal(true);
  };

  const handleDelete = (visaAppId) => {
    setVisaAppToDeleteId(visaAppId);
    setShowDeleteModal(true);
  };

  const handleView = (visaApplication) => {
    setSelectedVisaApplication(visaApplication);
    setShowDetailsPanel(true);
  };

  const confirmDelete = async () => {
    if (visaAppToDeleteId) {
      try {
        await deleteVisaApplication(visaAppToDeleteId);
        toast.success("Application deleted successfully!");
      } catch (error) {
        console.error("Error deleting application:", error);
        toast.error(
          error.message || "Failed to delete application. Please try again."
        );
      } finally {
        setShowDeleteModal(false);
        setVisaAppToDeleteId(null);
      }
    }
  };

  const handleVisibility = userProfile.role === USER_ROLES.SUPERADMIN;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Visa Applications
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
            Visa Applications
          </h1>
          <p className="text-sm text-gray-600">
            Manage all student visa applications
          </p>
        </div>
        {handleVisibility && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={loading}
          >
            <Plus size={18} className="mr-1.5" /> Add Visa Application
          </button>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <VisaApplicationTable
          visaApplications={visaApplications}
          assessments={assessments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          handleVisibility={handleVisibility}
          onView={handleView}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Visa Application"
        size="large"
      >
        <VisaApplicationForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            toast.success("Visa application created successfully!");
          }}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVisaApplication(null);
        }}
        title="Edit Visa Application"
        size="large"
      >
        {selectedVisaApplication && (
          <VisaApplicationForm
            editData={selectedVisaApplication}
            onClose={() => {
              setShowEditModal(false);
              setSelectedVisaApplication(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedVisaApplication(null);
              toast.success("Visa application updated successfully!");
            }}
          />
        )}
      </Modal>

      <VisaApplicationDetails
        isOpen={showDetailsPanel}
        onClose={() => {
          setShowDetailsPanel(false);
          setSelectedVisaApplication(null);
        }}
        visaApplication={selectedVisaApplication}
        assessments={assessments}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          selectedVisaApplication(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Visa Application?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this application? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setVisaAppToDeleteId(null);
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              // disabled
              type="button"
              onClick={confirmDelete}
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

export default VisaApplication;
