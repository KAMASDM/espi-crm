import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  GraduationCap,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  submitEnquiry,
  getActiveServices,
} from "../../hooks/servicesforSaperateEnquiryForm/api";
import {
  EDUCATION_LEVELS,
  INDIAN_STATES,
  INTAKES,
} from "../../utils/constants";
import img from "../../assets/espi.png";
import { useCountries } from "../../hooks/useFirestore";

const Enquiry = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      enquiry_status: "New",
    },
  });
  const { data: countries} = useCountries();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Personal Information",
      icon: User,
      fields: ["student_First_Name", "student_Last_Name", "student_passport"],
    },
    {
      title: "Contact Details",
      icon: Phone,
      fields: [
        "student_email",
        "student_phone",
        "alternate_phone",
        "student_country",
        "student_state",
        "student_city",
        "student_address",
      ],
    },
    {
      title: "Education & Interests",
      icon: GraduationCap,
      fields: [
        "current_education",
        "intake_interested",
        "country_interested",
        "Interested_Services",
      ],
    },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const activeServices = await getActiveServices();
        setServices(activeServices);
      } catch (error) {
        toast.error("Could not load available services.");
      }
    };
    fetchServices();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const toastId = toast.loading("Submitting your enquiry...");

    try {
      await submitEnquiry(data);
      toast.success("Your enquiry has been submitted successfully!", {
        id: toastId,
      });
      reset();
      setCurrentStep(0);
    } catch (error) {
      toast.error(
        "There was an error submitting your form. Please try again.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields;
    const isValid = await trigger(currentFields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const isStepValid = (stepIndex) => {
    const stepFields = steps[stepIndex].fields;
    const requiredFields = [
      "student_First_Name",
      "student_Last_Name",
      "student_email",
      "student_phone",
      "current_education",
      "country_interested",
    ];

    return stepFields.every((field) => {
      if (requiredFields.includes(field)) {
        const value = watch(field);
        return (
          value &&
          (Array.isArray(value) ? value.length > 0 : value.trim() !== "")
        );
      }
      return true;
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="student_First_Name"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Last Name"
                name="student_Last_Name"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Passport Number"
                name="student_passport"
                register={register}
                errors={errors}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Email Address"
                name="student_email"
                type="email"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Phone Number"
                name="student_phone"
                type="tel"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Alternate Phone"
                name="alternate_phone"
                type="tel"
                register={register}
                errors={errors}
              />
              <SelectField
                label="Country"
                name="student_country"
                register={register}
                errors={errors}
                options={countries.map((c) => c.name)}
              />
              <SelectField
                label="State"
                name="student_state"
                register={register}
                errors={errors}
                options={INDIAN_STATES}
              />
              <InputField
                label="City"
                name="student_city"
                register={register}
                errors={errors}
              />
            </div>
            <div className="mt-6">
              <label
                htmlFor="student_address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                id="student_address"
                {...register("student_address")}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Current Education"
                name="current_education"
                register={register}
                errors={errors}
                options={EDUCATION_LEVELS}
                required
              />
              <SelectField
                label="Intake Interested"
                name="intake_interested"
                register={register}
                errors={errors}
                options={INTAKES.map((i) => i.name)}
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Countries Interested *
              </label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                {countries.map((country) => (
                  <label
                    key={country.code}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      value={country.countryCode}
                      {...register("country_interested", {
                        required: "Please select at least one country",
                      })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {country.country}
                    </span>
                  </label>
                ))}
              </div>
              {errors.country_interested && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.country_interested.message}
                </p>
              )}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Services Interested
              </label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      value={service.serviceName}
                      {...register("Interested_Services")}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {service.serviceName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="text-center p-8">
          <img src={img} alt="" className="mx-auto block" height={100} />
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Your Gateway to Global Education
          </h2>
          <p className="text-gray-500">
            Complete this form to connect with our expert counselors.
          </p>
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isValid = isStepValid(index);

              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center text-center w-32">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : isValid
                          ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          : "bg-gray-200 text-gray-400"
                      }`}
                      onClick={() => goToStep(index)}
                    >
                      {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    </div>

                    <div className="mt-2 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        Step {index + 1}
                      </p>
                      <p
                        className={`text-xs ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 ">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-6">
                {React.createElement(steps[currentStep].icon, {
                  className: "h-6 w-6 text-blue-500",
                })}
                <h3 className="ml-3 text-xl font-semibold text-gray-800">
                  {steps[currentStep].title}
                </h3>
              </div>

              {renderStepContent()}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Next
                  <ChevronRight size={20} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:bg-green-400"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Submit Enquiry
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  type = "text",
  register,
  errors,
  required,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1">
      <input
        type={type}
        id={name}
        {...register(name, { required: required && `${label} is required` })}
        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
    {errors[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>
    )}
  </div>
);

const SelectField = ({ label, name, register, errors, options, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1">
      <select
        id={name}
        {...register(name, { required: required && `${label} is required` })}
        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    {errors[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>
    )}
  </div>
);

export default Enquiry;
