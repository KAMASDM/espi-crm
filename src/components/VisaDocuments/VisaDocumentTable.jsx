// src/components/VisaDocument/VisaDocumentTable.jsx
import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpDown,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { useCountries } from "../../hooks/useFirestore";


const VisaDocumentTable = ({
  documents,
  onEdit,
  onDelete,
  loading,
  totalCount,
}) => {
    const { data: countries } = useCountries();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const filteredDocuments = documents.filter((doc) => {
    const countryName = countries[doc.id] || doc.id;
    return countryName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key] || a.id;
    const bValue = b[sortConfig.key] || b.id;

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpNarrowWide size={14} className="ml-1 text-gray-600" />
    ) : (
      <ArrowDownWideNarrow size={14} className="ml-1 text-gray-600" />
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
            placeholder="Search by country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredDocuments.length} of {documents.length} countries
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="table-header cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("id")}
              >
                <div className="flex items-center">
                  Country {getSortIcon("id")}
                </div>
              </th>
              <th className="table-header">Documents</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading documents...</p>
                </td>
              </tr>
            ) : totalCount === 0 ? (
              <tr>
                <td colSpan={3} className="table-cell text-center py-8">
                  <PlusCircle
                    className="mx-auto mb-2 text-gray-300"
                    size={40}
                  />
                  <p className="text-gray-500">No visa documents added yet.</p>
                </td>
              </tr>
            ) : sortedDocuments.length === 0 ? (
              <tr>
                <td colSpan={3} className="table-cell text-center py-8">
                  <p className="text-gray-500">
                    No countries found matching your search.
                  </p>
                </td>
              </tr>
            ) : (
              sortedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {countries.find((c) => c.countryCode === doc.countryCode)
                        ?.country || doc.id}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-500">
                      {doc.requirements?.join(", ").slice(0, 50) + "....." ||
                        "No documents"}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(doc)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-red-600 hover:text-red-900 p-1"
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

export default VisaDocumentTable;
