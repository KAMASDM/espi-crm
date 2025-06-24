import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  XCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Loader2,
  PlusCircle,
  Home,
} from "lucide-react";

const ApplicationStatusTable = ({
  applicationStatuses,
  onEdit,
  onDelete,
  loading,
  handleVisibility,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const uniqueCountries = [
    ...new Set(applicationStatuses.map((status) => status.country)),
  ].sort();

  const filteredStatuses = applicationStatuses.filter((status) => {
    const matchesSearch = status.applicationStatus
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? status.isActive
        : !status.isActive;

    const matchesCountry =
      countryFilter === "all" ? true : status.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 size={12} className="mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle size={12} className="mr-1" /> Inactive
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
            placeholder="Search statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
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
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Status Name</th>
              <th className="table-header">Country</th>
              <th className="table-header">Status</th>
              <th className="table-header">Sequence</th>
              {handleVisibility && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={handleVisibility ? 5 : 4}
                  className="table-cell text-center py-8"
                >
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading statuses...</p>
                </td>
              </tr>
            ) : filteredStatuses.length === 0 ? (
              <tr>
                <td
                  colSpan={handleVisibility ? 5 : 4}
                  className="table-cell text-center py-8"
                >
                  {applicationStatuses.length === 0 ? (
                    <>
                      <PlusCircle
                        className="mx-auto mb-2 text-gray-300"
                        size={40}
                      />
                      <p className="text-gray-500">No statuses added yet.</p>
                    </>
                  ) : (
                    <>
                      <Home className="mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">
                        No statuses found matching your criteria.
                      </p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredStatuses.map((status) => (
                <tr key={status.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {status.applicationStatus}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {status.country}
                    </div>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(status.isActive)}
                  </td>
                  <td className="table-cell text-sm font-medium text-gray-500">
                    {status.sequence}
                  </td>
                  {handleVisibility && (
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(status)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Edit Status"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(status.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Status"
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

export default ApplicationStatusTable;
