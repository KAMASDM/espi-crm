import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm, useFieldArray } from "react-hook-form";
import app from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { useServices } from "../../hooks/useFirestore";
import { firestoreService } from "../../services/firestore";
import {
  COUNTRIES,
  ENQUIRY_STATUS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
} from "../../utils/constants";
import {
  X,
  Plus,
  Upload,
  Trash2,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  User,
  DollarSign,
  Flag,
} from "lucide-react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage(app);

const STEPS = [
  {
    id: 1,
    name: "Academic Background",
    fields: [
      "current_education_details",
      "tenth_education_details",
      "twelveth_education_details",
      "graduation_education_details",
      "academics",
    ],
  },
  {
    id: 2,
    name: "Test Scores",
    fields: ["exams"],
  },
  { id: 3, name: "Work Experience", fields: ["workExperiences"] },
  {
    id: 4,
    name: "Personal & Financial",
    fields: ["father_Occupation", "father_Annual_Income", "refusals"],
  },
  {
    id: 5,
    name: "Document Uploads",
    fields: [
      "tenth_Document",
      "twelveth_Document",
      "graduation_Marksheet",
      "graduation_Certificate",
      "ug_Marksheet",
      "ug_Certificate",
      "work_Experience_Document",
      "passport_Document",
      "offer_Letter",
      "ielts_Result",
      "toefl_Result",
      "pte_Result",
      "duolingo_Result",
      "gre_Result",
      "gmat_Result",
    ],
  },
  {
    id: 6,
    name: "Services & Status",
    fields: ["confirmed_services", "enquiry_status"],
  },
  { id: 7, name: "Review & Submit" },
];

const DOCUMENT_FIELD_KEYS = [
  "tenth_Document",
  "twelveth_Document",
  "graduation_Marksheet",
  "graduation_Certificate",
  "ug_Marksheet",
  "ug_Certificate",
  "work_Experience_Document",
  "passport_Document",
  "offer_Letter",
  "ielts_Result",
  "toefl_Result",
  "pte_Result",
  "duolingo_Result",
  "gre_Result",
  "gmat_Result",
];

const Step1Academics = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "academics",
  });

  return (
    <div className="space-y-6">
      <div>
        <h5 className="text-md font-semibold text-gray-700 mb-3">
          Current Education
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Level
            </label>
            <select
              {...register("current_education_details.level")}
              className={`input-field ${
                errors?.current_education_details?.level ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Level</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors?.current_education_details?.level && (
              <p className="text-red-500 text-xs mt-1">
                {errors.current_education_details.level.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div>
        <h5 className="text-md font-semibold text-gray-700 mb-3 mt-6">
          10th Grade Details
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage
            </label>
            <input
              type="number"
              step="0.01"
              {...register("tenth_education_details.percentage")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Passing
            </label>
            <input
              type="number"
              {...register("tenth_education_details.year")}
              className="input-field"
              placeholder="YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              type="text"
              {...register("tenth_education_details.institute")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board
            </label>
            <input
              type="text"
              {...register("tenth_education_details.board")}
              className="input-field"
            />
          </div>
        </div>
      </div>
      <div>
        <h5 className="text-md font-semibold text-gray-700 mb-3 mt-6">
          12th Grade Details
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <select
              {...register("twelveth_education_details.stream")}
              className="input-field"
            >
              <option value="">Select Stream</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage
            </label>
            <input
              type="number"
              step="0.01"
              {...register("twelveth_education_details.percentage")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Passing
            </label>
            <input
              type="number"
              {...register("twelveth_education_details.year")}
              className="input-field"
              placeholder="YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              type="text"
              {...register("twelveth_education_details.institute")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board
            </label>
            <input
              type="text"
              {...register("twelveth_education_details.board")}
              className="input-field"
            />
          </div>
        </div>
      </div>
      <div>
        <h5 className="text-md font-semibold text-gray-700 mb-3 mt-6">
          Graduation Details (if applicable)
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree
            </label>
            <input
              type="text"
              {...register("graduation_education_details.degree")}
              className="input-field"
              placeholder="e.g., B.Tech, B.Com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              {...register("graduation_education_details.stream")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage/CGPA
            </label>
            <input
              type="number"
              step="0.01"
              {...register("graduation_education_details.percentage")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Passing
            </label>
            <input
              type="number"
              {...register("graduation_education_details.year")}
              className="input-field"
              placeholder="YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name
            </label>
            <input
              type="text"
              {...register("graduation_education_details.institute")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <input
              type="text"
              {...register("graduation_education_details.university")}
              className="input-field"
            />
          </div>
        </div>
      </div>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border border-gray-300 rounded-lg p-4 mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-md font-semibold text-gray-700">
              Additional Academic Record {index + 1}
            </h5>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree
              </label>
              <input
                {...register(`academics.${index}.degree`)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University
              </label>
              <input
                {...register(`academics.${index}.university`)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Passing
              </label>
              <input
                type="number"
                {...register(`academics.${index}.year`)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ degree: "", university: "", year: "" })}
        className="btn-secondary flex items-center mt-4"
      >
        <Plus size={16} className="mr-2" />
        Add Another Academic Record
      </button>
    </div>
  );
};

const Step2TestScores = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exams",
  });
  const [selectedExamType, setSelectedExamType] = useState("");

  const handleAddExam = () => {
    if (selectedExamType) {
      append({ type: selectedExamType, scores: {} });
      setSelectedExamType("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Exam to Add
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="input-field"
          >
            <option value="">-- Choose an Exam --</option>
            <option value="ielts">IELTS</option>
            <option value="toefl">TOEFL</option>
            <option value="pte">PTE</option>
            <option value="gre">GRE</option>
            <option value="gmat">GMAT</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddExam}
          disabled={!selectedExamType}
          className="btn-primary"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => {
          const examConfig = EXAM_TYPES.find((e) => e.value === field.type);
          if (!examConfig) return null;

          return (
            <div key={field.id} className="p-4 border rounded-md bg-gray-50/50">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-gray-800 text-md">
                  {examConfig.label} Scores
                </h5>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {examConfig.fields.map((scoreField) => (
                  <div key={scoreField.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {scoreField.label}
                    </label>
                    <input
                      type="number"
                      step={scoreField.step || "any"}
                      min={scoreField.min}
                      max={scoreField.max}
                      {...register(`exams.${index}.scores.${scoreField.name}`)}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Step3WorkExperience = ({ control, register, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperiences",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Work Experience</h4>
        <button
          type="button"
          onClick={() =>
            append({
              companyName: "",
              designation: "",
              startDate: "",
              endDate: "",
              ongoing: false,
            })
          }
          className="btn-secondary flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Add Experience
        </button>
      </div>
      {fields.map((field, index) => {
        const isOngoing = watch(`workExperiences.${index}.ongoing`);
        return (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">
                Experience {index + 1}
              </h5>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register(`workExperiences.${index}.companyName`)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  {...register(`workExperiences.${index}.designation`)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register(`workExperiences.${index}.startDate`)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register(`workExperiences.${index}.endDate`)}
                  className="input-field"
                  disabled={isOngoing}
                />
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`workExperiences.${index}.ongoing`)}
                      className="mr-2"
                    />
                    <span className="text-sm">Ongoing</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No work experience added. Click 'Add Experience' to include details.
        </p>
      )}
    </div>
  );
};

const Step4FamilyAndRefusal = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "refusals",
  });

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Family Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father's Occupation
            </label>
            <input
              type="text"
              {...register("father_Occupation")}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father's Annual Income (₹)
            </label>
            <input
              type="number"
              {...register("father_Annual_Income", { valueAsNumber: true })}
              className="input-field"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Refusal History
          </h4>
          <button
            type="button"
            onClick={() =>
              append({
                country: "",
                date: "",
                visa_category: "",
                reason: "",
              })
            }
            className="btn-secondary flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" /> Add Refusal
          </button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50/50 mb-4"
          >
            <div className="flex justify-between items-center md:col-span-2">
              <h5 className="font-medium text-gray-900">Refusal {index + 1}</h5>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                {...register(`refusals.${index}.country`)}
                className="input-field"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refusal Date
              </label>
              <input
                type="date"
                {...register(`refusals.${index}.date`)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Category Refused
              </label>
              <input
                type="text"
                {...register(`refusals.${index}.visa_category`)}
                className="input-field"
                placeholder="e.g., Student Visa, Tourist Visa"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refusal Reason
              </label>
              <textarea
                {...register(`refusals.${index}.reason`)}
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No refusal history added. Click 'Add Refusal' if applicable.
          </p>
        )}
      </div>
    </div>
  );
};

const Step5Documents = ({ FileUploadField }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-900 mb-4">
      Document Uploads
    </h4>
    <p className="text-xs text-gray-500 mb-3">
      Please upload relevant documents. PDF format is accepted.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FileUploadField
        name="tenth_Document"
        label="10th Grade Certificate"
        accept=".pdf"
      />
      <FileUploadField
        name="twelveth_Document"
        label="12th Grade Certificate"
        accept=".pdf"
      />
      <FileUploadField
        name="graduation_Marksheet"
        label="Graduation Marksheet(s)"
        accept=".pdf"
      />
      <FileUploadField
        name="graduation_Certificate"
        label="Graduation Certificate"
        accept=".pdf"
      />
      <FileUploadField
        name="ug_Marksheet"
        label="All UG Marksheets (if applicable)"
        accept=".pdf"
      />
      <FileUploadField
        name="ug_Certificate"
        label="UG Degree Certificate (if applicable)"
        accept=".pdf"
      />
      <FileUploadField
        name="work_Experience_Document"
        label="Work Experience Letter(s)"
        accept=".pdf"
      />
      <FileUploadField
        name="passport_Document"
        label="Passport (First & Last Page)"
        accept=".pdf"
      />
      <FileUploadField
        name="offer_Letter"
        label="Offer Letter (if any)"
        accept=".pdf"
      />
      <FileUploadField name="ielts_Result" label="IELTS TRF" accept=".pdf" />
      <FileUploadField
        name="toefl_Result"
        label="TOEFL Score Report"
        accept=".pdf"
      />
      <FileUploadField
        name="pte_Result"
        label="PTE Score Report"
        accept=".pdf"
      />
      <FileUploadField
        name="duolingo_Result"
        label="Duolingo Test Report"
        accept=".pdf"
      />
      <FileUploadField
        name="gre_Result"
        label="GRE Score Report"
        accept=".pdf"
      />
      <FileUploadField
        name="gmat_Result"
        label="GMAT Score Report"
        accept=".pdf"
      />
    </div>
  </div>
);

const Step6ServicesAndStatus = ({ services, register }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Confirmed Services
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg">
        {services.map(({ serviceName, servicePrice }, index) => (
          <label key={index} className="flex items-center">
            <input
              type="checkbox"
              value={serviceName}
              {...register("confirmed_services")}
              className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{serviceName}</span>
            <span className="ml-auto text-sm text-gray-500">
              (₹{servicePrice.toLocaleString()})
            </span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Status Update for Detailed Profile
      </h4>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Status
        </label>
        <select {...register("enquiry_status")} className="input-field">
          {ENQUIRY_STATUS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

const Step7Review = ({ getValues, uploadedDocumentsDisplay }) => {
  const formData = getValues();

  const renderObject = (obj, title, icon) => (
    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        <h6 className="text-sm font-semibold text-gray-700">{title}</h6>
      </div>
      <div className="space-y-1">
        {Object.entries(obj || {}).map(
          ([key, value]) =>
            (value || value === 0 || typeof value === "boolean") && (
              <div key={key} className="flex text-xs">
                <span className="capitalize font-medium text-gray-600 min-w-[120px]">
                  {key
                    .replace(/_/g, " ")
                    .replace(/([A-Z])/g, " $1")
                    .trim()}
                  :
                </span>
                <span className="text-gray-800 ml-2 break-words">
                  {typeof value === "object" &&
                  value !== null &&
                  !Array.isArray(value)
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            )
        )}
        {Object.values(obj || {}).every(
          (val) => !val && val !== 0 && typeof val !== "boolean"
        ) && <p className="text-xs text-gray-400 italic">Not provided</p>}
      </div>
    </div>
  );

  const renderArrayOfObjects = (arr, title, icon) => (
    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        <h6 className="text-sm font-semibold text-gray-700">{title}</h6>
      </div>
      <div className="space-y-2">
        {(arr || []).map((item, index) => (
          <div
            key={index}
            className="ml-2 p-2 border border-gray-100 rounded bg-gray-50 text-xs"
          >
            {Object.entries(item).map(
              ([key, value]) =>
                (value || value === 0) && (
                  <div key={key} className="flex mb-1 last:mb-0">
                    <span className="capitalize font-medium text-gray-600 min-w-[100px]">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/_/g, " ")
                        .trim()}
                      :
                    </span>
                    <span className="text-gray-800 ml-2 break-words">
                      {String(value)}
                    </span>
                  </div>
                )
            )}
          </div>
        ))}
        {(!arr ||
          arr.length === 0 ||
          (arr.length === 1 &&
            !Object.values(arr[0]).some((v) => v || v === 0))) && (
          <p className="text-xs text-gray-400 italic">Not provided</p>
        )}
      </div>
    </div>
  );

  const renderSimpleField = (value, title, icon, isCurrency = false) => (
    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-1">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        <h6 className="text-sm font-semibold text-gray-700">{title}</h6>
      </div>
      <p className="text-xs text-gray-800 ml-6">
        {isCurrency && value ? `₹${value.toLocaleString()}` : value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start p-3 bg-yellow-50 rounded-md border border-yellow-100">
        <AlertTriangle
          className="flex-shrink-0 text-yellow-600 mt-0.5 mr-2"
          size={16}
        />
        <p className="text-sm text-yellow-700">
          Please review all the information carefully before submitting.
          Documents will be uploaded upon submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {renderObject(
            formData.current_education_details,
            "Current Education",
            <BookOpen size={16} />
          )}
          {renderArrayOfObjects(
            formData.academics,
            "Academic History",
            <GraduationCap size={16} />
          )}
          {renderArrayOfObjects(
            formData.workExperiences,
            "Work Experience",
            <Briefcase size={16} />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {renderArrayOfObjects(formData.exams, "Exams", <Award size={16} />)}
          {renderArrayOfObjects(
            formData.refusals,
            "Refusal History",
            <Flag size={16} />
          )}

          {renderSimpleField(
            formData.father_Occupation,
            "Father's Occupation",
            <User size={16} />
          )}
          {renderSimpleField(
            formData.father_Annual_Income,
            "Father's Income",
            <DollarSign size={16} />,
            true
          )}
          {renderSimpleField(
            formData.confirmed_services?.join(", "),
            "Confirmed Services",
            <CheckCircle size={16} />
          )}
          {renderSimpleField(
            formData.enquiry_status,
            "Profile Status",
            <Clock size={16} />
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          <FileText size={18} className="text-gray-600 mr-2" />
          <h5 className="text-md font-semibold text-gray-700">
            Selected Documents
          </h5>
        </div>

        {Object.keys(uploadedDocumentsDisplay).length > 0 ||
        DOCUMENT_FIELD_KEYS.some((key) => getValues(key)) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOCUMENT_FIELD_KEYS.map((key) => {
              const documentName =
                uploadedDocumentsDisplay[key] || formData[key];
              if (documentName) {
                return (
                  <div
                    key={key}
                    className="p-3 bg-gray-50 rounded border border-gray-200 flex items-start space-x-2 hover:bg-gray-100 transition-colors"
                  >
                    <FileText
                      size={14}
                      className="text-gray-600 flex-shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-700 text-xs truncate">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/_/g, " ")
                          .replace(
                            / (Document|Result|Certificate|Marksheet|Letter)/g,
                            ""
                          )
                          .trim()}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {typeof documentName === "string"
                          ? documentName
                          : "File selected"}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            No documents selected for upload.
          </p>
        )}
      </div>
    </div>
  );
};

const DetailEnquiryForm = ({
  onClose,
  onSuccess,
  selectedEnquiry,
  editData = null,
}) => {
  const totalSteps = STEPS.length;
  const { user } = useAuth();
  const { data: services } = useServices();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filesToUpload, setFilesToUpload] = useState({});
  const [uploadedDocumentsDisplay, setUploadedDocumentsDisplay] = useState({});

  const defaultValues = {
    Current_Enquiry: selectedEnquiry?.id || "",
    current_education_details: editData?.current_education_details || {
      level: selectedEnquiry?.current_education || "",
    },
    academics: editData?.academics || [],
    workExperiences:
      editData?.workExperiences && editData.workExperiences.length > 0
        ? editData.workExperiences
        : [
            {
              companyName: "",
              designation: "",
              startDate: "",
              endDate: "",
              ongoing: false,
            },
          ],
    exams: editData?.exams || [],
    father_Occupation: editData?.father_Occupation || "",
    father_Annual_Income: editData?.father_Annual_Income || null,
    refusals: editData?.refusals || [],
    ...DOCUMENT_FIELD_KEYS.reduce((acc, key) => {
      acc[key] = editData?.[key] ? uploadedDocumentsDisplay[key] : "";
      return acc;
    }, {}),
    confirmed_services:
      editData?.confirmed_services ||
      selectedEnquiry?.Interested_Services ||
      [],
    enquiry_status:
      editData?.enquiry_status ||
      selectedEnquiry?.enquiry_status ||
      "Profile Under Review",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, touchedFields, dirtyFields },
    trigger,
    getValues,
    reset,
    watch,
  } = useForm({
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    const initialFormValues = { ...defaultValues };

    if (editData) {
      Object.keys(editData).forEach((key) => {
        if (DOCUMENT_FIELD_KEYS.includes(key)) {
          if (editData[key] && typeof editData[key] === "string") {
            const fileUrlOrName = editData[key];
            let displayName = "Attached Document";
            if (
              fileUrlOrName.startsWith("https://firebasestorage.googleapis.com")
            ) {
              try {
                const url = new URL(fileUrlOrName);
                const pathParts = url.pathname.split("/");
                const encodedNameWithStoragePath = decodeURIComponent(
                  pathParts[pathParts.length - 1]
                );
                const actualEncodedName = encodedNameWithStoragePath
                  .split("%2F")
                  .pop();
                displayName = actualEncodedName.split("?")[0];
                if (
                  displayName.includes("_") &&
                  /^\d+_/.test(displayName.split("/").pop())
                ) {
                  displayName = displayName.substring(
                    displayName.indexOf("_") + 1
                  );
                }
              } catch (e) {
                console.warn(
                  "Could not parse filename from URL",
                  fileUrlOrName,
                  e
                );
              }
            } else {
              displayName = fileUrlOrName;
            }
            initialFormValues[key] = displayName;
            setUploadedDocumentsDisplay((prev) => ({
              ...prev,
              [key]: displayName,
            }));
            setFilesToUpload((prev) => ({ ...prev, [key]: fileUrlOrName }));
          } else {
            initialFormValues[key] = "";
          }
        } else if (editData[key] !== undefined) {
          initialFormValues[key] = editData[key];
        }
      });
      if (editData.workExperiences && editData.workExperiences.length > 0) {
        initialFormValues.workExperiences = editData.workExperiences;
      } else {
        initialFormValues.workExperiences = [
          {
            companyName: "",
            designation: "",
            startDate: "",
            endDate: "",
            ongoing: false,
          },
        ];
      }
    } else if (selectedEnquiry) {
      initialFormValues.current_education_details.level =
        selectedEnquiry.current_education || "";
      initialFormValues.confirmed_services =
        selectedEnquiry.Interested_Services || [];
      initialFormValues.enquiry_status =
        selectedEnquiry.enquiry_status || "Profile Under Review";
    }
    reset(initialFormValues);
  }, [editData, selectedEnquiry, reset]);

  const nextStep = async () => {
    const stepFields = STEPS.find((s) => s.id === currentStep)?.fields || [];
    const validationPromises = [];
    if (stepFields.length > 0) {
      stepFields.forEach((field) => {
        if (
          typeof getValues(field) === "object" &&
          getValues(field) !== null &&
          !Array.isArray(getValues(field)) &&
          !(getValues(field) instanceof File)
        ) {
          Object.keys(getValues(field)).forEach((subField) => {
            if (
              errors[field]?.[subField] ||
              touchedFields[field]?.[subField] ||
              dirtyFields[field]?.[subField]
            ) {
              validationPromises.push(trigger(`${field}.${subField}`));
            }
          });
        } else {
          if (errors[field] || touchedFields[field] || dirtyFields[field]) {
            validationPromises.push(trigger(field));
          }
        }
      });
    }

    const results =
      validationPromises.length > 0
        ? await Promise.all(validationPromises)
        : [true];
    const isValid = results.every(Boolean);

    if (isValid && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else if (!isValid) {
      toast.error(
        "Please fill all required fields in this section correctly.",
        { id: "validationError" }
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmitHandler = async (formDataFromHook) => {
    if (!user || !user.uid) {
      setLoading(false);
      toast.error("User not authenticated.");
      return;
    }
    if (!selectedEnquiry || !selectedEnquiry.id) {
      setLoading(false);
      toast.error("No enquiry selected for update.");
      return;
    }

    setLoading(true);
    const toastIdSubmit = toast.loading(
      editData ? "Updating profile..." : "Creating profile..."
    );

    try {
      const newDocumentURLs = {};
      const uploadPromises = [];

      for (const fieldName in filesToUpload) {
        const fileOrUrl = filesToUpload[fieldName];
        if (fileOrUrl instanceof File) {
          const file = fileOrUrl;
          if (file.type !== "application/pdf") {
            toast.error(`Only PDF files are accepted for ${file.name}.`);
            setLoading(false);
            return;
          }

          const uploadToastId = toast.loading(`Uploading ${file.name}...`, {
            duration: 10000,
          });

          const enquiryIdForPath = selectedEnquiry.id;
          const storageFilePath = `detailEnquiries/${enquiryIdForPath}/${fieldName}/${Date.now()}_${
            file.name
          }`;
          const fileStorageRef = ref(storage, storageFilePath);

          const uploadTask = uploadBytesResumable(fileStorageRef, file);

          uploadPromises.push(
            new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {},
                (error) => {
                  console.error("Upload error:", error);
                  toast.error(
                    `Upload failed for ${file.name}: ${error.message}`,
                    {
                      id: uploadToastId,
                    }
                  );
                  reject(
                    new Error(
                      `Upload failed for ${file.name}: ${error.message}`
                    )
                  );
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL) => {
                      newDocumentURLs[fieldName] = downloadURL;
                      toast.success(`${file.name} uploaded!`, {
                        id: uploadToastId,
                      });
                      resolve();
                    })
                    .catch((error) => {
                      console.error("Get download URL error:", error);
                      toast.error(
                        `Failed to get download URL for ${file.name}`,
                        {
                          id: uploadToastId,
                        }
                      );
                      reject(error);
                    });
                }
              );
            })
          );
        }
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      const dataToSave = { ...formDataFromHook };

      DOCUMENT_FIELD_KEYS.forEach((fieldName) => {
        let urlToSave = "";
        if (newDocumentURLs[fieldName]) {
          urlToSave = newDocumentURLs[fieldName];
        } else if (
          filesToUpload[fieldName] &&
          typeof filesToUpload[fieldName] === "string"
        ) {
          urlToSave = filesToUpload[fieldName];
        }
        dataToSave[fieldName] = urlToSave;
      });

      dataToSave.Current_Enquiry = selectedEnquiry.id;
      dataToSave.lastUpdatedBy = user.uid;

      if (editData && editData.id) {
        await firestoreService.update(
          "detailEnquiries",
          editData.id,
          dataToSave
        );
        toast.success("Detailed profile updated successfully!", {
          id: toastIdSubmit,
        });
      } else {
        dataToSave.createdBy = user.uid;
        await firestoreService.create("detailEnquiries", dataToSave);
        toast.success("Detailed profile created successfully!", {
          id: toastIdSubmit,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit detailed profile.", { id: toastIdSubmit });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted.");
        return;
      }
      setFilesToUpload((prev) => ({ ...prev, [fieldName]: file }));
      setUploadedDocumentsDisplay((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
      setValue(fieldName, file.name, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      toast.success(`${file.name} selected. Ready for upload.`);
    }
  };

  const removeDocument = (fieldName) => {
    setFilesToUpload((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setUploadedDocumentsDisplay((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setValue(fieldName, "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    toast.info(
      `Document for ${fieldName
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()} removed.`
    );
  };

  const FileUploadFieldComponent = ({ name, label, accept = ".pdf" }) => {
    const currentFileDisplayName = uploadedDocumentsDisplay[name];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {currentFileDisplayName ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText
                    className="text-green-600 flex-shrink-0"
                    size={24}
                  />
                  <span
                    className="text-sm text-green-600 truncate max-w-xs"
                    title={currentFileDisplayName}
                  >
                    {currentFileDisplayName.length > 25
                      ? `${currentFileDisplayName.slice(0, 22)}...`
                      : currentFileDisplayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(name)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium py-1 px-2 rounded-md bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <X size={14} className="inline mr-1" /> Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-gray-400" size={24} />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor={`${name}-file-input-applicationform`}
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id={`${name}-file-input-applicationform`}
                      name={name}
                      type="file"
                      className="sr-only"
                      accept={accept}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(name, e.target.files[0]);
                        }
                        e.target.value = null;
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF files</p>
              </>
            )}
          </div>
        </div>
        {errors[name] && (
          <p className="text-red-600 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-6 max-h-[calc(100vh-150px)] overflow-y-auto"
      noValidate
    >
      <div className="sticky top-0 bg-white py-3 px-1 sm:px-0 z-10 border-b mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Detailed Profile for {selectedEnquiry?.student_First_Name}{" "}
          {selectedEnquiry?.student_Last_Name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}:{" "}
            <span className="font-semibold">
              {STEPS.find((s) => s.id === currentStep)?.name}
            </span>
          </p>
          <div className="flex space-x-1">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-6 h-1 rounded-full ${
                  currentStep >= step.id ? "bg-primary-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-1 sm:px-0">
        {currentStep === 1 && (
          <Step1Academics
            control={control}
            register={register}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2TestScores control={control} register={register} />
        )}
        {currentStep === 3 && (
          <Step3WorkExperience
            control={control}
            register={register}
            watch={watch}
          />
        )}
        {currentStep === 4 && (
          <Step4FamilyAndRefusal control={control} register={register} />
        )}
        {currentStep === 5 && (
          <Step5Documents FileUploadField={FileUploadFieldComponent} />
        )}
        {currentStep === 6 && (
          <Step6ServicesAndStatus
            register={register}
            services={services.filter((service) => service.isActive)}
          />
        )}
        {currentStep === 7 && (
          <Step7Review
            getValues={getValues}
            uploadedDocumentsDisplay={uploadedDocumentsDisplay}
          />
        )}
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8 px-1 sm:px-0">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <div className="flex items-center space-x-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center"
              disabled={loading}
            >
              <ArrowLeft size={18} className="mr-1" /> Previous
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center"
              disabled={loading}
            >
              Next <ArrowRight size={18} className="ml-1" />
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <CheckCircle size={18} className="mr-1" /> Confirm & Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default DetailEnquiryForm;
