import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, Upload, AlertTriangle, X } from "lucide-react";
import Modal from "../components/Common/Modal";
import ApplicationForm from "../components/Application/ApplicationForm";
import { useApplications, useAssessments } from "../hooks/useFirestore";
import ApplicationsTable from "../components/Application/ApplicationsTable";
import ApplicationDetail from "../components/Application/ApplicationDetail";

const Applications = () => {
  const { data: assessments, loading: assessmentsLoading } = useAssessments();
  const {
    data: applications,
    loading: applicationsLoading,
    delete: deleteApplication,
    updateStatus: updateApplicationStatus,
  } = useApplications();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDeleteId, setApplicationToDeleteId] = useState(null);

  const isLoading = applicationsLoading || assessmentsLoading;

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleDelete = (applicationId) => {
    setApplicationToDeleteId(applicationId);
    setShowDeleteModal(true);
  };
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast.success("Application status updated successfully!");
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        error.message ||
          "Failed to update application status. Please try again."
      );
    }
  };

  const confirmDelete = async () => {
    if (applicationToDeleteId) {
      try {
        await deleteApplication(applicationToDeleteId);
        toast.success("Application deleted successfully!");
      } catch (error) {
        console.error("Error deleting application:", error);
        toast.error(
          error.message || "Failed to delete application. Please try again."
        );
      } finally {
        setShowDeleteModal(false);
        setApplicationToDeleteId(null);
      }
    }
  };

  const handleFormSuccess = (action = "submitted") => {
    toast.success(`Application ${action} successfully!`);
  };

  const safeApplications = Array.isArray(applications) ? applications : [];

  const draftApplications = safeApplications.filter(
    (app) => app.application_status === "Draft"
  ).length;

  const acceptedApplications = safeApplications.filter(
    (app) => app.application_status === "Accepted"
  ).length;

  const underReviewApplications = safeApplications.filter(
    (app) => app.application_status === "Under Review"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            Manage university applications and track submission status
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary flex items-center"
            disabled={isLoading}
          >
            <Upload size={20} className="mr-2" />
            Import
          </button>
          <button
            className="btn-secondary flex items-center"
            disabled={isLoading || !safeApplications.length}
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={isLoading}
          >
            <Plus size={20} className="mr-2" />
            Add Application
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-indigo-100 rounded-lg">
              <div className="text-indigo-600 text-2xl font-bold">
                {isLoading ? "..." : safeApplications.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Total Applications
              </p>
              <p className="text-xs text-gray-500">All submissions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-gray-100 rounded-lg">
              <div className="text-gray-600 text-2xl font-bold">
                {isLoading ? "..." : draftApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Draft</p>
              <p className="text-xs text-gray-500">In preparation</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {isLoading ? "..." : underReviewApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Under Review</p>
              <p className="text-xs text-gray-500">Being processed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {isLoading ? "..." : acceptedApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Accepted</p>
              <p className="text-xs text-gray-500">Successful applications</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <ApplicationsTable
          applications={safeApplications}
          assessments={assessments}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onUpdateStatus={handleStatusUpdate}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Application"
        size="large"
      >
        <ApplicationForm
          assessments={assessments}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            handleFormSuccess("created");
            setShowAddModal(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Application"
        size="large"
      >
        <ApplicationForm
          editData={selectedApplication}
          assessments={assessments}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess("updated");
            setShowEditModal(false);
            setSelectedApplication(null);
          }}
        />
      </Modal>
      <ApplicationDetail
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        application={selectedApplication}
        assessments={assessments}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setApplicationToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Application?
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
                setApplicationToDeleteId(null);
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              disabled
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

export default Applications;
