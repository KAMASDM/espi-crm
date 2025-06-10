import React from "react";
import { Phone, Mail, MapPin, User, Key } from "lucide-react";
import DetailItem from "./DetailItem";

const PersonalContactCard = ({ student }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <User size={20} className="text-purple-600 mr-3" />
      Personal & Contact
    </h2>
    <div className="space-y-2">
      <DetailItem icon={Mail} label="Email" value={student.student_email} />
      <DetailItem icon={Phone} label="Phone" value={student.student_phone} />
      <DetailItem
        icon={Phone}
        label="Alternate Phone"
        value={student.alternate_phone}
      />
      <DetailItem
        icon={MapPin}
        label="Address"
        value={`${student.student_address}, ${student.student_city}, ${student.student_state}, ${student.student_country}`.trim()}
      />
      <DetailItem
        icon={Key}
        label="Passport No."
        value={student.student_passport}
      />
    </div>
  </div>
);

export default PersonalContactCard;
