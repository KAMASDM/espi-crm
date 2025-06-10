import React from "react";
import {
  Calendar,
  User,
  Tag,
  Info,
  MessageSquare,
  Building2,
} from "lucide-react";
import DetailItem from "./DetailItem";

const EnquiryStatusCard = ({ student, usersMap, branchesMap }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Tag size={20} className="text-green-600 mr-3" />
      Enquiry & Status
    </h2>
    <div className="space-y-2">
      <DetailItem
        icon={Tag}
        label="Enquiry Status"
        value={student.enquiry_status}
      />
      <DetailItem
        icon={Calendar}
        label="Enquiry Date"
        value={student.createdAt}
      />
      <DetailItem
        icon={Info}
        label="Source Enquiry"
        value={student.Source_Enquiry}
      />
      <DetailItem
        icon={User}
        label="Assigned To"
        value={usersMap[student.assignedUserId]?.displayName || "N/A"}
      />
      <DetailItem
        icon={Building2}
        label="Branch"
        value={branchesMap[student.branchId]?.branchName || "N/A"}
      />
      <DetailItem icon={MessageSquare} label="Notes" value={student.notes} />
    </div>
  </div>
);

export default EnquiryStatusCard;
