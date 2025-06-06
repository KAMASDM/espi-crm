import React from "react";
import { Briefcase } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString();
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

export default ExperienceTimeline;