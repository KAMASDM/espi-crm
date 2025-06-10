import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { where } from "firebase/firestore";
import Modal from "../components/Common/Modal";
import { useAuth } from "../context/AuthContext";
import { downloadAsCSV } from "../utils/helpers";
import { firestoreService } from "../services/firestore";
import CourseForm from "../components/Courses/CourseForm";
import CoursesTable from "../components/Courses/CoursesTable";
import { useCourses, useUniversities } from "../hooks/useFirestore";
import CourseDetail from "../components/Courses/CourseDetail";
import {
  COURSE_LEVELS,
  CURRENCIES,
  INTAKES,
  DOCUMENTS_REQUIRED,
} from "../utils/constants";
import {
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

const Courses = () => {
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    create,
    delete: deleteCourse,
  } = useCourses();
  const { data: universities, loading: universitiesLoading } =
    useUniversities();
  const { user, userProfile } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const isLoading = coursesLoading || universitiesLoading;

  useEffect(() => {
    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      toast.error("Failed to load courses.");
    }
  }, [coursesError]);

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleDelete = (courseId) => {
    setCourseToDeleteId(courseId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (courseToDeleteId) {
      try {
        await deleteCourse(courseToDeleteId);
        toast.success("Course deleted successfully!");
      } catch (err) {
        console.error("Error deleting course:", err);
        toast.error("Failed to delete course. Please try again.");
      } finally {
        setShowDeleteModal(false);
        setCourseToDeleteId(null);
      }
    }
  };

  const handleFormSuccess = (action = "added") => {
    toast.success(`Course ${action} successfully!`);
  };

  const getUniversityName = (universityId) => {
    if (!universities || universities.length === 0) return "N/A";
    const university = universities.find((uni) => uni.id === universityId);
    return university?.univ_name || "Unknown University";
  };

  const getCountryCodeForUniversity = (universityId) => {
    if (!universities || universities.length === 0) return null;
    const university = universities.find((uni) => uni.id === universityId);
    return university?.country || null;
  };

  const handleExport = () => {
    if (
      courses &&
      courses.length > 0 &&
      universities &&
      universities.length > 0
    ) {
      const dataToExport = courses.map((course) => ({
        CourseID: course.id,
        CourseName: course.course_name,
        UniversityID: course.university,
        UniversityName: getUniversityName(course.university),
        CountryCode: getCountryCodeForUniversity(course.university),
        CourseLevel: course.course_levels,
        WebsiteURL: course.website_url,
        SpecializationTag: course.specialisation_tag,
        Intakes: Array.isArray(course.intake)
          ? course.intake.join(" | ")
          : course.intake,
        DocumentsRequired: Array.isArray(course.documents_required)
          ? course.documents_required.join(" | ")
          : course.documents_required,
        ApplicationDeadline: course.Application_deadline
          ? new Date(course.Application_deadline).toLocaleDateString()
          : "",
        BacklogsAllowed: course.Backlogs_allowed,
        ApplicationFee: course.Application_fee,
        ApplicationFeeCurrency: course.Application_fee_currency,
        YearlyTuitionFee: course.Yearly_Tuition_fee,
        IsActive: course.Active,
        TenthStdRequirement: course.tenth_std_percentage_requirement,
        TwelfthStdRequirement: course.twelfth_std_percentage_requirement,
        BachelorRequirement: course.bachelor_requirement,
        MasterRequirement: course.masters_requirement,
        IELTSExam: course.ielts_Exam,
        TOEFLExam: course.Toefl_Exam,
        PTEExam: course.PTE_Exam,
        DuolingoExam: course.Duolingo_Exam,
        GREExam: course.Gre_Exam,
        GMATExam: course.Gmat_Exam,
        OtherExam: course.other_exam,
        Notes: course.Remark,
        CreatedAt: course.createdAt?.toDate
          ? course.createdAt.toDate().toISOString()
          : "N/A",
      }));
      downloadAsCSV(dataToExport, "courses_export.csv");
      toast.success("Courses data exported successfully!");
    } else {
      toast.info(
        "No course data available to export or universities not loaded."
      );
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
          const essentialCsvHeaders = ["CourseName", "CourseLevel"];
          const missingEssentialHeaders = essentialCsvHeaders.filter(
            (h) => !csvHeaders.includes(h)
          );

          if (missingEssentialHeaders.length > 0) {
            toast.error(
              `CSV is missing essential headers: ${missingEssentialHeaders.join(
                ", "
              )}.`,
              { duration: 5000 }
            );
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          if (
            !csvHeaders.includes("UniversityID") &&
            !csvHeaders.includes("UniversityName")
          ) {
            toast.error(
              "CSV must include either 'UniversityID' or 'UniversityName' header.",
              { duration: 5000 }
            );
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          await processCourseImportData(results.data);
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

  const processCourseImportData = async (data) => {
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const importErrors = [];

    if (!user || !user.uid) {
      toast.error("User not authenticated. Cannot import data.");
      setIsImporting(false);
      return;
    }
    if (universitiesLoading || !universities || universities.length === 0) {
      toast.warn(
        "University data is not loaded yet. Please wait and try again."
      );
      setIsImporting(false);
      return;
    }

    const universityIdMap = new Map(
      universities.map((uni) => [uni.id.toLowerCase(), uni.id])
    );
    const universityNameMap = new Map(
      universities.map((uni) => [uni.univ_name.trim().toLowerCase(), uni.id])
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        let universityIdFromRow = row.UniversityID?.trim();
        let resolvedUniversityId = null;

        if (universityIdFromRow) {
          resolvedUniversityId = universityIdMap.get(
            universityIdFromRow.toLowerCase()
          );
          if (!resolvedUniversityId) {
            importErrors.push(
              `Row ${i + 2} (${
                row.CourseName || "N/A"
              }): UniversityID "${universityIdFromRow}" not found.`
            );
            errorCount++;
            continue;
          }
        } else if (row.UniversityName) {
          resolvedUniversityId = universityNameMap.get(
            row.UniversityName.trim().toLowerCase()
          );
          if (!resolvedUniversityId) {
            importErrors.push(
              `Row ${i + 2} (${row.CourseName || "N/A"}): UniversityName "${
                row.UniversityName
              }" not found.`
            );
            errorCount++;
            continue;
          }
        } else {
          importErrors.push(
            `Row ${i + 2} (${
              row.CourseName || "N/A"
            }): Missing UniversityID or UniversityName.`
          );
          errorCount++;
          continue;
        }

        const courseData = {
          course_name: row.CourseName?.trim() || "",
          university: resolvedUniversityId,
          country: getCountryCodeForUniversity(resolvedUniversityId) || "",
          course_levels: row.CourseLevel?.trim() || "",
          website_url: row.WebsiteURL?.trim() || null,
          specialisation_tag: row.SpecializationTag?.trim() || null,
          intake:
            row.Intakes?.split(/[,|]/)
              .map((s) => s.trim())
              .filter((s) => INTAKES.map((it) => it.value).includes(s)) || [],
          documents_required:
            row.DocumentsRequired?.split(/[,|]/)
              .map((s) => s.trim())
              .filter((s) =>
                DOCUMENTS_REQUIRED.map((dr) => dr.value).includes(s)
              ) || [],
          Application_deadline: row.ApplicationDeadline
            ? new Date(row.ApplicationDeadline).toISOString().split("T")[0]
            : null,
          Backlogs_allowed: row.BacklogsAllowed
            ? parseInt(row.BacklogsAllowed, 10)
            : null,
          Application_fee: row.ApplicationFee
            ? parseFloat(row.ApplicationFee)
            : null,
          Application_fee_currency:
            CURRENCIES.find(
              (c) => c.code === row.ApplicationFeeCurrency?.trim().toUpperCase()
            )?.code || null,
          Yearly_Tuition_fee: row.YearlyTuitionFee
            ? parseFloat(row.YearlyTuitionFee)
            : null,
          Active: !(
            row.IsActive?.toLowerCase() === "false" || row.IsActive === "0"
          ),
          tenth_std_percentage_requirement:
            row.TenthStdRequirement?.trim() || null,
          twelfth_std_percentage_requirement:
            row.TwelfthStdRequirement?.trim() || null,
          bachelor_requirement: row.BachelorRequirement?.trim() || null,
          masters_requirement: row.MasterRequirement?.trim() || null,
          ielts_Exam: row.IELTSExam?.trim() || null,
          Toefl_Exam: row.TOEFLExam?.trim() || null,
          PTE_Exam: row.PTEExam?.trim() || null,
          Duolingo_Exam: row.DuolingoExam?.trim() || null,
          Gre_Exam: row.GREExam?.trim() || null,
          Gmat_Exam: row.GMATExam?.trim() || null,
          other_exam: row.OtherExam?.trim() || null,
          Remark: row.Notes?.trim() || null,
        };

        let missingOrInvalidField = false;
        if (!courseData.course_name) {
          importErrors.push(`Row ${i + 2}: Missing 'CourseName'.`);
          missingOrInvalidField = true;
        }
        if (
          !COURSE_LEVELS.map((cl) => cl.value).includes(
            courseData.course_levels
          )
        ) {
          importErrors.push(
            `Row ${i + 2} (${courseData.course_name}): Invalid 'CourseLevel' "${
              courseData.course_levels
            }".`
          );
          missingOrInvalidField = true;
        }
        if (!courseData.country) {
          importErrors.push(
            `Row ${i + 2} (${
              courseData.course_name
            }): Could not determine country from University.`
          );
          missingOrInvalidField = true;
        }
        if (missingOrInvalidField) {
          errorCount++;
          continue;
        }

        const qConstraints = [
          where("course_name", "==", courseData.course_name),
          where("university", "==", courseData.university),
        ];
        const existingCourses = await firestoreService.getAll(
          "courses",
          qConstraints
        );

        if (existingCourses.length > 0) {
          importErrors.push(
            `Row ${i + 2} (${
              courseData.course_name
            }): Duplicate course already exists for this university.`
          );
          duplicateCount++;
          errorCount++;
          continue;
        }

        await create(courseData);
        successCount++;
      } catch (err) {
        console.error(`Error importing course row ${i + 2}:`, err, row);
        importErrors.push(
          `Row ${i + 2} (${row.CourseName || "N/A"}): ${
            err.message || "Unknown error"
          }`
        );
        errorCount++;
      }
    }

    setImportResults({
      successCount,
      errorCount,
      duplicateCount,
      errors: importErrors,
    });
    if (errorCount > 0) {
      toast.error(
        `${errorCount} record(s) failed (includes ${duplicateCount} duplicate(s)). ${successCount} imported.`,
        { duration: 6000 }
      );
    } else if (successCount > 0) {
      toast.success(`${successCount} course(s) imported successfully!`);
    } else {
      toast.info("No new courses were imported.");
    }
    setIsImporting(false);
  };

  const handleVisibility = userProfile.role === "Superadmin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">
            Manage course catalog and program information
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
                id="csvCourseInput"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center"
                title="Import Courses from CSV"
                disabled={isImporting || isLoading}
              >
                <Upload size={20} className="mr-2" />{" "}
                {isImporting ? "Importing..." : "Import"}
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center"
                title="Export Courses to CSV"
                disabled={isImporting || isLoading || !courses.length}
              >
                <Download size={20} className="mr-2" /> Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
                disabled={isLoading}
              >
                <Plus size={20} className="mr-2" /> Add Course
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
                <AlertTriangle className="h-5 w-5 text-red-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-400" />
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
                <p>{importResults.successCount} course(s) imported.</p>
                {importResults.errorCount > 0 && (
                  <p>
                    {importResults.errorCount} record(s) failed (includes{" "}
                    {importResults.duplicateCount} duplicate(s)).
                  </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Courses",
            value: courses?.length,
            color: "purple",
            subtext: "All programs",
          },
          {
            title: "Active Courses",
            value: courses?.filter((c) => c.Active).length,
            color: "green",
            subtext: "Currently available",
          },
          {
            title: "Course Levels",
            value: [...new Set(courses?.map((c) => c.course_levels))].length,
            color: "blue",
            subtext: "Unique degree types",
          },
          {
            title: "Avg. App Fee",
            value:
              courses?.length > 0
                ? courses.reduce(
                    (sum, c) => sum + parseFloat(c.Application_fee),
                    0
                  ) / courses.filter((c) => c.Application_fee).length
                : 0,
            color: "yellow",
            subtext: "Est. application cost",
            prefix: "$",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-2.5 bg-${card.color}-100 rounded-lg`}>
                <div className={`text-${card.color}-600 text-2xl font-bold`}>
                  {isLoading
                    ? "..."
                    : `${card.prefix || ""}${
                        card.value % 1 !== 0
                          ? card.value.toFixed(
                              card.title === "Avg. App Fee" ? 0 : 0
                            )
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
        <CoursesTable
          courses={courses}
          universities={universities}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          handleVisibility={handleVisibility}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Course"
        size="large"
      >
        <CourseForm
          universities={universities}
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
        title="Edit Course"
        size="large"
      >
        <CourseForm
          editData={selectedCourse}
          universities={universities}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleFormSuccess("updated");
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
        />
      </Modal>
      <CourseDetail
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        course={selectedCourse}
        universities={universities}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCourseToDeleteId(null);
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Course?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setCourseToDeleteId(null);
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

export default Courses;
