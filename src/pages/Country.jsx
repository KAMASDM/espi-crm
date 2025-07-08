import React, { useState } from "react";
import { Plus, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Common/Modal";
import CountryForm from "../components/Country/CountryForm";
import CountriesTable from "../components/Country/CountriesTable";
import { countryService } from "../services/firestore";
import { useCountries } from "../hooks/useFirestore";

const Countries = () => {
  const { data: countries, loading, error } = useCountries();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryToDelete, setCountryToDelete] = useState({ id: "", name: "" });

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setShowEditModal(true);
  };

  const handleDelete = (countryId) => {
    const country = countries.find((c) => c.id === countryId);
    if (country) {
      setCountryToDelete({
        id: countryId,
        name: country.country,
      });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await countryService.delete(countryToDelete.id);
      toast.success(`Country "${countryToDelete.name}" deleted!`);
    } catch (err) {
      toast.error(`Failed to delete country: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCountry(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Countries
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
            Country Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage countries and their specific requirements
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
          disabled={loading}
        >
          <Plus size={18} className="mr-1.5" /> Add Country
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <CountriesTable
          countries={countries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Country"
        size="large"
      >
        <CountryForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCountry(null);
        }}
        title={`Edit ${selectedCountry?.country}`}
        size="large"
      >
        {selectedCountry && (
          <CountryForm
            editData={selectedCountry}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCountry(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCountryToDelete({ id: "", name: "" });
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete {countryToDelete.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              This will permanently remove the country and its settings.
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
              className="btn-danger bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Countries;