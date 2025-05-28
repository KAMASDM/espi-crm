import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { APPLICATION_STATUS } from '../../utils/constants';
import { useAssessments } from '../../hooks/useFirestore';
import { applicationService } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationForm = ({ onClose, onSuccess, editData = null }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: editData || {}
  });
  const { user } = useAuth();
  const { data: assessments } = useAssessments();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const applicationData = {
        ...data,
        ...uploadedFiles,
        createdBy: user.uid
      };

      if (editData) {
        await applicationService.update(editData.id, applicationData);
        toast.success('Application updated successfully!');
      } else {
        await applicationService.create(applicationData);
        toast.success('Application created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      // In a real implementation, you would upload to Firebase Storage
      // For now, we'll just store the file reference
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file.name
      }));
      toast.success(`${file.name} uploaded successfully!`);
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const FileUploadField = ({ name, label, accept = "*/*" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
        <div className="space-y-1 text-center">
          {uploadedFiles[name] ? (
            <div className="flex items-center justify-center space-x-2">
              <FileText className="text-green-600" size={24} />
              <span className="text-sm text-green-600">{uploadedFiles[name]}</span>
              <button
                type="button"
                onClick={() => removeFile(name)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-gray-400" size={24} />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept={accept}
                    onChange={(e) => handleFileUpload(name, e.target.files[0])}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const getAssessmentDisplayName = (assessment) => {
    return `${assessment.student_name || 'Student'} - ${assessment.university_name || 'University'} - ${assessment.course_name || 'Course'}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment *
            </label>
            <select 
              {...register('application', { required: 'Assessment selection is required' })} 
              className="input-field"
            >
              <option value="">Select Assessment</option>
              {assessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  Assessment #{assessment.id.slice(-8)} - {assessment.specialisation || 'General Assessment'}
                </option>
              ))}
            </select>
            {errors.application && (
              <p className="text-red-600 text-sm mt-1">{errors.application.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Status
            </label>
            <select {...register('application_status')} className="input-field">
              <option value="">Select Status</option>
              {APPLICATION_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Documents */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Academic Documents</h5>
            
            <FileUploadField 
              name="passport" 
              label="Passport"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="diploma_marksheet" 
              label="Diploma Marksheet"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="bachelor_marksheet" 
              label="Bachelor's Marksheet"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="master_marksheet" 
              label="Master's Marksheet"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          {/* Test Scores & Professional Documents */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Test Scores & Professional Documents</h5>
            
            <FileUploadField 
              name="ielts" 
              label="IELTS Score Report"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="toefl" 
              label="TOEFL Score Report"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="gre" 
              label="GRE Score Report"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="gmat" 
              label="GMAT Score Report"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="pte" 
              label="PTE Score Report"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        {/* Application Documents */}
        <div className="mt-6">
          <h5 className="font-medium text-gray-900 mb-4">Application Documents</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadField 
              name="sop" 
              label="Statement of Purpose (SOP)"
              accept=".pdf,.doc,.docx"
            />
            
            <FileUploadField 
              name="cv" 
              label="CV/Resume"
              accept=".pdf,.doc,.docx"
            />
            
            <FileUploadField 
              name="work_experience" 
              label="Work Experience Letter"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <FileUploadField 
              name="other_documents" 
              label="Other Documents"
              accept="*/*"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="input-field"
              placeholder="Add any additional notes about the application process, deadlines, special requirements, etc..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : editData ? 'Update Application' : 'Create Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;