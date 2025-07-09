import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Save,
  X,
  ChevronDown,
  Search,
  DownloadCloud,
  FileText,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { universityService } from "../../services/firestore";
import { COUNTRIES, COURSE_LEVELS } from "../../utils/constants";
import OpenAI from "openai";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
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
    if (!value) return "";
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
          }`}
          onClick={handleInputClick}
        >
          <span className={`flex-1 ${!value ? "text-gray-500" : ""}`}>
            {getDisplayValue() || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        {required && (
          <span className="absolute -top-2 -right-2 text-red-500">*</span>
        )}
      </div>

      {isOpen && (
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
                className="w-full pl-9 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

const UniversityForm = ({ onClose, onSuccess, editData = null }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: editData || {
      moi_accepted: false,
      Active: true,
      levels: [],
    },
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [brochureFile, setBrochureFile] = useState(null);
  const [newsletterFile, setNewsletterFile] = useState(null);
  const [brochureFileName, setBrochureFileName] = useState("");
  const [newsletterFileName, setNewsletterFileName] = useState("");

  const univName = watch("univ_name");
  const countryCode = watch("country");

  useEffect(() => {
    if (editData?.brochure) {
      setBrochureFileName(editData.brochure.split("%2F").pop().split("?")[0]);
    }
    if (editData?.newsletter) {
      setNewsletterFileName(
        editData.newsletter.split("%2F").pop().split("?")[0]
      );
    }
  }, [editData]);

  const handleFetchUniversityData = async () => {
    if (!univName || !countryCode) {
      toast.error("Please enter University Name and select a Country first.");
      return;
    }

    setFetchingInfo(true);
    toast.loading("Fetching university details...", {
      id: "fetching-uni-info",
    });

    try {
      const countryName =
        COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;
      const currentYear = new Date().getFullYear();
      const prompt = `Provide detailed information about the university "${univName}" in "${countryName}".
        Include its typical application deadline for the current admission cycle (in YYYY-MM-dd format, using ${currentYear} if an exact date is not available),
        general admission requirements (e.g., minimum GPA, test scores like IELTS/TOEFL if applicable),
        course levels offered by this university - select from these options only: ${COURSE_LEVELS.join(
          ", "
        )} (return as comma-separated string of applicable levels),
        typical application fees (numeric, USD if possible),
        a brief description,
        official website link,
        general contact phone number,
        general contact email,
        maximum number of backlogs allowed (numeric),
        and the direct application form link.
        Format the output as a JSON object with keys:
        "deadline", "Admission_Requirements", "levels", "Application_fee", "univ_desc",
        "univ_website", "univ_phone", "univ_email", "Backlogs_allowed", "Application_form_link".
        For the "levels" field, only use values from this list: ${COURSE_LEVELS.join(
          ", "
        )}. Return them as a comma-separated string.
        If a piece of information is not found or not applicable, use a null value for that key.
        If you find an older deadline, please adjust it to reflect the ${currentYear} admission cycle.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const fetchedData = JSON.parse(response.choices[0].message.content);

      setValue("deadline", fetchedData.deadline || "");
      setValue(
        "Admission_Requirements",
        fetchedData.Admission_Requirements || ""
      );
      let formattedAdmissionReqs = "";
      if (fetchedData.Admission_Requirements) {
        if (
          typeof fetchedData.Admission_Requirements === "object" &&
          fetchedData.Admission_Requirements !== null
        ) {
          const reqs = fetchedData.Admission_Requirements;
          if (reqs.IELTS_score) {
            formattedAdmissionReqs += `IELTS Score: ${reqs.IELTS_score}\n`;
          }
          if (reqs.TOEFL_score) {
            formattedAdmissionReqs += `TOEFL Score: ${reqs.TOEFL_score}\n`;
          }
          if (reqs.minimum_GPA) {
            formattedAdmissionReqs += `Minimum GPA: ${reqs.minimum_GPA}\n`;
          }
        } else if (typeof fetchedData.Admission_Requirements === "string") {
          formattedAdmissionReqs = fetchedData.Admission_Requirements;
        } else {
          formattedAdmissionReqs = JSON.stringify(
            fetchedData.Admission_Requirements
          );
        }
      }
      setValue("Admission_Requirements", formattedAdmissionReqs);

      if (fetchedData.levels) {
        let parsedLevels = [];

        if (typeof fetchedData.levels === "string") {
          parsedLevels = fetchedData.levels
            .split(",")
            .map((level) => level.trim())
            .filter((level) => COURSE_LEVELS.includes(level));
        } else if (Array.isArray(fetchedData.levels)) {
          parsedLevels = fetchedData.levels
            .map((level) => level.trim())
            .filter((level) => COURSE_LEVELS.includes(level));
        }
        setValue("levels", parsedLevels);
      } else {
        setValue("levels", []);
      }
      setValue(
        "Application_fee",
        fetchedData.Application_fee !== null &&
          !isNaN(parseFloat(fetchedData.Application_fee))
          ? parseFloat(fetchedData.Application_fee)
          : null
      );
      setValue("univ_desc", fetchedData.univ_desc || "");
      setValue("univ_website", fetchedData.univ_website || "");
      setValue("univ_phone", fetchedData.univ_phone || "");
      setValue("univ_email", fetchedData.univ_email || "");
      setValue(
        "Backlogs_allowed",
        fetchedData.Backlogs_allowed !== null &&
          !isNaN(parseInt(fetchedData.Backlogs_allowed, 10))
          ? parseInt(fetchedData.Backlogs_allowed, 10)
          : null
      );
      setValue(
        "Application_form_link",
        fetchedData.Application_form_link || ""
      );

      toast.success("University details fetched successfully!", {
        id: "fetching-uni-info",
      });
    } catch (error) {
      console.error("Error fetching university details from OpenAI:", error);
      toast.error(
        "Failed to fetch university details. Please enter manually.",
        { id: "fetching-uni-info" }
      );
    } finally {
      setFetchingInfo(false);
    }
  };

  const uploadFile = async (file, fileType) => {
    if (!file) return null;

    try {
      const storage = getStorage();
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(
        storage,
        `university-files/${fileType}/${fileName}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          () => resolve()
        );
      });

      return await getDownloadURL(uploadTask.snapshot.ref);
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast.error(`Failed to upload ${fileType}`);
      return null;
    }
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Brochure file size exceeds 10MB limit");
        return;
      }
      setBrochureFile(file);
      setBrochureFileName(file.name);
    }
  };

  const handleNewsletterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Newsletter file size exceeds 10MB limit");
        return;
      }
      setNewsletterFile(file);
      setNewsletterFileName(file.name);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      toast.loading("Saving university data...", { id: "saving-university" });

      const uploads = [];
      if (brochureFile) {
        uploads.push(
          uploadFile(brochureFile, "brochures").then((url) => {
            data.brochure = url;
          })
        );
      }
      if (newsletterFile) {
        uploads.push(
          uploadFile(newsletterFile, "newsletters").then((url) => {
            data.newsletter = url;
          })
        );
      }

      await Promise.all(uploads);

      const universityData = {
        ...data,
        assigned_users: user.uid,
        createdBy: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (editData) {
        await universityService.update(editData.id, universityData);
        toast.success("University updated successfully!", {
          id: "saving-university",
        });
      } else {
        universityData.createdAt = new Date().toISOString();
        await universityService.create(universityData);
        toast.success("University created successfully!", {
          id: "saving-university",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving university:", error);
      toast.error("Failed to save university. Please try again.", {
        id: "saving-university",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h4>
          <button
            type="button"
            onClick={handleFetchUniversityData}
            disabled={!univName || !countryCode || fetchingInfo}
            className="btn-secondary flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadCloud size={16} className="mr-2" />
            {fetchingInfo ? "Fetching..." : "Fetch University Data"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Name *
            </label>
            <input
              type="text"
              {...register("univ_name", {
                required: "University name is required",
              })}
              className="input-field"
            />
            {errors.univ_name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.univ_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={COUNTRIES}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Country"
                  displayKey="name"
                  valueKey="code"
                  error={errors.country}
                  required={true}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
            <input
              type="text"
              {...register("campus")}
              className="input-field"
              placeholder="e.g., Main Campus, Downtown"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              {...register("deadline")}
              className="input-field"
              disabled={fetchingInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register("univ_phone")}
              className="input-field"
              disabled={fetchingInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("univ_email")}
              className="input-field"
              disabled={fetchingInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              {...register("univ_website")}
              className="input-field"
              placeholder="https://university.edu"
              disabled={fetchingInfo}
            />
          </div>
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Description
            </label>
            <textarea
              {...register("univ_desc")}
              rows={4}
              className="input-field"
              placeholder="Brief description of the university..."
              disabled={fetchingInfo}
            />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Levels Offered
            </label>
            <Controller
              name="levels"
              control={control}
              render={({ field: { value = [], onChange } }) => (
                <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
                  {COURSE_LEVELS.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onChange([...value, level]);
                          } else {
                            onChange(value.filter((item) => item !== level));
                          }
                        }}
                        className="mr-2"
                        disabled={fetchingInfo}
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Form Link
            </label>
            <input
              type="url"
              {...register("Application_form_link")}
              className="input-field"
              placeholder="https://university.edu/apply"
              disabled={fetchingInfo}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Requirements
            </label>
            <textarea
              {...register("Admission_Requirements")}
              rows={4}
              className="input-field"
              placeholder="Detailed admission requirements..."
              disabled={fetchingInfo}
            />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("moi_accepted")}
              className="mr-3"
              disabled={fetchingInfo}
            />
            <label className="text-sm font-medium text-gray-700">
              Medium of Instruction Accepted
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("Active")}
              className="mr-3"
              disabled={fetchingInfo}
            />
            <label className="text-sm font-medium text-gray-700">
              Active University
            </label>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brochure
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {brochureFileName ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="text-green-500" />
                    <span className="text-sm text-gray-700">
                      {brochureFileName}
                    </span>
                  </div>
                ) : (
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="brochure-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="brochure-upload"
                      name="brochure-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleBrochureChange}
                      accept=".pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Newsletter
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {newsletterFileName ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="text-green-500" />
                    <span className="text-sm text-gray-700">
                      {newsletterFileName}
                    </span>
                  </div>
                ) : (
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="newsletter-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="newsletter-upload"
                      name="newsletter-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleNewsletterChange}
                      accept=".pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("Remark")}
              rows={3}
              className="input-field"
              placeholder="Additional notes about the university..."
              disabled={fetchingInfo}
            />
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
  );
};

export default UniversityForm;
