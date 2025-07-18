import React from "react";
import {
  BookOpen,
  School,
  Building2,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Coins,
  AlertCircle,
  Clock,
  ClipboardList,
  Award,
  Percent,
  Layers,
  X,
  Tag,
  ListChecks,
  FileBadge,
  CalendarDays,
  Sparkles,
  MinusCircle,
  Edit,
} from "lucide-react";
import { useCountries } from "../../hooks/useFirestore";

const CourseDetail = ({ course, universities, isOpen, onClose, onEdit }) => {
  const { data: countries, loading: countriesLoading } = useCountries();
  const getUniversityName = (universityId) =>
    universities?.find((uni) => uni.id === universityId)?.univ_name || "N/A";

  const getCountryName = (countryCode) =>
    countries.find((c) => c.currency === countryCode)?.name || countryCode;

  const getCountryCodeForUniversity = (universityId) =>
    universities?.find((uni) => uni.id === universityId)?.country;

  const getCourseDeadlineInfo = (deadline) => {
    if (!deadline)
      return {
        formatted: "No deadline specified",
        remainingDays: null,
        isPast: false,
        daysText: "",
      };

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const formatted = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const remainingDays = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    let daysText = "";
    if (remainingDays > 0) {
      daysText = `${remainingDays} day${
        remainingDays > 1 ? "s" : ""
      } remaining`;
    } else if (remainingDays === 0) {
      daysText = "Today is the deadline";
    } else {
      daysText = `Passed ${Math.abs(remainingDays)} day${
        Math.abs(remainingDays) > 1 ? "s" : ""
      } ago`;
    }

    return {
      formatted,
      remainingDays,
      isPast: remainingDays < 0,
      daysText,
    };
  };

  const deadlineInfo = course
    ? getCourseDeadlineInfo(course.Application_deadline)
    : null;

  const renderExamRequirements = () => {
    if (!course) return <p className="text-sm text-slate-500">N/A</p>;
    const exams = [
      { name: "IELTS", value: course.ielts_Exam },
      { name: "TOEFL", value: course.Toefl_Exam },
      { name: "PTE", value: course.PTE_Exam },
      { name: "Duolingo", value: course.Duolingo_Exam },
      { name: "GRE", value: course.Gre_Exam },
      { name: "GMAT", value: course.Gmat_Exam },
      { name: "Other", value: course.other_exam },
    ].filter(
      (exam) =>
        exam.value &&
        exam.value.toString().trim() !== "" &&
        exam.value.toString().toLowerCase() !== "n/a"
    );

    if (exams.length === 0)
      return (
        <p className="text-sm text-slate-500">
          No specific exam scores required or mentioned.
        </p>
      );

    return (
      <div className="flex flex-wrap gap-2">
        {exams.map((exam, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700"
          >
            <ListChecks className="mr-1.5 h-3.5 w-3.5" />
            {exam.name}: {exam.value}
          </span>
        ))}
      </div>
    );
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

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    unit = "",
    condition = true,
  }) => {
    if (!condition || !value) return null;
    return (
      <div className="flex items-center text-sm text-slate-600">
        <Icon className="mr-2 h-4 w-4 text-slate-500 flex-shrink-0" />
        <span>
          {label}: {value}
          {unit}
        </span>
      </div>
    );
  };

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
            <BookOpen className="mr-2 h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              Course Details
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="rounded-md p-1 text-yellow-600 transition-colors hover:bg-yellow-100 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              aria-label="Edit course"
            >
              <Edit className="h-6 w-6" />
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Close drawer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 pt-5 sm:p-6 bg-slate-50">
          {course ? (
            <div className="space-y-6">
              <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
                <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  {course.course_name}
                </h1>
                <p className="mb-3 text-indigo-200 text-sm sm:text-base flex items-center">
                  <School className="mr-1.5 h-4 w-4 flex-shrink-0" />{" "}
                  {course.course_levels || "N/A"}
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 md:text-base">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span>{getUniversityName(course.university)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span>
                      {getCountryName(
                        getCountryCodeForUniversity(course.university) ||
                          course.country
                      )}
                    </span>
                  </div>
                  {course.website_url && (
                    <div className="flex items-center sm:col-span-2">
                      <LinkIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                      <a
                        href={
                          course.website_url.startsWith("http")
                            ? course.website_url
                            : `https://${course.website_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        View Course Website
                      </a>
                    </div>
                  )}
                </div>
              </section>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className={`flex items-center justify-center rounded-lg p-3 text-sm font-semibold shadow-sm ${
                    course.Active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {course.Active ? (
                    <Sparkles className="mr-1.5 h-4 w-4" />
                  ) : (
                    <MinusCircle className="mr-1.5 h-4 w-4" />
                  )}
                  Status: {course.Active ? "Active" : "Inactive"}
                </div>
                <div className="flex items-center justify-center rounded-lg bg-purple-100 p-3 text-sm font-semibold text-purple-700 shadow-sm">
                  <Layers className="mr-1.5 h-4 w-4" />
                  Backlogs: {course.Backlogs_allowed || "N/A"}
                </div>
              </section>
              <Card>
                <CardTitle icon={ClipboardList} text="Admission Requirements" />
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-slate-700">
                      Exam Scores
                    </h3>
                    {renderExamRequirements()}
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-slate-700">
                      Academic Requirements
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          icon: Percent,
                          label: "10th",
                          value: course.tenth_std_percentage_requirement,
                          unit: "%",
                        },
                        {
                          icon: Percent,
                          label: "12th",
                          value: course.twelfth_std_percentage_requirement,
                          unit: "%",
                        },
                        {
                          icon: Award,
                          label: "Bachelor GPA",
                          value: course.bachelor_requirement,
                          unit: "/10",
                          condition: !!course.bachelor_requirement,
                        },
                        {
                          icon: Award,
                          label: "Master GPA",
                          value: course.masters_requirement,
                          unit: "/10",
                          condition: !!course.masters_requirement,
                        },
                      ].map((item, index) => (
                        <InfoItem
                          key={index}
                          icon={item.icon}
                          label={item.label}
                          value={item.value}
                          unit={item.unit}
                          condition={item.condition}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-slate-700">
                      Documents Required
                    </h3>
                    {Array.isArray(course.documents_required) &&
                    course.documents_required.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {course.documents_required.map((doc, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            <FileBadge className="mr-1.5 h-3.5 w-3.5" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No specific documents listed.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
              <Card>
                <CardTitle
                  icon={Calendar}
                  text="Intake & Deadline"
                  iconColor="text-rose-600"
                />
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-slate-700">
                      Available Intakes
                    </h3>
                    {Array.isArray(course.intake) &&
                    course.intake.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {course.intake.map((intake, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
                          >
                            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                            {intake}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No intakes specified.
                      </p>
                    )}
                  </div>
                  {deadlineInfo && (
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-slate-700">
                        Application Deadline
                      </h3>
                      <div className="flex flex-col items-start gap-y-1 sm:flex-row sm:items-center sm:gap-x-3">
                        <span
                          className={`text-base font-semibold ${
                            deadlineInfo.isPast
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {deadlineInfo.formatted}
                        </span>
                        {deadlineInfo.formatted !== "No deadline specified" && (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              deadlineInfo.isPast
                                ? "bg-red-100 text-red-700"
                                : deadlineInfo.remainingDays === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : deadlineInfo.remainingDays < 30
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {deadlineInfo.daysText}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              <Card>
                <CardTitle
                  icon={Coins}
                  text="Financial Information"
                  iconColor="text-amber-600"
                />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500">
                      Application Fee
                    </h3>
                    <p className="text-lg font-semibold text-slate-700">
                      {course.Application_fee
                        ? `${course.Application_fee_currency || "USD"} ${
                            course.Application_fee
                          }`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500">
                      Est. Yearly Tuition Fee
                    </h3>
                    <p className="text-lg font-semibold text-slate-700">
                      {course.Yearly_Tuition_fee
                        ? `${course.Application_fee_currency || "USD"} ${
                            course.Yearly_Tuition_fee
                          }`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
              {course.specialisation_tag &&
                course.specialisation_tag.trim() !== "" && (
                  <Card>
                    <CardTitle
                      icon={Tag}
                      text="Specializations"
                      iconColor="text-purple-600"
                    />
                    <div className="flex flex-wrap gap-2">
                      {course.specialisation_tag.split(",").map(
                        (tag, index) =>
                          tag.trim() && (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700"
                            >
                              {tag.trim()}
                            </span>
                          )
                      )}
                    </div>
                  </Card>
                )}
              {course.Remark && course.Remark.trim() !== "" && (
                <section className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-5 shadow-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-semibold text-yellow-800">
                        Additional Notes
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                        {course.Remark}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-500">No course data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
