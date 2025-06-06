import React from "react";
import { CheckCircle, Clock, Eye, Info, Star } from "lucide-react";

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

export default StatusBadge;
