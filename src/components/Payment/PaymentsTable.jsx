import { useState } from "react";
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
  Filter,
  Loader2,
} from "lucide-react";
import {
  PAYMENT_STATUS,
  PAYMENT_MODES,
  PAYMENT_TYPES,
} from "../../utils/constants";
import moment from "moment";

const PaymentsTable = ({
  payments,
  enquiries,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");

  const getStudentName = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`
      : "Unknown Student";
  };

  const filteredPayments = payments
    .filter((payment) => {
      const studentName = getStudentName(payment.Memo_For);

      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_reference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || payment.payment_status === statusFilter;
      const matchesMode = !modeFilter || payment.payment_mode === modeFilter;
      const matchesType = !typeFilter || payment.Payment_Type === typeFilter;

      return matchesSearch && matchesStatus && matchesMode && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "student") {
        aValue = getStudentName(a.Memo_For);
        bValue = getStudentName(b.Memo_For);
      } else if (sortField === "payment_date") {
        aValue = new Date(a.payment_date);
        bValue = new Date(b.payment_date);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStudentEmail = (enquiryId) => {
    const enquiry = enquiries.find((enq) => enq.id === enquiryId);
    return enquiry ? enquiry.student_email : "Unknown";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Partially Paid": { color: "bg-blue-100 text-blue-800", icon: Clock },
      Refunded: { color: "bg-purple-100 text-purple-800", icon: CreditCard },
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

  const getModeIcon = (mode) => {
    const modeIcons = {
      Cash: IndianRupee,
      "Credit Card": CreditCard,
      "Debit Card": CreditCard,
      "Bank Transfer": CreditCard,
      Cheque: CreditCard,
      "Online Payment": CreditCard,
      UPI: CreditCard,
      Other: CreditCard,
    };

    return modeIcons[mode] || CreditCard;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by student name, payment ID, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        <div className="relative flex gap-2">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            {PAYMENT_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Modes</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredPayments.length} of {payments.length} payments
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Payment ID</th>
              <th
                onClick={() => handleSort("student")}
                className="table-header cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Student
                  {sortField === "student" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
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
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading payments...</p>
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
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
              filteredPayments.map((payment) => {
                const ModeIcon = getModeIcon(payment.payment_mode);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CreditCard className="text-green-600" size={20} />
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
                            {getStudentName(payment.Memo_For)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getStudentEmail(payment.Memo_For)}
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
                          <ModeIcon size={14} className="mr-2 text-gray-400" />
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

                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(payment)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Payment"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(payment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Payment"
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

export default PaymentsTable;
