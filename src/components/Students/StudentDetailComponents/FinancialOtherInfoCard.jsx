import React from "react";
import { DollarSign, User, Ban } from "lucide-react";
import DetailItem from "./DetailItem";

const FinancialOtherInfoCard = ({ selectedDetailEnquiry }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <DollarSign size={20} className="text-indigo-600 mr-3" />
      Financial & Other Info
    </h2>
    <div className="space-y-2">
      <DetailItem
        icon={DollarSign}
        label="Father's Annual Income"
        value={selectedDetailEnquiry.father_Annual_Income}
      />
      <DetailItem
        icon={User}
        label="Father's Occupation"
        value={selectedDetailEnquiry.father_Occupation}
      />
      {selectedDetailEnquiry.refusal_details &&
      Object.keys(selectedDetailEnquiry.refusal_details).length > 0 ? (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
            <Ban size={18} className="text-red-500 mr-2" /> Visa Refusal Details
          </h4>
          <div className="space-y-1 pl-2">
            <DetailItem
              label="Country"
              value={selectedDetailEnquiry.refusal_details.country}
            />
            <DetailItem
              label="Date"
              value={selectedDetailEnquiry.refusal_details.date}
            />
            <DetailItem
              label="Reason"
              value={selectedDetailEnquiry.refusal_details.reason}
            />
            <DetailItem
              label="Visa Category"
              value={selectedDetailEnquiry.refusal_details.visa_category}
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 pt-4 border-t border-gray-100">
          <Ban size={24} className="text-gray-300 mx-auto mb-2" />
          <p>No visa refusal details.</p>
        </div>
      )}
    </div>
  </div>
);

export default FinancialOtherInfoCard;
