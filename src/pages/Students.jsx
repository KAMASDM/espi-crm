import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Modal from "../components/common/Modal";
import EnquiryForm from "../components/Students/EnquiryForm";
import StudentsTable from "../components/Students/StudentsTable";
import { useEnquiries } from "../hooks/useFirestore";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { downloadAsCSV } from "../utils/helpers";
import Papa from "papaparse";

const CSV_EXPECTED_HEADERS = [
  "FirstName",
  "LastName",
  "Email",
  "Phone",
  "CurrentEducation",
  "CountriesInterested",
  "EnquirySource",
  "Notes",
  "EnquiryStatus",
  "City",
  "State",
  "PassportNumber",
  "AlternatePhone",
  "Address",
  "IntakeInterested",
  "ServicesInterested",
];
const REQUIRED_FIRESTORE_FIELDS = [
  "student_First_Name",
  "student_Last_Name",
  "student_email",
  "student_phone",
  "current_education",
  "country_interested",
];

const Students = () => {
  const {
    data: students,
    loading,
    error,
    remove,
    update,
    create,
  } = useEnquiries();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student data. Check console for details.");
    }
  }, [error]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleView = (student) => {
    navigate(`/students/${student.id}/details`);
  };

  const handleDelete = async (studentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this student enquiry? This action cannot be undone."
      )
    ) {
      try {
        await remove(studentId);
        toast.success("Student enquiry deleted successfully!");
      } catch (err) {
        console.error("Error deleting student:", err);
        toast.error("Failed to delete student enquiry. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {};

  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      await update(studentId, {
        enquiry_status: newStatus,
        updatedAt: new Date(),
      });
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleUpdateStudentNote = async (studentId, newNote) => {
    try {
      await update(studentId, { notes: newNote, updatedAt: new Date() });
      toast.success("Note updated successfully!");
    } catch (err) {
      console.error("Error updating note:", err);
      toast.error("Failed to update note.");
    }
  };

  const handleUpdateStudentAssignment = async (
    studentId,
    newAssignedUserId
  ) => {
    try {
      await update(studentId, {
        assignedUserId: newAssignedUserId,
        assigned_users: newAssignedUserId,
        updatedAt: new Date(),
      });
      toast.success("Assignment updated successfully!");
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Failed to update assignment.");
    }
  };

  const handleExport = () => {
    if (students && students.length > 0) {
      const dataToExport = students.map((student) => ({
        ID: student.id,
        FirstName: student.student_First_Name,
        LastName: student.student_Last_Name,
        Email: student.student_email,
        Phone: student.student_phone,
        Status: student.enquiry_status,
        City: student.student_city,
        State: student.student_state,
        Branch: student.branchId,
        AssignedTo: student.assignedUserId,
        CountriesInterested: Array.isArray(student.country_interested)
          ? student.country_interested.join(" | ")
          : student.country_interested,
        CurrentEducation: student.current_education,
        Notes: student.notes,
        EnquirySource: student.Source_Enquiry,
        PassportNumber: student.student_passport,
        AlternatePhone: student.alternate_phone,
        Address: student.student_address,
        IntakeInterested: student.intake_interested,
        ServicesInterested: Array.isArray(student.Interested_Services)
          ? student.Interested_Services.join(" | ")
          : student.Interested_Services,
        CreatedAt: student.createdAt?.toDate
          ? student.createdAt.toDate().toISOString()
          : "N/A",
      }));
      downloadAsCSV(dataToExport, "students_export.csv");
      toast.success("Students data exported successfully!");
    } else {
      toast.error("No data available to export.");
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImporting(true);
      setImportResults(null);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const csvHeaders = results.meta.fields;
          const essentialCsvHeaders = [
            "FirstName",
            "LastName",
            "Email",
            "Phone",
            "CurrentEducation",
            "CountriesInterested",
          ];
          const missingEssentialHeaders = essentialCsvHeaders.filter(
            (h) => !csvHeaders.includes(h)
          );

          if (missingEssentialHeaders.length > 0) {
            toast.error(
              `CSV is missing essential headers: ${missingEssentialHeaders.join(
                ", "
              )}.`
            );
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          await processImportedData(results.data);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      });
    }
  };

  const processImportedData = async (data) => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    if (!user || !user.uid) {
      toast.error("User not authenticated. Cannot import data.");
      setIsImporting(false);
      return;
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const studentData = {
          student_First_Name: row.FirstName?.trim() || "",
          student_Last_Name: row.LastName?.trim() || "",
          student_email: row.Email?.trim().toLowerCase() || "",
          student_phone: row.Phone?.replace(/\D/g, "") || "",
          current_education: row.CurrentEducation?.trim() || "",
          country_interested:
            row.CountriesInterested?.split(",")
              .map((c) => c.trim())
              .filter((c) => c) || [],
          Source_Enquiry: row.EnquirySource?.trim() || "CSV Import",
          notes: row.Notes?.trim() || "",
          enquiry_status: row.EnquiryStatus?.trim() || "New",
          student_city: row.City?.trim() || "",
          student_state: row.State?.trim() || "",
          student_passport: row.PassportNumber?.trim() || "",
          alternate_phone: row.AlternatePhone?.replace(/\D/g, "") || "",
          student_address: row.Address?.trim() || "",
          intake_interested: row.IntakeInterested?.trim() || "",
          Interested_Services:
            row.ServicesInterested?.split(",")
              .map((s) => s.trim())
              .filter((s) => s) || [],
          branchId: userProfile?.branchId || null,
          assignedUserId: userProfile?.uid || null,
          assigned_users: userProfile?.uid || null,
          createdBy: user.uid,
        };

        let missingField = false;
        for (const field of REQUIRED_FIRESTORE_FIELDS) {
          if (
            !studentData[field] ||
            (Array.isArray(studentData[field]) &&
              studentData[field].length === 0)
          ) {
            errors.push(
              `Row ${i + 2}: Missing required field '${field}' for student ${
                studentData.student_First_Name || "N/A"
              }.`
            );
            missingField = true;
            break;
          }
        }
        if (missingField) {
          errorCount++;
          continue;
        }

        await create(studentData);
        successCount++;
      } catch (err) {
        console.error(`Error importing row ${i + 2}:`, err, row);
        errors.push(`Row ${i + 2}: ${err.message || "Failed to import."}`);
        errorCount++;
      }
    }

    setImportResults({ successCount, errorCount, errors });
    if (errorCount > 0) {
      toast.error(
        `${errorCount} record(s) failed to import. ${successCount} imported.`,
        { duration: 5000 }
      );
    } else if (successCount > 0) {
      toast.success(`${successCount} student(s) imported successfully!`);
    } else {
      toast.info("No new students were imported.");
    }
    setIsImporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            Manage student enquiries and track their progress
          </p>
          {userProfile && (
            <div className="text-sm text-gray-500 mt-1">
              {userProfile.role === "Superadmin"
                ? "Viewing all enquiries across all branches"
                : `Viewing enquiries from ${
                    userProfile.branchId ? "your branch" : "all branches"
                  }`}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            ref={fileInputRef}
            style={{ display: "none" }}
            id="csvFileInput"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center"
            title="Import Students from CSV"
            disabled={isImporting}
          >
            <Upload size={20} className="mr-2" />
            {isImporting ? "Importing..." : "Import"}
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
            title="Export Students to CSV"
            disabled={
              isImporting || loading || !students || students.length === 0
            }
          >
            <Download size={20} className="mr-2" /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={isImporting}
          >
            <Plus size={20} className="mr-2" /> Add Student
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
                <p>
                  {importResults.successCount} student(s) imported successfully.
                </p>
                {importResults.errorCount > 0 && (
                  <p>{importResults.errorCount} record(s) failed.</p>
                )}
              </div>
              {importResults.errorCount > 0 &&
                importResults.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-700 max-h-20 overflow-y-auto">
                    <strong>Errors:</strong>
                    <ul className="list-disc pl-5">
                      {importResults.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
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
                {students?.length || 0}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-xs text-gray-500">All enquiries</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {students?.filter((s) => s.enquiry_status === "New").length ||
                  0}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New Enquiries</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                {students?.filter((s) => s.enquiry_status === "In Progress")
                  .length || 0}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xs text-gray-500">Active cases</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {students?.filter((s) => s.enquiry_status === "Admitted")
                  .length || 0}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admitted</p>
              <p className="text-xs text-gray-500">Success stories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <StudentsTable
          students={students || []}
          loading={loading || isImporting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onUpdateStatus={handleUpdateStudentStatus}
          onUpdateNote={handleUpdateStudentNote}
          onUpdateAssignment={handleUpdateStudentAssignment}
          currentUserProfile={userProfile}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        size="large"
      >
        <EnquiryForm
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
        title="Edit Student"
        size="large"
      >
        <EnquiryForm
          editData={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess();
            setShowEditModal(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Students;
