import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import Modal from "../components/Common/Modal";
import { useAuth } from "../context/AuthContext";
import { downloadAsCSV } from "../utils/helpers";
import { firestoreService } from "../services/firestore";
import CourseForm from "../components/Courses/CourseForm";
import CoursesTable from "../components/Courses/CoursesTable";
import { useCourses, useUniversities } from "../hooks/useFirestore";
import {
  COUNTRIES,
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
} from "lucide-react";

const Courses = () => {
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    remove,
    create,
  } = useCourses();
  const { data: universities, loading: universitiesLoading } =
    useUniversities();
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const isLoading = coursesLoading || universitiesLoading;

  useEffect(() => {
    if (coursesError) {
      console.log("error", coursesError);
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

  const handleDelete = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        await remove(courseId);
        toast.success("Course deleted successfully!");
      } catch (error) {
        console.error("error", error);
      }
    }
  };

  const handleFormSuccess = () => {};

  const getUniversityName = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.univ_name;
  };
  const getCountryCodeForUniversity = (universityId) => {
    const university = universities.find((uni) => uni.id === universityId);
    return university && university.country;
  };

  const handleExport = () => {
    if (courses && courses.length > 0 && universities.length > 0) {
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
      console.log("No data available to export or universities not loaded.");
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
          const essentialCsvHeaders = [
            "CourseName",
            "UniversityID",
            "CourseLevel",
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
          await processCourseImportData(results.data);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        error: (error) => {
          console.log("error", error.message);
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
      console.log("User not authenticated. Cannot import data.");
      setIsImporting(false);
      return;
    }
    if (universitiesLoading || !universities || universities.length === 0) {
      console.log(
        "University data is not loaded yet. Please wait and try again."
      );
      setIsImporting(false);
      return;
    }

    const universityIdMap = new Map(
      universities.map((uni) => [uni.id.toLowerCase(), uni.id])
    );
    const universityNameMap = new Map(
      universities.map((uni) => [uni.univ_name.toLowerCase(), uni.id])
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        let universityId = row.UniversityID?.trim();
        if (!universityId && row.UniversityName) {
          universityId = universityNameMap.get(
            row.UniversityName.trim().toLowerCase()
          );
          if (!universityId) {
            importErrors.push(
              `Row ${i + 2} (${row.CourseName}): UniversityName "${
                row.UniversityName
              }" not found.`
            );
            errorCount++;
            continue;
          }
        } else if (
          universityId &&
          !universityIdMap.has(universityId.toLowerCase())
        ) {
          importErrors.push(
            `Row ${i + 2} (${row.CourseName}): UniversityID "${
              row.UniversityID
            }" not found.`
          );
          errorCount++;
          continue;
        }
        if (!universityId) {
          importErrors.push(
            `Row ${i + 2} (${
              row.CourseName
            }): Missing UniversityID or valid UniversityName.`
          );
          errorCount++;
          continue;
        }
        universityId =
          universityIdMap.get(universityId.toLowerCase()) || universityId;

        const courseData = {
          course_name: row.CourseName?.trim() || "",
          university: universityId,
          country: getCountryCodeForUniversity(universityId) || "",
          course_levels: row.CourseLevel?.trim() || "",
          website_url: row.WebsiteURL?.trim() || null,
          specialisation_tag: row.SpecializationTag?.trim() || null,
          intake:
            row.Intakes?.split(",")
              .map((s) => s.trim())
              .filter((s) => INTAKES.some((intake) => intake.name === s)) || [],
          documents_required:
            row.DocumentsRequired?.split(",")
              .map((s) => s.trim())
              .filter((s) => DOCUMENTS_REQUIRED.includes(s)) || [],
          Application_deadline: row.ApplicationDeadline
            ? new Date(row.ApplicationDeadline).toISOString().split("T")[0]
            : null,
          Backlogs_allowed: row.BacklogsAllowed
            ? parseInt(row.BacklogsAllowed, 10)
            : null,
          Application_fee: row.ApplicationFee
            ? parseFloat(row.ApplicationFee)
            : null,
          Application_fee_currency: CURRENCIES.find(
            (c) => c.code === row.ApplicationFeeCurrency?.trim().toUpperCase()
          )
            ? row.ApplicationFeeCurrency.trim().toUpperCase()
            : null, //
          Yearly_Tuition_fee: row.YearlyTuitionFee
            ? parseFloat(row.YearlyTuitionFee)
            : null,
          Active:
            row.IsActive?.toLowerCase() === "true" ||
            row.IsActive === "1" ||
            true,
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
          createdBy: user.uid,
        };

        let missingOrInvalidField = false;
        if (!courseData.course_name) {
          importErrors.push(`Row ${i + 2}: Missing 'CourseName'.`);
          missingOrInvalidField = true;
        }
        if (!courseData.university) {
          importErrors.push(
            `Row ${i + 2} (${
              courseData.course_name
            }): Missing or invalid 'UniversityID'.`
          );
          missingOrInvalidField = true;
        }
        if (
          !courseData.course_levels ||
          !COURSE_LEVELS.includes(courseData.course_levels)
        ) {
          importErrors.push(
            `Row ${i + 2} (${
              courseData.course_name
            }): Missing or invalid 'CourseLevel'.`
          );
          missingOrInvalidField = true;
        }
        if (!courseData.country) {
          importErrors.push(
            `Row ${i + 2} (${
              courseData.course_name
            }): Could not determine country from UniversityID.`
          );
          missingOrInvalidField = true;
        }

        if (missingOrInvalidField) {
          errorCount++;
          continue;
        }

        const existingCourses = await firestoreService.getAll("courses", [
          firestoreService.where("course_name", "==", courseData.course_name),
          firestoreService.where("university", "==", courseData.university),
        ]);

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
        importErrors.push(`Row ${i + 2} (${row.CourseName}): ${err.message}`);
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
        `${errorCount} record(s) failed (duplicates: ${duplicateCount}). ${successCount} imported.`,
        { duration: 6000 }
      );
    } else if (successCount > 0) {
      toast.success(`${successCount} course(s) imported successfully!`);
    } else {
      toast.info(
        "No new courses were imported (or all were duplicates/had errors)."
      );
    }
    setIsImporting(false);
  };

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
            disabled={isImporting || isLoading}
          >
            <Download size={20} className="mr-2" /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={isImporting || isLoading}
          >
            <Plus size={20} className="mr-2" /> Add Course
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
                    {importResults.duplicateCount} duplicates).
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {courses?.length}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-xs text-gray-500">All programs</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">
                {courses?.filter((c) => c.Active).length || 0}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {
                  [...new Set(courses?.map((c) => c.course_levels) || [])]
                    .length
                }
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Levels Offered
              </p>
              <p className="text-xs text-gray-500">Degree types</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">
                $
                {(
                  courses?.reduce(
                    (sum, c) => sum + parseFloat(c.Application_fee || 0),
                    0
                  ) / (courses?.filter((c) => c.Application_fee).length || 1) ||
                  0
                ).toFixed(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg App Fee</p>
              <p className="text-xs text-gray-500">Application cost</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <CoursesTable
          courses={courses || []}
          universities={universities || []}
          loading={isLoading || isImporting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Course"
        size="large"
      >
        <CourseForm
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
        title="Edit Course"
        size="large"
      >
        <CourseForm
          editData={selectedCourse}
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
        title="Course Details"
        size="large"
      >
        {selectedCourse && (
          <CourseDetails
            course={selectedCourse}
            universities={universities || []}
          />
        )}
      </Modal>
    </div>
  );
};

const CourseDetails = ({ course, universities }) => {
  const getUniversityName = (universityId) =>
    universities.find((uni) => uni.id === universityId)?.univ_name ||
    "Unknown University";
  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode; //
  const getCountryCodeForUniversity = (universityId) =>
    universities.find((uni) => uni.id === universityId)?.country;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <p className="text-sm text-gray-900">{course.course_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Level
            </label>
            <p className="text-sm text-gray-900">{course.course_levels}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              University
            </label>
            <p className="text-sm text-gray-900">
              {getUniversityName(course.university)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <p className="text-sm text-gray-900">
              {getCountryName(
                getCountryCodeForUniversity(course.university) || course.country
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specialization
            </label>
            <p className="text-sm text-gray-900">{course.specialisation_tag}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <p className="text-sm text-gray-900">
              {course.website_url ? (
                <a
                  href={course.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {course.website_url}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Academic Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Intakes
            </label>
            <p className="text-sm text-gray-900">
              {Array.isArray(course.intake)
                ? course.intake.join(", ")
                : course.intake}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Deadline
            </label>
            <p className="text-sm text-gray-900">
              {course.Application_deadline &&
                new Date(course.Application_deadline).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Backlogs Allowed
            </label>
            <p className="text-sm text-gray-900">
              {course.Backlogs_allowed ?? "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Documents Required
            </label>
            <p className="text-sm text-gray-900">
              {Array.isArray(course.documents_required)
                ? course.documents_required.join(", ")
                : course.documents_required}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Financial Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Fee
            </label>
            <p className="text-sm text-gray-900">
              {course.Application_fee &&
                `${course.Application_fee_currency || "$"}${
                  course.Application_fee
                }`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Yearly Tuition Fee
            </label>
            <p className="text-sm text-gray-900">
              {course.Yearly_Tuition_fee &&
                `${course.Application_fee_currency || "$"}${
                  course.Yearly_Tuition_fee
                }`}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Status & Notes
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm text-gray-900">
              {course.Active ? (
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
          {course.Remark && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {course.Remark}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
