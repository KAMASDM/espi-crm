import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Download, Upload } from 'lucide-react';

const DocumentStatus = ({ 
  documents = [], 
  onUpload, 
  onDownload, 
  compact = false 
}) => {
  const getStatusIcon = (hasDocument) => {
    if (hasDocument) {
      return <CheckCircle2 size={16} className="text-green-500" />;
    }
    return <AlertCircle size={16} className="text-red-500" />;
  };

  const getStatusText = (hasDocument) => {
    return hasDocument ? 'Uploaded' : 'Missing';
  };

  const getStatusColor = (hasDocument) => {
    return hasDocument 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  if (compact) {
    // Compact view for dashboard/summary
    const totalDocuments = documents.length;
    const uploadedDocuments = documents.filter(doc => doc.uploaded).length;
    const percentage = totalDocuments > 0 ? (uploadedDocuments / totalDocuments) * 100 : 0;

    return (
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h6 className="text-sm font-medium text-gray-900">Document Status</h6>
          <span className="text-xs text-gray-500">
            {uploadedDocuments}/{totalDocuments}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${
              percentage === 100 ? 'bg-green-500' :
              percentage >= 75 ? 'bg-blue-500' :
              percentage >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600">
          {percentage === 100 ? 'All documents uploaded' : 
           percentage === 0 ? 'No documents uploaded' :
           `${Math.round(percentage)}% complete`}
        </p>
      </div>
    );
  }

  // Full view for detailed pages
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-900">Document Checklist</h5>
        <span className="text-sm text-gray-500">
          {documents.filter(doc => doc.uploaded).length} of {documents.length} uploaded
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents.map((doc, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-3 ${getStatusColor(doc.uploaded)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={16} className="text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">{doc.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(doc.uploaded)}
                {doc.uploaded ? (
                  <button
                    onClick={() => onDownload?.(doc.field)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Download"
                  >
                    <Download size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => onUpload?.(doc.field)}
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Upload"
                  >
                    <Upload size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-1">
              <span className={`text-xs ${
                doc.uploaded ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusText(doc.uploaded)}
              </span>
              {doc.uploadDate && (
                <span className="text-xs text-gray-500 ml-2">
                  • {doc.uploadDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentStatus;