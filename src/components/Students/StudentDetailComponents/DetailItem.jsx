import React from "react";
import moment from "moment";

const DetailItem = ({ icon: Icon, label, value }) => {
  if (
    (value === null || value === undefined || value === "") &&
    value !== 0 &&
    value !== false
  ) {
    return null;
  }

  let displayValue = value;
  if (Array.isArray(value)) {
    displayValue = value.join(", ");
  } else if (value && typeof value.toDate === "function") {
    displayValue = moment(value.toDate()).format("MMM DD,YYYY (hh:mm a)");
  } else if (value instanceof Date) {
    displayValue = moment(value).format("MMM DD,YYYY (hh:mm a)");
  } else if (typeof value === "object" && value.seconds && value.nanoseconds) {
    const date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    displayValue = moment(date).format("MMM DD,YYYY (hh:mm a)");
  } else if (typeof value === "object") {
    try {
      displayValue = JSON.stringify(value, null, 2);
    } catch (e) {
      console.error(e);
      displayValue = "[Complex Object]";
    }
  }

  return (
    <div className="flex items-start text-gray-700 text-sm mb-2">
      {Icon && (
        <Icon size={16} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
      )}
      <p>
        <span className="font-semibold text-gray-800">{label}:</span>{" "}
        <span className="break-words whitespace-pre-wrap">{displayValue}</span>
      </p>
    </div>
  );
};

export default DetailItem;
