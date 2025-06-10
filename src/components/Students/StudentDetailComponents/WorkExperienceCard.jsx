import React from "react";
import { Briefcase } from "lucide-react";

const WorkExperienceCard = ({ workExperiences }) => {
  if (!workExperiences || workExperiences.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-500">
        <Briefcase size={32} className="text-gray-300 mb-3" />
        <p>No work experience details available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Briefcase size={20} className="text-teal-600 mr-3" />
        Work Experience
      </h3>
      <div className="space-y-4">
        {workExperiences.map((exp, index) => (
          <div key={index} className="border-l-4 border-teal-300 pl-4 py-2">
            <p className="text-base font-medium text-gray-900">
              {exp.designation} at {exp.companyName}
            </p>
            <p className="text-xs text-gray-600">
              {exp.startDate} to {exp.endDate || "Present"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceCard;
