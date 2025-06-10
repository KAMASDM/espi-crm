import React, { useState } from "react";
import moment from "moment";
import { ASSESSMENT_STATUS } from "../../../utils/constants";
import {
  Calendar,
  Link as LinkIcon,
  Building2,
  Search,
  Filter,
  ClipboardList,
  ExternalLink,
  IndianRupee,
} from "lucide-react";

const getStatusBadge = (status) => {
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    "On Hold": "bg-orange-100 text-orange-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const getUniversityName = (universityId, universitiesMap) => {
  return universitiesMap[universityId]?.univ_name;
};

const getCourseName = (courseId, coursesMap) => {
  return coursesMap[courseId]?.course_name;
};

const AssessmentList = ({ assessments, universitiesMap, coursesMap }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredAssessments = assessments
    .filter((assessment) => {
      const universityName = getUniversityName(
        assessment.university,
        universitiesMap
      );
      const courseName = getCourseName(
        assessment.course_interested,
        coursesMap
      );

      const matchesSearch =
        universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.specialisation
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assessment.level_applying_for
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assessment.intake_interested
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || assessment.ass_status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "university":
          aValue = getUniversityName(a.university, universitiesMap);
          bValue = getUniversityName(b.university, universitiesMap);
          break;
        case "course":
          aValue = getCourseName(a.course_interested, coursesMap);
          bValue = getCourseName(b.course_interested, coursesMap);
          break;
        case "status":
          aValue = a.ass_status;
          bValue = b.ass_status;
          break;
        case "createdAt":
        default:
          aValue = a.createdAt ? a.createdAt.toDate().getTime() : 0;
          bValue = b.createdAt ? b.createdAt.toDate().getTime() : 0;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (!assessments || assessments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-600 h-full flex flex-col items-center justify-center min-h-[200px]">
        <ClipboardList size={48} className="text-gray-300 mb-3" />
        <p>No assessments found for this student.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by university, course, specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {ASSESSMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredAssessments.length} of {assessments.length}{" "}
          assessments
        </div>
        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("university")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    University & Course
                    {sortField === "university" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="table-header">Program Details</th>
                <th className="table-header">Financial</th>
                <th
                  onClick={() => handleSort("status")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Created
                    {sortField === "createdAt" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="table-cell text-center text-gray-500 py-8"
                  >
                    <ClipboardList
                      className="mx-auto mb-2 text-gray-300"
                      size={48}
                    />
                    <p>No assessments found</p>
                    {searchTerm && (
                      <p className="text-sm">Try adjusting your search terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <Building2 size={14} className="mr-2 text-gray-400" />
                          {getUniversityName(
                            assessment.university,
                            universitiesMap
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCourseName(
                            assessment.course_interested,
                            coursesMap
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assessment.level_applying_for}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {assessment.specialisation && (
                          <div className="text-sm text-gray-900">
                            {assessment.specialisation}
                          </div>
                        )}
                        {assessment.duration && (
                          <div className="text-sm text-gray-500">
                            Duration: {assessment.duration}
                          </div>
                        )}
                        {assessment.intake_interested && (
                          <div className="text-sm text-gray-500">
                            Intake: {assessment.intake_interested}
                          </div>
                        )}
                        {assessment.course_link && (
                          <div className="text-sm text-blue-600">
                            <a
                              href={assessment.course_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-800"
                            >
                              <ExternalLink size={12} className="mr-1" />
                              Course Link
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {assessment.application_fee && (
                          <div className="flex items-center text-sm text-gray-900">
                            <IndianRupee
                              size={14}
                              className="mr-1 text-gray-400"
                            />
                            App: {assessment.application_fee}
                          </div>
                        )}
                        {assessment.tution_fee && (
                          <div className="text-sm text-gray-500">
                            Tuition: {assessment.tution_fee}
                          </div>
                        )}
                        {assessment.fee_currency && (
                          <div className="text-sm text-gray-500">
                            Currency: {assessment.fee_currency}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(assessment.ass_status)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {assessment.createdAt &&
                          moment(assessment.createdAt.toDate()).format(
                            "MMM DD, YYYY"
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentList;
