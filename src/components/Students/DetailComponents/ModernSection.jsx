import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default ModernSection;
