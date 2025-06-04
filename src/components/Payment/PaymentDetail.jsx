import React from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ChevronRight,
  CircleDollarSign,
  BadgeCheck,
} from "lucide-react";

const PaymentDetail = ({ payment, enquiries }) => {
  const getStudentInfo = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return (
      enquiry && {
        name: `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`,
        email: enquiry.student_email,
        phone: enquiry.student_phone,
      }
    );
  };

  const studentInfo = getStudentInfo(payment.Memo_For);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "Pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "Failed":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment Details</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center">
            <BadgeCheck className="w-4 h-4 mr-1" />
            Payment ID: {payment.payment_id}
          </span>
          <span className="flex items-center">
            {getStatusIcon(payment.payment_status)}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                payment.payment_status
              )}`}
            >
              {payment.payment_status}
            </span>
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Date:{" "}
            {payment.payment_date &&
              new Date(payment.payment_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Payment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Payment Type</p>
              <p className="text-sm text-gray-900">{payment.Payment_Type}</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                ₹{parseFloat(payment.payment_amount).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Payment Mode</p>
              <p className="text-sm text-gray-900">{payment.payment_mode}</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Payment Reference
              </p>
              <p className="text-sm text-gray-900">
                {payment.payment_reference}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-indigo-600" />
          Student Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Student Name</p>
              <p className="text-sm text-gray-900">
                {studentInfo?.name || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Mail className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">
                {studentInfo?.email || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Phone className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">
                {studentInfo?.phone || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {payment.Payment_For && Array.isArray(payment.Payment_For) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payment.Payment_For.map((service, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
          Additional Information
        </h2>
        <div className="space-y-4">
          {payment.payment_document && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Payment Document
                </p>
                <a
                  href={payment.payment_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                >
                  View document <ChevronRight className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          )}
          {payment.payment_remarks && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-gray-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Remarks</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {payment.payment_remarks}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-gray-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Created Date</p>
              <p className="text-sm text-gray-900">
                {payment.createdAt &&
                  new Date(payment.createdAt.toDate()).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
