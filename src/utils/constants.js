// Countries
export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NZ", name: "New Zealand" },
{ code: "IN", name: "India" },
  { code: "other", name: "Other" },
];

export const EXAM_TYPES = [
  {
    label: "IELTS",
    value: "ielts",
    fields: [
      { name: "listening", label: "Listening", min: 0, max: 9, step: 0.5 },
      { name: "reading", label: "Reading", min: 0, max: 9, step: 0.5 },
      { name: "writing", label: "Writing", min: 0, max: 9, step: 0.5 },
      { name: "speaking", label: "Speaking", min: 0, max: 9, step: 0.5 },
      { name: "overall", label: "Overall", min: 0, max: 9, step: 0.5 },
    ],
  },
  {
    label: "TOEFL",
    value: "toefl",
    fields: [
      { name: "listening", label: "Listening", min: 0, max: 30 },
      { name: "reading", label: "Reading", min: 0, max: 30 },
      { name: "writing", label: "Writing", min: 0, max: 30 },
      { name: "speaking", label: "Speaking", min: 0, max: 30 },
      { name: "overall", label: "Overall", min: 0, max: 120 },
    ],
  },
  {
    label: "PTE",
    value: "pte",
    fields: [
      { name: "listening", label: "Listening", min: 10, max: 90 },
      { name: "reading", label: "Reading", min: 10, max: 90 },
      { name: "writing", label: "Writing", min: 10, max: 90 },
      { name: "speaking", label: "Speaking", min: 10, max: 90 },
      { name: "overall", label: "Overall", min: 10, max: 90 },
    ],
  },
  {
    label: "Duolingo (DET)",
    value: "duolingo",
    fields: [{ name: "overall", label: "Overall Score", min: 10, max: 160 }],
  },
  {
    label: "GRE",
    value: "gre",
    fields: [
      { name: "verbal", label: "Verbal", min: 130, max: 170 },
      { name: "quantitative", label: "Quantitative", min: 130, max: 170 },
      { name: "analytical", label: "Analytical Writing", min: 0, max: 6, step: 0.5 },
    ],
  },
  {
    label: "GMAT",
    value: "gmat",
    fields: [
      { name: "verbal", label: "Verbal", min: 0, max: 60 },
      { name: "quantitative", label: "Quantitative", min: 0, max: 60 },
      { name: "overall", label: "Overall", min: 200, max: 800 },
    ],
  },
  {
    label: "SAT",
    value: "sat",
    fields: [
      { name: "math", label: "Math", min: 200, max: 800 },
      { name: "reading_writing", label: "Reading & Writing", min: 200, max: 800 },
      { name: "overall", label: "Overall", min: 400, max: 1600 },
    ],
  },
  {
    label: "ACT",
    value: "act",
    fields: [
      { name: "english", label: "English", min: 1, max: 36 },
      { name: "math", label: "Math", min: 1, max: 36 },
      { name: "reading", label: "Reading", min: 1, max: 36 },
      { name: "science", label: "Science", min: 1, max: 36 },
      { name: "overall", label: "Overall", min: 1, max: 36 },
    ],
  },
];

// Education Levels
export const EDUCATION_LEVELS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

// Course Levels
export const COURSE_LEVELS = [
  "Certificate",
  "Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree",
  "Professional Degree",
];

// Enquiry Sources
export const ENQUIRY_SOURCES = [
  "Website",
  "Social Media",
  "Referral",
  "Walk-in",
  "Phone Call",
  "Email",
  "Exhibition",
  "Advertisement",
  "Other",
];

// Enquiry Status
export const ENQUIRY_STATUS = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

// Assessment Status
export const ASSESSMENT_STATUS = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

// Application Status
export const APPLICATION_STATUS = [
  "Draft",
  "Submitted",
  "Under Review",
  "Additional Documents Required",
  "Interview Scheduled",
  "Decision Pending",
  "Accepted",
  "Rejected",
  "Waitlisted",
  "Deferred",
];

// Payment Types
export const PAYMENT_TYPES = [
  "Counselling Fee",
  "Application Fee",
  "University Fee",
  "Visa Fee",
  "Service Fee",
  "Documentation Fee",
  "Other",
];

// Payment Status
export const PAYMENT_STATUS = [
  "Pending",
  "Paid",
  "Partially Paid",
  "Refunded",
  "Failed",
  "Cancelled",
];

// Payment Modes
export const PAYMENT_MODES = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Cheque",
  "Online Payment",
  "UPI",
  "Other",
];

// Intakes
export const INTAKES = [
  { name: "Fall 2024", month: "September", year: "2024" },

  { name: "Spring 2025", month: "January", year: "2025" },
  { name: "Summer 2025", month: "May", year: "2025" },
  { name: "Fall 2025", month: "September", year: "2025" },

  { name: "Spring 2026", month: "January", year: "2026" },
  { name: "Summer 2026", month: "May", year: "2026" },
  { name: "Fall 2026", month: "September", year: "2026" },

  { name: "Spring 2027", month: "January", year: "2027" },
  { name: "Summer 2027", month: "May", year: "2027" },
  { name: "Fall 2027", month: "September", year: "2027" },

  { name: "Spring 2028", month: "January", year: "2028" },
  { name: "Summer 2028", month: "May", year: "2028" },
  { name: "Fall 2028", month: "September", year: "2028" },

  { name: "Spring 2029", month: "January", year: "2029" },
  { name: "Summer 2029", month: "May", year: "2029" },
  { name: "Fall 2029", month: "September", year: "2029" },

  { name: "Spring 2030", month: "January", year: "2030" },
  { name: "Summer 2030", month: "May", year: "2030" },
  { name: "Fall 2030", month: "September", year: "2030" },

  { name: "Spring 2031", month: "January", year: "2031" },
  { name: "Summer 2031", month: "May", year: "2031" },
  { name: "Fall 2031", month: "September", year: "2031" },

  { name: "Spring 2032", month: "January", year: "2032" },
  { name: "Summer 2032", month: "May", year: "2032" },
  { name: "Fall 2032", month: "September", year: "2032" },

  { name: "Spring 2033", month: "January", year: "2033" },
  { name: "Summer 2033", month: "May", year: "2033" },
  { name: "Fall 2033", month: "September", year: "2033" },

  { name: "Spring 2034", month: "January", year: "2034" },
  { name: "Summer 2034", month: "May", year: "2034" },
  { name: "Fall 2034", month: "September", year: "2034" },
];

// Documents Required (General)
export const DOCUMENTS_REQUIRED = [
  "Passport",
  "10th Grade Marksheet",
  "12th Grade Marksheet",
  "Bachelor's Degree",
  "Master's Degree",
  "IELTS/TOEFL Score",
  "GRE Score",
  "GMAT Score",
  "Work Experience Letter",
  "Statement of Purpose",
  "Letters of Recommendation",
  "CV/Resume",
  "Financial Documents",
  "Photographs",
  "Other",
];

// Visa Documents Required By Country
export const VISA_DOCUMENT_REQUIREMENTS = {
  US: [
    "Passport_Copy",
    "I-20_Form",
    "SEVIS_Fee_Receipt",
    "DS-160_Confirmation_Page",
    "Appointment_Confirmation",
    "Financial_Statements",
    "Academic_Transcripts",
    "Standardized_Test_Scores",
  ],
  CA: [
    "Passport_Copy",
    "Letter_of_Acceptance",
    "Proof_of_Financial_Support",
    "Passport-sized_Photographs",
    "Medical_Examination_Proof",
    "English_Proficiency_Test_Results",
    "Statement_of_Purpose",
  ],
  GB: [
    "Passport_Copy",
    "Confirmation_of_Acceptance_for_Studies_CAS",
    "Proof_of_Financial_Support",
    "Tuberculosis_TB_Test_Results",
    "Academic_Technology_Approval_Scheme_ATAS_Certificate",
  ],
  AU: [
    "Passport_Copy",
    "Confirmation_of_Enrolment_CoE",
    "Genuine_Temporary_Entrant_GTE_Statement",
    "Proof_of_Financial_Capacity",
    "Health_Insurance_OSHC",
    "English_Proficiency_Test_Results",
  ],
  DE: [
    "Passport_Copy",
    "Letter_of_Admission",
    "Proof_of_Financial_Resources_Blocked_Account",
    "Travel_Health_Insurance",
    "University_Degree_Certificate",
    "Proof_of_Language_Proficiency",
  ],
  other: [
    "Passport_Copy",
    "Letter_of_Acceptance",
    "Financial_Documents",
    "Visa_Application_Form",
    "Passport-sized_Photographs",
  ],
};

// User Roles
export const USER_ROLES = {
  SUPERADMIN: "Superadmin",
  BRANCH_ADMIN: "Branch Admin",
  AGENT: "Agent",
  ACCOUNTANT: "Accountant",
  RECEPTION: "Reception",
  COUNSELLOR: "Counsellor",
  PROCESSOR: "Processor",
};

// Indian States
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Puducherry",
];

// Currency Options
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export const USER_ROLE_LIST = Object.values(USER_ROLES);

// Follow Up Constants
export const FOLLOW_UP_STATUSES = ["Pending", "Completed"];
export const FOLLOW_UP_STEPS = [
  "Enquiry",
  "Detail Enquiry",
  "Assessment",
  "Application",
  "Visa Application",
];

// Define Permissions for each Role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPERADMIN]: {
    canViewAllBranches: true,
    canManageUsers: true,
    canManageBranches: true,
    canViewEnquiries: true,
    canCreateEnquiries: true,
    canUpdateEnquiries: true,
    canDeleteEnquiries: true,
    canViewAssessments: true,
    canCreateAssessments: true,
    canUpdateAssessments: true,
    canDeleteAssessments: true,
    canViewApplications: true,
    canCreateApplications: true,
    canUpdateApplications: true,
    canDeleteApplications: true,
    canViewPayments: true,
    canCreatePayments: true,
    canUpdatePayments: true,
    canDeletePayments: true,
    canViewUniversities: true,
    canManageUniversities: true,
    canViewCourses: true,
    canManageCourses: true,
    canViewReports: true,
    canManageSettings: true,
    canViewChats: true,
    canManageChats: true,
  },
  [USER_ROLES.BRANCH_ADMIN]: {
    canViewAllBranches: false,
    canManageUsers: true, // Within their branch
    canManageBranches: false,
    canViewEnquiries: true,
    canCreateEnquiries: true,
    canUpdateEnquiries: true,
    canDeleteEnquiries: true,
    canViewAssessments: true,
    canCreateAssessments: true,
    canUpdateAssessments: true,
    canDeleteAssessments: true,
    canViewApplications: true,
    canCreateApplications: true,
    canUpdateApplications: true,
    canDeleteApplications: true,
    canViewPayments: true,
    canCreatePayments: true,
    canUpdatePayments: true,
    canDeletePayments: true,
    canViewUniversities: true,
    canManageUniversities: false,
    canViewCourses: true,
    canManageCourses: false,
    canViewReports: true,
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
  [USER_ROLES.AGENT]: {
    canViewAllBranches: false,
    canManageUsers: false,
    canManageBranches: false,
    canViewEnquiries: true,
    canCreateEnquiries: true,
    canUpdateEnquiries: true, // Only assigned ones
    canDeleteEnquiries: false,
    canViewAssessments: false,
    canCreateAssessments: false,
    canUpdateAssessments: false,
    canDeleteAssessments: false,
    canViewApplications: false,
    canCreateApplications: false,
    canUpdateApplications: false,
    canDeleteApplications: false,
    canViewPayments: false,
    canCreatePayments: false,
    canUpdatePayments: false,
    canDeletePayments: false,
    canViewUniversities: true,
    canManageUniversities: false,
    canViewCourses: true,
    canManageCourses: false,
    canViewReports: false,
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
  [USER_ROLES.COUNSELLOR]: {
    canViewAllBranches: false,
    canManageUsers: false,
    canManageBranches: false,
    canViewEnquiries: true, // Only assigned ones
    canCreateEnquiries: true,
    canUpdateEnquiries: true, // Only assigned ones
    canDeleteEnquiries: false,
    canViewAssessments: true, // Only for their enquiries
    canCreateAssessments: false,
    canUpdateAssessments: false,
    canDeleteAssessments: false,
    canViewApplications: true, // Only for their enquiries
    canCreateApplications: false,
    canUpdateApplications: false,
    canDeleteApplications: false,
    canViewPayments: true, // Only for their enquiries
    canCreatePayments: false,
    canUpdatePayments: false,
    canDeletePayments: false,
    canViewUniversities: true,
    canManageUniversities: false,
    canViewCourses: true,
    canManageCourses: false,
    canViewReports: false,
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
  [USER_ROLES.PROCESSOR]: {
    canViewAllBranches: false,
    canManageUsers: false,
    canManageBranches: false,
    canViewEnquiries: false,
    canCreateEnquiries: false,
    canUpdateEnquiries: false,
    canDeleteEnquiries: false,
    canViewAssessments: true, // Only assigned ones
    canCreateAssessments: true,
    canUpdateAssessments: true, // Only assigned ones
    canDeleteAssessments: false,
    canViewApplications: true, // Only assigned ones
    canCreateApplications: true,
    canUpdateApplications: true, // Only assigned ones
    canDeleteApplications: false,
    canViewPayments: false,
    canCreatePayments: false,
    canUpdatePayments: false,
    canDeletePayments: false,
    canViewUniversities: true,
    canManageUniversities: false,
    canViewCourses: true,
    canManageCourses: false,
    canViewReports: false,
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
  [USER_ROLES.RECEPTION]: {
    canViewAllBranches: false,
    canManageUsers: false,
    canManageBranches: false,
    canViewEnquiries: true,
    canCreateEnquiries: true,
    canUpdateEnquiries: true, // Limited fields
    canDeleteEnquiries: false,
    canViewAssessments: false,
    canCreateAssessments: false,
    canUpdateAssessments: false,
    canDeleteAssessments: false,
    canViewApplications: false,
    canCreateApplications: false,
    canUpdateApplications: false,
    canDeleteApplications: false,
    canViewPayments: true,
    canCreatePayments: true,
    canUpdatePayments: true, // Only their own payments
    canDeletePayments: false,
    canViewUniversities: true,
    canManageUniversities: false,
    canViewCourses: true,
    canManageCourses: false,
    canViewReports: false,
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
  [USER_ROLES.ACCOUNTANT]: {
    canViewAllBranches: false,
    canManageUsers: false,
    canManageBranches: false,
    canViewEnquiries: false,
    canCreateEnquiries: false,
    canUpdateEnquiries: false,
    canDeleteEnquiries: false,
    canViewAssessments: false,
    canCreateAssessments: false,
    canUpdateAssessments: false,
    canDeleteAssessments: false,
    canViewApplications: false,
    canCreateApplications: false,
    canUpdateApplications: false,
    canDeleteApplications: false,
    canViewPayments: true,
    canCreatePayments: true,
    canUpdatePayments: true,
    canDeletePayments: true,
    canViewUniversities: false,
    canManageUniversities: false,
    canViewCourses: false,
    canManageCourses: false,
    canViewReports: true, // Financial reports
    canManageSettings: false,
    canViewChats: true,
    canManageChats: false,
  },
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions[permission] : false;
};

export default {
  COUNTRIES,
  EDUCATION_LEVELS,
  COURSE_LEVELS,
  ENQUIRY_SOURCES,
  ENQUIRY_STATUS,
  ASSESSMENT_STATUS,
  APPLICATION_STATUS,
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  PAYMENT_MODES,
  INTAKES,
  DOCUMENTS_REQUIRED,
  VISA_DOCUMENT_REQUIREMENTS,
  USER_ROLES,
  USER_ROLE_LIST,
  INDIAN_STATES,
  CURRENCIES,
  ROLE_PERMISSIONS,
  hasPermission,
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_STEPS,
};
