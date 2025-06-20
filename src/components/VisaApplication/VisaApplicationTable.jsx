import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Loader2,
  User,
} from "lucide-react";
import moment from "moment";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { VISA_DOCUMENT_REQUIREMENTS } from "../../utils/constants";

const VisaApplicationTable = ({
  visaApplications,
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

  const getRequiredDocuments = (country) => {
    return (
      VISA_DOCUMENT_REQUIREMENTS[country] || VISA_DOCUMENT_REQUIREMENTS.other
    );
  };

  const getDocumentCount = (application) => {
    if (!application || !application.documents) return 0;
    const requiredDocs = getRequiredDocuments(application.country);
    return requiredDocs.filter((docKey) => application.documents[docKey])
      .length;
  };

  const getCompletionPercentage = (application) => {
    if (!application) return 0;
    const requiredDocs = getRequiredDocuments(application.country);
    const totalFields = requiredDocs.length;
    if (totalFields === 0) return 0;
    const completedFields = getDocumentCount(application);
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleDownloadAllDocuments = async (application) => {
    setDownloadingAppId(application.id);
    try {
      const pdfDoc = await PDFDocument.create();
      let mergedAny = false;

      const documentsToMerge = getRequiredDocuments(application.country);

      for (const key of documentsToMerge) {
        const fileUrl = application.documents?.[key];
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
        `Visa_Application_${application.id.slice(-8)}.pdf`
      );
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not merge PDFs. Please check if documents are valid PDFs.");
    } finally {
      setDownloadingAppId(null);
    }
  };

  const filteredApplications = visaApplications
    .filter((app) => {
      const matchesSearch =
        app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id?.includes(searchTerm);
      const matchesStatus = !statusFilter || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        bValue = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
      }

      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
            placeholder="Search by student name, ID..."
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
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Additional Documents Required">
              Additional Documents Required
            </option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredApplications.length} of {visaApplications.length} visa
        applications
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
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
                <td colSpan="6" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading visa applications...</p>
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <FileText className="mx-auto mb-2 text-gray-300" size={48} />
                  <p className="font-semibold">No visa applications found</p>
                  {searchTerm || statusFilter ? (
                    <p className="text-sm">
                      Try adjusting your search or filter.
                    </p>
                  ) : (
                    <p className="text-sm">
                      There are no visa applications to display yet.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => {
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
                            {application.studentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900">
                          {getDocumentCount(application)}/
                          {getRequiredDocuments(application.country).length}
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
                        {application.createdAt?.toDate
                          ? moment(application.createdAt.toDate()).format(
                              "MMM DD, YYYY"
                            )
                          : moment(application.createdAt).format(
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
                          title="Edit Visa Application"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(application.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete Visa Application"
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

export default VisaApplicationTable;
