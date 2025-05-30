import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { COUNTRIES, CURRENCIES } from "../../utils/constants";

const getCurrencySymbolForCountry = (countryCode) => {
  const countryToCurrencyCodeMap = {
    US: "USD",
    CA: "CAD",
    GB: "GBP",
    AU: "AUD",
    DE: "EUR",
    FR: "EUR",
    NL: "EUR",
    SG: "SGD",
    IN: "INR",
  };

  const targetCurrencyCode = countryToCurrencyCodeMap[countryCode];
  if (targetCurrencyCode) {
    const currency = CURRENCIES.find((c) => c.code === targetCurrencyCode); //
    if (currency) {
      return currency.symbol;
    }
  }
  return "$";
};

const UniversitiesTable = ({
  universities,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("univ_name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredUniversities = universities
    .filter((uni) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        uni.univ_name?.toLowerCase().includes(lowerSearchTerm) ||
        uni.univ_email?.toLowerCase().includes(lowerSearchTerm);

      const matchesCountry = !countryFilter || uni.country === countryFilter;
      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && uni.Active) ||
        (statusFilter === "inactive" && !uni.Active);

      return matchesSearch && matchesCountry && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";

      if (sortDirection === "asc") {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
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
    const country = COUNTRIES.find((c) => c.code === countryCode); //
    return country ? country.name : countryCode;
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
            placeholder="Search universities by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map(
                (
                  country //
                ) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                )
              )}
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
        Showing {filteredUniversities.length} of {universities.length}{" "}
        universities
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("univ_name")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  University Name
                  {sortField === "univ_name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("country")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Country
                  {sortField === "country" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header">Contact</th>
              <th className="table-header">Application</th>
              <th className="table-header">Status</th>
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
            {filteredUniversities.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="table-cell text-center text-gray-500 py-8"
                >
                  <Building2 className="mx-auto mb-2 text-gray-300" size={48} />
                  <p>No universities found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredUniversities.map((university) => {
                let formattedDate = "N/A";
                if (
                  university.createdAt &&
                  typeof university.createdAt.toDate === "function"
                ) {
                  try {
                    formattedDate = format(
                      university.createdAt.toDate(),
                      "MMM dd, yyyy"
                    );
                  } catch (e) {
                    formattedDate = "Invalid Date";
                  }
                } else if (university.createdAt) {
                  try {
                    const parsedDate = new Date(university.createdAt);
                    if (!isNaN(parsedDate)) {
                      formattedDate = format(parsedDate, "MMM dd, yyyy");
                    } else {
                      formattedDate = "Invalid Date";
                    }
                  } catch (e) {
                    formattedDate = "Error Parsing Date";
                  }
                }

                const appFeeSymbol = getCurrencySymbolForCountry(
                  university.country
                );

                return (
                  <tr key={university.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building2 className="text-primary-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {university.univ_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {university.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        {getCountryName(university.country)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {university.univ_phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {university.univ_phone}
                          </div>
                        )}
                        {university.univ_email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {university.univ_email}
                          </div>
                        )}
                        {university.univ_website && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Globe size={14} className="mr-2 text-gray-400" />
                            <a
                              href={university.univ_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary-600"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {university.Application_fee != null &&
                          university.Application_fee !== "" && (
                            <div className="text-sm text-gray-900">
                              Fee: {appFeeSymbol}
                              {university.Application_fee}
                            </div>
                          )}
                        {university.deadline && (
                          <div className="text-sm text-gray-500">
                            Deadline:{" "}
                            {format(
                              new Date(university.deadline),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(university.Active)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {formattedDate}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(university)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(university)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(university.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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

export default UniversitiesTable;
