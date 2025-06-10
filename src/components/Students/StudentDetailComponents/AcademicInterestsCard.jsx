import React from "react";
import {
  Book,
  Handshake,
  Calendar,
  Globe,
  Award,
  GraduationCap,
} from "lucide-react";
import DetailItem from "./DetailItem";

const AcademicInterestsCard = ({ student, universitiesMap }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Book size={20} className="text-orange-600 mr-3" />
      Academic & Interests
    </h2>
    <div className="space-y-2">
      <DetailItem
        icon={GraduationCap}
        label="Current Education"
        value={student.current_education}
      />
      <DetailItem
        icon={Globe}
        label="Countries Interested"
        value={student.country_interested}
      />
      <DetailItem
        icon={Calendar}
        label="Intake Interested"
        value={student.intake_interested}
      />
      <DetailItem
        icon={Handshake}
        label="Interested Services"
        value={student.Interested_Services}
      />
      <DetailItem
        icon={Award}
        label="University Interested"
        value={
          universitiesMap[student.university_interested]?.univ_name || "N/A"
        }
      />
    </div>
  </div>
);

export default AcademicInterestsCard;
