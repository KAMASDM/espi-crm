import { useState } from "react";
import { Plus, Download, Upload } from "lucide-react";
import Modal from "../components/common/Modal";
import AssessmentForm from "../components/forms/AssessmentForm";
import AssessmentsTable from "../components/tables/AssessmentsTable";
import {
  useAssessments,
  useEnquiries,
  useUniversities,
  useCourses,
} from "../hooks/useFirestore";
import { COUNTRIES } from "../utils/constants";
import toast from "react-hot-toast";

const Assessments = () => {
  const { data: assessments, loading, remove } = useAssessments();
  const { data: enquiries } = useEnquiries();
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleEdit = (assessment) => {
    setSelectedAssessment(assessment);
    setShowEditModal(true);
  };

  const handleView = (assessment) => {
    setSelectedAssessment(assessment);
    setShowViewModal(true);
  };

  const handleDelete = async (assessmentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this assessment? This action cannot be undone."
      )
    ) {
      try {
        await remove(assessmentId);
        toast.success("Assessment deleted successfully!");
      } catch (error) {
        console.error("Error deleting assessment:", error);
        toast.error("Failed to delete assessment. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {};

  const handleExport = () => {
    toast.info("Export functionality will be implemented soon!");
  };

  const handleImport = () => {
    toast.info("Import functionality will be implemented soon!");
  };

  // Calculate stats
  const pendingAssessments = assessments.filter(
    (a) => a.ass_status === "Pending"
  ).length;
  const inProgressAssessments = assessments.filter(
    (a) => a.ass_status === "In Progress"
  ).length;
  const completedAssessments = assessments.filter(
    (a) => a.ass_status === "Completed"
  ).length;
  const uniqueStudents = [...new Set(assessments.map((a) => a.enquiry))].length;

  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
      : "Unknown Student";
  };

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university ? university.univ_name : "Unknown University";
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.course_name : "Course not specified";
  };

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

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
            New Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {assessments.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Assessments
              </p>
              <p className="text-xs text-gray-500">All evaluations</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {pendingAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {inProgressAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xs text-gray-500">Being evaluated</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {completedAssessments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xs text-gray-500">Ready for application</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <AssessmentsTable
          assessments={assessments}
          enquiries={enquiries}
          universities={universities}
          courses={courses}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Assessment"
        size="large"
      >
        <AssessmentForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
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
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Assessment Details"
        size="large"
      >
        {selectedAssessment && (
          <AssessmentDetails
            assessment={selectedAssessment}
            enquiries={enquiries}
            universities={universities}
            courses={courses}
          />
        )}
      </Modal>
    </div>
  );
};

const AssessmentDetails = ({
  assessment,
  enquiries,
  universities,
  courses,
}) => {
  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
      : "Unknown Student";
  };

  const getStudentEmail = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry ? enquiry.student_email : "Unknown";
  };

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university ? university.univ_name : "Unknown University";
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.course_name : "Course not specified";
  };

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Student Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student Name
            </label>
            <p className="text-sm text-gray-900">
              {getStudentName(assessment.enquiry)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student Email
            </label>
            <p className="text-sm text-gray-900">
              {getStudentEmail(assessment.enquiry)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country of Interest
            </label>
            <p className="text-sm text-gray-900">
              {getCountryName(assessment.student_country)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Level Applying For
            </label>
            <p className="text-sm text-gray-900">
              {assessment.level_applying_for}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          University & Course Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              University
            </label>
            <p className="text-sm text-gray-900">
              {getUniversityName(assessment.university)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <p className="text-sm text-gray-900">
              {getCourseName(assessment.course_interested)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specialization
            </label>
            <p className="text-sm text-gray-900">
              {assessment.specialisation || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <p className="text-sm text-gray-900">
              {assessment.duration || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Intake Interested
            </label>
            <p className="text-sm text-gray-900">
              {assessment.intake_interested || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Link
            </label>
            <p className="text-sm text-gray-900">
              {assessment.course_link ? (
                <a
                  href={assessment.course_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {assessment.course_link}
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Financial Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Fee
            </label>
            <p className="text-sm text-gray-900">
              {assessment.application_fee || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tuition Fee
            </label>
            <p className="text-sm text-gray-900">
              {assessment.tution_fee || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <p className="text-sm text-gray-900">
              {assessment.fee_currency || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Assessment Status & Notes
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm text-gray-900">
              {assessment.ass_status ? (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    assessment.ass_status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : assessment.ass_status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : assessment.ass_status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {assessment.ass_status}
                </span>
              ) : (
                "Not specified"
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assessment Notes
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {assessment.notes || "No notes available"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Created Date
        </label>
        <p className="text-sm text-gray-900">
          {assessment.createdAt
            ? new Date(assessment.createdAt.toDate()).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>
    </div>
  );
};

export default Assessments;
