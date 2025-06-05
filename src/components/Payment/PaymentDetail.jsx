import React, { useCallback } from "react";
import {
  CreditCard as CreditCardIcon,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  XCircle,
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  FileText as FileTextIcon,
  AlertCircle,
  ChevronRight,
  CircleDollarSign,
  X,
  Info,
  FileArchive,
  Link as LinkIcon,
} from "lucide-react";
import Loading from "../Common/Loading";

const PaymentDetail = ({ payment, enquiries, isOpen, onClose }) => {
  const getStudentInfo = useCallback(
    (enquiryId) => {
      if (!enquiryId || !enquiries) return null;
      const enquiry = enquiries.find((enq) => enq.id === enquiryId);
      return (
        enquiry && {
          name: `${enquiry.student_First_Name} ${enquiry.student_Last_Name}`,
          email: enquiry.student_email,
          phone: enquiry.student_phone,
        }
      );
    },
    [enquiries]
  );

  const studentInfo = React.useMemo(
    () => (payment ? getStudentInfo(payment.Memo_For) : null),
    [payment, getStudentInfo]
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp.toDate()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return "Invalid Date";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Failed":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { className: "mr-1.5 h-4 w-4 flex-shrink-0" };
    switch (status) {
      case "Paid":
        return <CheckCircle2 {...iconProps} />;
      case "Pending":
        return <Clock {...iconProps} />;
      case "Failed":
        return <XCircle {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const Card = ({ children, className = "" }) => (
    <section
      className={`rounded-xl bg-white p-5 shadow-lg sm:p-6 ${className}`}
    >
      {children}
    </section>
  );

  const CardTitle = ({ icon: Icon, text, iconColor = "text-indigo-600" }) => (
    <h2 className="mb-4 flex items-center text-lg font-semibold text-slate-800 sm:text-xl">
      <Icon
        className={`mr-3 h-5 w-5 sm:h-6 sm:w-6 ${iconColor} flex-shrink-0`}
      />
      {text}
    </h2>
  );

  const InfoListItem = ({
    icon: Icon,
    label,
    value,
    valueClasses = "text-slate-800",
  }) => (
    <div className="py-2">
      <div className="flex items-start">
        <Icon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-slate-500" />
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>
          <p
            className={`mt-0.5 break-words text-sm sm:text-base ${valueClasses}`}
          >
            {value || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

  if (!payment) {
    return isOpen && <Loading size="default" />;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end overflow-hidden transition-opacity duration-300 ease-in-out ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex h-full w-full transform flex-col bg-slate-100 shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-2xl md:max-w-3xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <FileArchive className="mr-2 h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              Payment Overview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Close drawer"
          >
            <X className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 pt-5 sm:p-6 bg-slate-50">
          <div className="space-y-6">
            <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
              <div className="flex flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold tracking-wide">
                  Payment ID: {payment.payment_id || "N/A"}
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm sm:text-sm ${getStatusClasses(
                    payment.payment_status
                  )}`}
                >
                  {getStatusIcon(payment.payment_status)}
                  {payment.payment_status || "N/A"}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                ₹{parseFloat(payment.payment_amount).toLocaleString() || "N/A"}
              </h1>
              <p className="mt-1 flex items-center text-sm text-indigo-200">
                <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                Payment Date: {formatDate(payment.payment_date)}
              </p>
            </section>
            <Card>
              <CardTitle
                icon={CreditCardIcon}
                text="Payment Information"
                iconColor="text-blue-600"
              />
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                {[
                  {
                    icon: FileTextIcon,
                    label: "Payment Type",
                    value: payment.Payment_Type,
                  },
                  {
                    icon: CircleDollarSign,
                    label: "Amount",
                    value: `₹${parseFloat(
                      payment.payment_amount
                    ).toLocaleString()}`,
                    valueClasses: "text-lg font-semibold text-slate-800",
                  },
                  {
                    icon: CreditCardIcon,
                    label: "Payment Mode",
                    value: payment.payment_mode,
                  },
                  {
                    icon: FileTextIcon,
                    label: "Payment Reference",
                    value: payment.payment_reference,
                  },
                ].map((item, index) => (
                  <InfoListItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    valueClasses={item.valueClasses}
                  />
                ))}
              </div>
            </Card>
            <Card>
              <CardTitle
                icon={UserIcon}
                text="Student Information"
                iconColor="text-indigo-600"
              />
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                {[
                  {
                    icon: UserIcon,
                    label: "Student Name",
                    value: studentInfo?.name,
                  },
                  {
                    icon: MailIcon,
                    label: "Email",
                    value: studentInfo?.email,
                  },
                  {
                    icon: PhoneIcon,
                    label: "Phone",
                    value: studentInfo?.phone,
                  },
                ].map((item, index) => (
                  <InfoListItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </Card>
            {payment.Payment_For && Array.isArray(payment.Payment_For) && (
              <Card>
                <CardTitle
                  icon={FileTextIcon}
                  text="Services"
                  iconColor="text-purple-600"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {payment.Payment_For.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-lg bg-slate-50 p-3"
                    >
                      <FileTextIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card>
              <CardTitle
                icon={Info}
                text="Additional Information"
                iconColor="text-slate-600"
              />
              <div className="space-y-4">
                {payment.payment_document && (
                  <div className="flex items-start">
                    <FileTextIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 sm:text-sm">
                        Payment Document
                      </p>
                      <a
                        href={payment.payment_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View document <ChevronRight className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                {payment.payment_remarks && (
                  <div className="flex items-start">
                    <AlertCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 sm:text-sm">
                        Remarks
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                        {payment.payment_remarks}
                      </p>
                    </div>
                  </div>
                )}
                <InfoListItem
                  icon={CalendarIcon}
                  label="Created Date"
                  value={formatDate(payment.createdAt)}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
