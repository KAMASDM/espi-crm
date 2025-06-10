import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  User,
  Loader2,
} from "lucide-react";
import moment from "moment";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { APPLICATION_STATUS } from "../../utils/constants";

const DOCUMENT_KEYS_FOR_COUNT = [
  "sop",
  "cv",
  "passport",
  "ielts",
  "toefl",
  "gre",
  "gmat",
  "pte",
  "work_experience",
  "diploma_marksheet",
  "bachelor_marksheet",
  "master_marksheet",
  "other_documents",
];

const ApplicationsTable = ({
  applications,
  assessments,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [downloadingAppId, setDownloadingAppId] = useState(null);

  const getAssessment = (assessmentId) => {
    if (!assessments || !assessmentId) return null;
    return assessments.find((assessment) => assessment.id === assessmentId);
  };

  const filteredApplications = applications
    .filter((application) => {
      const assessment = getAssessment(application.application);
      const searchableText = `${assessment?.specialisation || ""} ${
        assessment?.university_name || ""
      }`.toLowerCase();
      const matchesSearch =
        searchableText.includes(searchTerm.toLowerCase()) ||
        (application.id && application.id.includes(searchTerm));
      const matchesStatus =
        !statusFilter || application.application_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      if (sortField === "createdAt") {
        aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      }
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      Submitted: { color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
      "Under Review": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      "Additional Documents Required": {
        color: "bg-orange-100 text-orange-800",
        icon: AlertCircle,
      },
      "Interview Scheduled": {
        color: "bg-purple-100 text-purple-800",
        icon: Calendar,
      },
      "Decision Pending": {
        color: "bg-indigo-100 text-indigo-800",
        icon: Clock,
      },
      Accepted: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      Rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      Waitlisted: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Deferred: { color: "bg-gray-100 text-gray-800", icon: Clock },
    };
    const config = statusConfig[status] || statusConfig["Draft"];
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

  const getDocumentCount = (application) => {
    if (!application) return 0;
    return DOCUMENT_KEYS_FOR_COUNT.filter((docKey) => application[docKey])
      .length;
  };

  const getCompletionPercentage = (application) => {
    if (!application) return 0;
    const totalFields = DOCUMENT_KEYS_FOR_COUNT.length;
    if (totalFields === 0) return 0;
    const completedFields = getDocumentCount(application);
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleDownloadAllDocuments = async (application) => {
    setDownloadingAppId(application.id);
    try {
      const pdfDoc = await PDFDocument.create();

      const documentFields = [
        "passport",
        "diploma_marksheet",
        "bachelor_marksheet",
        "master_marksheet",
        "ielts",
        "toefl",
        "gre",
        "gmat",
        "pte",
        "sop",
        "cv",
        "work_experience",
        "other_documents",
      ];

      let mergedAny = false;

      for (const key of documentFields) {
        const fileUrl = application[key];
        if (fileUrl && typeof fileUrl === "string") {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(fileUrl, {
              signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error("Failed to fetch");

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
              console.error(`Error merging ${key}:`, e);
              console.warn(`File ${key} is not a valid PDF`);
            }
          } catch (error) {
            console.error(`Error processing ${key}:`, error);
          }
        }
      }

      if (!mergedAny) {
        throw new Error("No valid PDFs found to merge");
      }

      const pdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        `Application_${application.id.slice(-8)}.pdf`
      );
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not merge PDFs. Please check if documents are valid PDFs.");
    } finally {
      setDownloadingAppId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 ">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by assessment, ID..."
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
            {APPLICATION_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Showing {filteredApplications.length} of {applications.length}{" "}
        applications.
      </div>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th
                onClick={() => handleSort("application_status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Status
                  {sortField === "application_status" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th
                onClick={() => handleSort("createdAt")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  Created
                  {sortField === "createdAt" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading applications...</p>
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  <FileText className="mx-auto mb-2 text-gray-300" size={48} />
                  <p className="font-semibold">No applications found</p>
                  {searchTerm || statusFilter ? (
                    <p className="text-sm">
                      Try adjusting your search or filter.
                    </p>
                  ) : (
                    <p className="text-sm">
                      There are no applications to display yet.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => {
                const assessment = getAssessment(application.application);
                const completionPercentage =
                  getCompletionPercentage(application);
                return (
                  <tr
                    key={application.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.studentDisplayName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assessment?.specialisation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900">
                          {getDocumentCount(application)}/
                          {DOCUMENT_KEYS_FOR_COUNT.length}
                        </span>
                        {getDocumentCount(application) > 0 && (
                          <button
                            onClick={() =>
                              handleDownloadAllDocuments(application)
                            }
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                            title="Download All Documents (PDF)"
                            disabled={downloadingAppId === application.id}
                          >
                            {downloadingAppId === application.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.application_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${
                              completionPercentage === 100
                                ? "bg-green-500"
                                : completionPercentage >= 75
                                ? "bg-blue-500"
                                : completionPercentage >= 50
                                ? "bg-yellow-500"
                                : completionPercentage > 0
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8 text-right">
                          {completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar
                          size={14}
                          className="mr-1.5 text-gray-400 flex-shrink-0"
                        />
                        {application.createdAt?.toDate &&
                          moment(application.createdAt.toDate()).format(
                            "MMM DD, YYYY"
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(application)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(application)}
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100 transition-colors"
                          title="Edit Application"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(application.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete Application"
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

export default ApplicationsTable;
