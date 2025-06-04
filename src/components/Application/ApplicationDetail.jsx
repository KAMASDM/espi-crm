import React from "react";
import {
  FileText,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Calendar,
  CircleDollarSign,
  FileCheck,
  FileX,
  User,
  Info,
  ChevronRight,
  Tag,
} from "lucide-react";

const documents = [
  { key: "sop", label: "Statement of Purpose", icon: FileText },
  { key: "cv", label: "CV/Resume", icon: ClipboardList },
  { key: "passport", label: "Passport", icon: FileText },
  { key: "ielts", label: "IELTS Score", icon: FileText },
  { key: "toefl", label: "TOEFL Score", icon: FileText },
  { key: "gre", label: "GRE Score", icon: FileText },
  { key: "gmat", label: "GMAT Score", icon: FileText },
  { key: "pte", label: "PTE Score", icon: FileText },
  { key: "work_experience", label: "Work Experience", icon: FileText },
  { key: "diploma_marksheet", label: "Diploma Marksheet", icon: FileText },
  { key: "bachelor_marksheet", label: "Bachelor's Marksheet", icon: FileText },
  { key: "master_marksheet", label: "Master's Marksheet", icon: FileText },
  { key: "other_documents", label: "Other Documents", icon: FileText },
];

const ApplicationDetail = ({ application, assessments }) => {
  const getAssessment = (assessmentId) => {
    return assessments.find((assessment) => assessment.id === assessmentId);
  };

  const assessment = getAssessment(application.application);

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 mr-1" />;
      case "Under Review":
        return <Clock className="w-4 h-4 mr-1" />;
      default:
        return <Info className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Application Details
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20">
              APP-{application.id.slice(-8).toUpperCase()}
            </span>
          </span>
          <span className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {application.studentDisplayName}
          </span>
          <span className="flex items-center">
            {getStatusIcon(application.application_status)}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                application.application_status
              )}`}
            >
              {application.application_status}
            </span>
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Created:{" "}
            {application.createdAt
              ? new Date(application.createdAt.toDate()).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Assessment ID</p>
              <p className="text-sm text-gray-900">
                {assessment && `ASS-${assessment.id.slice(-8).toUpperCase()}`}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Created Date</p>
              <p className="text-sm text-gray-900">
                {application.createdAt &&
                  new Date(application.createdAt.toDate()).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
              </p>
            </div>
          </div>
        </div>
      </div>
      {assessment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            Assessment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <Tag className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Specialization
                </p>
                <p className="text-sm text-gray-900">
                  {assessment.specialisation}
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
                  {assessment.duration && `${assessment.duration} years`}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Application Fee
                </p>
                <p className="text-sm text-gray-900">
                  {assessment.application_fee &&
                    `${assessment.fee_currency || ""} ${
                      assessment.application_fee
                    }`}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tuition Fee</p>
                <p className="text-sm text-gray-900">
                  {assessment.tution_fee &&
                    `${assessment.fee_currency || ""} ${assessment.tution_fee}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Documents Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.key}
                className={`p-4 rounded-lg border ${
                  application[doc.key]
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {doc.label}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application[doc.key]
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application[doc.key] ? (
                      <span className="flex items-center">
                        <FileCheck className="w-3 h-3 mr-1" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FileX className="w-3 h-3 mr-1" />
                        Missing
                      </span>
                    )}
                  </span>
                </div>
                {application[doc.key] && (
                  <a
                    href={application[doc.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View document <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {application.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
            Notes
          </h2>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
