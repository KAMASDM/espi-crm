import React from "react";
import { FileText } from "lucide-react";
import DocumentLinkItem from "./DocumentLinkItem";

const DocumentsCard = ({ selectedDetailEnquiry }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <FileText size={20} className="text-blue-600 mr-3" />
      Documents
    </h2>
    <div className="space-y-2">
      <DocumentLinkItem
        label="10th Document"
        url={selectedDetailEnquiry.tenth_Document}
      />
      <DocumentLinkItem
        label="12th Document"
        url={selectedDetailEnquiry.twelveth_Document}
      />
      <DocumentLinkItem
        label="Graduation Marksheet"
        url={selectedDetailEnquiry.graduation_Marksheet}
      />
      <DocumentLinkItem
        label="Graduation Certificate"
        url={selectedDetailEnquiry.graduation_Certificate}
      />
      <DocumentLinkItem
        label="UG Marksheet"
        url={selectedDetailEnquiry.ug_Marksheet}
      />
      <DocumentLinkItem
        label="UG Certificate"
        url={selectedDetailEnquiry.ug_Certificate}
      />
      <DocumentLinkItem
        label="Work Experience Document"
        url={selectedDetailEnquiry.work_Experience_Document}
      />
      <DocumentLinkItem
        label="Passport Document"
        url={selectedDetailEnquiry.passport_Document}
      />
      <DocumentLinkItem
        label="Offer Letter"
        url={selectedDetailEnquiry.offer_Letter}
      />
      <DocumentLinkItem
        label="IELTS Result"
        url={selectedDetailEnquiry.ielts_Result}
      />
      <DocumentLinkItem
        label="TOEFL Result"
        url={selectedDetailEnquiry.toefl_Result}
      />
      <DocumentLinkItem
        label="PTE Result"
        url={selectedDetailEnquiry.pte_Result}
      />
      <DocumentLinkItem
        label="Duolingo Result"
        url={selectedDetailEnquiry.duolingo_Result}
      />
      <DocumentLinkItem
        label="GRE Result"
        url={selectedDetailEnquiry.gre_Result}
      />
      <DocumentLinkItem
        label="GMAT Result"
        url={selectedDetailEnquiry.gmat_Result}
      />
      {!selectedDetailEnquiry.tenth_Document &&
        !selectedDetailEnquiry.twelveth_Document &&
        !selectedDetailEnquiry.graduation_Marksheet &&
        !selectedDetailEnquiry.graduation_Certificate &&
        !selectedDetailEnquiry.ug_Marksheet &&
        !selectedDetailEnquiry.ug_Certificate &&
        !selectedDetailEnquiry.work_Experience_Document &&
        !selectedDetailEnquiry.passport_Document &&
        !selectedDetailEnquiry.offer_Letter &&
        !selectedDetailEnquiry.ielts_Result &&
        !selectedDetailEnquiry.toefl_Result &&
        !selectedDetailEnquiry.pte_Result &&
        !selectedDetailEnquiry.duolingo_Result &&
        !selectedDetailEnquiry.gre_Result &&
        !selectedDetailEnquiry.gmat_Result && (
          <div className="text-center text-gray-500 py-4">
            <FileText size={24} className="text-gray-300 mx-auto mb-2" />
            <p>No documents uploaded.</p>
          </div>
        )}
    </div>
  </div>
);

export default DocumentsCard;
