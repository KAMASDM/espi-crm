import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  XCircle,
  Calendar,
  BookOpen,
  DollarSign,
  CheckCircle,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { COUNTRIES, COURSE_LEVELS } from "../../utils/constants";

const CoursesTable = ({
  courses,
  universities,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortField, setSortField] = useState("course_name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.specialisation_tag
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCountry = !countryFilter || course.country === countryFilter;
      const matchesLevel = !levelFilter || course.course_levels === levelFilter;
      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && course.Active) ||
        (statusFilter === "inactive" && !course.Active);

      return matchesSearch && matchesCountry && matchesLevel && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";

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

  const getCountryName = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.univ_name;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle size={12} className="mr-1" />
        Inactive
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const levelColors = {
      Certificate: "bg-gray-100 text-gray-800",
      Diploma: "bg-blue-100 text-blue-800",
      "Associate Degree": "bg-green-100 text-green-800",
      "Bachelor's Degree": "bg-purple-100 text-purple-800",
      "Master's Degree": "bg-indigo-100 text-indigo-800",
      "Doctoral Degree": "bg-red-100 text-red-800",
      "Professional Degree": "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          levelColors[level] || "bg-gray-100 text-gray-800"
        }`}
      >
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
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
            placeholder="Search courses by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Levels</option>
            {COURSE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
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
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("course_name")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Course Name
                  {sortField === "course_name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header">University</th>
              <th className="table-header">Level</th>
              <th className="table-header">Financial</th>
              <th className="table-header">Deadline</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCourses.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="table-cell text-center text-gray-500 py-8"
                >
                  <BookOpen className="mx-auto mb-2 text-gray-300" size={48} />
                  <p>No courses found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <GraduationCap
                            className="text-purple-600"
                            size={20}
                          />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {course.course_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.specialisation_tag && (
                            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {course.specialisation_tag}
                            </span>
                          )}
                        </div>
                        {course.website_url && (
                          <div className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                            <a
                              href={course.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink size={12} className="mr-1" />
                              View Course
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getUniversityName(course.university)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCountryName(course.country)}
                      </div>
                    </div>
                  </td>

                  <td className="table-cell">
                    {getLevelBadge(course.course_levels)}
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1">
                      {course.Application_fee && (
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign
                            size={14}
                            className="mr-1 text-gray-400"
                          />
                          App Fee: {course.Application_fee_currency || "$"}
                          {course.Application_fee}
                        </div>
                      )}
                      {course.Yearly_Tuition_fee && (
                        <div className="text-sm text-gray-500">
                          Tuition: ${course.Yearly_Tuition_fee}/year
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="table-cell">
                    {course.Application_deadline ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {format(
                          new Date(course.Application_deadline),
                          "MMM dd, yyyy"
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No deadline set
                      </span>
                    )}
                  </td>

                  <td className="table-cell">
                    {getStatusBadge(course.Active)}
                  </td>

                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(course)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(course)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

export default CoursesTable;
