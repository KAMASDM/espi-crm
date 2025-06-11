import React from "react";
import {
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  IndianRupee,
  Info,
  MapPin,
  Clock,
  TrendingUp,
  BookOpen,
  Building,
  Badge,
  Shield,
} from "lucide-react";
import InfoCard from "./DetailComponents/InfoCard";
import ScoreCard from "./DetailComponents/ScoreCard";
import StatusBadge from "./DetailComponents/StatusBadge";
import ModernSection from "./DetailComponents/ModernSection";
import ExperienceTimeline from "./DetailComponents/ExperienceTimeline";
import DocumentLibrarySection from "./DetailComponents/DocumentLibrarySection";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
];

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString();
};

const EnquiryDetail = ({ detailEnquiry }) => {
  const getCountryName = (countryCode) =>
    COUNTRIES.find((c) => c.code === countryCode)?.name;

  if (!detailEnquiry) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg text-center">
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Profile Data Found
        </h3>
      </div>
    );
  }

  const {
    current_education_details = {},
    tenth_education_details = {},
    twelveth_education_details = {},
    workExperiences = [],
    toefl_exam = {},
    ielts_exam = {},
    pte_exam = {},
    duolingo_exam = {},
    gre_exam = {},
    gmat_exam = {},
    father_Occupation,
    father_Annual_Income,
    refusal_details = {},
    confirmed_services = [],
    enquiry_status,
    updatedAt,
    tenth_Document,
    twelveth_Document,
    graduation_Marksheet,
    graduation_Certificate,
    ug_Marksheet,
    ug_Certificate,
    work_Experience_Document,
    passport_Document,
    offer_Letter,
    ielts_Result,
    toefl_Result,
    pte_Result,
    duolingo_Result,
    gre_Result,
    gmat_Result,
  } = detailEnquiry;

  return (
    <div className="min-h-screen  from-blue-50 via-white to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Profile Overview
            </h1>
            <p className="text-gray-600">
              Comprehensive academic and professional profile
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status={enquiry_status} />
          </div>
        </div>
        {updatedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              Last updated:{" "}
              {formatDate(
                updatedAt.toDate ? updatedAt.toDate() : updatedAt,
                "PP pp"
              )}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-8">
        <ModernSection
          title="Current Education"
          icon={GraduationCap}
          accentColor="blue"
          badge={current_education_details.level}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Education Level",
                value: current_education_details.level,
                icon: Badge,
              },
              {
                label: "Stream/Specialization",
                value: current_education_details.stream,
                icon: BookOpen,
              },
              {
                label: "Percentage/CGPA",
                value: current_education_details.percentage,
                icon: TrendingUp,
              },
              {
                label: "Year of Passing",
                value: current_education_details.year,
                icon: Calendar,
              },
              {
                label: "Institute",
                value: current_education_details.institute,
                icon: Building,
              },
              {
                label: "Medium",
                value: current_education_details.medium,
                icon: Info,
              },
            ].map(({ label, value, icon }) => (
              <InfoCard
                key={label}
                label={label}
                value={value}
                icon={icon}
                highlight
              />
            ))}
          </div>
        </ModernSection>
        <ModernSection
          title="Academic History"
          icon={BookOpen}
          accentColor="green"
          defaultExpanded={false}
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">10th Grade</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Percentage",
                    value: tenth_education_details.percentage,
                  },
                  { label: "Year", value: tenth_education_details.year },
                  { label: "School", value: tenth_education_details.institute },
                  { label: "Board", value: tenth_education_details.board },
                ].map(({ label, value }) => (
                  <InfoCard key={label} label={label} value={value} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">12th Grade</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Stream", value: twelveth_education_details.stream },
                  {
                    label: "Percentage",
                    value: twelveth_education_details.percentage,
                  },
                  { label: "Year", value: twelveth_education_details.year },
                  {
                    label: "School",
                    value: twelveth_education_details.institute,
                  },
                ].map(({ label, value }) => (
                  <InfoCard key={label} label={label} value={value} />
                ))}
              </div>
            </div>
          </div>
        </ModernSection>
        <ModernSection
          title="Test Scores"
          icon={Award}
          accentColor="purple"
          badge={
            ielts_exam.overall ? `IELTS ${ielts_exam.overall}` : "Various Tests"
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "IELTS", value: ielts_exam, colorScheme: "green" },
              { label: "TOEFL", value: toefl_exam, colorScheme: "blue" },
              { label: "PTE", value: pte_exam, colorScheme: "purple" },
              {
                label: "Duolingo",
                value: duolingo_exam,
                colorScheme: "orange",
              },
              { label: "GRE", value: gre_exam, colorScheme: "blue" },
              { label: "GMAT", value: gmat_exam, colorScheme: "green" },
            ].map(({ label, value, colorScheme }) => (
              <ScoreCard
                key={label}
                title={label}
                scores={value}
                colorScheme={colorScheme}
              />
            ))}
          </div>
        </ModernSection>
        <ModernSection
          title="Work Experience"
          icon={Briefcase}
          accentColor="orange"
          badge={`${workExperiences.length} ${
            workExperiences.length === 1 ? "Role" : "Roles"
          }`}
        >
          <ExperienceTimeline experiences={workExperiences} />
        </ModernSection>
        <ModernSection
          title="Family Information"
          icon={Users}
          accentColor="blue"
          defaultExpanded={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: "Father's Occupation",
                value: father_Occupation,
                icon: Briefcase,
              },
              {
                label: "Father's Annual Income",
                value: father_Annual_Income,
                icon: IndianRupee,
                isCurrency: true,
                highlight: true,
              },
            ].map(({ label, value, icon, isCurrency, highlight }) => (
              <InfoCard
                key={label}
                label={label}
                value={value}
                icon={icon}
                isCurrency={isCurrency}
                highlight={highlight}
              />
            ))}
          </div>
        </ModernSection>
        {(refusal_details.country || refusal_details.reason) && (
          <ModernSection
            title="Visa Refusal History"
            icon={AlertTriangle}
            accentColor="red"
          >
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Country",
                    value: getCountryName(refusal_details.country),
                    icon: MapPin,
                  },
                  {
                    label: "Date",
                    value: formatDate(refusal_details.date),
                    icon: Calendar,
                  },
                  {
                    label: "Visa Category",
                    value: refusal_details.visa_category,
                    icon: Shield,
                  },
                ].map(({ label, value, icon }) => (
                  <InfoCard
                    key={label}
                    label={label}
                    value={value}
                    icon={icon}
                  />
                ))}
              </div>
              {refusal_details.reason && (
                <div className="mt-4">
                  <InfoCard
                    label="Reason for Refusal"
                    value={refusal_details.reason}
                  />
                </div>
              )}
            </div>
          </ModernSection>
        )}
        <ModernSection
          title="Document Library"
          icon={FileText}
          accentColor="gray"
          badge="15 Documents"
        >
          <DocumentLibrarySection
            documents={[
              {
                label: "10th Certificate",
                docNameValue: tenth_Document,
              },
              {
                label: "12th Certificate",
                docNameValue: twelveth_Document,
              },
              {
                label: "Graduation Marksheet",
                docNameValue: graduation_Marksheet,
              },
              {
                label: "Graduation Certificate",
                docNameValue: graduation_Certificate,
              },
              { label: "UG Marksheet", docNameValue: ug_Marksheet },
              {
                label: "UG Certificate",
                docNameValue: ug_Certificate,
              },
              {
                label: "Work Experience Letter",
                docNameValue: work_Experience_Document,
              },
              {
                label: "Passport",
                docNameValue: passport_Document,
              },
              { label: "Offer Letter", docNameValue: offer_Letter },
              { label: "IELTS TRF", docNameValue: ielts_Result },
              { label: "TOEFL Report", docNameValue: toefl_Result },
              { label: "PTE Report", docNameValue: pte_Result },
              {
                label: "Duolingo Report",
                docNameValue: duolingo_Result,
              },
              { label: "GRE Report", docNameValue: gre_Result },
              { label: "GMAT Report", docNameValue: gmat_Result },
            ]}
          />
        </ModernSection>
        <ModernSection
          title="Confirmed Services"
          icon={CheckCircle}
          accentColor="green"
          badge={`${confirmed_services.length} Services`}
        >
          {confirmed_services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confirmed_services.map((service, index) => (
                <div
                  key={index}
                  className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium text-green-900">{service}</h4>
                      <p className="text-sm text-green-700">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No services confirmed yet</p>
            </div>
          )}
        </ModernSection>
      </div>
    </div>
  );
};

export default EnquiryDetail;
