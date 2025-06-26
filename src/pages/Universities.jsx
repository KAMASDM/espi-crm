import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import {
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import Modal from "../components/Common/Modal";
import { useAuth } from "../context/AuthContext";
import { downloadAsCSV } from "../utils/helpers";
import { useUniversities } from "../hooks/useFirestore";
import { COUNTRIES, COURSE_LEVELS } from "../utils/constants";
import UniversityForm from "../components/University/UniversityForm";
import UniversitiesTable from "../components/University/UniversitiesTable";
import UniversityDetail from "../components/University/UniversityDetail";

const Universities = () => {
  const {
    data: universities,
    loading,
    error,
    create,
    delete: deleteUniversity,
  } = useUniversities();
  const { user, userProfile } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [universityToDeleteId, setUniversityToDeleteId] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    if (error) {
      console.error("Error fetching universities:", error);
      toast.error("Failed to load universities.");
    }
  }, [error]);

  const handleEdit = (university) => {
    setSelectedUniversity(university);
    setShowEditModal(true);
  };

  const handleView = (university) => {
    setSelectedUniversity(university);
    setShowViewModal(true);
  };

  const handleDelete = (universityId) => {
    setUniversityToDeleteId(universityId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (universityToDeleteId) {
      try {
        await deleteUniversity(universityToDeleteId);
        toast.success("University deleted successfully!");
      } catch (err) {
        console.error("Error deleting university:", err);
        toast.error("Failed to delete university. Please try again.");
      } finally {
        setShowDeleteModal(false);
        setUniversityToDeleteId(null);
      }
    }
  };

  const handleFormSuccess = (action = "added") => {
    toast.success(`University ${action} successfully!`);
  };

  const handleExport = () => {
    if (universities && universities.length > 0) {
      const dataToExport = universities.map((uni) => ({
        ID: uni.id,
        UniversityName: uni.univ_name,
        CountryCode: uni.country,
        CountryName:
          COUNTRIES.find((c) => c.code === uni.country)?.name || uni.country,
        Email: uni.univ_email,
        Phone: uni.univ_phone,
        Website: uni.univ_website,
        ApplicationFee: uni.Application_fee,
        IsActive: uni.Active,
        ApplicationDeadline: uni.deadline
          ? new Date(uni.deadline).toLocaleDateString()
          : "",
        CourseLevels: Array.isArray(uni.levels)
          ? uni.levels.join(" | ")
          : uni.levels,
        BacklogsAllowed: uni.Backlogs_allowed,
        MOIAccepted: uni.moi_accepted,
        Description: uni.univ_desc,
        AdmissionRequirements: uni.Admission_Requirements,
        ApplicationFormLink: uni.Application_form_link,
        Notes: uni.Remark,
        CreatedAt: uni.createdAt?.toDate
          ? uni.createdAt.toDate().toISOString()
          : "N/A",
      }));
      downloadAsCSV(dataToExport, "universities_export.csv");
      toast.success("Universities data exported successfully!");
    } else {
      toast.info("No data available to export.");
    }
  };

  const handleFileImportChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImporting(true);
      setImportResults(null);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const csvHeaders = results.meta.fields;
          const essentialCsvHeaders = ["UniversityName", "CountryCode"];
          const missingEssentialHeaders = essentialCsvHeaders.filter(
            (h) => !csvHeaders.includes(h)
          );

          if (missingEssentialHeaders.length > 0) {
            const message = `CSV is missing essential headers: ${missingEssentialHeaders.join(
              ", "
            )}. Required: ${essentialCsvHeaders.join(", ")}`;
            toast.error(message, { duration: 5000 });
            console.error(message);
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          await processUniversityImportData(results.data);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        error: (err) => {
          toast.error(`Error parsing CSV: ${err.message}`);
          console.error("Error parsing CSV:", err);
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      });
    }
  };

  const processUniversityImportData = async (data) => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    if (!user || !user.uid) {
      toast.error("User not authenticated. Cannot import data.");
      setIsImporting(false);
      return;
    }

    const validCountryCodes = COUNTRIES.map((c) => c.code);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const universityData = {
          univ_name: row.UniversityName?.trim() || "",
          country: row.CountryCode?.trim().toUpperCase() || "",
          univ_email: row.Email?.trim().toLowerCase() || null,
          univ_phone: row.Phone?.trim() || null,
          univ_website: row.Website?.trim() || null,
          Application_fee: row.ApplicationFee
            ? parseFloat(row.ApplicationFee)
            : null,
          Active: !(
            row.IsActive?.toLowerCase() === "false" || row.IsActive === "0"
          ),
          deadline: row.ApplicationDeadline
            ? new Date(row.ApplicationDeadline).toISOString().split("T")[0]
            : null,
          levels:
            row.CourseLevels?.split(/[,|]/)
              .map((l) => l.trim())
              .filter((l) => COURSE_LEVELS.includes(l)) || [],
          Backlogs_allowed: row.BacklogsAllowed
            ? parseInt(row.BacklogsAllowed, 10)
            : null,
          moi_accepted:
            row.MOIAccepted?.toLowerCase() === "true" ||
            row.MOIAccepted === "1",
          univ_desc: row.Description?.trim() || null,
          Remark: row.Notes?.trim() || null,
          Admission_Requirements: row.AdmissionRequirements?.trim() || null,
          Application_form_link: row.ApplicationFormLink?.trim() || null,
        };

        let missingOrInvalidField = false;
        if (!universityData.univ_name) {
          errors.push(`Row ${i + 2}: Missing required field 'UniversityName'.`);
          missingOrInvalidField = true;
        }
        if (
          !universityData.country ||
          !validCountryCodes.includes(universityData.country)
        ) {
          errors.push(
            `Row ${i + 2}: Missing or invalid 'CountryCode' for ${
              universityData.univ_name || "N/A"
            }. Must be a valid 2-letter code.`
          );
          missingOrInvalidField = true;
        }

        if (
          universityData.Application_fee &&
          isNaN(universityData.Application_fee)
        ) {
          errors.push(
            `Row ${i + 2}: Invalid 'ApplicationFee' for ${
              universityData.univ_name
            }. Must be a number.`
          );
          missingOrInvalidField = true;
        }
        if (
          universityData.Backlogs_allowed &&
          isNaN(universityData.Backlogs_allowed)
        ) {
          errors.push(
            `Row ${i + 2}: Invalid 'BacklogsAllowed' for ${
              universityData.univ_name
            }. Must be a number.`
          );
          missingOrInvalidField = true;
        }
        if (
          row.ApplicationDeadline &&
          isNaN(new Date(row.ApplicationDeadline))
        ) {
          errors.push(
            `Row ${i + 2}: Invalid 'ApplicationDeadline' for ${
              universityData.univ_name
            }. Use YYYY-MM-DD format.`
          );
          universityData.deadline = null;
        }

        if (missingOrInvalidField) {
          errorCount++;
          continue;
        }

        await create(universityData);
        successCount++;
      } catch (error) {
        console.error(`Error importing university row ${i + 2}:`, error, row);
        errors.push(
          `Row ${i + 2} (${row.UniversityName || "N/A"}): ${
            error.message || "Failed to import."
          }`
        );
        errorCount++;
      }
    }

    setImportResults({ successCount, errorCount, errors });
    if (errorCount > 0) {
      toast.error(
        `${errorCount} universit(y/ies) failed to import. ${successCount} imported.`,
        { duration: 5000 }
      );
    } else if (successCount > 0) {
      toast.success(`${successCount} universit(y/ies) imported successfully!`);
    } else {
      toast.info("No new universities were imported.");
    }
    setIsImporting(false);
  };

  const handleVisibility = userProfile.role === "Superadmin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-600">
            Manage university partnerships and information
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {handleVisibility && (
            <>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImportChange}
                ref={fileInputRef}
                style={{ display: "none" }}
                id="csvUniversityInput"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center"
                title="Import Universities from CSV"
                disabled={isImporting}
              >
                <Upload size={20} className="mr-2" />{" "}
                {isImporting ? "Importing..." : "Import"}
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center"
                title="Export Universities to CSV"
                disabled={isImporting || loading || !universities}
              >
                <Download size={20} className="mr-2" /> Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
                disabled={loading}
              >
                <Plus size={20} className="mr-2" /> Add University
              </button>
            </>
          )}
        </div>
      </div>

      {importResults && (
        <div
          className={`p-4 rounded-md ${
            importResults.errorCount > 0
              ? "bg-red-50 border-red-300"
              : "bg-green-50 border-green-300"
          } border`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {importResults.errorCount > 0 ? (
                <AlertTriangle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="ml-3">
              <h3
                className={`text-sm font-medium ${
                  importResults.errorCount > 0
                    ? "text-red-800"
                    : "text-green-800"
                }`}
              >
                Import Complete
              </h3>
              <div
                className={`text-sm ${
                  importResults.errorCount > 0
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                <p>{importResults.successCount} universit(y/ies) imported.</p>
                {importResults.errorCount > 0 && (
                  <p>{importResults.errorCount} record(s) failed.</p>
                )}
              </div>
              {importResults.errorCount > 0 &&
                importResults.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-700 max-h-20 overflow-y-auto">
                    <strong>Errors:</strong>
                    <ul className="list-disc pl-5">
                      {importResults.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {importResults.errors.length > 5 && (
                        <li>And {importResults.errors.length - 5} more...</li>
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Universities",
            value: universities?.length,
            color: "blue",
            subtext: "All partnerships",
          },
          {
            title: "Active",
            value: universities?.filter((uni) => uni.Active).length,
            color: "green",
            subtext: "Currently accepting",
          },
          {
            title: "Countries",
            value: [...new Set(universities?.map((uni) => uni.country))].length,
            color: "purple",
            subtext: "Geographic spread",
          },
          {
            title: "Avg. App Fee",
            value:
              universities?.length > 0
                ? universities.reduce(
                    (sum, uni) => sum + parseFloat(uni.Application_fee || 0),
                    0
                  ) /
                    universities.filter((uni) => uni.Application_fee).length ||
                  0
                : 0,
            color: "yellow",
            subtext: "Average per uni",
            prefix: "₹",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-2.5 bg-${card.color}-100 rounded-lg`}>
                <div className={`text-${card.color}-600 text-2xl font-bold`}>
                  {loading
                    ? "..."
                    : `${card.prefix || ""}${
                        card.value % 1 !== 0
                          ? card.value.toFixed(2)
                          : card.value
                      }`}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500">{card.subtext}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <UniversitiesTable
          universities={universities}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          handleVisibility={handleVisibility}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New University"
        size="large"
      >
        <UniversityForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            handleFormSuccess("added");
            setShowAddModal(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit University"
        size="large"
      >
        <UniversityForm
          editData={selectedUniversity}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess("updated");
            setShowEditModal(false);
            setSelectedUniversity(null);
          }}
        />
      </Modal>
      <UniversityDetail
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        university={selectedUniversity}
        onEdit={() => {
          setShowViewModal(false);
          handleEdit(selectedUniversity);
        }}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUniversityToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete University?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this university? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setUniversityToDeleteId(null);
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              disabled
              type="button"
              onClick={confirmDelete}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Universities;
