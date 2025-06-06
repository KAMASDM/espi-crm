import React, { useState } from "react";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import {
  FileText as FileTextIcon,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Calendar as CalendarIcon,
  CircleDollarSign,
  FileCheck,
  FileX,
  Info,
  Tag,
  X,
  FileArchive,
  Link as LinkIcon,
  Paperclip,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import Loading from "../Common/Loading";

const documentsConfig = [
  { key: "sop", label: "Statement of Purpose", icon: FileTextIcon },
  { key: "cv", label: "CV/Resume", icon: ClipboardList },
  { key: "passport", label: "Passport Copy", icon: FileTextIcon },
  { key: "ielts", label: "IELTS Scorecard", icon: Paperclip },
  { key: "toefl", label: "TOEFL Scorecard", icon: Paperclip },
  { key: "gre", label: "GRE Scorecard", icon: Paperclip },
  { key: "gmat", label: "GMAT Scorecard", icon: Paperclip },
  { key: "pte", label: "PTE Scorecard", icon: Paperclip },
  {
    key: "work_experience",
    label: "Work Experience Letter(s)",
    icon: ClipboardList,
  },
  {
    key: "diploma_marksheet",
    label: "Diploma Marksheet(s)",
    icon: FileTextIcon,
  },
  {
    key: "bachelor_marksheet",
    label: "Bachelor's Marksheet(s)",
    icon: FileTextIcon,
  },
  {
    key: "master_marksheet",
    label: "Master's Marksheet(s)",
    icon: FileTextIcon,
  },
  {
    key: "other_documents",
    label: "Other Supporting Documents",
    icon: Paperclip,
  },
];

const ApplicationDetail = ({ application, assessments, isOpen, onClose }) => {
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isMergingPdf, setIsMergingPdf] = useState(false);

  const getAssessment = (assessmentId) => {
    if (!assessmentId || !assessments) return null;
    return assessments.find((ass) => ass.id === assessmentId);
  };

  const assessment = React.useMemo(
    () => (application ? getAssessment(application.application) : null),
    [application, assessments]
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
      case "Accepted":
        return "bg-green-100 text-green-700 border-green-300";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "Under Review":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { className: "mr-1.5 h-4 w-4 flex-shrink-0" };
    switch (status) {
      case "Accepted":
        return <CheckCircle2 {...iconProps} />;
      case "Rejected":
        return <XCircle {...iconProps} />;
      case "Under Review":
        return <Clock {...iconProps} />;
      default:
        return <Info {...iconProps} />;
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

  const handleDownloadDocument = async (docKey, docName) => {
    if (!application[docKey]) return;

    setDownloadingDoc(docKey);
    try {
      const response = await fetch(application[docKey]);
      const blob = await response.blob();
      saveAs(blob, `${docName}.pdf`);
    } catch (error) {
      console.error(`Error downloading ${docKey}:`, error);
      alert(`Failed to download ${docName}. Please try again.`);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadAllDocuments = async () => {
    setIsDownloadingAll(true);
    try {
      for (const doc of documentsConfig) {
        if (application[doc.key]) {
          try {
            const response = await fetch(application[doc.key]);
            const blob = await response.blob();
            saveAs(blob, `${doc.label}.pdf`);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between downloads
          } catch (error) {
            console.error(`Failed to download ${doc.label}`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error initiating downloads:", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleMergeToPdf = async () => {
    setIsMergingPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let mergedAny = false;

      for (const doc of documentsConfig) {
        const fileUrl = application[doc.key];
        if (fileUrl) {
          try {
            const response = await fetch(fileUrl);
            const fileBytes = await response.arrayBuffer();

            try {
              const externalPdfDoc = await PDFDocument.load(fileBytes);
              const pages = await pdfDoc.copyPages(
                externalPdfDoc,
                externalPdfDoc.getPageIndices()
              );
              pages.forEach((page) => pdfDoc.addPage(page));
              mergedAny = true;
            } catch (e) {
              console.warn(`Skipping non-PDF document: ${doc.label}`);
            }
          } catch (error) {
            console.error(`Error processing ${doc.label}:`, error);
          }
        }
      }

      if (!mergedAny) {
        throw new Error("No valid PDF documents found to merge");
      }

      const mergedPdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([mergedPdfBytes], { type: "application/pdf" }),
        `Application_${application.id.slice(-8)}_Documents.pdf`
      );
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Please check if documents are valid PDFs.");
    } finally {
      setIsMergingPdf(false);
    }
  };

  if (!application) {
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
              Application Overview
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
                  APP ID:{" "}
                  {application.id
                    ? application.id.slice(-8).toUpperCase()
                    : "N/A"}
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm sm:text-sm ${getStatusClasses(
                    application.application_status
                  )}`}
                >
                  {getStatusIcon(application.application_status)}
                  {application.application_status || "N/A"}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {application.studentDisplayName || "N/A"}
              </h1>
              <p className="mt-1 flex items-center text-sm text-indigo-200">
                <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                Application Date: {formatDate(application.createdAt)}
              </p>
            </section>
            <Card>
              <CardTitle
                icon={Info}
                text="Basic Application Info"
                iconColor="text-sky-600"
              />
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                <InfoListItem
                  icon={ClipboardList}
                  label="Linked Assessment ID"
                  value={
                    assessment
                      ? `ASS-${assessment.id.slice(-8).toUpperCase()}`
                      : "Not Linked"
                  }
                />
                <InfoListItem
                  icon={CalendarIcon}
                  label="Application Submission Date"
                  value={formatDate(application.createdAt)}
                />
              </div>
            </Card>
            {assessment && (
              <Card>
                <CardTitle icon={BookOpen} text="Key Assessment Details" />
                <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                  {[
                    {
                      icon: Tag,
                      label: "Specialization",
                      value: assessment.specialisation,
                    },
                    {
                      icon: Clock,
                      label: "Duration",
                      value: `${assessment.duration} ${
                        assessment.duration_unit || "years"
                      }`,
                    },
                    {
                      icon: FileTextIcon,
                      label: "Application Fee",
                      value: `${assessment.fee_currency || ""} ${
                        assessment.application_fee
                      }`,
                    },
                    {
                      icon: CircleDollarSign,
                      label: "Tuition Fee (Est.)",
                      value: `${assessment.fee_currency || ""} ${
                        assessment.tution_fee
                      }`,
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
            )}
            <Card>
              <CardTitle
                icon={Paperclip}
                text="Document Checklist"
                iconColor="text-purple-600"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documentsConfig.map((doc) => {
                  const isUploaded = !!application[doc.key];
                  const Icon = doc.icon;
                  return (
                    <div
                      key={doc.key}
                      className={`flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-all ${
                        isUploaded
                          ? "border-green-300 bg-green-50 hover:shadow-md"
                          : "border-red-300 bg-red-50 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon
                              className={`mr-2 h-5 w-5 flex-shrink-0 ${
                                isUploaded ? "text-green-600" : "text-red-600"
                              }`}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {doc.label}
                            </span>
                          </div>
                          {isUploaded ? (
                            <FileCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <FileX className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            isUploaded ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          Status: {isUploaded ? "Uploaded" : "Missing"}
                        </p>
                      </div>
                      {isUploaded && application[doc.key] && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              window.open(application[doc.key], "_blank")
                            }
                            className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadDocument(doc.key, doc.label)
                            }
                            disabled={downloadingDoc === doc.key}
                            className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            {downloadingDoc === doc.key ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={handleDownloadAllDocuments}
                  disabled={isDownloadingAll}
                  className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isDownloadingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download All Individually
                    </>
                  )}
                </button>
                <button
                  onClick={handleMergeToPdf}
                  disabled={isMergingPdf}
                  className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isMergingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <FileArchive className="mr-2 h-4 w-4" />
                      Merge to Single PDF
                    </>
                  )}
                </button>
              </div>
            </Card>
            {application.notes && application.notes.trim() !== "" && (
              <Card>
                <CardTitle
                  icon={AlertCircle}
                  text="Application Notes"
                  iconColor="text-amber-600"
                />
                <div className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
                  <div className="flex items-start">
                    <Info className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <p className="whitespace-pre-wrap text-sm text-amber-800">
                      {application.notes}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
