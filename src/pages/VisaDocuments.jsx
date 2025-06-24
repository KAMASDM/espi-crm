// src/pages/VisaDocument.jsx
import React, { useState } from "react";
import { Plus, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Common/Modal";
import VisaDocumentForm from "../components/VisaDocuments/VisaDocumentForm";
import VisaDocumentTable from "../components/VisaDocuments/VisaDocumentTable";
import { useVisaDocuments } from "../hooks/useFirestore";
import { visaDocumentService } from "../services/firestore";
import { COUNTRIES } from "../utils/constants";

const VisaDocument = () => {
  const { data: documents, loading, error } = useVisaDocuments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docToDelete, setDocToDelete] = useState({ id: "", name: "" });

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setShowEditModal(true);
  };

  const handleDelete = (countryCode) => {
    const doc = documents.find((d) => d.id === countryCode);
    if (doc) {
      setDocToDelete({
        id: countryCode,
        name:
          COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode,
      });
      setShowDeleteModal(true);
    }
  };
  const confirmDelete = async () => {
    try {
      await visaDocumentService.delete(docToDelete.id);
      toast.success(`Visa documents for ${docToDelete.name} deleted!`);
    } catch (err) {
      toast.error(`Failed to delete documents for ${docToDelete.name}`, err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDoc(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Visa Documents
        </h2>
        <p className="text-red-500 mb-4">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Visa Document Requirements
          </h1>
          <p className="text-sm text-gray-600">
            Manage visa document requirements by country
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
          disabled={loading}
        >
          <Plus size={18} className="mr-1.5" /> Add Documents
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <VisaDocumentTable
          documents={documents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          totalCount={documents.length}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Visa Document Requirements"
        size="large"
      >
        <VisaDocumentForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDoc(null);
        }}
        title={`Edit ${selectedDoc?.countryCode} Requirements`}
        size="large"
      >
        {selectedDoc && (
          <VisaDocumentForm
            editData={selectedDoc}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDoc(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocToDelete({ id: "", name: "" });
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete requirements for {docToDelete.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              This will permanently remove all document requirements for this
              country.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisaDocument;
