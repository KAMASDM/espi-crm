import React from "react";
import { Info } from "lucide-react";

const NestedDetailsCard = ({ icon: CardIcon, title, detailsObject }) => {
  if (
    !detailsObject ||
    Object.keys(detailsObject).every(
      (key) =>
        !detailsObject[key] &&
        detailsObject[key] !== 0 &&
        detailsObject[key] !== false
    )
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-500">
        <Info size={32} className="text-gray-300 mb-3" />
        <p>No {title.toLowerCase()} available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {CardIcon && <CardIcon size={20} className="text-purple-600 mr-3" />}
        {title}
      </h3>
      <div className="space-y-2">
        {Object.entries(detailsObject).map(([key, value]) =>
          value || value === 0 || value === false ? (
            <p key={key} className="text-sm text-gray-700">
              <span className="font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:
              </span>{" "}
              {Array.isArray(value) ? value.join(", ") : value}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
};

export default NestedDetailsCard;
