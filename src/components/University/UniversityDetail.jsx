import React from "react";
import { COUNTRIES } from "../../utils/constants";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const UniversityDetail = ({ university }) => {
  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {university.univ_name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {getCountryName(university.country)}
          </span>
          <span className="flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            {university.univ_phone}
          </span>
          <span className="flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            {university.univ_email}
          </span>
          {university.univ_website && (
            <a
              href={
                university.univ_website.startsWith("http")
                  ? university.univ_website
                  : `https://${university.univ_website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              <Globe className="w-4 h-4 mr-1" />
              Visit Website
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            university.Active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {university.Active ? "Active" : "Inactive"}
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            university.moi_accepted
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          MOI Accepted: {university.moi_accepted ? "Yes" : "No"}
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          Backlogs Allowed: {university.Backlogs_allowed || "N/A"}
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Application Fee:{" "}
          {university.Application_fee
            ? `$${university.Application_fee}`
            : "N/A"}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          About the University
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {university.univ_desc || "No description available."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
            Course Levels
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(university.levels) &&
            university.levels.length > 0 ? (
              university.levels.map((level, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {level}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No levels specified</span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-red-600" />
            Application Deadline
          </h2>
          <div className="flex items-center">
            <span
              className={`text-lg font-medium ${
                new Date(university.deadline) < new Date()
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {university.deadline
                ? new Date(university.deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No deadline specified"}
            </span>
            {university.deadline && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {Math.ceil(
                  (new Date(university.deadline) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days remaining
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Admission Requirements
        </h2>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {university.Admission_Requirements ||
            "No specific admission requirements provided."}
        </div>
      </div>
      {university.Remark && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Note</h3>
              <div className="mt-1 text-sm text-yellow-700">
                {university.Remark}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityDetail;
