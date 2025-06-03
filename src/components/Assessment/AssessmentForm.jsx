import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  COUNTRIES,
  COURSE_LEVELS,
  ASSESSMENT_STATUS,
  INTAKES,
  CURRENCIES,
} from "../../utils/constants";
import {
  useEnquiries,
  useUniversities,
  useCourses,
} from "../../hooks/useFirestore";
import { assessmentService } from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AssessmentForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({});

  const { user } = useAuth();
  const { data: enquiries, loading: enquiriesLoading } = useEnquiries();
  const { data: universities, loading: universitiesLoading } =
    useUniversities();
  const { data: courses, loading: coursesLoading } = useCourses();

  const [loading, setLoading] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const selectedCountry = watch("student_country");
  const selectedUniversity = watch("university");
  const selectedLevel = watch("level_applying_for");

  useEffect(() => {
    if (editData) {
      reset(editData);
    } else {
      reset({
        enquiry: "",
        student_country: "",
        university: "",
        level_applying_for: "",
        course_interested: "",
        intake_interested: "",
        specialisation: "",
        duration: "",
        course_link: "",
        application_fee: "",
        tution_fee: "",
        fee_currency: "",
        ass_status: "",
        notes: "",
      });
    }
  }, [editData, reset]);

  useEffect(() => {
    if (universitiesLoading) return;
    if (selectedCountry) {
      const filtered = universities.filter(
        (uni) => uni.country === selectedCountry
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities(universities || []);
    }
  }, [selectedCountry, universities, universitiesLoading]);

  useEffect(() => {
    if (coursesLoading) return;
    let localFilteredCourses = courses || [];

    if (selectedUniversity) {
      localFilteredCourses = localFilteredCourses.filter(
        (course) => course.university === selectedUniversity
      );
    }

    if (selectedLevel) {
      localFilteredCourses = localFilteredCourses.filter(
        (course) => course.course_levels === selectedLevel
      );
    }
    setFilteredCourses(localFilteredCourses);
  }, [selectedUniversity, selectedLevel, courses, coursesLoading]);

  const onSubmit = async (dataFromForm) => {
    console.log("Raw data from form:", dataFromForm);

    if (!user || !user.uid) {
      toast.error("User not authenticated. Cannot save assessment.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const assessmentPayload = {
        ...dataFromForm,
        assigned_users: user.uid,
        branchId: dataFromForm.branchId || null,
      };

      if (editData && editData.id) {
        await assessmentService.update(editData.id, assessmentPayload);
        toast.success("Assessment updated successfully!");
      } else {
        await assessmentService.create(assessmentPayload);
        toast.success("Assessment created successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error(
        error.message || "Failed to save assessment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (enquiriesLoading || universitiesLoading || coursesLoading) {
    return <div className="p-4 text-center">Loading form data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Student & Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <select
              {...register("enquiry", {
                required: "Student selection is required",
              })}
              className="input-field"
            >
              <option value="">Select Student</option>
              {enquiries.map((enquiry) => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.student_First_Name} {enquiry.student_Last_Name} -{" "}
                  {enquiry.student_email}
                </option>
              ))}
            </select>
            {errors.enquiry && (
              <p className="text-red-600 text-sm mt-1">
                {errors.enquiry.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country of Interest *
            </label>
            <select
              {...register("student_country", {
                required: "Country is required",
              })}
              className="input-field"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.student_country && (
              <p className="text-red-600 text-sm mt-1">
                {errors.student_country.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University *
            </label>
            <select
              {...register("university", {
                required: "University is required",
              })}
              className="input-field"
            >
              <option value="">Select University</option>
              {filteredUniversities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.univ_name}
                </option>
              ))}
            </select>
            {errors.university && (
              <p className="text-red-600 text-sm mt-1">
                {errors.university.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level Applying For *
            </label>
            <select
              {...register("level_applying_for", {
                required: "Level is required",
              })}
              className="input-field"
            >
              <option value="">Select Level</option>
              {COURSE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level_applying_for && (
              <p className="text-red-600 text-sm mt-1">
                {errors.level_applying_for.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Interested
            </label>
            <select {...register("course_interested")} className="input-field">
              <option value="">Select Course</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intake Interested
            </label>
            <select {...register("intake_interested")} className="input-field">
              <option value="">Select Intake</option>
              {INTAKES.map((intake) => (
                <option key={intake.name} value={intake.name}>
                  {intake.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Course Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              {...register("specialisation")}
              className="input-field"
              placeholder="e.g., Computer Science, Data Analytics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              {...register("duration")}
              className="input-field"
              placeholder="e.g., 2 years, 18 months"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Link
            </label>
            <input
              type="url"
              {...register("course_link")}
              className="input-field"
              placeholder="https://university.edu/course"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Financial Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Fee
            </label>
            <input
              type="text"
              {...register("application_fee")}
              className="input-field"
              placeholder="e.g., $100, €75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuition Fee
            </label>
            <input
              type="text"
              {...register("tution_fee")}
              className="input-field"
              placeholder="e.g., $25,000/year"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Currency
            </label>
            <select {...register("fee_currency")} className="input-field">
              <option value="">Select Currency</option>
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Assessment Status & Notes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Status
            </label>
            <select {...register("ass_status")} className="input-field">
              <option value="">Select Status</option>
              {ASSESSMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="input-field"
              placeholder="Add detailed assessment notes, recommendations, eligibility analysis, etc..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Saving..."
            : editData
            ? "Update Assessment"
            : "Create Assessment"}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
