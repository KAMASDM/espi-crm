import React from "react";
import { useCountries } from "../../hooks/useFirestore";
import {
  User,
  Mail,
  MapPin,
  School,
  BookOpen,
  Clock,
  Tag,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Coins,
  BadgeCheck,
  AlertCircle,
  ChevronRight,
  X,
  ClipboardCheck,
  Info,
  Briefcase,
  GraduationCap,
} from "lucide-react";

const AssessmentDetail = ({
  assessment,
  enquiries,
  universities,
  courses,
  isOpen,
  onClose,
}) => {
  const { data: countries } = useCountries();
  const getStudentName = (enquiryId) => {
    const enquiry = enquiries?.find((enq) => enq.id === enquiryId);
    return enquiry
      ? `${enquiry.student_First_Name || ""} ${
          enquiry.student_Last_Name || ""
        }`.trim() || "N/A"
      : "N/A";
  };

  const getStudentEmail = (enquiryId) => {
    const enquiry = enquiries?.find((enq) => enq.id === enquiryId);
    return enquiry?.student_email || "N/A";
  };

  const getUniversityName = (universityId) => {
    const university = universities?.find((uni) => uni.id === universityId);
    return university?.univ_name || "N/A";
  };

  const getCourseName = (courseId) => {
    const course = courses?.find((c) => c.id === courseId);
    return course?.course_name || "N/A";
  };

  const getCountryName = (countryCode) => {
    if (!countryCode) return "N/A";
    const country = countries.find((c) => c.currency === countryCode);
    return country ? country.name : countryCode;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp.toDate()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
      return "Invalid Date";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "In Progress":
        return "bg-sky-100 text-sky-700 border-sky-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
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
      <Icon className={`mr-3 h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
      {text}
    </h2>
  );

  const InfoListItem = ({
    icon: Icon,
    label,
    value,
    isLink = false,
    href = "#",
  }) => (
    <div className="py-2">
      <div className="flex items-start">
        <Icon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-slate-500" />
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>
          {isLink && value !== "N/A" && value !== "Not provided" ? (
            <a
              href={href.startsWith("http") ? href : `https://${href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block break-words text-sm text-indigo-600 hover:text-indigo-700 hover:underline sm:text-base"
            >
              {value} <ChevronRight className="inline h-4 w-4" />
            </a>
          ) : (
            <p className="mt-0.5 break-words text-sm text-slate-800 sm:text-base">
              {value || "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );

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
            <ClipboardCheck className="mr-2 h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              Assessment Overview
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
          {assessment ? (
            <div className="space-y-6">
              <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
                <div className="flex flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {getStudentName(assessment.enquiry)}
                  </h1>
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm sm:text-sm ${getStatusClasses(
                      assessment.ass_status
                    )}`}
                  >
                    <BadgeCheck className="mr-1.5 h-4 w-4" />
                    {assessment.ass_status || "N/A"}
                  </span>
                </div>
                <p className="mt-2 flex items-center text-sm text-indigo-200">
                  <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  Assessment Created: {formatDate(assessment.createdAt)}
                </p>
              </section>
              <Card>
                <CardTitle icon={User} text="Student Profile" />
                <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                  {[
                    {
                      icon: User,
                      label: "Full Name",
                      value: getStudentName(assessment.enquiry),
                    },
                    {
                      icon: Mail,
                      label: "Email Address",
                      value: getStudentEmail(assessment.enquiry),
                    },
                    {
                      icon: MapPin,
                      label: "Country of Interest",
                      value: getCountryName(assessment.student_country),
                    },
                    {
                      icon: Briefcase,
                      label: "Level Applying For",
                      value: assessment.level_applying_for,
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
              <Card>
                <CardTitle
                  icon={GraduationCap}
                  text="Academic & Course Preferences"
                />
                <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                  {[
                    {
                      icon: School,
                      label: "University",
                      value: getUniversityName(assessment.university),
                    },
                    {
                      icon: BookOpen,
                      label: "Course",
                      value: getCourseName(assessment.course_interested),
                    },
                    {
                      icon: Tag,
                      label: "Specialization",
                      value: assessment.specialisation,
                    },
                    {
                      icon: Clock,
                      label: "Course Duration",
                      value: `${assessment.duration} ${
                        assessment.duration_unit || "years"
                      }`,
                    },
                    {
                      icon: CalendarIcon,
                      label: "Intake Interested",
                      value: assessment.intake_interested,
                    },
                    {
                      icon: LinkIcon,
                      label: "Course Link",
                      value: assessment.course_link || "Not provided",
                      isLink: !!assessment.course_link,
                      href: assessment.course_link,
                    },
                  ].map((item, index) => (
                    <InfoListItem
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      isLink={item.isLink}
                      href={item.href}
                    />
                  ))}
                </div>
              </Card>
              <Card>
                <CardTitle
                  icon={Coins}
                  text="Financial Details"
                  iconColor="text-amber-600"
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="mb-0.5 text-xs font-medium text-slate-500">
                      Application Fee
                    </p>
                    <p className="text-base font-semibold text-slate-800 sm:text-lg">
                      {assessment.application_fee
                        ? `${assessment.fee_currency || ""} ${
                            assessment.application_fee
                          }`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="mb-0.5 text-xs font-medium text-slate-500">
                      Tuition Fee
                    </p>
                    <p className="text-base font-semibold text-slate-800 sm:text-lg">
                      {assessment.tution_fee
                        ? `${assessment.fee_currency || ""} ${
                            assessment.tution_fee
                          }`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="mb-0.5 text-xs font-medium text-slate-500">
                      Fee Currency
                    </p>
                    <p className="text-base font-semibold text-slate-800 sm:text-lg">
                      {assessment.fee_currency || "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
              {assessment.notes && assessment.notes.trim() !== "" && (
                <Card>
                  <CardTitle
                    icon={Info}
                    text="Assessment Notes"
                    iconColor="text-sky-600"
                  />
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-start">
                      <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {assessment.notes}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-500">No assessment data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;
