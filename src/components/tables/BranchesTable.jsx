// src/components/tables/BranchesTable.jsx
import React, { useState } from 'react';
import { Edit, Trash2, Search, Home, Users, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const BranchesTable = ({ branches, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = branches.filter(branch =>
    branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Search branches by name, address, contact..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 input-field w-full sm:w-1/2"/>
      </div>

      <div className="text-sm text-gray-500">Showing {filteredBranches.length} of {branches.length} branches</div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Branch Name</th>
              <th className="table-header">Address</th>
              <th className="table-header">Contact Person</th>
              <th className="table-header">Contact Email</th>
              <th className="table-header">Status</th>
              <th className="table-header">Created At</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBranches.length === 0 ? (
              <tr><td colSpan="7" className="table-cell text-center text-gray-500 py-8"><Home className="mx-auto mb-2 text-gray-300" size={48} /><p>No branches found</p></td></tr>
            ) : (
              filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                     <div className="font-medium text-gray-900">{branch.branchName}</div>
                     <div className="text-xs text-gray-500">ID: {branch.id.slice(0,10)}...</div>
                  </td>
                  <td className="table-cell text-xs">{branch.address}</td>
                  <td className="table-cell">{branch.contactPerson || 'N/A'}</td>
                  <td className="table-cell text-xs">{branch.contactEmail || 'N/A'}</td>
                  <td className="table-cell">{getStatusBadge(branch.isActive)}</td>
                  <td className="table-cell text-xs">
                    {branch.createdAt?.toDate ? format(branch.createdAt.toDate(), 'PP') : 'N/A'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => onEdit(branch)} className="text-yellow-600 hover:text-yellow-900 p-1" title="Edit Branch"><Edit size={16} /></button>
                      <button onClick={() => onDelete(branch.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete Branch"><Trash2 size={16} /></button>
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