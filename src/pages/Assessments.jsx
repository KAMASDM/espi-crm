import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, AlertTriangle, X } from "lucide-react";
import Modal from "../components/Common/Modal";
import AssessmentForm from "../components/Assessment/AssessmentForm";
import AssessmentsTable from "../components/Assessment/AssessmentsTable";
import AssessmentDetail from "../components/Assessment/AssessmentDetail";
import {
  useCourses,
  useEnquiries,
  useAssessments,
  useUniversities,
  useFollowUps,
} from "../hooks/useFirestore";
import FollowUpForm from "../components/FollowUp/FollowUpForm";

const Assessments = () => {
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: enquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: universities, loading: universitiesLoading } =
    useUniversities();
  const {
    data: assessments,
    loading: assessmentsLoading,
    delete: deleteAssessment,
    update,
  } = useAssessments();
  const { data: followUps, loading: followUpsLoading } = useFollowUps();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDeleteId, setAssessmentToDeleteId] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedStudentForFollowUp, setSelectedStudentForFollowUp] =
    useState(null);
  const [editingFollowUp, setEditingFollowUp] = useState(null);

  const isLoading =
    coursesLoading ||
    enquiriesLoading ||
    universitiesLoading ||
    assessmentsLoading;

  const openFollowUpModal = (student, followUp = null) => {
    setSelectedStudentForFollowUp(student);
    setEditingFollowUp(followUp);
    setShowFollowUpModal(true);
  };

  const handleFollowUpSuccess = () => {
    setShowFollowUpModal(false);
    setSelectedStudentForFollowUp(null);
    setEditingFollowUp(null);
  };

  const handleEdit = (assessment) => {
    setSelectedAssessment(assessment);
    setShowEditModal(true);
  };

  const handleView = (assessment) => {
    setSelectedAssessment(assessment);
    setShowViewModal(true);
  };

  const handleDelete = (assessmentId) => {
    setAssessmentToDeleteId(assessmentId);
    setShowDeleteModal(true);
  };

  const handleUpdateAssessmentStatus = async (assessmentId, newStatus) => {
    try {
      await update(assessmentId, {
        ass_status: newStatus,
      });
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const confirmDelete = async () => {
    if (assessmentToDeleteId) {
      try {
        await deleteAssessment(assessmentToDeleteId);
        toast.success("Assessment deleted successfully!");
      } catch (error) {
        console.error("Error deleting assessment:", error);
        toast.error("Failed to delete assessment. Please try again.");
      } finally {
        setShowDeleteModal(false);
        setAssessmentToDeleteId(null);
      }
    }
  };

  const handleFormSuccess = (action = "submitted") => {
    toast.success(`Assessment ${action} successfully!`);
  };

  const safeAssessments = Array.isArray(assessments) ? assessments : [];

  const pendingAssessments = safeAssessments.filter(
    (a) => a.ass_status === "Pending"
  ).length;
  const inProgressAssessments = safeAssessments.filter(
    (a) => a.ass_status === "In Progress"
  ).length;
  const completedAssessments = safeAssessments.filter(
    (a) => a.ass_status === "Completed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600">
            Evaluate student profiles and recommend suitable programs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary flex items-center"
            disabled={isLoading || !safeAssessments.length}
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
            Add Assessment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {isLoading ? "..." : safeAssessments.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Total Assessments
              </p>
              <p className="text-xs text-gray-500">All evaluations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {isLoading ? "..." : pendingAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {isLoading ? "..." : inProgressAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">In Progress</p>
              <p className="text-xs text-gray-500">Being evaluated</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {isLoading ? "..." : completedAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Completed</p>
              <p className="text-xs text-gray-500">Ready for application</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <AssessmentsTable
          assessments={safeAssessments}
          enquiries={enquiries}
          universities={universities}
          courses={courses}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onUpdateStatus={handleUpdateAssessmentStatus}
          onOpenFollowUp={openFollowUpModal}
          followUps={followUps}
          isFollowUpsLoading={followUpsLoading}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Assessment"
        size="large"
      >
        <AssessmentForm
          enquiries={enquiries}
          universities={universities}
          courses={courses}
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
        title="Edit Assessment"
        size="large"
      >
        <AssessmentForm
          editData={selectedAssessment}
          enquiries={enquiries}
          universities={universities}
          courses={courses}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess("updated");
            setShowEditModal(false);
            setSelectedAssessment(null);
          }}
        />
      </Modal>
      <AssessmentDetail
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        assessment={selectedAssessment}
        enquiries={enquiries}
        universities={universities}
        courses={courses}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssessmentToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Assessment?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this assessment? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setAssessmentToDeleteId(null);
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

      {showFollowUpModal && selectedStudentForFollowUp && (
        <Modal
          isOpen={showFollowUpModal}
          onClose={handleFollowUpSuccess}
          title={editingFollowUp ? "Edit Follow-Up" : "Add Follow-Up"}
        >
          <FollowUpForm
            studentId={selectedStudentForFollowUp.id}
            studentName={`${selectedStudentForFollowUp.student_First_Name} ${selectedStudentForFollowUp.student_Last_Name}`}
            step="Enquiry"
            editData={editingFollowUp}
            onSuccess={handleFollowUpSuccess}
            onClose={handleFollowUpSuccess}
          />
        </Modal>
      )}
    </div>
  );
};

export default Assessments;
