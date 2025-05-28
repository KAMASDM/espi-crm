import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  PAYMENT_TYPES, 
  PAYMENT_STATUS, 
  PAYMENT_MODES,
  AVAILABLE_SERVICES
} from '../../utils/constants';
import { useEnquiries } from '../../hooks/useFirestore';
import { paymentService } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentForm = ({ onClose, onSuccess, editData = null }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: editData || {
      payment_date: new Date().toISOString().split('T')[0]
    }
  });
  const { user } = useAuth();
  const { data: enquiries } = useEnquiries();
  const [loading, setLoading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const selectedEnquiry = watch('Memo_For');
  const selectedServices = watch('Payment_For') || [];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const paymentData = {
        ...data,
        payment_received_by: user.uid,
        createdBy: user.uid
      };

      // Add uploaded document if exists
      if (uploadedDocument) {
        paymentData.payment_document = uploadedDocument;
      }

      if (editData) {
        await paymentService.update(editData.id, paymentData);
        toast.success('Payment updated successfully!');
      } else {
        await paymentService.create(paymentData);
        toast.success('Payment recorded successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      // In a real implementation, you would upload to Firebase Storage
      setUploadedDocument(file.name);
      toast.success(`${file.name} uploaded successfully!`);
    }
  };

  const removeDocument = () => {
    setUploadedDocument(null);
  };

  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find(enq => enq.id === enquiryId);
    return enquiry ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}` : 'Unknown Student';
  };

  const calculateServiceTotal = () => {
    return selectedServices.reduce((total, serviceName) => {
      const service = AVAILABLE_SERVICES.find(s => s.name === serviceName);
      return total + (service ? service.price : 0);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <select 
              {...register('Memo_For', { required: 'Student selection is required' })} 
              className="input-field"
            >
              <option value="">Select Student</option>
              {enquiries.map(enquiry => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.student_First_Name} {enquiry.student_Last_Name} - {enquiry.student_email}
                </option>
              ))}
            </select>
            {errors.Memo_For && (
              <p className="text-red-600 text-sm mt-1">{errors.Memo_For.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment ID
            </label>
            <input
              type="text"
              {...register('payment_id')}
              className="input-field"
              placeholder="Auto-generated if empty"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <select 
              {...register('Payment_Type', { required: 'Payment type is required' })} 
              className="input-field"
            >
              <option value="">Select Payment Type</option>
              {PAYMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.Payment_Type && (
              <p className="text-red-600 text-sm mt-1">{errors.Payment_Type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              {...register('payment_date', { required: 'Payment date is required' })}
              className="input-field"
            />
            {errors.payment_date && (
              <p className="text-red-600 text-sm mt-1">{errors.payment_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('payment_amount', { 
                required: 'Payment amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="input-field"
              placeholder="0.00"
            />
            {errors.payment_amount && (
              <p className="text-red-600 text-sm mt-1">{errors.payment_amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode *
            </label>
            <select 
              {...register('payment_mode', { required: 'Payment mode is required' })} 
              className="input-field"
            >
              <option value="">Select Payment Mode</option>
              {PAYMENT_MODES.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            {errors.payment_mode && (
              <p className="text-red-600 text-sm mt-1">{errors.payment_mode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status *
            </label>
            <select 
              {...register('payment_status', { required: 'Payment status is required' })} 
              className="input-field"
            >
              <option value="">Select Payment Status</option>
              {PAYMENT_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.payment_status && (
              <p className="text-red-600 text-sm mt-1">{errors.payment_status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Reference
            </label>
            <input
              type="text"
              {...register('payment_reference')}
              className="input-field"
              placeholder="Transaction ID, Cheque number, etc."
            />
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Services</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment For *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg">
              {AVAILABLE_SERVICES.map(service => (
                <label key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      value={service.name}
                      {...register('Payment_For', { required: 'Please select at least one service' })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">₹{service.price.toLocaleString()}</span>
                </label>
              ))}
            </div>
            {errors.Payment_For && (
              <p className="text-red-600 text-sm mt-1">{errors.Payment_For.message}</p>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Selected Services Total</h5>
              <p className="text-2xl font-bold text-blue-900">₹{calculateServiceTotal().toLocaleString()}</p>
              <p className="text-sm text-blue-700">
                Based on {selectedServices.length} selected service{selectedServices.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Document */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Document</h4>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {uploadedDocument ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="text-green-600" size={24} />
                <span className="text-sm text-green-600">{uploadedDocument}</span>
                <button
                  type="button"
                  onClick={removeDocument}
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
                    <span>Upload payment receipt</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Remarks
          </label>
          <textarea
            {...register('payment_remarks')}
            rows={4}
            className="input-field"
            placeholder="Add any additional notes about the payment..."
          />
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
          {loading ? 'Saving...' : editData ? 'Update Payment' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;