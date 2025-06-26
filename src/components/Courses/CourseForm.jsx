import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Save,
  X,
  ChevronDown,
  Search,
  Plus,
  DownloadCloud,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { courseService } from "../../services/firestore";
import { useUniversities } from "../../hooks/useFirestore";
import {
  INTAKES,
  COUNTRIES,
  CURRENCIES,
  COURSE_LEVELS,
  DOCUMENTS_REQUIRED,
} from "../../utils/constants";
import OpenAI from "openai";
import Modal from "../Common/Modal";
import UniversityForm from "../University/UniversityForm";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  displayKey = "name",
  valueKey = "code",
  error,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!options) {
      setFilteredOptions([]);
      return;
    }
    const filtered = options.filter((option) => {
      const displayValue =
        typeof option === "string" ? option : option[displayKey];
      return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (!value || !options) return "";
    const option = options.find((opt) => {
      const optValue = typeof opt === "string" ? opt : opt[valueKey];
      return optValue === value;
    });
    return option
      ? typeof option === "string"
        ? option
        : option[displayKey]
      : "";
  };

  const handleSelect = (option) => {
    const optValue = typeof option === "string" ? option : option[valueKey];
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div
          className={`input-field cursor-pointer flex items-center justify-between ${
            error ? "border-red-500" : ""
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          onClick={handleInputClick}
        >
          <span className={`flex-1 ${!value ? "text-gray-500" : ""}`}>
            {getDisplayValue() || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${disabled ? "text-gray-400" : ""}`}
          />
        </div>
        {required && (
          <span className="absolute -top-2 -right-2 text-red-500">*</span>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const displayValue =
                  typeof option === "string" ? option : option[displayKey];
                const optValue =
                  typeof option === "string" ? option : option[valueKey];
                return (
                  <div
                    key={index}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      value === optValue ? "bg-blue-50 text-blue-600" : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {displayValue}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

const CourseForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: editData || {
      Active: true,
      intake: [],
      documents_required: [],
    },
  });
  const { user } = useAuth();
  const selectedCountry = watch("country");
  const selectedUniversityId = watch("university");
  const selectedCourseName = watch("course_name");

  const { data: universities } = useUniversities();
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [showAddUniversityModal, setShowAddUniversityModal] = useState(false);

  useEffect(() => {
    if (universities && selectedCountry) {
      const filtered = universities.filter(
        (uni) => uni.country === selectedCountry && uni.Active
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities([]);
    }

    if (
      !selectedCountry ||
      (selectedUniversityId &&
        universities &&
        !universities.find(
          (uni) =>
            uni.id === selectedUniversityId && uni.country === selectedCountry
        ))
    ) {
      setValue("university", "");
    }
  }, [selectedCountry, universities, setValue, selectedUniversityId]);

  const handleFetchCourseData = async () => {
    if (!selectedCountry || !selectedUniversityId || !selectedCourseName) {
      toast.error(
        "Please enter Course Name and select a Country and University."
      );
      return;
    }
    setFetchingInfo(true);
    toast.loading("Fetching course details from AI...", {
      id: "fetching-course-info",
    });

    try {
      const selectedUniversity = universities.find(
        (uni) => uni.id === selectedUniversityId
      );
      const universityName = selectedUniversity
        ? selectedUniversity.univ_name
        : "unknown university";
      const countryName =
        COUNTRIES.find((c) => c.code === selectedCountry)?.name ||
        selectedCountry;

      const websiteUrl = getValues("website_url");
      let prompt = `Provide detailed information about the course "${selectedCourseName}"`;
      prompt += ` at "${universityName}" in "${countryName}".`;

      if (websiteUrl) {
        prompt += ` Use this URL for reference if it contains relevant course details: ${websiteUrl}.`;
      }

      prompt += `
         Include:
         - Available intakes (e.g., "Fall", "Spring", "Summer" - comma separated, without years. For example, 'Fall, Spring'.).
         - Documents required for application (e.g., "Transcripts", "SOP", "LOR", "Resume" - comma separated). Please use the exact terms if applicable: "Statement of Purpose", "Letters of Recommendation", "CV/Resume", "Passport", "10th Grade Marksheet", "12th Grade Marksheet", "Bachelor's Degree", "Master's Degree", "IELTS/TOEFL Score", "GRE Score", "GMAT Score", "Work Experience Letter", "Financial Documents", "Photographs", "Other".
         - Application deadline (YYYY-MM-DD format if possible, otherwise month/season)
         - Maximum backlogs allowed (numeric)
         - Application fee (numeric, USD if possible)
         - Application fee currency (3-letter currency code, e.g., "USD", "EUR")
         - Yearly tuition fee (numeric, USD if possible)
         - 10th standard percentage/grade requirement (e.g., "70% or above", "A grade")
         - 12th standard percentage/grade requirement (e.g., "75% or above", "B grade")
         - Bachelor's degree requirement (e.g., "3.0 GPA or above", "First Class")
         - Master's degree requirement (e.g., "3.5 GPA or above", "Distinction")
         - IELTS score requirement (e.g., "Overall 6.5, No band below 6.0")
         - TOEFL score requirement (e.g., "Overall 90")
         - PTE score requirement (e.g., "Overall 65")
         - Duolingo score requirement (e.g., "Overall 110")
         - GRE score requirement (e.g., "Verbal 155, Quant 160")
         - GMAT score requirement (e.g., "Overall 650")
         - Any other exam requirements
         - Specialization tags (comma separated, e.g., "Data Science", "AI", "Machine Learning")
         - Any additional notes/remarks about the course.
         - Course Website URL (if different from the one provided or more specific).

         Format the output as a JSON object with keys:
         "intake", "documents_required", "Application_deadline", "Backlogs_allowed",
         "Application_fee", "Application_fee_currency", "Yearly_Tuition_fee",
         "tenth_std_percentage_requirement", "twelfth_std_percentage_requirement",
         "bachelor_requirement", "masters_requirement", "ielts_Exam", "Toefl_Exam",
         "PTE_Exam", "Duolingo_Exam", "Gre_Exam", "Gmat_Exam", "other_exam",
         "specialisation_tag", "Remark", "website_url".
         If a piece of information is not found or not applicable, use a null value for that key.
         `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const fetchedData = JSON.parse(response.choices[0].message.content);

      if (fetchedData.intake && typeof fetchedData.intake === "string") {
        const aiIntakeSeasons = fetchedData.intake
          .split(",")
          .map((item) => item.trim().toLowerCase());
        const matchedIntakes = [];
        INTAKES.forEach((constantIntake) => {
          const constantIntakeSeason = constantIntake.name
            .split(" ")[0]
            .toLowerCase();
          if (aiIntakeSeasons.includes(constantIntakeSeason)) {
            matchedIntakes.push(constantIntake.name);
          }
        });
        setValue("intake", matchedIntakes);
      } else {
        setValue("intake", []);
      }
      if (
        fetchedData.documents_required &&
        typeof fetchedData.documents_required === "string"
      ) {
        const parsedDocs = fetchedData.documents_required
          .split(",")
          .map((item) => item.trim())
          .map((item) => {
            const lowerItem = item.toLowerCase();
            if (
              lowerItem.includes("statement of purpose") ||
              lowerItem === "sop"
            )
              return "Statement of Purpose";
            if (
              lowerItem.includes("letters of recommendation") ||
              lowerItem === "lor"
            )
              return "Letters of Recommendation";
            if (lowerItem.includes("cv") || lowerItem.includes("resume"))
              return "CV/Resume";
            if (lowerItem.includes("passport")) return "Passport";
            if (lowerItem.includes("10th grade marksheet"))
              return "10th Grade Marksheet";
            if (lowerItem.includes("12th grade marksheet"))
              return "12th Grade Marksheet";
            if (lowerItem.includes("bachelor's degree"))
              return "Bachelor's Degree";
            if (lowerItem.includes("master's degree")) return "Master's Degree";
            if (lowerItem.includes("ielts") || lowerItem.includes("toefl"))
              return "IELTS/TOEFL Score";
            if (lowerItem.includes("gre")) return "GRE Score";
            if (lowerItem.includes("gmat")) return "GMAT Score";
            if (lowerItem.includes("work experience"))
              return "Work Experience Letter";
            if (lowerItem.includes("financial documents"))
              return "Financial Documents";
            if (lowerItem.includes("photographs")) return "Photographs";
            return item;
          })
          .filter((item) => DOCUMENTS_REQUIRED.includes(item));
        setValue("documents_required", parsedDocs);
      } else {
        setValue("documents_required", []);
      }
      setValue("Application_deadline", fetchedData.Application_deadline || "");
      setValue(
        "Backlogs_allowed",
        fetchedData.Backlogs_allowed !== null &&
          !isNaN(parseInt(fetchedData.Backlogs_allowed, 10))
          ? parseInt(fetchedData.Backlogs_allowed, 10)
          : null
      );
      setValue(
        "Application_fee",
        fetchedData.Application_fee !== null &&
          !isNaN(parseFloat(fetchedData.Application_fee))
          ? parseFloat(fetchedData.Application_fee)
          : null
      );
      setValue(
        "Application_fee_currency",
        fetchedData.Application_fee_currency || ""
      );
      setValue(
        "Yearly_Tuition_fee",
        fetchedData.Yearly_Tuition_fee !== null &&
          !isNaN(parseFloat(fetchedData.Yearly_Tuition_fee))
          ? parseFloat(fetchedData.Yearly_Tuition_fee)
          : null
      );
      setValue(
        "tenth_std_percentage_requirement",
        fetchedData.tenth_std_percentage_requirement || ""
      );
      setValue(
        "twelfth_std_percentage_requirement",
        fetchedData.twelfth_std_percentage_requirement || ""
      );
      setValue("bachelor_requirement", fetchedData.bachelor_requirement || "");
      setValue("masters_requirement", fetchedData.masters_requirement || "");
      setValue("ielts_Exam", fetchedData.ielts_Exam || "");
      setValue("Toefl_Exam", fetchedData.Toefl_Exam || "");
      setValue("PTE_Exam", fetchedData.PTE_Exam || "");
      setValue("Duolingo_Exam", fetchedData.Duolingo_Exam || "");
      setValue("Gre_Exam", fetchedData.Gre_Exam || "");
      setValue("Gmat_Exam", fetchedData.Gmat_Exam || "");
      setValue("other_exam", fetchedData.other_exam || "");
      setValue("specialisation_tag", fetchedData.specialisation_tag || "");
      setValue("Remark", fetchedData.Remark || "");
      setValue(
        "website_url",
        fetchedData.website_url || getValues("website_url")
      );

      toast.success("Course details fetched successfully!", {
        id: "fetching-course-info",
      });
    } catch (error) {
      console.error("Error fetching course details from OpenAI:", error);
      toast.error("Failed to fetch course details. Please enter manually.", {
        id: "fetching-course-info",
      });
    } finally {
      setFetchingInfo(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const courseData = { ...data, createdBy: user.uid };
      if (editData) {
        await courseService.update(editData.id, courseData);
      } else {
        await courseService.create(courseData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleUniversityAdded = (newUniversity) => {
    setShowAddUniversityModal(false);
    if (newUniversity && newUniversity.id) {
      if (newUniversity.country) {
        setValue("country", newUniversity.country, { shouldValidate: true });
      }
      setValue("university", newUniversity.id, { shouldValidate: true });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h4>
            <button
              type="button"
              onClick={handleFetchCourseData}
              disabled={
                !selectedCourseName ||
                !selectedCountry ||
                !selectedUniversityId ||
                fetchingInfo
              }
              className="btn-secondary flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadCloud size={16} className="mr-2" />
              {fetchingInfo ? "Fetching..." : "Fetch Course Data"}
            </button>
          </div>
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
                disabled={fetchingInfo}
              />
              {errors.course_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.course_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Controller
                name="country"
                control={control}
                rules={{ required: "Country is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    options={COUNTRIES}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("university", "");
                    }}
                    placeholder="Select Country"
                    displayKey="name"
                    valueKey="code"
                    error={errors.country}
                    required={true}
                    disabled={fetchingInfo}
                  />
                )}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  University
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddUniversityModal(true)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                  title="Add New University"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Controller
                name="university"
                control={control}
                rules={{ required: "University is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    options={filteredUniversities}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select University"
                    displayKey="univ_name"
                    valueKey="id"
                    error={errors.university}
                    required={true}
                    disabled={!selectedCountry || fetchingInfo}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Level *
              </label>
              <Controller
                name="course_levels"
                control={control}
                rules={{ required: "Course level is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    options={COURSE_LEVELS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Level"
                    error={errors.course_levels}
                    required={true}
                    disabled={fetchingInfo}
                  />
                )}
              />
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
                disabled={fetchingInfo}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                {...register("specialisation_tag")}
                className="input-field"
                placeholder="e.g., Data Science, AI, Machine Learning"
                disabled={fetchingInfo}
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
                      disabled={fetchingInfo}
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
              <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
                {DOCUMENTS_REQUIRED.map((doc) => (
                  <label key={doc} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      value={doc}
                      {...register("documents_required")}
                      className="mr-2"
                      disabled={fetchingInfo}
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
                disabled={fetchingInfo}
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
                disabled={fetchingInfo}
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
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Fee Currency
              </label>
              <select
                {...register("Application_fee_currency")}
                className="input-field"
                disabled={fetchingInfo}
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
                disabled={fetchingInfo}
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
                10th Standard
              </label>
              <input
                type="text"
                {...register("tenth_std_percentage_requirement")}
                className="input-field"
                placeholder="e.g., 70% or above"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                12th Standard
              </label>
              <input
                type="text"
                {...register("twelfth_std_percentage_requirement")}
                className="input-field"
                placeholder="e.g., 75% or above"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bachelor's
              </label>
              <input
                type="text"
                {...register("bachelor_requirement")}
                className="input-field"
                placeholder="e.g., 3.0 GPA or above"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Master's
              </label>
              <input
                type="text"
                {...register("masters_requirement")}
                className="input-field"
                placeholder="e.g., 3.5 GPA or above"
                disabled={fetchingInfo}
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
                IELTS
              </label>
              <input
                type="text"
                {...register("ielts_Exam")}
                className="input-field"
                placeholder="e.g., Overall 6.5, No band below 6.0"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TOEFL
              </label>
              <input
                type="text"
                {...register("Toefl_Exam")}
                className="input-field"
                placeholder="e.g., Overall 90"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PTE
              </label>
              <input
                type="text"
                {...register("PTE_Exam")}
                className="input-field"
                placeholder="e.g., Overall 65"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duolingo
              </label>
              <input
                type="text"
                {...register("Duolingo_Exam")}
                className="input-field"
                placeholder="e.g., Overall 110"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GRE
              </label>
              <input
                type="text"
                {...register("Gre_Exam")}
                className="input-field"
                placeholder="e.g., Verbal 155, Quant 160"
                disabled={fetchingInfo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GMAT
              </label>
              <input
                type="text"
                {...register("Gmat_Exam")}
                className="input-field"
                placeholder="e.g., Overall 650"
                disabled={fetchingInfo}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Exam
              </label>
              <input
                type="text"
                {...register("other_exam")}
                className="input-field"
                placeholder="Any other specific exam requirements"
                disabled={fetchingInfo}
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
                Notes
              </label>
              <textarea
                {...register("Remark")}
                rows={4}
                className="input-field"
                placeholder="Additional notes about the course..."
                disabled={fetchingInfo}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("Active")}
                className="mr-3"
                disabled={fetchingInfo}
              />
              <label className="text-sm font-medium text-gray-700">
                Active Course
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading || fetchingInfo}
          >
            <X size={16} className="inline mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || fetchingInfo}
          >
            <Save size={16} className="inline mr-1" />
            {fetchingInfo
              ? "Fetching..."
              : loading
              ? "Saving..."
              : editData
              ? "Update"
              : "Create"}
          </button>
        </div>
      </form>
      <Modal
        isOpen={showAddUniversityModal}
        onClose={() => setShowAddUniversityModal(false)}
        title="Add New University"
        size="large"
      >
        <UniversityForm
          onClose={() => setShowAddUniversityModal(false)}
          onSuccess={handleUniversityAdded}
        />
      </Modal>
    </>
  );
};

export default CourseForm;
