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
} from "../../hooks/useFirestore.js";
import Modal from "../Common/Modal.jsx";
import Loading from "../Common/Loading.jsx";
import EnquiryForm from "./EnquiryForm.jsx";
import DetailEnquiryForm from "../Forms/DetailEnquiryForm.jsx";
import AssessmentForm from "../Assessment/AssessmentForm.jsx";
import ApplicationForm from "../Application/ApplicationForm.jsx";
import PaymentForm from "../Payment/PaymentForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { USER_ROLES } from "../../utils/constants.js";
import NotesTab from "./StudentDetailComponents/NotesTab.jsx";
import VisaApplicationTable from "../VisaApplication/VisaApplicationTable.jsx";
import VisaApplicationForm from "../VisaApplication/VisaApplicationForm.jsx";
import PersonalContactCard from "./StudentDetailComponents/PersonalContactCard.jsx";
import AcademicInterestsCard from "./StudentDetailComponents/AcademicInterestsCard.jsx";
import EnquiryStatusCard from "./StudentDetailComponents/EnquiryStatusCard.jsx";
import DetailEnquiryContent from "./StudentDetailComponents/DetailEnquiryContent.jsx";
import AssessmentsTable from "../Assessment/AssessmentsTable.jsx";
import ApplicationsTable from "../Application/ApplicationsTable.jsx";
import PaymentsTable from "../Payment/PaymentsTable.jsx";
import toast from "react-hot-toast";
import AssessmentDetail from "../Assessment/AssessmentDetail.jsx";
import ApplicationDetail from "../Application/ApplicationDetail.jsx";
import PaymentDetail from "../Payment/PaymentDetail.jsx";
import VisaApplicationDetail from "../VisaApplication/VisaApplicationDetail.jsx";

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
    delete: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
  },
  application: {
    add: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.PROCESSOR],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.PROCESSOR,
    ],
    delete: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
  },
  visaApplication: {
    add: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.PROCESSOR],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.PROCESSOR,
    ],
    delete: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
  },
  payment: {
    add: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.ACCOUNTANT,
    ],
    edit: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.BRANCH_ADMIN,
      USER_ROLES.ACCOUNTANT,
    ],
    delete: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
  },
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const { data: allUsers, loading: usersLoading } = useUsers();
  const { data: allCourses, loading: coursesLoading } = useCourses();
  const { data: allBranches, loading: branchesLoading } = useBranches();
  const {
    data: allPayments,
    loading: paymentsLoading,
    delete: deletePayment,
  } = usePayments();
  const { data: allEnquiries, loading: enquiriesLoading } = useEnquiries();
  const {
    data: allAssessments,
    loading: assessmentsLoading,
    delete: deleteAssessment,
    update: updateAssessment,
  } = useAssessments();
  const {
    data: allApplications,
    loading: applicationsLoading,
    delete: deleteApplication,
    updateStatus: updateApplicationStatus,
  } = useApplications();
  const {
    data: allVisaApplications,
    loading: visaApplicationsLoading,
    delete: deleteVisaApplication,
  } = useVisaApplications();
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
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedForView, setSelectedForView] = useState(null);
  const [viewModalType, setViewModalType] = useState(null);

  const universitiesMap = React.useMemo(
    () =>
      allUniversities?.reduce((acc, uni) => {
        acc[uni.id] = uni;
        return acc;
      }, {}) || {},
    [allUniversities]
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
    ({ studentId: visaStudentId }) =>
      studentApplications?.some(({ id }) => id === visaStudentId)
  );

  const hasEnquiry = !!student;
  const hasDetailEnquiry = !!selectedDetailEnquiry;
  const hasAssessments = studentAssessments?.length > 0;
  const hasApplications = studentApplications?.length > 0;

  const hasPermission = (section, action) => {
    if (!userProfile || !userProfile.role) return false;
    const allowedRoles = permissions[section]?.[action];
    return allowedRoles?.includes(userProfile.role);
  };

  const handleSuccess = (modalSetter) => {
    modalSetter(false);
    setEditMode(false);
    setSelectedForEdit(null);
  };

  const handleEditClick = (modalSetter, data) => {
    setEditMode(true);
    setSelectedForEdit(data);
    modalSetter(true);
  };

  const handleAddClick = (modalSetter) => {
    setEditMode(false);
    setSelectedForEdit(null);
    modalSetter(true);
  };

  const handleViewClick = (item, type) => {
    setSelectedForView(item);
    setViewModalType(type);
  };

  const handleDeleteItem = async (service, itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
      try {
        await service(itemId);
        toast.success(`${itemName} deleted successfully!`);
      } catch (err) {
        toast.error(`Failed to delete ${itemName}.`);
        console.error(`Error deleting ${itemName}:`, err);
      }
    }
  };

  const handleUpdateAssessmentStatus = async (assessmentId, newStatus) => {
    try {
      await updateAssessment(assessmentId, { ass_status: newStatus });
      toast.success(`Assessment status updated!`);
    } catch (err) {
      toast.error(`Failed to update assessment status.`);
      console.error(`Error updating assessment status:`, err);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application status updated!`);
    } catch (err) {
      toast.error(`Failed to update application status.`);
      console.error(`Error updating application status:`, err);
    }
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
                onClick={() => handleEditClick(setShowEnquiryModal, student)}
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
                    onClick={() =>
                      handleEditClick(
                        setShowDetailEnquiryModal,
                        selectedDetailEnquiry
                      )
                    }
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

            {activeTab === "assessments" &&
              hasDetailEnquiry &&
              hasPermission("assessment", "add") && (
                <button
                  onClick={() => handleAddClick(setShowAssessmentModal)}
                  className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                  title="Add Assessment"
                >
                  <Plus size={14} className="mr-1" /> Add
                </button>
              )}

            {activeTab === "applications" &&
              hasAssessments &&
              hasPermission("application", "add") && (
                <button
                  onClick={() => handleAddClick(setShowApplicationModal)}
                  className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                  title="Add Application"
                >
                  <Plus size={14} className="mr-1" /> Add
                </button>
              )}

            {activeTab === "visa-application" &&
              hasApplications &&
              hasPermission("visaApplication", "add") && (
                <button
                  onClick={() => handleAddClick(setShowVisaApplicationModal)}
                  className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm ml-2"
                  title="Add Visa Application"
                >
                  <Plus size={14} className="mr-1" /> Add
                </button>
              )}

            {activeTab === "payments" &&
              hasApplications &&
              hasPermission("payment", "add") && (
                <button
                  onClick={() => handleAddClick(setShowPaymentModal)}
                  className="btn-secondary btn-xs flex items-center px-2 py-1 text-sm"
                  title="Add Payment"
                >
                  <Plus size={14} className="mr-1" /> Add
                </button>
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
          <AssessmentsTable
            assessments={studentAssessments}
            enquiries={allEnquiries}
            universities={allUniversities}
            courses={allCourses}
            loading={
              assessmentsLoading ||
              enquiriesLoading ||
              universitiesLoading ||
              coursesLoading
            }
            onEdit={(assessment) =>
              handleEditClick(setShowAssessmentModal, assessment)
            }
            onDelete={(assessmentId) =>
              handleDeleteItem(deleteAssessment, assessmentId, "Assessment")
            }
            onView={(assessment) => handleViewClick(assessment, "assessment")}
            onUpdateStatus={handleUpdateAssessmentStatus}
          />
        )}
        {activeTab === "applications" && (
          <ApplicationsTable
            applications={studentApplications}
            assessments={studentAssessments}
            loading={applicationsLoading || assessmentsLoading}
            onEdit={(application) =>
              handleEditClick(setShowApplicationModal, application)
            }
            onDelete={(applicationId) =>
              handleDeleteItem(deleteApplication, applicationId, "Application")
            }
            onView={(application) =>
              handleViewClick(application, "application")
            }
            onUpdateStatus={handleUpdateApplicationStatus}
          />
        )}
        {activeTab === "visa-application" && (
          <VisaApplicationTable
            visaApplications={studentVisaApplications}
            onEdit={(visaApp) =>
              handleEditClick(setShowVisaApplicationModal, visaApp)
            }
            onDelete={(visaAppId) =>
              handleDeleteItem(
                deleteVisaApplication,
                visaAppId,
                "Visa Application"
              )
            }
            onView={(visaApp) => handleViewClick(visaApp, "visaApplication")}
            loading={visaApplicationsLoading}
          />
        )}
        {activeTab === "payments" && (
          <PaymentsTable
            payments={studentPayments}
            enquiries={allEnquiries}
            loading={paymentsLoading || enquiriesLoading}
            onEdit={(payment) => handleEditClick(setShowPaymentModal, payment)}
            onDelete={(paymentId) =>
              handleDeleteItem(deletePayment, paymentId, "Payment")
            }
            onView={(payment) => handleViewClick(payment, "payment")}
          />
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
          editData={selectedForEdit}
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
          editData={editMode ? selectedForEdit : null}
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
          editData={editMode ? selectedForEdit : null}
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
          editData={editMode ? selectedForEdit : null}
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
          editData={editMode ? selectedForEdit : null}
          onClose={() => setShowVisaApplicationModal(false)}
          onSuccess={() => handleSuccess(setShowVisaApplicationModal)}
        />
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={editMode ? "Edit Payment" : "Add New Payment"}
        size="large"
      >
        <PaymentForm
          editData={editMode ? selectedForEdit : null}
          enquiries={allEnquiries}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => handleSuccess(setShowPaymentModal)}
        />
      </Modal>

      {viewModalType === "assessment" && (
        <AssessmentDetail
          isOpen={true}
          onClose={() => setViewModalType(null)}
          assessment={selectedForView}
          enquiries={allEnquiries}
          universities={allUniversities}
          courses={allCourses}
        />
      )}
      {viewModalType === "application" && (
        <ApplicationDetail
          isOpen={true}
          onClose={() => setViewModalType(null)}
          application={selectedForView}
          assessments={allAssessments}
        />
      )}
      {viewModalType === "payment" && (
        <PaymentDetail
          isOpen={true}
          onClose={() => setViewModalType(null)}
          payment={selectedForView}
          enquiries={allEnquiries}
        />
      )}
      {viewModalType === "visaApplication" && (
        <VisaApplicationDetail
          isOpen={true}
          onClose={() => setViewModalType(null)}
          visaApplication={selectedForView}
          applications={allApplications}
          assessments={allAssessments}
        />
      )}
    </div>
  );
};

export default StudentDetails;
