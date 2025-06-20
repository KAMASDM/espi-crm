/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import {
  FileText as FileTextIcon,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar as CalendarIcon,
  Info,
  Tag,
  X,
  FileArchive,
  Paperclip,
  Download,
  Eye,
  Loader2,
  Globe,
  Building,
} from "lucide-react";
import Loading from "../Common/Loading";
import { VISA_DOCUMENT_REQUIREMENTS } from "../../utils/constants";

const visaDocumentsConfig = {
  Passport_Copy: { label: "Passport Copy", icon: FileTextIcon },
  I_20_Form: { label: "I-20 Form", icon: FileTextIcon },
  SEVIS_Fee_Receipt: { label: "SEVIS Fee Receipt", icon: FileTextIcon },
  DS_160_Confirmation_Page: {
    label: "DS-160 Confirmation Page",
    icon: FileTextIcon,
  },
  Appointment_Confirmation: {
    label: "Appointment Confirmation",
    icon: FileTextIcon,
  },
  Financial_Statements: { label: "Financial Statements", icon: FileTextIcon },
  Academic_Transcripts: { label: "Academic Transcripts", icon: FileTextIcon },
  Standardized_Test_Scores: {
    label: "Standardized Test Scores",
    icon: FileTextIcon,
  },
  Letter_of_Acceptance: { label: "Letter of Acceptance", icon: FileTextIcon },
  Proof_of_Financial_Support: {
    label: "Proof of Financial Support",
    icon: FileTextIcon,
  },
  Passport_sized_Photographs: {
    label: "Passport-sized Photographs",
    icon: FileTextIcon,
  },
  Medical_Examination_Proof: {
    label: "Medical Examination Proof",
    icon: FileTextIcon,
  },
  English_Proficiency_Test_Results: {
    label: "English Proficiency Test Results",
    icon: FileTextIcon,
  },
  Statement_of_Purpose: { label: "Statement of Purpose", icon: FileTextIcon },
  Confirmation_of_Acceptance_for_Studies_CAS: {
    label: "CAS (Confirmation of Acceptance)",
    icon: FileTextIcon,
  },
  Tuberculosis_TB_Test_Results: {
    label: "TB Test Results",
    icon: FileTextIcon,
  },
  Academic_Technology_Approval_Scheme_ATAS_Certificate: {
    label: "ATAS Certificate",
    icon: FileTextIcon,
  },
  Confirmation_of_Enrolment_CoE: {
    label: "Confirmation of Enrolment (CoE)",
    icon: FileTextIcon,
  },
  Genuine_Temporary_Entrant_GTE_Statement: {
    label: "GTE Statement",
    icon: FileTextIcon,
  },
  Proof_of_Financial_Capacity: {
    label: "Proof of Financial Capacity",
    icon: FileTextIcon,
  },
  Health_Insurance_OSHC: {
    label: "Health Insurance (OSHC)",
    icon: FileTextIcon,
  },
  Letter_of_Admission: { label: "Letter of Admission", icon: FileTextIcon },
  Proof_of_Financial_Resources_Blocked_Account: {
    label: "Proof of Financial Resources",
    icon: FileTextIcon,
  },
  Travel_Health_Insurance: {
    label: "Travel Health Insurance",
    icon: FileTextIcon,
  },
  University_Degree_Certificate: {
    label: "University Degree Certificate",
    icon: FileTextIcon,
  },
  Proof_of_Language_Proficiency: {
    label: "Proof of Language Proficiency",
    icon: FileTextIcon,
  },
  Visa_Application_Form: { label: "Visa Application Form", icon: FileTextIcon },
  Financial_Documents: { label: "Financial Documents", icon: FileTextIcon },
};

const VisaApplicationDetails = ({
  visaApplication,
  applications,
  assessments,
  isOpen,
  onClose,
}) => {
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isMergingPdf, setIsMergingPdf] = useState(false);

  const linkedApplication = useMemo(() => {
    if (!visaApplication || !applications) return null;
    return applications.find((app) => app.id === visaApplication.studentId);
  }, [visaApplication, applications]);

  const linkedAssessment = useMemo(() => {
    if (!linkedApplication || !assessments) return null;
    return assessments.find((ass) => ass.id === linkedApplication.application);
  }, [linkedApplication, assessments]);

  const requiredDocs = useMemo(() => {
    if (!visaApplication?.country) return [];
    const countryDocs =
      VISA_DOCUMENT_REQUIREMENTS[visaApplication.country] ||
      VISA_DOCUMENT_REQUIREMENTS.other;
    return countryDocs.map((doc) => doc.replace(/-/g, "_"));
  }, [visaApplication]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return "Invalid Date";
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
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
      case "Approved":
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

  const InfoListItem = ({ icon: Icon, label, value }) => (
    <div className="py-2">
      <div className="flex items-start">
        <Icon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-slate-500" />
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-0.5 break-words text-sm sm:text-base text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const handleDownloadDocument = async (docKey, docName) => {
    const fileUrl = visaApplication.documents?.[docKey];
    if (!fileUrl) return;

    setDownloadingDoc(docKey);
    try {
      const response = await fetch(fileUrl);
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
      for (const docKey of requiredDocs) {
        const fileUrl = visaApplication.documents?.[docKey];
        if (fileUrl) {
          try {
            const docConfig = visaDocumentsConfig[docKey] || {
              label: docKey.replace(/_/g, " "),
              icon: FileTextIcon,
            };
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            saveAs(blob, `${docConfig.label}.pdf`);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to download ${docKey}`, error);
          }
        }
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleMergeToPdf = async () => {
    setIsMergingPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let mergedAny = false;

      for (const docKey of requiredDocs) {
        const fileUrl = visaApplication.documents?.[docKey];
        if (fileUrl) {
          try {
            const response = await fetch(fileUrl);
            const fileBytes = await response.arrayBuffer();
            const externalPdfDoc = await PDFDocument.load(fileBytes);
            const pages = await pdfDoc.copyPages(
              externalPdfDoc,
              externalPdfDoc.getPageIndices()
            );
            pages.forEach((page) => pdfDoc.addPage(page));
            mergedAny = true;
          } catch (e) {
            const docConfig = visaDocumentsConfig[docKey] || {
              label: docKey.replace(/_/g, " "),
              icon: FileTextIcon,
            };
            console.warn(`Skipping non-PDF document: ${docConfig.label}`, e);
          }
        }
      }

      if (!mergedAny) throw new Error("No valid PDF documents found to merge");

      const mergedPdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([mergedPdfBytes], { type: "application/pdf" }),
        `Visa_Application_${visaApplication.studentName.replace(
          /\s/g,
          "_"
        )}_Documents.pdf`
      );
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Please check if documents are valid PDFs.");
    } finally {
      setIsMergingPdf(false);
    }
  };

  if (!visaApplication) {
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
              Visa Application Overview
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
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {visaApplication.studentName || "N/A"}
              </h1>
              <p className="mt-1 flex items-center text-sm text-indigo-200">
                <Globe className="mr-1.5 h-4 w-4 flex-shrink-0" />
                Applying for: {visaApplication.country || "N/A"}
              </p>
            </section>

            {linkedAssessment && (
              <Card>
                <CardTitle
                  icon={BookOpen}
                  text="University & Assessment Info"
                />
                <div className="grid grid-cols-1 gap-x-4 gap-y-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                  <InfoListItem
                    icon={Building}
                    label="University"
                    value={linkedAssessment.university_name}
                  />
                  <InfoListItem
                    icon={Tag}
                    label="Specialization"
                    value={linkedAssessment.specialisation}
                  />
                  <InfoListItem
                    icon={CalendarIcon}
                    label="Application Date"
                    value={formatDate(linkedApplication?.createdAt)}
                  />
                  <InfoListItem
                    icon={Info}
                    label="University App Status"
                    value={linkedApplication?.application_status}
                  />
                </div>
              </Card>
            )}

            <Card>
              <CardTitle
                icon={Paperclip}
                text="Visa Document Checklist"
                iconColor="text-purple-600"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {requiredDocs.map((docKey) => {
                  const docConfig = visaDocumentsConfig[docKey] || {
                    label: docKey.replace(/_/g, " "),
                    icon: FileTextIcon,
                  };
                  const isUploaded = !!visaApplication.documents?.[docKey];
                  const Icon = docConfig.icon;
                  return (
                    <div
                      key={docKey}
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
                              {docConfig.label}
                            </span>
                          </div>
                          {isUploaded ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
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
                      {isUploaded && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              window.open(
                                visaApplication.documents[docKey],
                                "_blank"
                              )
                            }
                            className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadDocument(docKey, docConfig.label)
                            }
                            disabled={downloadingDoc === docKey}
                            className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            {downloadingDoc === docKey ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                            )}{" "}
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

            {visaApplication.notes && (
              <Card>
                <CardTitle
                  icon={Info}
                  text="Visa Application Notes"
                  iconColor="text-amber-600"
                />
                <div className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
                  <div className="flex items-start">
                    <Info className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <p className="whitespace-pre-wrap text-sm text-amber-800">
                      {visaApplication.notes}
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

export default VisaApplicationDetails;
