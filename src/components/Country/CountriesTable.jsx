import React from "react";
import { Edit, Trash2, FileText } from "lucide-react";

const CountriesTable = ({ countries, onEdit, onDelete, loading }) => {
  if (loading) {
    return <p>Loading countries...</p>;
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
              <td className="table-cell">{country.courseLevels?.join(", ")}</td>
              <td className="table-cell">
                {country.attachment ? (
                  <a href={country.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    <FileText size={20} />
                  </a>
                ) : (
                  "No attachment"
                )}
              </td>
              <td className="table-cell">
                <div className="flex items-center space-x-4">
                  <button onClick={() => onEdit(country)} className="text-yellow-600 hover:text-yellow-900">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(country.id)} className="text-red-600 hover:text-red-900">
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