import React, { useState } from 'react';
import { Plus, Download, Upload, FileText } from 'lucide-react';
import Modal from '../components/common/Modal';
import ApplicationForm from '../components/forms/ApplicationForm';
import ApplicationsTable from '../components/tables/ApplicationsTable';
import { useApplications, useAssessments } from '../hooks/useFirestore';
import { applicationService } from '../services/firestore';
import toast from 'react-hot-toast';

const Applications = () => {
  const { data: applications, loading, remove } = useApplications();
  const { data: assessments } = useAssessments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleDelete = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await remove(applicationId);
        toast.success('Application deleted successfully!');
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Failed to delete application. Please try again.');
      }
    }
  };

  const handleDownload = (application) => {
    // TODO: Implement document download functionality
    toast.info('Document download functionality will be implemented soon!');
  };

  const handleFormSuccess = () => {
    // The useApplications hook will automatically update the data
  };

  const handleExport = () => {
    toast.info('Export functionality will be implemented soon!');
  };

  const handleImport = () => {
    toast.info('Import functionality will be implemented soon!');
  };

  // Calculate stats
  const draftApplications = applications.filter(app => app.application_status === 'Draft').length;
  const submittedApplications = applications.filter(app => app.application_status === 'Submitted').length;
  const acceptedApplications = applications.filter(app => app.application_status === 'Accepted').length;
  const underReviewApplications = applications.filter(app => app.application_status === 'Under Review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Manage university applications and track submission status</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleImport}
            className="btn-secondary flex items-center"
          >
            <Upload size={20} className="mr-2" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            New Application
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <div className="text-indigo-600 text-2xl font-bold">
                {applications.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-xs text-gray-500">All submissions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <div className="text-gray-600 text-2xl font-bold">
                {draftApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-xs text-gray-500">In preparation</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {underReviewApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-xs text-gray-500">Being processed</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {acceptedApplications}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-xs text-gray-500">Successful applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <ApplicationsTable
          applications={applications}
          assessments={assessments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onDownload={handleDownload}
        />
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Application"
        size="large"
      >
        <ApplicationForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Application"
        size="large"
      >
        <ApplicationForm
          editData={selectedApplication}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* View Application Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Application Details"
        size="large"
      >
        {selectedApplication && (
          <ApplicationDetails 
            application={selectedApplication} 
            assessments={assessments}
          />
        )}
      </Modal>
    </div>
  );
};

// Application Details Component for View Modal
const ApplicationDetails = ({ application, assessments }) => {
  const getAssessment = (assessmentId) => {
    return assessments.find(assessment => assessment.id === assessmentId);
  };

  const assessment = getAssessment(application.application);

  const documents = [
    { key: 'sop', label: 'Statement of Purpose' },
    { key: 'cv', label: 'CV/Resume' },
    { key: 'passport', label: 'Passport' },
    { key: 'ielts', label: 'IELTS Score Report' },
    { key: 'toefl', label: 'TOEFL Score Report' },
    { key: 'gre', label: 'GRE Score Report' },
    { key: 'gmat', label: 'GMAT Score Report' },
    { key: 'pte', label: 'PTE Score Report' },
    { key: 'work_experience', label: 'Work Experience Letter' },
    { key: 'diploma_marksheet', label: 'Diploma Marksheet' },
    { key: 'bachelor_marksheet', label: 'Bachelor\'s Marksheet' },
    { key: 'master_marksheet', label: 'Master\'s Marksheet' },
    { key: 'other_documents', label: 'Other Documents' }
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Application ID</label>
            <p className="text-sm text-gray-900">APP-{application.id.slice(-8)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assessment ID</label>
            <p className="text-sm text-gray-900">
              {assessment ? `ASS-${assessment.id.slice(-8)}` : 'Not found'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Status</label>
            <p className="text-sm text-gray-900">
              {application.application_status ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  application.application_status === 'Accepted' ? 'bg-green-100 text-green-800' :
                  application.application_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  application.application_status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {application.application_status}
                </span>
              ) : 'No status set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created Date</label>
            <p className="text-sm text-gray-900">
              {application.createdAt 
                ? new Date(application.createdAt.toDate()).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Details */}
      {assessment && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Assessment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <p className="text-sm text-gray-900">{assessment.specialisation || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <p className="text-sm text-gray-900">{assessment.duration || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Application Fee</label>
              <p className="text-sm text-gray-900">{assessment.application_fee || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tuition Fee</label>
              <p className="text-sm text-gray-900">{assessment.tution_fee || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Status */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Documents Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-700">{doc.label}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                application[doc.key] 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {application[doc.key] ? 'Uploaded' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      {application.notes && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{application.notes}</p>
        </div>
      )}
    </div>
  );
};

export default Applications;