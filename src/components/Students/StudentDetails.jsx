import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import {
  useEnquiries,
  useDetailEnquiries,
  useAssessments,
  useApplications,
  useBranches,
  usePayments,
  useUsers,
  useUniversities,
  useCourses,
} from "../../hooks/useFirestore";
import Loading from "../Common/Loading";
import AssessmentList from "./DetailComponents/AssessmentList";
import ApplicationList from "./DetailComponents/ApplicationList";
import PaymentList from "./DetailComponents/PaymentList";
import PersonalContactCard from "./StudentDetailComponents/PersonalContactCard";
import AcademicInterestsCard from "./StudentDetailComponents/AcademicInterestsCard";
import EnquiryStatusCard from "./StudentDetailComponents/EnquiryStatusCard";
import DetailEnquiryContent from "./StudentDetailComponents/DetailEnquiryContent";
import Modal from "../Common/Modal";
import EnquiryForm from "./EnquiryForm";
import DetailEnquiryForm from "../Forms/DetailEnquiryForm";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: allUsers, loading: usersLoading } = useUsers();
  const { data: allCourses, loading: coursesLoading } = useCourses();
  const { data: allBranches, loading: branchesLoading } = useBranches();
  const { data: allPayments, loading: paymentsLoading } = usePayments();
  const { data: allEnquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: allAssessments, loading: assessmentsLoading } =
    useAssessments();
  const { data: allApplications, loading: applicationsLoading } =
    useApplications();
  const { data: allUniversities, loading: universitiesLoading } =
    useUniversities();
  const { data: allDetailEnquiries, loading: detailEnquiriesLoading } =
    useDetailEnquiries();

  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("enquiry");
  const [selectedDetailEnquiry, setSelectedDetailEnquiry] = useState(null);
  const [showEditEnquiryModal, setShowEditEnquiryModal] = useState(false);
  const [showEditDetailEnquiryModal, setShowEditDetailEnquiryModal] =
    useState(false);

  const universitiesMap =
    allUniversities?.reduce((acc, uni) => {
      acc[uni.id] = uni;
      return acc;
    }, {}) || {};

  const coursesMap =
    allCourses?.reduce((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {}) || {};

  const usersMap =
    allUsers?.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {}) || {};

  const branchesMap =
    allBranches?.reduce((acc, branch) => {
      acc[branch.id] = branch;
      return acc;
    }, {}) || {};

  useEffect(() => {
    if (id && allEnquiries && !enquiriesLoading) {
      const foundStudent = allEnquiries.find((enquiry) => enquiry.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
        setError(null);
        if (allDetailEnquiries && !detailEnquiriesLoading) {
          const foundDetail = allDetailEnquiries.find(
            (detail) => detail.Current_Enquiry === foundStudent.id
          );
          setSelectedDetailEnquiry(foundDetail);
        }
      } else {
        setStudent(null);
        setSelectedDetailEnquiry(null);
        setError("Student not found.");
      }
    } else if (!id) {
      setError("No student ID provided in the URL.");
      setStudent(null);
      setSelectedDetailEnquiry(null);
    }
  }, [
    id,
    allEnquiries,
    enquiriesLoading,
    allDetailEnquiries,
    detailEnquiriesLoading,
  ]);

  const studentPayments = allPayments?.filter(
    ({ Memo_For }) => Memo_For === student?.id
  );

  const studentAssessments = allAssessments?.filter(
    ({ enquiry }) => enquiry === student?.id
  );

  const studentApplications = allApplications?.filter(({ assessmentId }) =>
    studentAssessments?.some(({ id }) => id === assessmentId)
  );

  const handleEditEnquiry = () => {
    setShowEditEnquiryModal(true);
  };

  const handleEditDetailEnquiry = () => {
    setShowEditDetailEnquiryModal(true);
  };

  const handleEnquiryFormSuccess = () => {
    setShowEditEnquiryModal(false);
  };

  const handleDetailEnquiryFormSuccess = () => {
    setShowEditDetailEnquiryModal(false);
  };

  if (
    enquiriesLoading ||
    detailEnquiriesLoading ||
    assessmentsLoading ||
    applicationsLoading ||
    branchesLoading ||
    paymentsLoading ||
    usersLoading ||
    universitiesLoading ||
    coursesLoading
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg shadow-md text-center max-w-md mx-auto my-10">
        <h2 className="text-2xl font-bold text-red-700 mb-3">
          Error Loading Student
        </h2>
        <p className="text-gray-700 text-base">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center mx-auto"
        >
          <ArrowLeft size={18} className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg shadow-md text-center max-w-md mx-auto my-10">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">
          No Student Selected
        </h2>
        <p className="text-gray-600 text-base">
          Please select a student to view their details.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 flex items-center mx-auto"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.student_First_Name} {student.student_Last_Name}
          </h1>
          <p className="text-gray-600">
            {student.student_email} - {student.student_city},{" "}
            {student.student_state}, {student.student_country}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="mr-2" /> Back to Students
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center border-b border-gray-200">
          <div className="flex flex-wrap">
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "enquiry"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("enquiry")}
            >
              Enquiry
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "detailEnquiry"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("detailEnquiry")}
            >
              Detail Enquiry
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "assessments"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("assessments")}
            >
              Assessment ({studentAssessments?.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "applications"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("applications")}
            >
              Application ({studentApplications?.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "payments"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("payments")}
            >
              Payment ({studentPayments?.length})
            </button>
          </div>
          {activeTab === "enquiry" && (
            <button
              onClick={handleEditEnquiry}
              className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
              title="Edit Student Enquiry"
            >
              <Edit size={16} />
            </button>
          )}
          {activeTab === "detailEnquiry" && selectedDetailEnquiry && (
            <button
              onClick={handleEditDetailEnquiry}
              className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
              title="Edit Detailed Enquiry Profile"
            >
              <Edit size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "enquiry" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PersonalContactCard student={student} />
            <AcademicInterestsCard
              student={student}
              universitiesMap={universitiesMap}
            />
            <EnquiryStatusCard
              student={student}
              usersMap={usersMap}
              branchesMap={branchesMap}
            />
          </div>
        )}

        {activeTab === "detailEnquiry" && (
          <DetailEnquiryContent selectedDetailEnquiry={selectedDetailEnquiry} />
        )}

        {activeTab === "assessments" && (
          <AssessmentList
            coursesMap={coursesMap}
            assessments={studentAssessments}
            universitiesMap={universitiesMap}
          />
        )}

        {activeTab === "applications" && (
          <ApplicationList
            assessments={studentAssessments}
            applications={studentApplications}
          />
        )}

        {activeTab === "payments" && (
          <PaymentList payments={studentPayments} student={student} />
        )}
      </div>

      <Modal
        isOpen={showEditEnquiryModal}
        onClose={() => setShowEditEnquiryModal(false)}
        title="Edit Student Enquiry"
        size="large"
      >
        <EnquiryForm
          editData={student}
          onClose={() => setShowEditEnquiryModal(false)}
          onSuccess={handleEnquiryFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showEditDetailEnquiryModal}
        onClose={() => setShowEditDetailEnquiryModal(false)}
        title="Edit Detailed Student Profile"
        size="full"
      >
        <DetailEnquiryForm
          selectedEnquiry={student}
          editData={selectedDetailEnquiry}
          onClose={() => setShowEditDetailEnquiryModal(false)}
          onSuccess={handleDetailEnquiryFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default StudentDetails;
