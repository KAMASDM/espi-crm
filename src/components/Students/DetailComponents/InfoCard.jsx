import React from "react";

const formatCurrency = (amount, code = "INR") => {
  if (!amount) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
};

const InfoCard = ({
  label,
  value,
  icon: Icon,
  isCurrency = false,
  currencyCode = "INR",
  highlight = false,
}) => (
  <div
    className={`p-4 rounded-lg border ${
      highlight ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
    } transition-colors hover:bg-gray-100`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          {Icon && <Icon size={14} className="text-gray-400 mr-2" />}
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        </div>
        <p
          className={`text-sm font-medium ${
            highlight ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {value !== undefined && value !== null && value !== "" ? (
            isCurrency ? (
              formatCurrency(value, currencyCode)
            ) : (
              String(value)
            )
          ) : (
            <span className="italic text-gray-400">Not specified</span>
          )}
        </p>
      </div>
    </div>
  </div>
);

export default InfoCard;
