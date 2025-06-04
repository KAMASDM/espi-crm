import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, Upload, AlertTriangle } from "lucide-react";
import Modal from "../components/Common/Modal";
import PaymentForm from "../components/Payment/PaymentForm";
import PaymentsTable from "../components/Payment/PaymentsTable";
import { usePayments, useEnquiries } from "../hooks/useFirestore";
import PaymentDetail from "../components/Payment/PaymentDetail";

const Payments = () => {
  const {
    data: paymentsData,
    loading: paymentsLoading,
    delete: deletePayment,
  } = usePayments();
  const { data: enquiriesData, loading: enquiriesLoading } = useEnquiries();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDeleteId, setPaymentToDeleteId] = useState(null);

  const isLoading = paymentsLoading || enquiriesLoading;

  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleDelete = (paymentId) => {
    setPaymentToDeleteId(paymentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (paymentToDeleteId) {
      try {
        await deletePayment(paymentToDeleteId);
        toast.success("Payment record deleted successfully!");
      } catch (error) {
        console.error("Error deleting payment record:", error);
        toast.error("Failed to delete payment record. Please try again.");
      } finally {
        setShowDeleteModal(false);
        setPaymentToDeleteId(null);
      }
    }
  };

  const handleDownload = () => {
    toast.info("Receipt download functionality will be implemented soon!");
  };

  const handleFormSuccess = (action = "submitted") => {
    toast.success(`Payment ${action} successfully!`);
  };

  const handleExport = () => {
    toast.info("Export functionality will be implemented soon!");
  };

  const handleImport = () => {
    toast.info("Import functionality will be implemented soon!");
  };

  const totalRevenue = payments
    .filter((payment) => payment.payment_status === "Paid")
    .reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);

  const pendingPaymentsCount = payments.filter(
    (payment) => payment.payment_status === "Pending"
  ).length;

  const paidPaymentsCount = payments.filter(
    (payment) => payment.payment_status === "Paid"
  ).length;

  const failedPaymentsCount = payments.filter(
    (payment) => payment.payment_status === "Failed"
  ).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-sm text-gray-600">
            Track payments, invoices, and financial transactions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleImport}
            className="btn-secondary flex items-center"
            disabled={isLoading}
          >
            <Upload size={18} className="mr-1.5" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
            disabled={isLoading || payments.length === 0}
          >
            <Download size={18} className="mr-1.5" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={isLoading}
          >
            <Plus size={18} className="mr-1.5" />
            Add Payment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                ₹
                {isLoading
                  ? "..."
                  : totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Total Revenue</p>
              <p className="text-xs text-gray-500">Successfully collected</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {isLoading ? "..." : paidPaymentsCount}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Paid</p>
              <p className="text-xs text-gray-500">Completed payments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {isLoading ? "..." : pendingPaymentsCount}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="text-xs text-gray-500">Awaiting payment</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <div className="text-red-600 text-2xl font-bold">
                {isLoading ? "..." : failedPaymentsCount}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Failed</p>
              <p className="text-xs text-gray-500">Unsuccessful payments</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <PaymentsTable
          payments={payments}
          enquiries={enquiries}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onDownload={handleDownload}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record New Payment"
        size="large"
      >
        <PaymentForm
          enquiries={enquiries}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            handleFormSuccess("added");
            setShowAddModal(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Payment"
        size="large"
      >
        <PaymentForm
          editData={selectedPayment}
          enquiries={enquiries}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess("updated");
            setShowEditModal(false);
            setSelectedPayment(null);
          }}
        />
      </Modal>
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Payment Details"
        size="large"
      >
        {selectedPayment && (
          <PaymentDetail payment={selectedPayment} enquiries={enquiries} />
        )}
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPaymentToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Payment Record?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this payment record? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setPaymentToDeleteId(null);
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
