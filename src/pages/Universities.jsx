import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import {
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Modal from "../components/Common/Modal";
import { useAuth } from "../context/AuthContext";
import { downloadAsCSV } from "../utils/helpers";
import { useUniversities } from "../hooks/useFirestore";
import { COUNTRIES, COURSE_LEVELS } from "../utils/constants";
import UniversityForm from "../components/University/UniversityForm";
import UniversitiesTable from "../components/University/UniversitiesTable";

const Universities = () => {
  const {
    data: universities,
    loading,
    error,
    remove,
    create,
  } = useUniversities();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    if (error) {
      console.log("error", error);
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

  const handleDelete = async (universityId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this university? This action cannot be undone."
      )
    ) {
      try {
        await remove(universityId);
        toast.success("University deleted successfully!");
      } catch (error) {
        console.error("Error deleting university:", error);
        console.log("Failed to delete university. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {
    toast.success("University added successfully!");
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
      console.log("No data available to export.");
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
            console.log(
              `CSV is missing essential headers: ${missingEssentialHeaders.join(
                ", "
              )}.`
            );
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          await processUniversityImportData(results.data);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        error: (error) => {
          console.log(`Error parsing CSV: ${error.message}`);
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
      console.log("User not authenticated. Cannot import data.");
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
          Active:
            row.IsActive?.toLowerCase() === "true" ||
            row.IsActive === "1" ||
            true,
          deadline: row.ApplicationDeadline
            ? new Date(row.ApplicationDeadline).toISOString().split("T")[0]
            : null,
          levels:
            row.CourseLevels?.split(",")
              .map((l) => l.trim())
              .filter((l) => COURSE_LEVELS.includes(l)) || [], //
          Backlogs_allowed: row.BacklogsAllowed
            ? parseInt(row.BacklogsAllowed, 10)
            : null,
          moi_accepted:
            row.MOIAccepted?.toLowerCase() === "true" ||
            row.MOIAccepted === "1" ||
            false,
          univ_desc: row.Description?.trim() || null,
          Remark: row.Notes?.trim() || null,
          Admission_Requirements: row.AdmissionRequirements?.trim() || null,
          Application_form_link: row.ApplicationFormLink?.trim() || null,

          createdBy: user.uid,
          assigned_users: user.uid,
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
      console.log(
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
            disabled={isImporting}
          >
            <Download size={20} className="mr-2" /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={isImporting}
          >
            <Plus size={20} className="mr-2" /> Add University
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {universities?.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Universities
              </p>
              <p className="text-xs text-gray-500">All partnerships</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {universities?.filter((uni) => uni.Active).length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xs text-gray-500">Currently accepting</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {
                  [...new Set(universities?.map((uni) => uni.country) || [])]
                    .length
                }
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-xs text-gray-500">Geographic spread</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                $
                {(
                  universities?.reduce(
                    (sum, uni) => sum + parseFloat(uni.Application_fee || 0),
                    0
                  ) || 0
                ).toFixed(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total App Fees
              </p>
              <p className="text-xs text-gray-500">Estimated sum</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <UniversitiesTable
          universities={universities || []}
          loading={loading || isImporting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
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
            handleFormSuccess();
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
            handleFormSuccess();
            setShowEditModal(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="University Details"
        size="large"
      >
        {selectedUniversity && (
          <UniversityDetails university={selectedUniversity} />
        )}
      </Modal>
    </div>
  );
};

const UniversityDetails = ({ university }) => {
  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              University Name
            </label>
            <p className="text-sm text-gray-900">{university.univ_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <p className="text-sm text-gray-900">
              {getCountryName(university.country)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <p className="text-sm text-gray-900">{university.univ_phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="text-sm text-gray-900">{university.univ_email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <p className="text-sm text-gray-900">
              {university.univ_website && (
                <a
                  href={university.univ_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {university.univ_website}
                </a>
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Fee
            </label>
            <p className="text-sm text-gray-900">
              {university.Application_fee && `$${university.Application_fee}`}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {university.univ_desc}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Academic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Levels
            </label>
            <p className="text-sm text-gray-900">
              {Array.isArray(university.levels)
                ? university.levels.join(", ")
                : university.levels}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Backlogs Allowed
            </label>
            <p className="text-sm text-gray-900">
              {university?.Backlogs_allowed}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Admission Requirements
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {university?.Admission_Requirements}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Status & Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm text-gray-900">
              {university.Active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              MOI Accepted
            </label>
            <p className="text-sm text-gray-900">
              {university.moi_accepted ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
      {university.Remark && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {university.Remark}
          </p>
        </div>
      )}
    </div>
  );
};

export default Universities;
