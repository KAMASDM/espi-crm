import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const ModernDocumentCard = ({ label, docNameValue }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (documentField, documentUrl) => {
    if (!documentUrl || !documentUrl.startsWith("http")) {
      toast.error(`Download failed: ${documentField} URL is invalid`);
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      saveAs(blob, `${documentField}.pdf`);
    } catch (error) {
      toast.error(`Failed to download ${documentField}`);
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = (documentField, documentUrl) => {
    if (!documentUrl || !documentUrl.startsWith("http")) {
      toast.error(`Cannot view: ${documentField} URL is invalid`);
      return;
    }
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
        docNameValue
          ? "border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className={`p-2 rounded-lg mr-3 ${
              docNameValue ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <FileText
              size={18}
              className={docNameValue ? "text-green-600" : "text-gray-400"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-medium text-gray-900 truncate"
              title={label}
            >
              {label}
            </h4>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {docNameValue ? (
            <>
              <CheckCircle size={18} className="text-green-500" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={() => handleView(label, docNameValue)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title={`View ${label}`}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleDownload(label, docNameValue)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title={`Download ${label}`}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-amber-500 mr-1" />
              <span className="text-xs text-amber-600 font-medium">
                Missing
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDocumentCard;
