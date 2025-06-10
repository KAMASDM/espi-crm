import React, { useState } from "react";
import moment from "moment";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  User,
  IndianRupee,
  Receipt,
  Filter,
} from "lucide-react";

// Assuming these constants are available from your project utils
const PAYMENT_STATUS = [
  "Paid",
  "Pending",
  "Failed",
  "Partially Paid",
  "Cancelled",
];
const PAYMENT_TYPES = ["Application Fee", "Tuition Fee", "Visa Fee"];

// Helper function for status badges
const getStatusBadge = (status) => {
  const statusConfig = {
    Paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    "Partially Paid": { color: "bg-blue-100 text-blue-800", icon: Clock },
    Failed: { color: "bg-red-100 text-red-800", icon: XCircle },
    Cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
  };
  const config = statusConfig[status] || statusConfig["Pending"];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon size={12} className="mr-1" />
      {status}
    </span>
  );
};

// Helper function for payment mode icons
const getModeIcon = (mode) => {
  const modeIcons = {
    Cash: IndianRupee,
    Cheque: CreditCard,
    "Bank Transfer": CreditCard,
    "Online Payment": CreditCard,
    UPI: CreditCard,
  };
  return modeIcons[mode] || CreditCard;
};

const PaymentList = ({ payments, student }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredAndSortedPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_reference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || payment.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-600 h-full flex flex-col items-center justify-center">
        <Receipt size={48} className="text-gray-300 mb-3" />
        <p>No payments found for this student.</p>
      </div>
    );
  }

  const studentInfo = {
    name: student
      ? `${student.student_First_Name} ${student.student_Last_Name}`
      : "Unknown Student",
    email: student ? student.student_email : "No email",
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by university, course, specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {PAYMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredAndSortedPayments.length} of {payments.length}{" "}
          payments
        </div>

        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Payment ID</th>
                <th className="table-header cursor-pointer hover:bg-gray-100">
                  Student
                </th>
                <th
                  onClick={() => handleSort("payment_amount")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Amount
                    {sortField === "payment_amount" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="table-header">Payment Details</th>
                <th
                  onClick={() => handleSort("payment_status")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "payment_status" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("payment_date")}
                  className="table-header cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "payment_date" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="table-cell text-center text-gray-500 py-8"
                  >
                    <CreditCard
                      className="mx-auto mb-2 text-gray-300"
                      size={48}
                    />
                    <p>No payments found</p>
                    {searchTerm && (
                      <p className="text-sm">Try adjusting your search terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSortedPayments.map((payment) => {
                  const ModeIcon = getModeIcon(payment.payment_mode);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <CreditCard
                                className="text-green-600"
                                size={20}
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.payment_id ||
                                `PAY-${payment.id.slice(-8)}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.payment_reference &&
                                `Ref: ${payment.payment_reference}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="text-blue-600" size={16} />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {studentInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {studentInfo.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="text-lg font-semibold text-gray-900">
                          ₹
                          {parseFloat(
                            payment.payment_amount || 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.Payment_Type}
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <ModeIcon
                              size={14}
                              className="mr-2 text-gray-400"
                            />
                            {payment.payment_mode}
                          </div>
                          {payment.Payment_For &&
                            Array.isArray(payment.Payment_For) && (
                              <div className="text-sm text-gray-500">
                                Services: {payment.Payment_For.join(", ")}
                              </div>
                            )}
                        </div>
                      </td>

                      <td className="table-cell">
                        {getStatusBadge(payment.payment_status)}
                      </td>

                      <td className="table-cell">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {payment.payment_date &&
                            moment(payment.payment_date).format("MMM DD, YYYY")}
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
    </div>
  );
};

export default PaymentList;
