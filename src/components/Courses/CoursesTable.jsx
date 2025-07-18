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
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Loader2,
} from "lucide-react";
import moment from "moment";
import { COURSE_LEVELS } from "../../utils/constants";
import { useCountries } from "../../hooks/useFirestore";

const CoursesTable = ({
  courses,
  universities,
  loading,
  onEdit,
  onDelete,
  onView,
  handleVisibility,
}) => {
  const { data: countries, loading: countriesLoading } = useCountries();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  console.log("countryFilter:", countryFilter);
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
    const country = countries.find((c) => c.currency === countryCode);
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
            {countries.map((country) => (
              <option key={country.id} value={country.currency}>
                {country.country}
              </option>
            ))}
          </select>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="pl-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              {COURSE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
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
              {handleVisibility && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading courses...</p>
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
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
                      <div
                        className="ml-4 cursor-pointer"
                        onClick={() => onView(course)}
                      >
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-600 hover:underline">
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
                        <div className="text-sm text-gray-900">
                          Application Fee: {course.Application_fee} (
                          {course.Application_fee_currency})
                        </div>
                      )}
                      {course.Yearly_Tuition_fee && (
                        <div className="text-sm text-gray-500">
                          Tuition Fee: {course.Yearly_Tuition_fee}/year
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="table-cell">
                    {course.Application_deadline ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {moment(course.Application_deadline).format(
                          "MMM DD, YYYY"
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

                  {handleVisibility && (
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
                          title="Edit Course"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(course.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
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
