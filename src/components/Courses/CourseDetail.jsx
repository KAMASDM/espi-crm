import React from "react";
import { COUNTRIES } from "../../utils/constants";
import {
  BookOpen,
  School,
  Building2,
  MapPin,
  Link,
  Calendar,
  FileText,
  Coins,
  BadgeCheck,
  AlertCircle,
  Clock,
  ClipboardList,
  Award,
  Percent,
  Layers,
} from "lucide-react";

const CourseDetail = ({ course, universities }) => {
  const getUniversityName = (universityId) =>
    universities.find((uni) => uni.id === universityId)?.univ_name;

  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name;

  const getCountryCodeForUniversity = (universityId) =>
    universities.find((uni) => uni.id === universityId)?.country;

  const renderExamRequirements = () => {
    const exams = [
      { name: "IELTS", value: course.ielts_Exam },
      { name: "TOEFL", value: course.Toefl_Exam },
      { name: "PTE", value: course.PTE_Exam },
      { name: "Duolingo", value: course.Duolingo_Exam },
      { name: "GRE", value: course.Gre_Exam },
      { name: "GMAT", value: course.Gmat_Exam },
      { name: "Other", value: course.other_exam },
    ].filter((exam) => exam.value);

    if (exams.length === 0) return "N/A";

    return (
      <div className="flex flex-wrap gap-2">
        {exams.map((exam, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs flex items-center"
          >
            {exam.name}: {exam.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          {course.course_name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center">
            <School className="w-4 h-4 mr-1" />
            {course.course_levels}
          </span>
          <span className="flex items-center">
            <Building2 className="w-4 h-4 mr-1" />
            {getUniversityName(course.university)}
          </span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {getCountryName(
              getCountryCodeForUniversity(course.university) || course.country
            )}
          </span>
          {course.website_url && (
            <a
              href={course.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              <Link className="w-4 h-4 mr-1" />
              Course Website
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
            course.Active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <BadgeCheck className="w-4 h-4 mr-1" />
          {course.Active ? "Active" : "Inactive"}
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center">
          <Layers className="w-4 h-4 mr-1" />
          Backlogs Allowed: {course.Backlogs_allowed || "N/A"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
            Admission Requirements
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Exam Scores
              </h3>
              {renderExamRequirements()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Academic Requirements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <Percent className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm">
                    10th: {course.tenth_std_percentage_requirement || "N/A"}%
                  </span>
                </div>
                <div className="flex items-center">
                  <Percent className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm">
                    12th: {course.twelfth_std_percentage_requirement || "N/A"}%
                  </span>
                </div>
                {course.bachelor_requirement && (
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm">
                      Bachelor GPA: {course.bachelor_requirement}/10
                    </span>
                  </div>
                )}
                {course.masters_requirement && (
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm">
                      Master GPA: {course.masters_requirement}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Documents Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(course.documents_required) &&
                course.documents_required.length > 0 ? (
                  course.documents_required.map((doc, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                    >
                      {doc}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    No documents specified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Intake & Deadline
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Available Intakes
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(course.intake) && course.intake.length > 0 ? (
                  course.intake.map((intake, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-xs"
                    >
                      {intake}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    No intakes specified
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </h3>
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${
                    new Date(course.Application_deadline) < new Date()
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {course.Application_deadline
                    ? new Date(course.Application_deadline).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "No deadline specified"}
                </span>
                {course.Application_deadline && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.ceil(
                      (new Date(course.Application_deadline) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days remaining
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-600" />
          Financial Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Application Fee
            </h3>
            <p className="text-lg font-medium">
              {course.Application_fee
                ? `${course.Application_fee_currency || "CAD"} ${
                    course.Application_fee
                  }`
                : "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Yearly Tuition Fee
            </h3>
            <p className="text-lg font-medium">
              {course.Yearly_Tuition_fee
                ? `${course.Application_fee_currency || "CAD"} ${
                    course.Yearly_Tuition_fee
                  }`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
      {course.specialisation_tag && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Specialization
          </h2>
          <div className="flex flex-wrap gap-2">
            {course.specialisation_tag.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-sm"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      {course.Remark && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Note</h3>
              <div className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                {course.Remark}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
