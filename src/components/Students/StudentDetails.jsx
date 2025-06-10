import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Book,
  Handshake,
  Calendar,
  Globe,
  Award,
  ArrowLeft,
  User,
  Tag,
  GraduationCap,
  Briefcase,
  FileText,
  Ban,
  Trophy,
  DollarSign,
  Info,
  Key,
  Link as LinkIcon,
  MessageSquare,
  Building2,
} from "lucide-react";
import moment from "moment";
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

const DetailItem = ({ icon: Icon, label, value }) => {
  if (
    (value === null || value === undefined || value === "") &&
    value !== 0 &&
    value !== false
  ) {
    return null;
  }

  let displayValue = value;
  if (Array.isArray(value)) {
    displayValue = value.join(", ");
  } else if (value && typeof value.toDate === "function") {
    displayValue = moment(value.toDate()).format("MMM DD,YYYY (hh:mm a)");
  } else if (value instanceof Date) {
    displayValue = moment(value).format("MMM DD,YYYY (hh:mm a)");
  } else if (typeof value === "object" && value.seconds && value.nanoseconds) {
    const date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    displayValue = moment(date).format("MMM DD,YYYY (hh:mm a)");
  } else if (typeof value === "object") {
    try {
      displayValue = JSON.stringify(value, null, 2);
    } catch (e) {
      console.error(e);
      displayValue = "[Complex Object]";
    }
  }

  return (
    <div className="flex items-start text-gray-700 text-sm mb-2">
      {Icon && (
        <Icon size={16} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
      )}
      <p>
        <span className="font-semibold text-gray-800">{label}:</span>{" "}
        <span className="break-words whitespace-pre-wrap">{displayValue}</span>
      </p>
    </div>
  );
};

const NestedDetailsCard = ({ icon: CardIcon, title, detailsObject }) => {
  if (
    !detailsObject ||
    Object.keys(detailsObject).every(
      (key) =>
        !detailsObject[key] &&
        detailsObject[key] !== 0 &&
        detailsObject[key] !== false
    )
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-500">
        <Info size={32} className="text-gray-300 mb-3" />
        <p>No {title.toLowerCase()} available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {CardIcon && <CardIcon size={20} className="text-purple-600 mr-3" />}
        {title}
      </h3>
      <div className="space-y-2">
        {Object.entries(detailsObject).map(([key, value]) =>
          value || value === 0 || value === false ? (
            <p key={key} className="text-sm text-gray-700">
              <span className="font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:
              </span>{" "}
              {Array.isArray(value) ? value.join(", ") : value}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
};

const WorkExperienceCard = ({ workExperiences }) => {
  if (!workExperiences || workExperiences.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-500">
        <Briefcase size={32} className="text-gray-300 mb-3" />
        <p>No work experience details available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Briefcase size={20} className="text-teal-600 mr-3" />
        Work Experience
      </h3>
      <div className="space-y-4">
        {workExperiences.map((exp, index) => (
          <div key={index} className="border-l-4 border-teal-300 pl-4 py-2">
            <p className="text-base font-medium text-gray-900">
              {exp.designation} at {exp.companyName}
            </p>
            <p className="text-xs text-gray-600">
              {exp.startDate} to {exp.endDate || "Present"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentLinkItem = ({ label, url }) => {
  if (!url) return null;
  return (
    <div className="flex items-center text-sm mb-2">
      <LinkIcon size={16} className="text-blue-500 mr-2 flex-shrink-0" />
      <p>
        <span className="font-semibold text-gray-800">{label}:</span>{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          View Document
        </a>
      </p>
    </div>
  );
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: allEnquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: allDetailEnquiries, loading: detailEnquiriesLoading } =
    useDetailEnquiries();
  const { data: allAssessments, loading: assessmentsLoading } =
    useAssessments();
  const { data: allApplications, loading: applicationsLoading } =
    useApplications();
  const { data: allBranches, loading: branchesLoading } = useBranches();
  const { data: allPayments, loading: paymentsLoading } = usePayments();
  const { data: allUsers, loading: usersLoading } = useUsers();
  const { data: allUniversities, loading: universitiesLoading } =
    useUniversities();
  const { data: allCourses, loading: coursesLoading } = useCourses();

  const [student, setStudent] = useState(null);
  const [selectedDetailEnquiry, setSelectedDetailEnquiry] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("enquiry");

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

  const studentAssessments = allAssessments?.filter(
    (assessment) => assessment.enquiry === id
  );

  const studentApplications = allApplications?.filter((application) =>
    studentAssessments?.some(
      (assessment) => assessment.id === application.assessmentId
    )
  );

  const studentPayments = allPayments?.filter(
    (payment) => payment.Memo_For === student?.id
  );

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
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          {student.student_First_Name} {student.student_Last_Name}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Students
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap border-b border-gray-200">
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
            Assessments ({studentAssessments?.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "applications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("applications")}
          >
            Applications ({studentApplications?.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "payments"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("payments")}
          >
            Payments ({studentPayments?.length})
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "enquiry" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User size={20} className="text-purple-600 mr-3" />
                Personal & Contact
              </h2>
              <div className="space-y-2">
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={student.student_email}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={student.student_phone}
                />
                <DetailItem
                  icon={Phone}
                  label="Alternate Phone"
                  value={student.alternate_phone}
                />
                <DetailItem
                  icon={MapPin}
                  label="Address"
                  value={`${student.student_address}, ${student.student_city}, ${student.student_state}, ${student.student_country}`.trim()}
                />
                <DetailItem
                  icon={Key}
                  label="Passport No."
                  value={student.student_passport}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Book size={20} className="text-orange-600 mr-3" />
                Academic & Interests
              </h2>
              <div className="space-y-2">
                <DetailItem
                  icon={GraduationCap}
                  label="Current Education"
                  value={student.current_education}
                />
                <DetailItem
                  icon={Globe}
                  label="Countries Interested"
                  value={student.country_interested}
                />
                <DetailItem
                  icon={Calendar}
                  label="Intake Interested"
                  value={student.intake_interested}
                />
                <DetailItem
                  icon={Handshake}
                  label="Interested Services"
                  value={student.Interested_Services}
                />
                <DetailItem
                  icon={Award}
                  label="University Interested"
                  value={
                    universitiesMap[student.university_interested]?.univ_name ||
                    "N/A"
                  }
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Tag size={20} className="text-green-600 mr-3" />
                Enquiry & Status
              </h2>
              <div className="space-y-2">
                <DetailItem
                  icon={Tag}
                  label="Enquiry Status"
                  value={student.enquiry_status}
                />
                <DetailItem
                  icon={Calendar}
                  label="Enquiry Date"
                  value={student.createdAt}
                />
                <DetailItem
                  icon={Info}
                  label="Source Enquiry"
                  value={student.Source_Enquiry}
                />
                <DetailItem
                  icon={User}
                  label="Assigned To"
                  value={usersMap[student.assignedUserId]?.displayName || "N/A"}
                />
                <DetailItem
                  icon={Building2}
                  label="Branch"
                  value={branchesMap[student.branchId]?.branchName || "N/A"}
                />
                <DetailItem
                  icon={MessageSquare}
                  label="Notes"
                  value={student.notes}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "detailEnquiry" &&
          (selectedDetailEnquiry ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NestedDetailsCard
                icon={GraduationCap}
                title="Current Education Details"
                detailsObject={selectedDetailEnquiry.current_education_details}
              />
              <NestedDetailsCard
                icon={GraduationCap}
                title="Graduation Education Details"
                detailsObject={
                  selectedDetailEnquiry.graduation_education_details
                }
              />
              <NestedDetailsCard
                icon={GraduationCap}
                title="12th Grade Education Details"
                detailsObject={selectedDetailEnquiry.twelveth_education_details}
              />
              <NestedDetailsCard
                icon={GraduationCap}
                title="10th Grade Education Details"
                detailsObject={selectedDetailEnquiry.tenth_education_details}
              />

              <NestedDetailsCard
                icon={Trophy}
                title="IELTS Exam"
                detailsObject={selectedDetailEnquiry.ielts_exam}
              />
              <NestedDetailsCard
                icon={Trophy}
                title="TOEFL Exam"
                detailsObject={selectedDetailEnquiry.toefl_exam}
              />
              <NestedDetailsCard
                icon={Trophy}
                title="PTE Exam"
                detailsObject={selectedDetailEnquiry.pte_exam}
              />
              <NestedDetailsCard
                icon={Trophy}
                title="Duolingo Exam"
                detailsObject={selectedDetailEnquiry.duolingo_exam}
              />
              <NestedDetailsCard
                icon={Trophy}
                title="GRE Exam"
                detailsObject={selectedDetailEnquiry.gre_exam}
              />
              <NestedDetailsCard
                icon={Trophy}
                title="GMAT Exam"
                detailsObject={selectedDetailEnquiry.gmat_exam}
              />

              <WorkExperienceCard
                workExperiences={selectedDetailEnquiry.workExperiences}
              />

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign size={20} className="text-indigo-600 mr-3" />
                  Financial & Other Info
                </h2>
                <div className="space-y-2">
                  <DetailItem
                    icon={DollarSign}
                    label="Father's Annual Income"
                    value={selectedDetailEnquiry.father_Annual_Income}
                  />
                  <DetailItem
                    icon={User}
                    label="Father's Occupation"
                    value={selectedDetailEnquiry.father_Occupation}
                  />
                  {selectedDetailEnquiry.refusal_details &&
                  Object.keys(selectedDetailEnquiry.refusal_details).length >
                    0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                        <Ban size={18} className="text-red-500 mr-2" /> Visa
                        Refusal Details
                      </h4>
                      <div className="space-y-1 pl-2">
                        <DetailItem
                          label="Country"
                          value={selectedDetailEnquiry.refusal_details.country}
                        />
                        <DetailItem
                          label="Date"
                          value={selectedDetailEnquiry.refusal_details.date}
                        />
                        <DetailItem
                          label="Reason"
                          value={selectedDetailEnquiry.refusal_details.reason}
                        />
                        <DetailItem
                          label="Visa Category"
                          value={
                            selectedDetailEnquiry.refusal_details.visa_category
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 pt-4 border-t border-gray-100">
                      <Ban size={24} className="text-gray-300 mx-auto mb-2" />
                      <p>No visa refusal details.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText size={20} className="text-blue-600 mr-3" />
                  Documents
                </h2>
                <div className="space-y-2">
                  <DocumentLinkItem
                    label="10th Document"
                    url={selectedDetailEnquiry.tenth_Document}
                  />
                  <DocumentLinkItem
                    label="12th Document"
                    url={selectedDetailEnquiry.twelveth_Document}
                  />
                  <DocumentLinkItem
                    label="Graduation Marksheet"
                    url={selectedDetailEnquiry.graduation_Marksheet}
                  />
                  <DocumentLinkItem
                    label="Graduation Certificate"
                    url={selectedDetailEnquiry.graduation_Certificate}
                  />
                  <DocumentLinkItem
                    label="UG Marksheet"
                    url={selectedDetailEnquiry.ug_Marksheet}
                  />
                  <DocumentLinkItem
                    label="UG Certificate"
                    url={selectedDetailEnquiry.ug_Certificate}
                  />
                  <DocumentLinkItem
                    label="Work Experience Document"
                    url={selectedDetailEnquiry.work_Experience_Document}
                  />
                  <DocumentLinkItem
                    label="Passport Document"
                    url={selectedDetailEnquiry.passport_Document}
                  />
                  <DocumentLinkItem
                    label="Offer Letter"
                    url={selectedDetailEnquiry.offer_Letter}
                  />
                  <DocumentLinkItem
                    label="IELTS Result"
                    url={selectedDetailEnquiry.ielts_Result}
                  />
                  <DocumentLinkItem
                    label="TOEFL Result"
                    url={selectedDetailEnquiry.toefl_Result}
                  />
                  <DocumentLinkItem
                    label="PTE Result"
                    url={selectedDetailEnquiry.pte_Result}
                  />
                  <DocumentLinkItem
                    label="Duolingo Result"
                    url={selectedDetailEnquiry.duolingo_Result}
                  />
                  <DocumentLinkItem
                    label="GRE Result"
                    url={selectedDetailEnquiry.gre_Result}
                  />
                  <DocumentLinkItem
                    label="GMAT Result"
                    url={selectedDetailEnquiry.gmat_Result}
                  />
                  {!selectedDetailEnquiry.tenth_Document &&
                    !selectedDetailEnquiry.twelveth_Document &&
                    !selectedDetailEnquiry.graduation_Marksheet &&
                    !selectedDetailEnquiry.graduation_Certificate &&
                    !selectedDetailEnquiry.ug_Marksheet &&
                    !selectedDetailEnquiry.ug_Certificate &&
                    !selectedDetailEnquiry.work_Experience_Document &&
                    !selectedDetailEnquiry.passport_Document &&
                    !selectedDetailEnquiry.offer_Letter &&
                    !selectedDetailEnquiry.ielts_Result &&
                    !selectedDetailEnquiry.toefl_Result &&
                    !selectedDetailEnquiry.pte_Result &&
                    !selectedDetailEnquiry.duolingo_Result &&
                    !selectedDetailEnquiry.gre_Result &&
                    !selectedDetailEnquiry.gmat_Result && (
                      <div className="text-center text-gray-500 py-4">
                        <FileText
                          size={24}
                          className="text-gray-300 mx-auto mb-2"
                        />
                        <p>No documents uploaded.</p>
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Handshake size={20} className="text-cyan-600 mr-3" />
                  Confirmed Services
                </h2>
                <div className="space-y-2">
                  <DetailItem
                    label="Services"
                    value={selectedDetailEnquiry.confirmed_services}
                  />
                  {(!selectedDetailEnquiry.confirmed_services ||
                    selectedDetailEnquiry.confirmed_services.length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      <Handshake
                        size={24}
                        className="text-gray-300 mx-auto mb-2"
                      />
                      <p>No confirmed services.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-600 h-full flex flex-col items-center justify-center min-h-[200px]">
              <Info size={48} className="text-gray-300 mb-3" />
              <p>No detailed enquiry information available for this student.</p>
            </div>
          ))}

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
    </div>
  );
};

export default StudentDetails;
