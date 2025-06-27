import React from "react";
import moment from "moment";
import { Calendar, CheckCircle, Clock } from "lucide-react";

const FollowUpBadge = ({ followUp, onClick }) => {
  if (!followUp) return null;

  const isCompleted = followUp.followUpStatus === "Completed";
  const badgeColor = isCompleted
    ? "bg-green-100 text-green-800"
    : "bg-yellow-100 text-yellow-800";
  const Icon = isCompleted ? CheckCircle : Clock;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-2 rounded-lg transition-colors hover:bg-gray-100 w-full text-left"
    >
      <div className="flex items-center text-xs text-gray-600 mb-1">
        <Calendar size={12} className="mr-1.5" />
        {moment(followUp.nextFollowUpDate.toDate()).format("MMM DD, YYYY")}
      </div>
      <div
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
      >
        <Icon size={12} className="mr-1" />
        {followUp.followUpStatus}
      </div>
    </button>
  );
};

export default FollowUpBadge;
