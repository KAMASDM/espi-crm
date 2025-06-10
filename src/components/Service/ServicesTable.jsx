import React, { useMemo, useState } from "react";
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
  PlusCircle,
} from "lucide-react";

const ServicesTable = ({
  services,
  onEdit,
  onDelete,
  handleVisibility,
  loading,
  totalServicesCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const allDates = useMemo(() => {
    const datesSet = new Set();
    services.forEach((s) => {
      const date = s.createdAt?.toDate?.();
      if (date) {
        datesSet.add(moment(date).format("YYYY-MM"));
      }
    });
    return Array.from(datesSet).sort().reverse();
  }, [services]);

  const filteredAndSortedServices = useMemo(() => {
    let currentServices = services.filter((service) => {
      const matchesSearch = service.serviceName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? service.isActive
          : !service.isActive;

      const matchesDate =
        dateFilter === "all"
          ? true
          : service.createdAt?.toDate?.() &&
            moment(service.createdAt.toDate()).format("YYYY-MM") === dateFilter;

      const servicePrice = parseFloat(service.servicePrice);
      let matchesPrice = true;
      if (priceFilter !== "all" && !isNaN(servicePrice)) {
        if (priceFilter === "0-100")
          matchesPrice = servicePrice >= 0 && servicePrice <= 100;
        else if (priceFilter === "101-500")
          matchesPrice = servicePrice > 100 && servicePrice <= 500;
        else if (priceFilter === "501-1000")
          matchesPrice = servicePrice > 500 && servicePrice <= 1000;
        else if (priceFilter === "1001-5000")
          matchesPrice = servicePrice > 1000 && servicePrice <= 5000;
        else if (priceFilter === "5000+") matchesPrice = servicePrice > 5000;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesPrice;
    });

    if (sortConfig.key) {
      currentServices.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
          aValue = a.createdAt?.toDate?.()?.getTime() || 0;
          bValue = b.createdAt?.toDate?.()?.getTime() || 0;
        } else if (sortConfig.key === "servicePrice") {
          aValue = parseFloat(a.servicePrice) || 0;
          bValue = parseFloat(b.servicePrice) || 0;
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

    return currentServices;
  }, [services, searchTerm, statusFilter, dateFilter, priceFilter, sortConfig]);

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

  const colSpan = handleVisibility ? 5 : 4;

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
            placeholder="Search services by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <div className="relative flex gap-2">
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

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

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Prices</option>
              <option value="0-100">₹0 - ₹100</option>
              <option value="101-500">₹101 - ₹500</option>
              <option value="501-1000">₹501 - ₹1000</option>
              <option value="1001-5000">₹1001 - ₹5000</option>
              <option value="5000+">₹5000+</option>
            </select>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Showing {filteredAndSortedServices.length} of {services.length} services
      </div>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("serviceName")}
              >
                <div className="flex items-center">
                  Service Name {getSortIcon("serviceName")}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("servicePrice")}
              >
                <div className="flex items-center">
                  Price {getSortIcon("servicePrice")}
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
              {handleVisibility && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading services...</p>
                </td>
              </tr>
            ) : totalServicesCount === 0 ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <PlusCircle
                    className="mx-auto mb-2 text-gray-300"
                    size={40}
                  />
                  <p className="text-gray-500">No services added yet.</p>
                  {handleVisibility && (
                    <p className="text-sm text-gray-400 mt-2">
                      Click "Add Service" above to get started.
                    </p>
                  )}
                </td>
              </tr>
            ) : filteredAndSortedServices.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="table-cell text-center py-8">
                  <Home className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">
                    No services found matching your criteria.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {service.serviceName}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{service.servicePrice}
                    </div>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(service.isActive)}
                  </td>
                  <td className="table-cell text-sm font-medium text-gray-500">
                    {service.createdAt?.toDate &&
                      moment(service.createdAt.toDate()).format("MMM DD, YYYY")}
                  </td>
                  {handleVisibility && (
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(service)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Edit Service"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(service.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Service"
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

export default ServicesTable;
