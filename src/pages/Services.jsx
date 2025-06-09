import React, { useEffect, useState } from "react";
import {
  Plus,
  AlertTriangle,
  Building,
  XCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Common/Modal";
import { USER_ROLES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import ServiceForm from "../components/Service/ServiceForm";
import ServicesTable from "../components/Service/ServicesTable";
import { serviceService } from "../services/firestore";

const Services = () => {
  const { userProfile } = useAuth();
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState(null);
  const [serviceToDeleteName, setServiceToDeleteName] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const fetchedServices = await serviceService.getAll();
      setServices(fetchedServices);
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err);
      toast.error("Failed to fetch services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleDelete = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setServiceToDeleteId(serviceId);
      setServiceToDeleteName(service.serviceName);
      setShowDeleteModal(true);
    } else {
      toast.error("Service not found.");
      console.error("Service not found for deletion:", serviceId);
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDeleteId) return;

    try {
      await serviceService.delete(serviceToDeleteId);
      toast.success(`Service "${serviceToDeleteName}" deleted successfully!`);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error(
        `Failed to delete service "${serviceToDeleteName}". ${
          err.message || ""
        }`
      );
    } finally {
      setShowDeleteModal(false);
      setServiceToDeleteId(null);
      setServiceToDeleteName("");
    }
  };

  const handleFormSuccess = (action = "submitted") => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedService(null);
    fetchServices();
    toast.success(`Service ${action} successfully!`);
  };

  const totalServicesCount = services.length;
  const activeServicesCount = services.filter(
    (s) => s.isActive === true
  ).length;
  const inactiveServicesCount = services.filter(
    (s) => s.isActive === false
  ).length;

  const handleVisibility = userProfile.role === USER_ROLES.SUPERADMIN;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Services
        </h2>
        <p className="text-red-500 mb-4">{error.message}</p>
        <button
          onClick={fetchServices}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-sm text-gray-600">
            Oversee and manage all company services.
          </p>
        </div>
        {handleVisibility && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
            disabled={loading}
          >
            <Plus size={18} className="mr-1.5" /> Add Service
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-sky-100 rounded-lg">
              <Building className="text-sky-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Total Services
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalServicesCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Active Services
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : activeServicesCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Inactive Services
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : inactiveServicesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <ServicesTable
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          handleVisibility={handleVisibility}
          totalServicesCount={totalServicesCount}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Service"
        size="large"
      >
        <ServiceForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => handleFormSuccess("added")}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedService(null);
        }}
        title="Edit Service"
        size="large"
      >
        {selectedService && (
          <ServiceForm
            editData={selectedService}
            onClose={() => {
              setShowEditModal(false);
              setSelectedService(null);
            }}
            onSuccess={() => handleFormSuccess("updated")}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setServiceToDeleteId(null);
          setServiceToDeleteName("");
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Service: {serviceToDeleteName}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              Are you sure you want to delete this service? This action cannot
              be undone and might affect associated users and data.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setServiceToDeleteId(null);
                setServiceToDeleteName("");
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteService}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Services;
