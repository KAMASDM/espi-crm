import React from "react";
import { Award } from "lucide-react";

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

export default ScoreCard;
