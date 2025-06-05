import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Edit,
  Home,
  Trash2,
  Search,
  XCircle,
  CheckCircle,
  Filter,
} from "lucide-react";

const BranchesTable = ({ branches, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const allDates = useMemo(() => {
    const datesSet = new Set();
    branches.forEach((b) => {
      const date = b.createdAt?.toDate?.();
      if (date) {
        datesSet.add(format(date, "yyyy-MM"));
      }
    });
    return Array.from(datesSet).sort().reverse();
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? branch.isActive
          : !branch.isActive;

      const matchesDate =
        dateFilter === "all"
          ? true
          : branch.createdAt?.toDate?.() &&
            format(branch.createdAt.toDate(), "yyyy-MM") === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [branches, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" /> Active
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
            placeholder="Search branches by name, address, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field "
          />
        </div>
        <div className="relative flex gap-2">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Dates</option>
              {allDates.map((dateStr) => (
                <option key={dateStr} value={dateStr}>
                  {format(new Date(dateStr + "-01"), "MMMM yyyy")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Showing {filteredBranches.length} of {branches.length} branches
      </div>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Branch Name
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Address
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Contact Person
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Contact Email
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Status
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Created At
              </th>
              <th className="table-header cursor-pointer hover:bg-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBranches.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="table-cell text-center text-gray-500 py-8"
                >
                  <Home className="mx-auto mb-2 text-gray-300" />
                  <p>No branches found</p>
                </td>
              </tr>
            ) : (
              filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {branch.branchName}
                    </div>
                  </td>
                  <td className="table-cell text-sm font-medium">
                    {branch.address}
                  </td>
                  <td className="table-cell">{branch.contactPerson}</td>
                  <td className="table-cell text-sm font-medium">
                    {branch.contactEmail}
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(branch.isActive)}
                  </td>
                  <td className="table-cell text-sm font-medium text-gray-500">
                    {branch.createdAt?.toDate &&
                      format(branch.createdAt.toDate(), "PP")}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(branch)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                        title="Edit Branch"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(branch.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Branch"
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

export default BranchesTable;
