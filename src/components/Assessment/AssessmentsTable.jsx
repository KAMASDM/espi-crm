import { useState } from "react";
import {
  Eye,
  Edit,
  User,
  Search,
  Trash2,
  Filter,
  Calendar,
  Building2,
  ExternalLink,
  ClipboardList,
  Loader2,
  PlusCircle,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { COUNTRIES, ASSESSMENT_STATUS } from "../../utils/constants";
import FollowUpBadge from "../FollowUp/FollowUpBadge";

const AssessmentsTable = ({
  assessments,
  enquiries,
  universities,
  courses,
  loading,
  onEdit,
  onDelete,
  onView,
  onUpdateStatus,
  followUps,
  onOpenFollowUp,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleStatusChange = async (assessmentId, newStatus) => {
    if (onUpdateStatus) {
      try {
        await onUpdateStatus(assessmentId, newStatus);
      } catch (error) {
        console.error("Failed to update assessment status:", error);
      }
    }
  };

  const getStudent = (enquiryId) => {
    return enquiries.find((enq) => enq.id === enquiryId);
  };

  const getStudentName = (enquiryId) => {
    const enquiry = getStudent(enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
      : "Unknown Student";
  };

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.univ_name;
  };

  const getStudentFollowUps = (enquiryId) => {
    if (!followUps || !Array.isArray(followUps)) return [];
    return followUps.filter((followUp) => followUp.studentId === enquiryId);
  };

  const getLatestFollowUp = (enquiryId) => {
    const studentFollowUps = getStudentFollowUps(enquiryId);
    const sortedFollowUps = studentFollowUps.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    return sortedFollowUps[0] || null;
  };

  const filteredAssessments = assessments
    .filter((assessment) => {
      const studentName = getStudentName(assessment.enquiry);
      const universityName = getUniversityName(assessment.university);

      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.specialisation
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || assessment.ass_status === statusFilter;
      const matchesCountry =
        !countryFilter || assessment.student_country === countryFilter;

      return matchesSearch && matchesStatus && matchesCountry;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "student") {
        aValue = getStudentName(a.enquiry);
        bValue = getStudentName(b.enquiry);
      } else if (sortField === "university") {
        aValue = getUniversityName(a.university);
        bValue = getUniversityName(b.university);
      } else if (sortField === "createdAt") {
        aValue = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        bValue = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course && course.course_name;
  };

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by student, university, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex gap-2">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />{" "}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="pl-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
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
      </div>
      <div className="text-sm text-gray-500">
        Showing {filteredAssessments.length} of {assessments.length} assessments
      </div>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("student")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Student
                  {sortField === "student" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
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
                onClick={() => handleSort("ass_status")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Status
                  {sortField === "ass_status" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header">Follow Up</th>
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
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading assessments...</p>
                </td>
              </tr>
            ) : filteredAssessments.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
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
              filteredAssessments.map((assessment) => {
                const student = getStudent(assessment.enquiry);
                const latestFollowUp = getLatestFollowUp(assessment.enquiry);
                
                return (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/students/${assessment.enquiry}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                            >
                              {getStudentName(assessment.enquiry)}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            {getCountryName(assessment.student_country)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <Building2 size={14} className="mr-2 text-gray-400" />
                          {getUniversityName(assessment.university)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCourseName(assessment.course_interested)}
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
                          <div className="text-sm text-gray-900">
                            Application Fee: {assessment.application_fee}
                          </div>
                        )}
                        {assessment.tution_fee && (
                          <div className="text-sm text-gray-500">
                            Tuition Fee: {assessment.tution_fee}
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
                      <select
                        value={assessment.ass_status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(assessment.id, e.target.value);
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      >
                        {ASSESSMENT_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      {latestFollowUp ? (
                        <FollowUpBadge
                          followUp={latestFollowUp}
                          onClick={() =>
                            onOpenFollowUp(student, latestFollowUp)
                          }
                        />
                      ) : (
                        <button
                          onClick={() => onOpenFollowUp(student)}
                          className="text-xs flex items-center text-primary-600 hover:text-primary-800"
                        >
                          <PlusCircle size={14} className="mr-1" />
                          Add Follow Up
                        </button>
                      )}
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
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(assessment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(assessment)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Assessment"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(assessment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Assessment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentsTable;
