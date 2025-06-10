import React, { useState, useMemo } from "react";
import moment from "moment";
import {
  Edit,
  Home,
  Trash2,
  Search,
  XCircle,
  CheckCircle,
  Filter,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpDown,
  Loader2,
  Building,
} from "lucide-react";

const BranchesTable = ({
  branches,
  onEdit,
  onDelete,
  loading,
  totalBranchesCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const allDates = useMemo(() => {
    const datesSet = new Set();
    branches.forEach((b) => {
      const date = b.createdAt?.toDate?.();
      if (date) {
        datesSet.add(moment(date).format("YYYY-MM"));
      }
    });
    return Array.from(datesSet).sort().reverse();
  }, [branches]);

  const filteredAndSortedBranches = useMemo(() => {
    let currentBranches = branches.filter((branch) => {
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
            moment(branch.createdAt.toDate()).format("YYYY-MM") === dateFilter; // Match YYYY-MM format

      return matchesSearch && matchesStatus && matchesDate;
    });

    if (sortConfig.key) {
      currentBranches.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
          aValue = a.createdAt?.toDate?.()?.getTime() || 0;
          bValue = b.createdAt?.toDate?.()?.getTime() || 0;
        } else if (sortConfig.key === "isActive") {
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
        } else {
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return currentBranches;
  }, [branches, searchTerm, statusFilter, dateFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      key = null;
      direction = "ascending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUpNarrowWide size={14} className="ml-1 text-gray-600" />;
    }
    return <ArrowDownWideNarrow size={14} className="ml-1 text-gray-600" />;
  };

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

  const colSpan = 7;

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
                  {moment(dateStr).format("MMMM YYYY")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Showing {filteredAndSortedBranches.length} of {branches.length} branches
      </div>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("branchName")}
              >
                <div className="flex items-center">
                  Branch Name {getSortIcon("branchName")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("address")}
              >
                <div className="flex items-center">
                  Address {getSortIcon("address")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("contactPerson")}
              >
                <div className="flex items-center">
                  Contact Person {getSortIcon("contactPerson")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("contactEmail")}
              >
                <div className="flex items-center">
                  Contact Email {getSortIcon("contactEmail")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("isActive")}
              >
                <div className="flex items-center">
                  Status {getSortIcon("isActive")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("createdAt")}
              >
                <div className="flex items-center">
                  Created At {getSortIcon("createdAt")}
                </div>
              </th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading branches...</p>
                </td>
              </tr>
            ) : totalBranchesCount === 0 ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <Building className="mx-auto mb-2 text-gray-300" size={40} />{" "}
                  <p className="text-gray-500">No branches added yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click "Add Branch" above to get started.
                  </p>
                </td>
              </tr>
            ) : filteredAndSortedBranches.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <Home className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">
                    No branches found matching your criteria.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedBranches.map((branch) => (
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
                      moment(branch.createdAt.toDate()).format("MMM DD, YYYY")}
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
