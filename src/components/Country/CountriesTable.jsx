import React from "react";
import { Edit, Trash2, FileText, Loader2 } from "lucide-react";

const CountriesTable = ({ countries, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-500">Loading countries...</p>
      </div>
    );
  }

  if (!countries || countries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No countries found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Country</th>
            <th className="table-header">Currency</th>
            <th className="table-header">Course Levels</th>
            <th className="table-header">Attachment</th>
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {countries.map((country) => (
            <tr key={country.id}>
              <td className="table-cell">{country.country}</td>
              <td className="table-cell">{country.currency}</td>
              <td className="table-cell">
                {Array.isArray(country.courseLevels) &&
                country.courseLevels.length > 0
                  ? country.courseLevels.map((level) => (
                      <span
                        key={level}
                        className="inline-block bg-gray-100 text-gray-700 text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full"
                      >
                        {level}
                      </span>
                    ))
                  : "N/A"}
              </td>
              <td className="table-cell">
                {country.attachment ? (
                  <a
                    href={country.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <FileText size={20} />
                  </a>
                ) : (
                  "No attachment"
                )}
              </td>
              <td className="table-cell">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onEdit(country)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(country.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountriesTable;
