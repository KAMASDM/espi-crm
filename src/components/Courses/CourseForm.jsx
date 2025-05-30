import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  COUNTRIES,
  COURSE_LEVELS,
  CURRENCIES,
  INTAKES,
  DOCUMENTS_REQUIRED,
} from "../../utils/constants";
import { useUniversities } from "../../hooks/useFirestore";
import { courseService } from "../../services/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CourseForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: editData || {
      Active: true,
    },
  });
  const { user } = useAuth();
  const { data: universities } = useUniversities();
  const [loading, setLoading] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState([]);

  const selectedCountry = watch("country");

  useEffect(() => {
    if (selectedCountry) {
      const filtered = universities.filter(
        (uni) => uni.country === selectedCountry
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities(universities);
    }
  }, [selectedCountry, universities]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const courseData = {
        ...data,
        createdBy: user.uid,
      };

      if (editData) {
        await courseService.update(editData.id, courseData);
        toast.success("Course updated successfully!");
      } else {
        await courseService.create(courseData);
        toast.success("Course created successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              {...register("course_name", {
                required: "Course name is required",
              })}
              className="input-field"
            />
            {errors.course_name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.course_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              {...register("country", { required: "Country is required" })}
              className="input-field"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-600 text-sm mt-1">
                {errors.country.message}
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
              Course Level *
            </label>
            <select
              {...register("course_levels", {
                required: "Course level is required",
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
            {errors.course_levels && (
              <p className="text-red-600 text-sm mt-1">
                {errors.course_levels.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Website URL
            </label>
            <input
              type="url"
              {...register("website_url")}
              className="input-field"
              placeholder="https://university.edu/course"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization Tags
            </label>
            <input
              type="text"
              {...register("specialisation_tag")}
              className="input-field"
              placeholder="e.g., Data Science, AI, Machine Learning"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Intakes
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
              {INTAKES.map((intake) => (
                <label key={intake.name} className="flex items-center">
                  <input
                    type="checkbox"
                    value={intake.name}
                    {...register("intake")}
                    className="mr-2"
                  />
                  <span className="text-sm">{intake.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documents Required
            </label>
            <div className="max-h-32 overflow-y-auto p-3 border border-gray-300 rounded-lg">
              {DOCUMENTS_REQUIRED.map((doc) => (
                <label key={doc} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    value={doc}
                    {...register("documents_required")}
                    className="mr-2"
                  />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              {...register("Application_deadline")}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backlogs Allowed
            </label>
            <input
              type="number"
              {...register("Backlogs_allowed")}
              className="input-field"
              placeholder="Maximum number of backlogs"
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
              type="number"
              step="0.01"
              {...register("Application_fee")}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Fee Currency
            </label>
            <select
              {...register("Application_fee_currency")}
              className="input-field"
            >
              <option value="">Select Currency</option>
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yearly Tuition Fee
            </label>
            <input
              type="number"
              step="0.01"
              {...register("Yearly_Tuition_fee")}
              className="input-field"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              10th Standard Requirement
            </label>
            <input
              type="text"
              {...register("tenth_std_percentage_requirement")}
              className="input-field"
              placeholder="e.g., 70% or above"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              12th Standard Requirement
            </label>
            <input
              type="text"
              {...register("twelfth_std_percentage_requirement")}
              className="input-field"
              placeholder="e.g., 75% or above"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bachelor's Requirement
            </label>
            <input
              type="text"
              {...register("bachelor_requirement")}
              className="input-field"
              placeholder="e.g., 3.0 GPA or above"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Master's Requirement
            </label>
            <input
              type="text"
              {...register("masters_requirement")}
              className="input-field"
              placeholder="e.g., 3.5 GPA or above"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Test Score Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IELTS Requirement
            </label>
            <input
              type="text"
              {...register("ielts_Exam")}
              className="input-field"
              placeholder="e.g., Overall 6.5, No band below 6.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TOEFL Requirement
            </label>
            <input
              type="text"
              {...register("Toefl_Exam")}
              className="input-field"
              placeholder="e.g., Overall 90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PTE Requirement
            </label>
            <input
              type="text"
              {...register("PTE_Exam")}
              className="input-field"
              placeholder="e.g., Overall 65"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duolingo Requirement
            </label>
            <input
              type="text"
              {...register("Duolingo_Exam")}
              className="input-field"
              placeholder="e.g., Overall 110"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRE Requirement
            </label>
            <input
              type="text"
              {...register("Gre_Exam")}
              className="input-field"
              placeholder="e.g., Verbal 155, Quant 160"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GMAT Requirement
            </label>
            <input
              type="text"
              {...register("Gmat_Exam")}
              className="input-field"
              placeholder="e.g., Overall 650"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Exam Requirements
            </label>
            <input
              type="text"
              {...register("other_exam")}
              className="input-field"
              placeholder="Any other specific exam requirements"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Notes
            </label>
            <textarea
              {...register("Remark")}
              rows={4}
              className="input-field"
              placeholder="Additional notes about the course..."
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" {...register("Active")} className="mr-3" />
            <label className="text-sm font-medium text-gray-700">
              Active Course (Available for applications)
            </label>
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
          {loading ? "Saving..." : editData ? "Update Course" : "Create Course"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
