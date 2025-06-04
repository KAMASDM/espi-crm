import React from "react";
import { COUNTRIES } from "../../utils/constants";
import {
  User,
  Mail,
  MapPin,
  School,
  BookOpen,
  Clock,
  Tag,
  Calendar,
  Link as LinkIcon,
  Coins,
  BadgeCheck,
  FileText,
  CircleDollarSign,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const AssessmentDetail = ({ assessment, enquiries, universities, courses }) => {
  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return (
      enquiry && `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
    );
  };

  const getStudentEmail = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry && enquiry.student_email;
  };

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.univ_name;
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course && course.course_name;
  };

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Assessment Details
        </h1>
        <div className="flex items-center space-x-2 text-sm">
          <span className="flex items-center">
            <BadgeCheck className="w-4 h-4 mr-1" />
            Status:
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                assessment.ass_status
              )}`}
            >
              {assessment.ass_status || "Not specified"}
            </span>
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Created:{" "}
            {assessment.createdAt
              ? new Date(assessment.createdAt.toDate()).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Student Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Student Name</p>
              <p className="text-sm text-gray-900">
                {getStudentName(assessment.enquiry) || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Mail className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Student Email</p>
              <p className="text-sm text-gray-900">
                {getStudentEmail(assessment.enquiry) || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Country of Interest
              </p>
              <p className="text-sm text-gray-900">
                {getCountryName(assessment.student_country)}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <School className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Level Applying For
              </p>
              <p className="text-sm text-gray-900">
                {assessment.level_applying_for || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
          University & Course Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <School className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">University</p>
              <p className="text-sm text-gray-900">
                {getUniversityName(assessment.university) || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Course</p>
              <p className="text-sm text-gray-900">
                {getCourseName(assessment.course_interested) || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Tag className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Specialization
              </p>
              <p className="text-sm text-gray-900">
                {assessment.specialisation || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Clock className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-sm text-gray-900">
                {assessment.duration
                  ? `${assessment.duration} years`
                  : "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Intake Interested
              </p>
              <p className="text-sm text-gray-900">
                {assessment.intake_interested || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Course Link</p>
              <p className="text-sm text-gray-900">
                {assessment.course_link ? (
                  <a
                    href={assessment.course_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                  >
                    {assessment.course_link}{" "}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-600" />
          Financial Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Application Fee
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {assessment.application_fee
                    ? `${assessment.fee_currency || ""} ${
                        assessment.application_fee
                      }`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tuition Fee</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assessment.tution_fee
                    ? `${assessment.fee_currency || ""} ${
                        assessment.tution_fee
                      }`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <Coins className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Currency</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assessment.fee_currency || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {assessment.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Assessment Notes
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {assessment.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetail;
