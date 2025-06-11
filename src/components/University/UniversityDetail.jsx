import React from "react";
import { COUNTRIES, CURRENCIES } from "../../utils/constants";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertTriangle,
  X,
  Building,
  FileText,
  Archive,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const countryToCurrency = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  SG: "SGD",
  IN: "INR",
};

const UniversityDetail = ({ university, isOpen, onClose }) => {
  const getCurrencySymbolForCountry = (countryCode) => {
    const targetCurrencyCode = countryToCurrency[countryCode];
    if (targetCurrencyCode) {
      const currency = CURRENCIES.find((c) => c.code === targetCurrencyCode);
      if (currency) {
        return currency.symbol;
      }
    }
    return "$";
  };

  const appFeeSymbol = getCurrencySymbolForCountry(university.country);

  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;

  const getDeadlineInfo = (deadline) => {
    if (!deadline)
      return {
        formatted: "No deadline specified",
        remainingDays: null,
        isPast: false,
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
      (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );
    return {
      formatted,
      remainingDays,
      isPast: remainingDays < 0,
    };
  };

  const deadlineInfo = university ? getDeadlineInfo(university.deadline) : null;

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
        className={`relative flex h-full w-full transform flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-2xl md:max-w-3xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <Building className="mr-2 h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              University Details
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
        <div className="flex-1 overflow-y-auto p-4 pt-6 sm:p-6 bg-slate-50">
          {university ? (
            <div className="space-y-6">
              <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
                <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                  {university.univ_name}
                </h1>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 md:text-base">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span>{getCountryName(university.country)}</span>
                  </div>
                  {university.univ_phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span>{university.univ_phone}</span>
                    </div>
                  )}
                  {university.univ_email && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-5 w-5 flex-shrink-0" />
                      <a
                        href={`mailto:${university.univ_email}`}
                        className="hover:underline break-all"
                      >
                        {university.univ_email}
                      </a>
                    </div>
                  )}
                  {university.univ_website && (
                    <div className="flex items-center sm:col-span-2 md:col-span-1">
                      <Globe className="mr-2 h-5 w-5 flex-shrink-0" />
                      <a
                        href={
                          university.univ_website.startsWith("http")
                            ? university.univ_website
                            : `https://${university.univ_website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </section>
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  className={`flex items-center justify-center rounded-lg p-3 text-sm font-medium shadow-sm ${
                    university.Active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {university.Active ? (
                    <ThumbsUp className="mr-1.5 h-4 w-4" />
                  ) : (
                    <ThumbsDown className="mr-1.5 h-4 w-4" />
                  )}
                  {university.Active ? "Active" : "Inactive"}
                </div>
                <div
                  className={`flex items-center justify-center rounded-lg p-3 text-sm font-medium shadow-sm ${
                    university.moi_accepted
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  MOI: {university.moi_accepted ? "Accepted" : "No"}
                </div>
                <div className="flex items-center justify-center rounded-lg bg-purple-100 p-3 text-sm font-medium text-purple-700 shadow-sm">
                  <Archive className="mr-1.5 h-4 w-4" />
                  Backlogs: {university.Backlogs_allowed || 0}
                </div>
                <div className="rounded-lg bg-amber-100 p-3 text-sm font-medium text-amber-700 shadow-sm">
                  Fee: {university.Application_fee} {appFeeSymbol}
                </div>
              </section>
              <section className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-800">
                  <Info className="mr-3 h-6 w-6 text-indigo-600" />
                  About the University
                </h2>
                <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {university.univ_desc || "No description available."}
                </p>
              </section>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-800">
                    <GraduationCap className="mr-3 h-6 w-6 text-indigo-600" />
                    Course Levels Offered
                  </h2>
                  {Array.isArray(university.levels) &&
                  university.levels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {university.levels.map((level, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      No course levels specified.
                    </p>
                  )}
                </section>
                <section className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-800">
                    <Calendar className="mr-3 h-6 w-6 text-red-600" />
                    Application Deadline
                  </h2>
                  {deadlineInfo && (
                    <div className="flex flex-col space-y-2">
                      <span
                        className={`text-lg font-semibold ${
                          deadlineInfo.isPast
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {deadlineInfo.formatted}
                      </span>
                      {deadlineInfo.formatted !== "No deadline specified" && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium self-start ${
                            deadlineInfo.isPast
                              ? "bg-red-100 text-red-700"
                              : deadlineInfo.remainingDays < 30
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {deadlineInfo.isPast
                            ? `Passed ${Math.abs(
                                deadlineInfo.remainingDays
                              )} days ago`
                            : `${deadlineInfo.remainingDays} days remaining`}
                        </span>
                      )}
                    </div>
                  )}
                </section>
              </div>
              <section className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-800">
                  <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
                  Admission Requirements
                </h2>
                <div className="prose prose-sm sm:prose-base max-w-none text-slate-600 whitespace-pre-wrap">
                  {university.Admission_Requirements ||
                    "No specific admission requirements provided."}
                </div>
              </section>
              {university.Remark && (
                <section className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-5 shadow-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-semibold text-yellow-800">
                        Important Note
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                        {university.Remark}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-500">No university data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityDetail;
