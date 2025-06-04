import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const fetchedBranches = await branchService.getAll();
      setBranches(fetchedBranches);
      setError(null);
    } catch (error) {
      console.log("error", error);
      setError(error);
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

  const handleDelete = async (branchId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this branch? This action might affect associated users and data."
      )
    ) {
      try {
        await branchService.delete(branchId);
        toast.success("Branch deleted successfully!");
        fetchBranches();
      } catch (error) {
        console.log("Error deleting branch:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    fetchBranches();
  };

  if (loading) return <Loading size="default" />;

  if (error) return <div className="text-red-500">{error.message}</div>;

  if (userProfile?.role !== USER_ROLES.SUPERADMIN) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <p className="text-red-600">
          You do not have permission to manage branches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Branches
          </h1>
          <p className="text-gray-600">
            Oversee and manage all company branches
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" /> Add Branch
        </button>
      </div>
      <div className="card">
        <BranchesTable
          branches={branches}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
          onSuccess={handleFormSuccess}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Branch"
        size="large"
      >
        <BranchForm
          editData={selectedBranch}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default Branches;
