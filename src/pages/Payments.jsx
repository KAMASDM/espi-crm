import { useState } from "react";
import { Plus, Download, Upload } from "lucide-react";
import Modal from "../components/common/Modal";
import PaymentForm from "../components/Payment/PaymentForm";
import PaymentsTable from "../components/Payment/PaymentsTable";
import { usePayments, useEnquiries } from "../hooks/useFirestore";
import toast from "react-hot-toast";

const Payments = () => {
  const { data: payments, loading, remove } = usePayments();
  const { data: enquiries } = useEnquiries();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleDelete = async (paymentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this payment record? This action cannot be undone."
      )
    ) {
      try {
        await remove(paymentId);
        toast.success("Payment deleted successfully!");
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment. Please try again.");
      }
    }
  };

  const handleDownload = () => {
    toast.info("Receipt download functionality will be implemented soon!");
  };

  const handleFormSuccess = () => {};

  const handleExport = () => {
    toast.info("Export functionality will be implemented soon!");
  };

  const handleImport = () => {
    toast.info("Import functionality will be implemented soon!");
  };

  const totalRevenue = payments
    .filter((payment) => payment.payment_status === "Paid")
    .reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);

  const pendingPayments = payments.filter(
    (payment) => payment.payment_status === "Pending"
  ).length;
  const paidPayments = payments.filter(
    (payment) => payment.payment_status === "Paid"
  ).length;
  const failedPayments = payments.filter(
    (payment) => payment.payment_status === "Failed"
  ).length;

  const averagePayment = paidPayments > 0 ? totalRevenue / paidPayments : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">
            Track payments, invoices, and financial transactions
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleImport}
            className="btn-secondary flex items-center"
          >
            <Upload size={20} className="mr-2" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xs text-gray-500">Successfully collected</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {paidPayments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-xs text-gray-500">Completed payments</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {pendingPayments}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xs text-gray-500">Awaiting payment</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                ₹{averagePayment.toLocaleString()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Average Payment
              </p>
              <p className="text-xs text-gray-500">Per transaction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <PaymentsTable
          payments={payments}
          enquiries={enquiries}
          loading={loading}
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
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
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
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Payment Details"
        size="large"
      >
        {selectedPayment && (
          <PaymentDetails payment={selectedPayment} enquiries={enquiries} />
        )}
      </Modal>
    </div>
  );
};

const PaymentDetails = ({ payment, enquiries }) => {
  const getStudentInfo = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry
      ? {
          name: `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`,
          email: enquiry.student_email,
          phone: enquiry.student_phone,
        }
      : { name: "Unknown Student", email: "Unknown", phone: "Unknown" };
  };

  const studentInfo = getStudentInfo(payment.Memo_For);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Payment Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment ID
            </label>
            <p className="text-sm text-gray-900">
              {payment.payment_id || `PAY-${payment.id.slice(-8)}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Type
            </label>
            <p className="text-sm text-gray-900">{payment.Payment_Type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <p className="text-lg font-semibold text-gray-900">
              ₹{parseFloat(payment.payment_amount || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <p className="text-sm text-gray-900">
              {payment.payment_date
                ? new Date(payment.payment_date).toLocaleDateString()
                : "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Mode
            </label>
            <p className="text-sm text-gray-900">{payment.payment_mode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <p className="text-sm text-gray-900">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  payment.payment_status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : payment.payment_status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : payment.payment_status === "Failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {payment.payment_status}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Reference
            </label>
            <p className="text-sm text-gray-900">
              {payment.payment_reference || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Student Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student Name
            </label>
            <p className="text-sm text-gray-900">{studentInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="text-sm text-gray-900">{studentInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <p className="text-sm text-gray-900">{studentInfo.phone}</p>
          </div>
        </div>
      </div>

      {payment.Payment_For && Array.isArray(payment.Payment_For) && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {payment.Payment_For.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-700">{service}</span>
                <span className="text-sm font-medium text-gray-900"></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Additional Information
        </h4>
        <div className="space-y-4">
          {payment.payment_document && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Document
              </label>
              <p className="text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Document Available: {payment.payment_document}
                </span>
              </p>
            </div>
          )}

          {payment.payment_remarks && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {payment.payment_remarks}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Created Date
            </label>
            <p className="text-sm text-gray-900">
              {payment.createdAt
                ? new Date(payment.createdAt.toDate()).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
