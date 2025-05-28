// src/components/tables/UsersTable.jsx
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, CheckCircle, XCircle, Shield } from 'lucide-react';
import { USER_ROLE_LIST, USER_ROLES } from '../../utils/constants';
import { branchService } from '../../services/firestore';

const UsersTable = ({ users = [], onEdit, onDelete, currentUserProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  console.log('UsersTable received users:', users); // Debug log

  // Fetch branches for display names
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const fetchedBranches = await branchService.getAll();
        console.log('Fetched branches:', fetchedBranches); // Debug log
        setBranches(fetchedBranches || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Create branch mapping for quick lookup
  const branchMap = branches.reduce((acc, branch) => {
    acc[branch.id] = branch.branchName || branch.name || `Branch ${branch.id.slice(0, 8)}`;
    return acc;
  }, {});

  // Function to get branch name from branchId
  const getBranchName = (branchId) => {
    if (!branchId) return 'No Branch';
    if (branchesLoading) return 'Loading...';
    return branchMap[branchId] || `Unknown Branch (${branchId.slice(0, 8)}...)`;
  };

  console.log('Branch map:', branchMap); // Debug log

  // Ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && user.isActive !== false) || 
      (statusFilter === 'inactive' && user.isActive === false);
    
    // If current user is Branch Admin, filter by their branchId
    if (currentUserProfile?.role === 'Branch Admin' && 
        user.branchId !== currentUserProfile.branchId && 
        user.role !== 'Superadmin') {
        return false;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (isActive) => {
    return isActive !== false ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle size={12} className="mr-1" /> Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    if (role === 'Superadmin') {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else if (role === 'Branch Admin' || role === 'Branch Manager') {
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
    } else if (role === 'Counsellor' || role === 'Processor') {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    } else if (role === 'Reception' || role === 'Accountant') {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else if (role === 'Agent') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        <Shield size={12} className="mr-1" /> {role || 'Unknown'}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
      
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return new Date(timestamp.toDate()).toLocaleDateString();
      }
      
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
      }
      
      return 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  const generateAvatarUrl = (displayName) => {
    const name = displayName?.replace(/\s/g, '+') || 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
  };

  console.log('Filtered users:', filteredUsers); // Debug log

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)} 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {USER_ROLE_LIST.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {safeUsers.length} users
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td 
                  colSpan={(onEdit || onDelete) ? 7 : 6} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <Shield className="mb-2 text-gray-300" size={48} />
                    <p>No users found</p>
                    {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id || user.uid || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full mr-3 object-cover" 
                        src={user.photoURL || generateAvatarUrl(user.displayName)} 
                        alt={user.displayName || 'User'}
                        onError={(e) => {
                          e.target.src = generateAvatarUrl(user.displayName);
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.displayName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {(user.id || user.uid || '').slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      {branchesLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">
                            {getBranchName(user.branchId)}
                          </span>
                          {user.branchId && user.branchId !== 'No Branch' && (
                            <span className="text-xs text-gray-400" title={`Branch ID: ${user.branchId}`}>
                              ID: {user.branchId.slice(0, 8)}...
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(user.updatedAt)}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(user)} 
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && user.role !== USER_ROLES.SUPERADMIN && (
                          <button 
                            onClick={() => onDelete(user.id || user.uid)} 
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Deactivate User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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

export default UsersTable;