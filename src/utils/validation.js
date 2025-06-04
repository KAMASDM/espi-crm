// Form validation utilities for the Education CRM

// Basic validation functions
export const required = (value) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return "This field is required";
  }
  if (Array.isArray(value) && value.length === 0) {
    return "Please select at least one option";
  }
  return null;
};

export const email = (value) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : "Please enter a valid email address";
};

export const phone = (value) => {
  if (!value) return null;
  const phoneRegex = /^[0-9]{10}$/;
  const cleanPhone = value.replace(/\D/g, "");
  return phoneRegex.test(cleanPhone)
    ? null
    : "Please enter a valid 10-digit phone number";
};

export const url = (value) => {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return "Please enter a valid URL";
  }
};

export const minLength = (min) => (value) => {
  if (!value) return null;
  return value.length >= min ? null : `Must be at least ${min} characters long`;
};

export const maxLength = (max) => (value) => {
  if (!value) return null;
  return value.length <= max
    ? null
    : `Must be no more than ${max} characters long`;
};

export const minValue = (min) => (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  return numValue >= min ? null : `Must be at least ${min}`;
};

export const maxValue = (max) => (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  return numValue <= max ? null : `Must be no more than ${max}`;
};

export const numeric = (value) => {
  if (!value) return null;
  return !isNaN(value) && !isNaN(parseFloat(value))
    ? null
    : "Must be a valid number";
};

export const integer = (value) => {
  if (!value) return null;
  return Number.isInteger(Number(value)) ? null : "Must be a whole number";
};

export const positiveNumber = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  return numValue > 0 ? null : "Must be a positive number";
};

// Date validation
export const futureDate = (value) => {
  if (!value) return null;
  const inputDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today ? null : "Date must be in the future";
};

export const pastDate = (value) => {
  if (!value) return null;
  const inputDate = new Date(value);
  const today = new Date();
  return inputDate <= today ? null : "Date must be in the past or today";
};

export const dateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end ? null : "End date must be after start date";
};

// Education CRM specific validations
export const studentName = (value) => {
  if (!value) return required(value);
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(value)
    ? null
    : "Name can only contain letters, spaces, hyphens, and apostrophes";
};

export const percentage = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 0 && numValue <= 100
    ? null
    : "Percentage must be between 0 and 100";
};

export const gpa = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 0 && numValue <= 4.0
    ? null
    : "GPA must be between 0 and 4.0";
};

export const ieltsScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 0 && numValue <= 9.0
    ? null
    : "IELTS score must be between 0 and 9.0";
};

export const toeflScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 0 && numValue <= 120
    ? null
    : "TOEFL score must be between 0 and 120";
};

export const greScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 130 && numValue <= 170
    ? null
    : "GRE score must be between 130 and 170";
};

export const gmatScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 200 && numValue <= 800
    ? null
    : "GMAT score must be between 200 and 800";
};

export const pteScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 10 && numValue <= 90
    ? null
    : "PTE score must be between 10 and 90";
};

export const duolingoScore = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid number";
  return numValue >= 10 && numValue <= 160
    ? null
    : "Duolingo score must be between 10 and 160";
};

export const yearOfPassing = (value) => {
  if (!value) return null;
  const numValue = parseInt(value);
  const currentYear = new Date().getFullYear();
  if (isNaN(numValue)) return "Must be a valid year";
  return numValue >= 1950 && numValue <= currentYear + 5
    ? null
    : `Year must be between 1950 and ${currentYear + 5}`;
};

export const applicationFee = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid amount";
  return numValue >= 0 ? null : "Application fee cannot be negative";
};

export const tuitionFee = (value) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Must be a valid amount";
  return numValue >= 0 ? null : "Tuition fee cannot be negative";
};

// File validation
export const fileSize = (maxSizeInMB) => (file) => {
  if (!file) return null;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes
    ? null
    : `File size must be less than ${maxSizeInMB}MB`;
};

export const fileType = (allowedTypes) => (file) => {
  if (!file) return null;
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  const isAllowed = allowedTypes.some((type) => {
    if (type.includes("/")) {
      return fileType === type;
    } else {
      return fileName.endsWith(`.${type}`);
    }
  });

  return isAllowed
    ? null
    : `File type must be one of: ${allowedTypes.join(", ")}`;
};

// Composite validation functions
export const validateEnquiryForm = (data) => {
  const errors = {};

  // Personal information
  if (!data.student_First_Name)
    errors.student_First_Name = required(data.student_First_Name);
  else errors.student_First_Name = studentName(data.student_First_Name);

  if (!data.student_Last_Name)
    errors.student_Last_Name = required(data.student_Last_Name);
  else errors.student_Last_Name = studentName(data.student_Last_Name);

  errors.student_phone =
    required(data.student_phone) || phone(data.student_phone);
  errors.student_email =
    required(data.student_email) || email(data.student_email);
  errors.current_education = required(data.current_education);
  errors.country_interested = required(data.country_interested);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

export const validateUniversityForm = (data) => {
  const errors = {};

  errors.univ_name = required(data.univ_name);
  errors.country = required(data.country);

  if (data.univ_email) errors.univ_email = email(data.univ_email);
  if (data.univ_website) errors.univ_website = url(data.univ_website);
  if (data.Application_fee)
    errors.Application_fee = applicationFee(data.Application_fee);
  if (data.Backlogs_allowed)
    errors.Backlogs_allowed = integer(data.Backlogs_allowed);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

export const validateCourseForm = (data) => {
  const errors = {};

  errors.course_name = required(data.course_name);
  errors.country = required(data.country);
  errors.university = required(data.university);
  errors.course_levels = required(data.course_levels);

  if (data.website_url) errors.website_url = url(data.website_url);
  if (data.Application_fee)
    errors.Application_fee = applicationFee(data.Application_fee);
  if (data.Yearly_Tuition_fee)
    errors.Yearly_Tuition_fee = tuitionFee(data.Yearly_Tuition_fee);
  if (data.Backlogs_allowed)
    errors.Backlogs_allowed = integer(data.Backlogs_allowed);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

export const validateAssessmentForm = (data) => {
  const errors = {};

  errors.enquiry = required(data.enquiry);
  errors.student_country = required(data.student_country);
  errors.university = required(data.university);
  errors.level_applying_for = required(data.level_applying_for);

  if (data.application_fee)
    errors.application_fee = applicationFee(data.application_fee);
  if (data.tution_fee) errors.tution_fee = tuitionFee(data.tution_fee);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

export const validateApplicationForm = (data) => {
  const errors = {};

  errors.application = required(data.application);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

export const validatePaymentForm = (data) => {
  const errors = {};

  errors.Memo_For = required(data.Memo_For);
  errors.Payment_Type = required(data.Payment_Type);
  errors.payment_date = required(data.payment_date);
  errors.payment_amount =
    required(data.payment_amount) || positiveNumber(data.payment_amount);
  errors.payment_mode = required(data.payment_mode);
  errors.payment_status = required(data.payment_status);
  errors.Payment_For = required(data.Payment_For);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => value !== null)
  );
};

// Generic form validator
export const validateForm = (data, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const rules = Array.isArray(validationRules[field])
      ? validationRules[field]
      : [validationRules[field]];

    for (const rule of rules) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

// Validation rule builder
export const createValidationRules = (rules) => {
  const validationRules = {};

  Object.keys(rules).forEach((field) => {
    validationRules[field] = [];

    if (rules[field].required) {
      validationRules[field].push(required);
    }

    if (rules[field].email) {
      validationRules[field].push(email);
    }

    if (rules[field].phone) {
      validationRules[field].push(phone);
    }

    if (rules[field].url) {
      validationRules[field].push(url);
    }

    if (rules[field].minLength) {
      validationRules[field].push(minLength(rules[field].minLength));
    }

    if (rules[field].maxLength) {
      validationRules[field].push(maxLength(rules[field].maxLength));
    }

    if (rules[field].min) {
      validationRules[field].push(minValue(rules[field].min));
    }

    if (rules[field].max) {
      validationRules[field].push(maxValue(rules[field].max));
    }

    if (rules[field].numeric) {
      validationRules[field].push(numeric);
    }

    if (rules[field].positive) {
      validationRules[field].push(positiveNumber);
    }

    if (rules[field].custom) {
      validationRules[field].push(rules[field].custom);
    }
  });

  return validationRules;
};
