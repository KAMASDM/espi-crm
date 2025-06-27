import React, { useState, useEffect, useRef, useMemo } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Download, AlertTriangle, CheckCircle, X } from "lucide-react";
import Modal from "../components/Common/Modal";
import { USER_ROLES } from "../utils/constants";
import { downloadAsCSV } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { useEnquiries, useUsers } from "../hooks/useFirestore";
import EnquiryForm from "../components/Students/EnquiryForm";
import StudentsTable from "../components/Students/StudentsTable";

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
    create,
    update,
    delete: deleteEnquiry,
  } = useEnquiries();
  const navigate = useNavigate();
  const { data: allUsers } = useUsers();
  const { user, userProfile } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const filteredStudents = useMemo(() => {
    if (!userProfile || !students) return [];
    if (userProfile.role === USER_ROLES.SUPERADMIN) {
      return students;
    } else if (
      userProfile.role === USER_ROLES.BRANCH_ADMIN ||
      userProfile.role === USER_ROLES.COUNSELLOR
    ) {
      return students.filter(
        (student) => student.branchId === userProfile.branchId
      );
    } else if (
      userProfile.role === USER_ROLES.AGENT ||
      userProfile.role === USER_ROLES.RECEPTION
    ) {
      return students.filter(
        (student) => student.createdBy === userProfile.uid
      );
    }
    return [];
  }, [students, userProfile]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching enquiries:", error);
    }
  }, [error]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleView = (student) => {
    navigate(`/students/${student.id}/details`);
  };

  const handleDelete = (studentId) => {
    setStudentToDeleteId(studentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (studentToDeleteId) {
      try {
        await deleteEnquiry(studentToDeleteId);
        toast.success("Student enquiry deleted successfully!");
      } catch (err) {
        console.error("Error deleting student enquiry:", err);
        toast.error("Failed to delete student enquiry. Please try again.");
      } finally {
        setShowDeleteModal(false);
        setStudentToDeleteId(null);
      }
    }
  };

  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      await update(studentId, {
        enquiry_status: newStatus,
      });
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleUpdateStudentNote = async (studentId, newNote) => {
    try {
      await update(studentId, {
        notes: newNote,
      });
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
      });
      toast.success("Assignment updated successfully!");
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error(err.message || "Failed to update assignment.");
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
      toast.info("No data available to export.");
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
            const message = `CSV is missing essential headers: ${missingEssentialHeaders.join(
              ", "
            )}. Required: ${essentialCsvHeaders.join(", ")}`;
            toast.error(message, { duration: 5000 });
            console.error(message);
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          await processImportedData(results.data);
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
            row.CountriesInterested?.split(/[,|]/)
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
            row.ServicesInterested?.split(/[,|]/)
              .map((s) => s.trim())
              .filter((s) => s) || [],
          branchId: userProfile?.branchId || null,
          assignedUserId: userProfile?.uid || null,
        };

        let missingField = false;
        for (const field of REQUIRED_FIRESTORE_FIELDS) {
          if (
            !studentData[field] ||
            (Array.isArray(studentData[field]) &&
              studentData[field].length === 0)
          ) {
            errors.push(
              `Row ${
                i + 2
              }: Missing required field '${field}' for student ${studentData.student_First_Name?.trim()} ${studentData.student_Last_Name?.trim()}.`
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
        errors.push(
          `Row ${i + 2} (${row.FirstName} ${row.LastName}): ${
            err.message || "Failed to import."
          }`
        );
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

  const handleVisibility =
    userProfile.role === USER_ROLES.SUPERADMIN ||
    userProfile.role === USER_ROLES.BRANCH_ADMIN ||
    userProfile.role === USER_ROLES.COUNSELLOR ||
    userProfile.role === USER_ROLES.RECEPTION ||
    userProfile.role === USER_ROLES.AGENT;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            Manage student enquiries and track their progress
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {handleVisibility && (
            <>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                ref={fileInputRef}
                style={{ display: "none" }}
                id="csvFileInput"
              />
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center"
                title="Export Students to CSV"
                disabled={isImporting || loading || !students.length}
              >
                <Download size={20} className="mr-2" /> Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
                disabled={loading}
              >
                <Plus size={20} className="mr-2" /> Add Student
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

      {userProfile.role !== USER_ROLES.AGENT && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Students",
              value: students?.length,
              color: "blue",
              subtext: "All enquiries",
            },
            {
              title: "New Enquiries",
              value: students?.filter((s) => s.enquiry_status === "New").length,
              color: "green",
              subtext: "Require attention",
            },
            {
              title: "In Progress",
              value: students?.filter((s) => s.enquiry_status === "In Progress")
                .length,
              color: "yellow",
              subtext: "Active cases",
            },
            {
              title: "Admitted",
              value: students?.filter((s) => s.enquiry_status === "Admitted")
                .length,
              color: "purple",
              subtext: "Success stories",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`p-2.5 bg-${card.color}-100 rounded-lg`}>
                  <div className={`text-${card.color}-600 text-2xl font-bold`}>
                    {loading ? "..." : card.value}
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
      )}
      <div className="card">
        <StudentsTable
          students={filteredStudents}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onUpdateStatus={handleUpdateStudentStatus}
          onUpdateNote={handleUpdateStudentNote}
          onUpdateAssignment={handleUpdateStudentAssignment}
          userRole={userProfile?.role}
          userBranch={userProfile?.branchId}
          handleVisibility={handleVisibility}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        size="large"
      >
        <EnquiryForm
          allUsers={allUsers}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
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
          allUsers={allUsers}
          editData={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
        />
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />{" "}
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Student?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this student? This action cannot
              be undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setStudentToDeleteId(null);
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

export default Students;
