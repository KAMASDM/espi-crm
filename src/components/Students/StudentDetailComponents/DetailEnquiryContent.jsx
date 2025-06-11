import React from "react";
import { Info } from "lucide-react";
import DocumentsCard from "./DocumentsCard";
import ExamScoresSection from "./ExamScoresSection";
import WorkExperienceCard from "./WorkExperienceCard";
import FinancialOtherInfoCard from "./FinancialOtherInfoCard";
import ConfirmedServicesCard from "./ConfirmedServicesCard";
import EducationalDetailsSection from "./EducationalDetailsSection";

const DetailEnquiryContent = ({ selectedDetailEnquiry }) => {
  if (!selectedDetailEnquiry) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-600 h-full flex flex-col items-center justify-center min-h-[200px]">
        <Info size={48} className="text-gray-300 mb-3" />
        <p>No detailed enquiry information available for this student.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EducationalDetailsSection
        selectedDetailEnquiry={selectedDetailEnquiry}
      />
      <ExamScoresSection selectedDetailEnquiry={selectedDetailEnquiry} />
      <WorkExperienceCard
        workExperiences={selectedDetailEnquiry.workExperiences}
      />
      <FinancialOtherInfoCard selectedDetailEnquiry={selectedDetailEnquiry} />
      <DocumentsCard selectedDetailEnquiry={selectedDetailEnquiry} />
      <ConfirmedServicesCard selectedDetailEnquiry={selectedDetailEnquiry} />
    </div>
  );
};

export default DetailEnquiryContent;
