import { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Building,
  Badge,
  Shield,
  Eye,
} from "lucide-react";

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

const formatCurrency = (amount, code = "INR") => {
  if (!amount) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ModernSection = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  badge,
  accentColor = "blue",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const gradientClasses = {
    blue: "from-blue-50 to-indigo-50 border-blue-100",
    green: "from-green-50 to-emerald-50 border-green-100",
    purple: "from-purple-50 to-indigo-50 border-purple-100",
    orange: "from-orange-50 to-amber-50 border-orange-100",
    red: "from-red-50 to-pink-50 border-red-100",
    gray: "from-gray-50 to-slate-50 border-gray-100",
  };

  return (
    <div
      className={`bg-gradient-to-r ${gradientClasses[accentColor]} rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {Icon && (
            <div className={`p-3 rounded-full bg-white shadow-sm mr-4`}>
              <Icon className={`text-${accentColor}-600`} size={24} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {title}
              {badge && (
                <span
                  className={`ml-3 px-2 py-1 text-xs font-medium rounded-full bg-${accentColor}-100 text-${accentColor}-800`}
                >
                  {badge}
                </span>
              )}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">{children}</div>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({
  label,
  value,
  icon: Icon,
  isCurrency = false,
  currencyCode = "INR",
  highlight = false,
}) => (
  <div
    className={`p-4 rounded-lg border ${
      highlight ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
    } transition-colors hover:bg-gray-100`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          {Icon && <Icon size={14} className="text-gray-400 mr-2" />}
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        </div>
        <p
          className={`text-sm font-medium ${
            highlight ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {value !== undefined && value !== null && value !== "" ? (
            isCurrency ? (
              formatCurrency(value, currencyCode)
            ) : (
              String(value)
            )
          ) : (
            <span className="italic text-gray-400">Not specified</span>
          )}
        </p>
      </div>
    </div>
  </div>
);

const ScoreCard = ({ title, scores, colorScheme = "blue" }) => {
  const hasScores = scores && Object.values(scores).some((s) => s);

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
  };

  if (!hasScores) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
          <Award size={16} className="mr-2" />
          {title}
        </h4>
        <p className="text-sm text-gray-500 italic">Not taken</p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[colorScheme]}`}>
      <h4 className="font-semibold mb-3 flex items-center">
        <Award size={16} className="mr-2" />
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(scores).map(
          ([key, value]) =>
            value && (
              <div key={key} className="text-center">
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs uppercase tracking-wide opacity-75">
                  {key === "overall" ? "Overall" : key.charAt(0).toUpperCase()}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

const ModernDocumentCard = ({
  label,
  docNameValue,
  storageUrl,
  onDownload,
  onView,
}) => {
  const isUploaded = docNameValue;

  return (
    <div
      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isUploaded
          ? "border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className={`p-2 rounded-lg mr-3 ${
              isUploaded ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <FileText
              size={18}
              className={isUploaded ? "text-green-600" : "text-gray-400"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-medium text-gray-900 truncate"
              title={label}
            >
              {label}
            </h4>
            {isUploaded && (
              <p
                className="text-xs text-green-600 truncate"
                title={docNameValue}
              >
                {docNameValue}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isUploaded ? (
            <>
              <CheckCircle size={18} className="text-green-500" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={() => onView?.(label, storageUrl || docNameValue)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title={`View ${label}`}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() =>
                    onDownload?.(label, storageUrl || docNameValue)
                  }
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title={`Download ${label}`}
                >
                  <Download size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-amber-500 mr-1" />
              <span className="text-xs text-amber-600 font-medium">
                Missing
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    New: { color: "blue", icon: Star },
    "In Progress": { color: "yellow", icon: Clock },
    "Profile Under Review": { color: "orange", icon: Eye },
    Completed: { color: "green", icon: CheckCircle },
  };

  const config = statusConfig[status] || { color: "gray", icon: Info };
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
    >
      <Icon size={14} className="mr-2" />
      {status}
    </div>
  );
};

const ExperienceTimeline = ({ experiences }) => {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">No work experience provided</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <div key={index} className="relative pl-8 pb-6 last:pb-0">
          {index < experiences.length - 1 && (
            <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200"></div>
          )}
          <div className="absolute left-0 top-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {exp.designation}
                </h4>
                <p className="text-blue-600 font-medium">{exp.companyName}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>
                  {exp.startDate ? formatDate(exp.startDate, "MMM yyyy") : ""}
                </div>
                <div>to</div>
                <div>
                  {exp.endDate
                    ? formatDate(exp.endDate, "MMM yyyy")
                    : "Present"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EnquiryDetail = ({ detailEnquiry, onDownload }) => {
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
            <InfoCard
              label="Education Level"
              value={current_education_details.level}
              icon={Badge}
              highlight
            />
            <InfoCard
              label="Stream/Specialization"
              value={current_education_details.stream}
              icon={BookOpen}
            />
            <InfoCard
              label="Percentage/CGPA"
              value={current_education_details.percentage}
              icon={TrendingUp}
            />
            <InfoCard
              label="Year of Passing"
              value={current_education_details.year}
              icon={Calendar}
            />
            <InfoCard
              label="Institute"
              value={current_education_details.institute}
              icon={Building}
            />
            <InfoCard
              label="Medium"
              value={current_education_details.medium}
              icon={Info}
            />
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
                <InfoCard
                  label="Percentage"
                  value={tenth_education_details.percentage}
                />
                <InfoCard label="Year" value={tenth_education_details.year} />
                <InfoCard
                  label="School"
                  value={tenth_education_details.institute}
                />
                <InfoCard label="Board" value={tenth_education_details.board} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">12th Grade</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard
                  label="Stream"
                  value={twelveth_education_details.stream}
                />
                <InfoCard
                  label="Percentage"
                  value={twelveth_education_details.percentage}
                />
                <InfoCard
                  label="Year"
                  value={twelveth_education_details.year}
                />
                <InfoCard
                  label="School"
                  value={twelveth_education_details.institute}
                />
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
            <ScoreCard title="IELTS" scores={ielts_exam} colorScheme="green" />
            <ScoreCard title="TOEFL" scores={toefl_exam} colorScheme="blue" />
            <ScoreCard title="PTE" scores={pte_exam} colorScheme="purple" />
            <ScoreCard
              title="Duolingo"
              scores={duolingo_exam}
              colorScheme="orange"
            />
            <ScoreCard title="GRE" scores={gre_exam} colorScheme="blue" />
            <ScoreCard title="GMAT" scores={gmat_exam} colorScheme="green" />
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
            <InfoCard
              label="Father's Occupation"
              value={father_Occupation}
              icon={Briefcase}
            />
            <InfoCard
              label="Father's Annual Income"
              value={father_Annual_Income}
              icon={DollarSign}
              isCurrency={true}
              highlight
            />
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
                <InfoCard
                  label="Country"
                  value={getCountryName(refusal_details.country)}
                  icon={MapPin}
                />
                <InfoCard
                  label="Date"
                  value={
                    refusal_details.date ? formatDate(refusal_details.date) : ""
                  }
                  icon={Calendar}
                />
                <InfoCard
                  label="Visa Category"
                  value={refusal_details.visa_category}
                  icon={Shield}
                />
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
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Info className="text-blue-600 mr-2" size={20} />
              <p className="text-blue-800 text-sm">
                Document management system with preview and download
                capabilities. Files are securely stored and accessible only to
                authorized users.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModernDocumentCard
              label="10th Certificate"
              docNameValue={tenth_Document}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="12th Certificate"
              docNameValue={twelveth_Document}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Graduation Marksheet"
              docNameValue={graduation_Marksheet}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Graduation Certificate"
              docNameValue={graduation_Certificate}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="UG Marksheet"
              docNameValue={ug_Marksheet}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="UG Certificate"
              docNameValue={ug_Certificate}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Work Experience Letter"
              docNameValue={work_Experience_Document}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Passport"
              docNameValue={passport_Document}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Offer Letter"
              docNameValue={offer_Letter}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="IELTS TRF"
              docNameValue={ielts_Result}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="TOEFL Report"
              docNameValue={toefl_Result}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="PTE Report"
              docNameValue={pte_Result}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="Duolingo Report"
              docNameValue={duolingo_Result}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="GRE Report"
              docNameValue={gre_Result}
              onDownload={onDownload}
            />
            <ModernDocumentCard
              label="GMAT Report"
              docNameValue={gmat_Result}
              onDownload={onDownload}
            />
          </div>
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
