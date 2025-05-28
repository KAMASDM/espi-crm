import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { APPLICATION_STATUS } from '../../utils/constants';

const ApplicationsTable = ({ 
  applications, 
  assessments,
  loading, 
  onEdit, 
  onDelete, 
  onView,
  onDownload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const filteredApplications = applications
    .filter(application => {
      const assessment = getAssessment(application.application);
      const searchableText = `${assessment?.specialisation || ''} ${assessment?.university_name || ''}`.toLowerCase();
      
      const matchesSearch = 
        searchableText.includes(searchTerm.toLowerCase()) ||
        application.id.includes(searchTerm);
      
      const matchesStatus = !statusFilter || application.application_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getAssessment = (assessmentId) => {
    return assessments.find(assessment => assessment.id === assessmentId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'Submitted': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Additional Documents Required': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      'Interview Scheduled': { color: 'bg-purple-100 text-purple-800', icon: Calendar },
      'Decision Pending': { color: 'bg-indigo-100 text-indigo-800', icon: Clock },
      'Accepted': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'Waitlisted': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Deferred': { color: 'bg-gray-100 text-gray-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig['Draft'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  const getDocumentCount = (application) => {
    const documents = [
      'sop', 'cv', 'passport', 'ielts', 'toefl', 'gre', 'gmat', 'pte',
      'work_experience', 'diploma_marksheet', 'bachelor_marksheet', 
      'master_marksheet', 'other_documents'
    ];
    
    return documents.filter(doc => application[doc]).length;
  };

  const getCompletionPercentage = (application) => {
    const totalFields = 13; 
    const completedFields = getDocumentCount(application);
    return Math.round((completedFields / totalFields) * 100);
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search applications by assessment or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {APPLICATION_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredApplications.length} of {applications.length} applications
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Application ID</th>
              <th className="table-header">Assessment Details</th>
              <th className="table-header">Documents</th>
              <th 
                onClick={() => handleSort('application_status')}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'application_status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header">Progress</th>
              <th 
                onClick={() => handleSort('createdAt')}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Created
                  {sortField === 'createdAt' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-cell text-center text-gray-500 py-8">
                  <FileText className="mx-auto mb-2 text-gray-300" size={48} />
                  <p>No applications found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => {
                const assessment = getAssessment(application.application);
                const completionPercentage = getCompletionPercentage(application);
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <FileText className="text-indigo-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            APP-{application.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {application.id.slice(-12)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment?.specialisation || 'General Assessment'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Assessment #{assessment?.id?.slice(-8) || 'N/A'}
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-900">
                          {getDocumentCount(application)}/13 docs
                        </div>
                        {onDownload && (
                          <button
                            onClick={() => onDownload(application)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Documents"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="table-cell">
                      {getStatusBadge(application.application_status)}
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              completionPercentage === 100 ? 'bg-green-500' :
                              completionPercentage >= 75 ? 'bg-blue-500' :
                              completionPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8">
                          {completionPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {application.createdAt && format(new Date(application.createdAt.toDate()), 'MMM dd, yyyy')}
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(application)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(application)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(application.id)}
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

export default ApplicationsTable;