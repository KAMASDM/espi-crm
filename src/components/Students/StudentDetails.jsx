import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
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
  useVisaApplications,
} from "../../hooks/useFirestore";
import Modal from "../Common/Modal";
import Loading from "../Common/Loading";
import EnquiryForm from "./EnquiryForm";
import PaymentList from "./DetailComponents/PaymentList";
import DetailEnquiryForm from "../Forms/DetailEnquiryForm";
import AssessmentList from "./DetailComponents/AssessmentList";
import ApplicationList from "./DetailComponents/ApplicationList";
import PersonalContactCard from "./StudentDetailComponents/PersonalContactCard";
import AcademicInterestsCard from "./StudentDetailComponents/AcademicInterestsCard";
import EnquiryStatusCard from "./StudentDetailComponents/EnquiryStatusCard";
import DetailEnquiryContent from "./StudentDetailComponents/DetailEnquiryContent";
import AssessmentForm from "../Assessment/AssessmentForm";
import ApplicationForm from "../Application/ApplicationForm";
import PaymentForm from "../Payment/PaymentForm";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLES } from "../../utils/constants";
import NotesTab from "./StudentDetailComponents/NotesTab";
import VisaApplicationTable from "../VisaApplication/VisaApplicationTable";
import VisaApplicationForm from "../VisaApplication/VisaApplicationForm";

const permissions = {
  enquiry: {
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.COUNSELLOR,
    ],
  },
  detailEnquiry: {
    add: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.COUNSELLOR,
    ],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.COUNSELLOR,
    ],
  },
  assessment: {
    add: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.PROCESSOR],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.PROCESSOR,
    ],
  },
  application: {
    add: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.PROCESSOR],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.PROCESSOR,
    ],
  },
  visaApplication: {
    add: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.PROCESSOR],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.PROCESSOR,
    ],
  },
  payment: {
    add: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.ACCOUNTANT,
    ],
  },
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const { data: allUsers, loading: usersLoading } = useUsers();
  const { data: allCourses, loading: coursesLoading } = useCourses();
  const { data: allBranches, loading: branchesLoading } = useBranches();
  const { data: allPayments, loading: paymentsLoading } = usePayments();
  const { data: allEnquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: allAssessments, loading: assessmentsLoading } =
    useAssessments();
  const { data: allApplications, loading: applicationsLoading } =
    useApplications();
  const { data: allVisaApplications, loading: visaApplicationsLoading } =
    useVisaApplications();
  const { data: allUniversities, loading: universitiesLoading } =
    useUniversities();
  const { data: allDetailEnquiries, loading: detailEnquiriesLoading } =
    useDetailEnquiries();

  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("enquiry");
  const [selectedDetailEnquiry, setSelectedDetailEnquiry] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showDetailEnquiryModal, setShowDetailEnquiryModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showVisaApplicationModal, setShowVisaApplicationModal] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const universitiesMap = React.useMemo(
    () =>
      allUniversities?.reduce((acc, uni) => {
        acc[uni.id] = uni;
        return acc;
      }, {}) || {},
    [allUniversities]
  );

  const coursesMap = React.useMemo(
    () =>
      allCourses?.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
      }, {}) || {},
    [allCourses]
  );

  const usersMap = React.useMemo(
    () =>
      allUsers?.reduce((acc, user) => {
        acc[user.id] = {
          name: user.displayName.trim(),
          ...user,
        };
        return acc;
      }, {}) || {},
    [allUsers]
  );

  const branchesMap = React.useMemo(
    () =>
      allBranches?.reduce((acc, branch) => {
        acc[branch.id] = branch;
        return acc;
      }, {}) || {},
    [allBranches]
  );

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
  const studentVisaApplications = allVisaApplications?.filter(
    ({ studentEnquiryId }) => studentEnquiryId === student?.id
  );

  const hasEnquiry = !!student;
  const hasDetailEnquiry = !!selectedDetailEnquiry;
  const hasAssessments = studentAssessments?.length > 0;
  const hasApplications = studentApplications?.length > 0;
  const hasVisaApplications = studentVisaApplications?.length > 0;

  const hasPermission = (section, action) => {
    if (!userProfile || !userProfile.role) return false;
    const allowedRoles = permissions[section]?.[action];
    return allowedRoles?.includes(userProfile.role);
  };

  const handleSuccess = (modalSetter) => {
    modalSetter(false);
    setEditMode(false);
  };

  const handleEditClick = (modalSetter) => {
    setEditMode(true);
    modalSetter(true);
  };

  const handleAddClick = (modalSetter) => {
    setEditMode(false);
    modalSetter(true);
  };

  const isLoading =
    enquiriesLoading ||
    detailEnquiriesLoading ||
    assessmentsLoading ||
    applicationsLoading ||
    visaApplicationsLoading ||
    branchesLoading ||
    paymentsLoading ||
    usersLoading ||
    universitiesLoading ||
    coursesLoading;

  if (isLoading) {
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
        <button
          className="btn-primary flex items-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Students
        </button>
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
            {hasEnquiry && (
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
            )}
            {hasDetailEnquiry && (
              <button
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === "assessments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("assessments")}
              >
                Assessment ({studentAssessments?.length || 0})
              </button>
            )}
            {hasAssessments && (
              <button
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === "applications"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("applications")}
              >
                Application ({studentApplications?.length || 0})
              </button>
            )}
            {hasApplications && (
              <button
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === "visa-application"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("visa-application")}
              >
                Visa Application ({studentVisaApplications?.length || 0})
              </button>
            )}
            {hasApplications && (
              <button
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === "payments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("payments")}
              >
                Payment ({studentPayments?.length || 0})
              </button>
            )}
            <button
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === "notes"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === "enquiry" && hasPermission("enquiry", "edit") && (
              <button
                onClick={() => handleEditClick(setShowEnquiryModal)}
                className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
                title="Edit Enquiry"
              >
                <Edit size={16} />
              </button>
            )}

            {activeTab === "detailEnquiry" && (
              <>
                {hasDetailEnquiry && hasPermission("detailEnquiry", "edit") && (
                  <button
                    onClick={() => handleEditClick(setShowDetailEnquiryModal)}
                    className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
                    title="Edit Detail Enquiry"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {!hasDetailEnquiry && hasPermission("detailEnquiry", "add") && (
                  <button
                    onClick={() => handleAddClick(setShowDetailEnquiryModal)}
                    className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm"
                    title="Add Detail Enquiry"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
              </>
            )}

            {activeTab === "assessments" && hasDetailEnquiry && (
              <>
                {hasAssessments && hasPermission("assessment", "edit") && (
                  <button
                    onClick={() => handleEditClick(setShowAssessmentModal)}
                    className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
                    title="Edit Assessment"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {hasPermission("assessment", "add") && (
                  <button
                    onClick={() => handleAddClick(setShowAssessmentModal)}
                    className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                    title="Add Assessment"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
              </>
            )}

            {activeTab === "applications" && hasAssessments && (
              <>
                {hasApplications && hasPermission("application", "edit") && (
                  <button
                    onClick={() => handleEditClick(setShowApplicationModal)}
                    className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
                    title="Edit Application"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {hasPermission("application", "add") && (
                  <button
                    onClick={() => handleAddClick(setShowApplicationModal)}
                    className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                    title="Add Application"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
              </>
            )}

            {activeTab === "visa-application" && hasApplications && (
              <>
                {hasVisaApplications &&
                  hasPermission("visaApplication", "edit") && (
                    <button
                      onClick={() =>
                        handleEditClick(setShowVisaApplicationModal)
                      }
                      className="p-1 text-yellow-600 hover:text-yellow-900 rounded-md hover:bg-yellow-100 transition-colors"
                      title="Edit Visa Application"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                {hasPermission("visaApplication", "add") && (
                  <button
                    onClick={() => handleAddClick(setShowVisaApplicationModal)}
                    className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                    title="Add Visa Application"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
              </>
            )}

            {activeTab === "payments" && hasApplications && (
              <>
                {hasPermission("payment", "add") && (
                  <button
                    onClick={() => handleAddClick(setShowPaymentModal)}
                    className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm"
                    title="Add Payment"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
              </>
            )}
          </div>
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
        {activeTab === "visa-application" && (
          <VisaApplicationTable visaApplications={studentVisaApplications} />
        )}
        {activeTab === "payments" && (
          <PaymentList payments={studentPayments} student={student} />
        )}
        {activeTab === "notes" && (
          <NotesTab
            student={student}
            studentAssessments={studentAssessments}
            studentApplications={studentApplications}
            usersMap={usersMap}
          />
        )}
      </div>

      <Modal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        title="Edit Student Enquiry"
        size="large"
      >
        <EnquiryForm
          editData={student}
          onClose={() => setShowEnquiryModal(false)}
          onSuccess={() => handleSuccess(setShowEnquiryModal)}
        />
      </Modal>

      <Modal
        isOpen={showDetailEnquiryModal}
        onClose={() => setShowDetailEnquiryModal(false)}
        title={
          editMode && hasDetailEnquiry
            ? "Edit Detailed Profile"
            : "Add Detailed Profile"
        }
        size="full"
      >
        <DetailEnquiryForm
          selectedEnquiry={student}
          editData={editMode ? selectedDetailEnquiry : null}
          onClose={() => setShowDetailEnquiryModal(false)}
          onSuccess={() => handleSuccess(setShowDetailEnquiryModal)}
        />
      </Modal>

      <Modal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        title={editMode ? "Edit Assessment" : "Add New Assessment"}
        size="full"
      >
        <AssessmentForm
          editData={editMode ? studentAssessments[0] : null}
          onClose={() => setShowAssessmentModal(false)}
          onSuccess={() => handleSuccess(setShowAssessmentModal)}
          studentId={student?.id}
        />
      </Modal>

      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={editMode ? "Edit Application" : "Add New Application"}
        size="full"
      >
        <ApplicationForm
          editData={editMode ? studentApplications[0] : null}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={() => handleSuccess(setShowApplicationModal)}
          studentId={student?.id}
        />
      </Modal>

      <Modal
        isOpen={showVisaApplicationModal}
        onClose={() => setShowVisaApplicationModal(false)}
        title={editMode ? "Edit Visa Application" : "Add New Visa Application"}
        size="large"
      >
        <VisaApplicationForm
          editData={editMode ? studentVisaApplications[0] : null}
          onClose={() => setShowVisaApplicationModal(false)}
          onSuccess={() => handleSuccess(setShowVisaApplicationModal)}
        />
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add New Payment"
        size="large"
      >
        <PaymentForm
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => handleSuccess(setShowPaymentModal)}
        />
      </Modal>
    </div>
  );
};

export default StudentDetails;
