import React from "react";
import { Handshake } from "lucide-react";
import DetailItem from "./DetailItem";

const ConfirmedServicesCard = ({ selectedDetailEnquiry }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Handshake size={20} className="text-cyan-600 mr-3" />
      Confirmed Services
    </h2>
    <div className="space-y-2">
      <DetailItem
        label="Services"
        value={selectedDetailEnquiry.confirmed_services}
      />
      {(!selectedDetailEnquiry.confirmed_services ||
        selectedDetailEnquiry.confirmed_services.length === 0) && (
        <div className="text-center text-gray-500 py-4">
          <Handshake size={24} className="text-gray-300 mx-auto mb-2" />
          <p>No confirmed services.</p>
        </div>
      )}
    </div>
  </div>
);

export default ConfirmedServicesCard;
