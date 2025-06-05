import React, { useState, useEffect } from "react";
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
import Loading from "../components/Common/Loading";
import { branchService } from "../services/firestore";
import BranchForm from "../components/Branch/BranchForm";
import BranchesTable from "../components/Branch/BranchesTable";

const Branches = () => {
  const { userProfile } = useAuth();
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDeleteId, setBranchToDeleteId] = useState(null);
  const [branchToDeleteName, setBranchToDeleteName] = useState("");

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const fetchedBranches = await branchService.getAll();
      setBranches(fetchedBranches);
      setError(null);
    } catch (err) {
      console.log("Error fetching branches:", err);
      setError(err);
      toast.error("Failed to fetch branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setShowEditModal(true);
  };

  const handleDelete = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setBranchToDeleteId(branchId);
      setBranchToDeleteName(branch.name);
      setShowDeleteModal(true);
    } else {
      toast.error("Branch not found.");
      console.error("Branch not found for deletion:", branchId);
    }
  };

  const confirmDeleteBranch = async () => {
    if (!branchToDeleteId) return;

    try {
      await branchService.delete(branchToDeleteId);
      toast.success(`Branch "${branchToDeleteName}" deleted successfully!`);
      fetchBranches();
    } catch (err) {
      console.log("Error deleting branch:", err);
      toast.error(
        `Failed to delete branch "${branchToDeleteName}". ${err.message || ""}`
      );
    } finally {
      setShowDeleteModal(false);
      setBranchToDeleteId(null);
      setBranchToDeleteName("");
    }
  };

  const handleFormSuccess = (action = "submitted") => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedBranch(null);
    fetchBranches();
    toast.success(`Branch ${action} successfully!`);
  };

  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter(
    (b) => b.isActive === true
  ).length;
  const inactiveBranchesCount = branches.filter(
    (b) => b.isActive === false
  ).length;

  if (loading && branches.length === 0) return <Loading size="default" />;

  if (error && branches.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Branches
        </h2>
        <p className="text-red-500 mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={fetchBranches}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (userProfile?.role !== USER_ROLES.SUPERADMIN) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Branches</h1>
          </div>
        </div>
        <div className="text-center py-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to manage branches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Branches</h1>
          <p className="text-sm text-gray-600">
            Oversee and manage all company branches.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
          disabled={loading}
        >
          <Plus size={18} className="mr-1.5" /> Add Branch
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2.5 bg-sky-100 rounded-lg">
              <Building className="text-sky-600" size={24} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                Total Branches
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading && totalBranchesCount === 0
                  ? "..."
                  : totalBranchesCount}
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
                Active Branches
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading &&
                activeBranchesCount === 0 &&
                totalBranchesCount === 0
                  ? "..."
                  : activeBranchesCount}
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
                Inactive Branches
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading &&
                inactiveBranchesCount === 0 &&
                totalBranchesCount === 0
                  ? "..."
                  : inactiveBranchesCount}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <BranchesTable
          branches={branches}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Branch"
        size="large"
      >
        <BranchForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => handleFormSuccess("added")}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBranch(null);
        }}
        title="Edit Branch"
        size="large"
      >
        {selectedBranch && (
          <BranchForm
            editData={selectedBranch}
            onClose={() => {
              setShowEditModal(false);
              setSelectedBranch(null);
            }}
            onSuccess={() => handleFormSuccess("updated")}
          />
        )}
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBranchToDeleteId(null);
          setBranchToDeleteName("");
        }}
        title="Confirm Deletion"
        size="small"
      >
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete Branch: {branchToDeleteName}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">
              Are you sure you want to delete this branch? This action cannot be
              undone and might affect associated users and data.
            </p>
          </div>
          <div className="flex justify-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setBranchToDeleteId(null);
                setBranchToDeleteName("");
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              disabled
              type="button"
              onClick={confirmDeleteBranch}
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

export default Branches;
