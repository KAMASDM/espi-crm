import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { Download, FileText, Loader2 } from "lucide-react";
import ModernDocumentCard from "./ModernDocumentCard";

const DocumentLibrarySection = ({ documents = [] }) => {
  const [isMerging, setIsMerging] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleMergePdf = async () => {
    setIsMerging(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let mergedAny = false;

      for (const doc of documents) {
        if (doc.docNameValue && doc.docNameValue.startsWith("http")) {
          try {
            const response = await fetch(doc.docNameValue);
            const arrayBuffer = await response.arrayBuffer();

            try {
              const externalPdf = await PDFDocument.load(arrayBuffer);
              const pages = await pdfDoc.copyPages(
                externalPdf,
                externalPdf.getPageIndices()
              );
              pages.forEach((page) => pdfDoc.addPage(page));
              mergedAny = true;
            } catch (e) {
              console.error(`Error merging ${doc.label}:`, e);
              console.warn(`Skipping non-PDF document: ${doc.label}`);
            }
          } catch (error) {
            console.error(`Error processing ${doc.label}:`, error);
          }
        }
      }

      if (!mergedAny) {
        toast.error("No valid PDF documents found to merge");
        return;
      }

      const mergedPdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([mergedPdfBytes], { type: "application/pdf" }),
        `merged_documents_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      toast.success("PDF merged successfully!");
    } catch (error) {
      toast.error("Failed to merge PDFs");
      console.error(error);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      for (const doc of documents) {
        if (doc.docNameValue && doc.docNameValue.startsWith("http")) {
          try {
            const response = await fetch(doc.docNameValue);
            const blob = await response.blob();
            saveAs(blob, `${doc.label}.pdf`);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between downloads
          } catch (error) {
            console.error(`Failed to download ${doc.label}`, error);
          }
        }
      }
      toast.success("Started downloading all documents");
    } catch (error) {
      toast.error("Error initiating downloads");
      console.error(error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <ModernDocumentCard
            key={index}
            label={doc.label}
            docNameValue={doc.docNameValue}
          />
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={handleDownloadAll}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
          disabled={isDownloadingAll}
        >
          {isDownloadingAll ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Download size={16} />
              Download All Individually
            </>
          )}
        </button>
        <button
          onClick={handleMergePdf}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
          disabled={isMerging}
        >
          {isMerging ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Merging...
            </>
          ) : (
            <>
              <FileText size={16} />
              Merge to Single PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentLibrarySection;
