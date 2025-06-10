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
  IndianRupee,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import Loading from "../Common/Loading";
import { COUNTRIES, ASSESSMENT_STATUS } from "../../utils/constants";

const AssessmentsTable = ({
  assessments,
  enquiries,
  universities,
  courses,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
      : "Unknown Student";
  };
  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.univ_name;
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

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course && course.course_name;
  };

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"
          }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return <Loading size="default" />;
  }

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
            placeholder="Search by student name, university, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <div className="relative flex gap-2">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
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
            {filteredAssessments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentsTable;
