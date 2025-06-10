import React from "react";
import { Link as LinkIcon } from "lucide-react";

const DocumentLinkItem = ({ label, url }) => {
  if (!url) return null;
  return (
    <div className="flex items-center text-sm mb-2">
      <LinkIcon size={16} className="text-blue-500 mr-2 flex-shrink-0" />
      <p>
        <span className="font-semibold text-gray-800">{label}:</span>{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          View Document
        </a>
      </p>
    </div>
  );
};

export default DocumentLinkItem;
