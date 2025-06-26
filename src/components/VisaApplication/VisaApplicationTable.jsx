import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import moment from "moment";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { useVisaDocuments } from "../../hooks/useFirestore";

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
  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const { data: visaDocuments } = useVisaDocuments();
  const statusMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target)
      ) {
        setOpenStatusMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRequiredDocuments = (country) => {
    const docRequirements = visaDocuments?.find(
      (doc) => doc.countryCode === country
    );
    return docRequirements?.requirements || [];
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
  const getLastUploadedDocumentName = (application) => {
    const requiredDocs = getRequiredDocuments(application.country);
    if (!requiredDocs.length || !application.documents) {
      return null;
    }

    const uploadedDocKeys = requiredDocs.filter(
      (docKey) => application.documents[docKey]
    );

    if (uploadedDocKeys.length > 0) {
      const lastDocKey = uploadedDocKeys[uploadedDocKeys.length - 1];
      return lastDocKey.replace(/_/g, " ");
    }

    return null;
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

  const statusColors = {
    Submitted: "bg-blue-100 text-blue-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    "Additional Documents Required": "bg-orange-100 text-orange-800",
    default: "bg-gray-100 text-gray-800",
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

      <div className="table-container h-[calc(100vh-4rem)] overflow-y-auto ">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                <td colSpan="7" className="table-cell text-center py-8">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading visa applications...</p>
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
                const requiredDocs = getRequiredDocuments(application.country);
                const lastDocName = getLastUploadedDocumentName(application);

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
                        <div
                          className="ml-4 cursor-pointer"
                          onClick={() => onView(application)}
                        >
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-600 hover:underline">
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
                          {getDocumentCount(application)}/{requiredDocs.length}
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
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8 text-right">
                          {completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative" ref={statusMenuRef}>
                        <button
                          onClick={() =>
                            setOpenStatusMenu(
                              openStatusMenu === application.id
                                ? null
                                : application.id
                            )
                          }
                          className={`inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            statusColors[application.status] ||
                            statusColors.default
                          }`}
                          aria-expanded={openStatusMenu === application.id}
                          aria-haspopup="true"
                        >
                          {lastDocName}
                          <ChevronDown
                            size={16}
                            className={`ml-1 transition-transform duration-200 ${
                              openStatusMenu === application.id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {openStatusMenu === application.id && (
                          <div className="absolute z-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none right-0">
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                            >
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                Document Checklist
                              </div>
                              {requiredDocs && requiredDocs.length > 0 ? (
                                <div className="max-h-64 overflow-y-auto">
                                  {requiredDocs.map((doc) => (
                                    <div
                                      key={doc}
                                      onClick={() => onEdit(application)}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                                    >
                                      <span className="w-6 flex-shrink-0">
                                        {application.documents?.[doc] ? (
                                          <span className="text-green-500 font-medium">
                                            ✓
                                          </span>
                                        ) : (
                                          <span className="text-gray-300">
                                            ○
                                          </span>
                                        )}
                                      </span>
                                      <span className="flex-1 capitalize">
                                        {doc.replace(/_/g, " ")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 italic">
                                  No document requirements found for{" "}
                                  {application.country || "this application"}.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                              "MMM DD,YYYY"
                            )
                          : moment(application.createdAt).format("MMM DD,YYYY")}
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
