import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, FileText } from "lucide-react";
import { where } from "firebase/firestore";
import Modal from "../components/Common/Modal";
import Loading from "../components/Common/Loading";
import { useDocument } from "../hooks/useFirestore";
import { firestoreService } from "../services/firestore";
import DetailEnquiryForm from "../components/Forms/DetailEnquiryForm";
import DetailEnquiryView from "../components/Views/DetailEnquiryView";

const DetailedEnquiry = () => {
  const { enquiryId } = useParams();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailEnquiry, setDetailEnquiry] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const {
    data: enquiry,
    loading: enquiryLoading,
    error: enquiryError,
  } = useDocument("enquiries", enquiryId);

  const loadDetailEnquiry = useCallback(async () => {
    if (!enquiryId) {
      setLoadingDetail(false);
      setDetailEnquiry(null);
      return;
    }
    try {
      setLoadingDetail(true);
      const detailEnquiries = await firestoreService.getAll("detailEnquiries", [
        where("Current_Enquiry", "==", enquiryId),
      ]);

      if (detailEnquiries.length > 0) {
        setDetailEnquiry(detailEnquiries[0]);
      } else {
        setDetailEnquiry(null);
      }
    } catch (error) {
      console.log("error", error);
      setDetailEnquiry(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    loadDetailEnquiry();
  }, [enquiryId, loadDetailEnquiry]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadDetailEnquiry();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadDetailEnquiry();
  };

  const handleDownload = (documentField, documentUrl) => {
    if (
      documentUrl &&
      typeof documentUrl === "string" &&
      documentUrl.startsWith("http")
    ) {
      window.open(documentUrl, "_blank");
    } else {
      toast.info(`Download for ${documentField} - URL missing or invalid.`);
    }
  };

  if (enquiryLoading || loadingDetail) {
    return <Loading />;
  }

  if (enquiryError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center card bg-red-50 border-red-300">
          <h2 className="text-xl font-semibold text-red-700">
            Error Loading Enquiry
          </h2>
          <p className="text-red-600 mt-2">
            Could not load the basic enquiry data. Please try again later.
          </p>
          <p className="text-xs text-red-500 mt-1">{enquiryError.message}</p>
          <button
            onClick={() => navigate("/students")}
            className="btn-secondary mt-4"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center card">
          <h2 className="text-xl font-semibold text-gray-900">
            Enquiry Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The enquiry (ID: {enquiryId}) you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/students")}
            className="btn-primary mt-4"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/students")}
            className="mr-3 sm:mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Students"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {enquiry.student_First_Name} {enquiry.student_Last_Name}
            </h1>
            <p className="text-sm text-gray-600">
              {enquiry.student_email}{" "}
              <span className="hidden sm:inline">•</span>{" "}
              <br className="sm:hidden" /> {enquiry.student_phone}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-center">
          {detailEnquiry ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary flex items-center text-sm sm:text-base"
            >
              <Edit size={18} className="mr-1 sm:mr-2" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center text-sm sm:text-base"
            >
              <Plus size={18} className="mr-1 sm:mr-2" /> Create Detailed
              Profile
            </button>
          )}
        </div>
      </div>
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Basic Enquiry Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500">
              Current Education
            </label>
            <p className="text-sm sm:text-base text-gray-800">
              {enquiry.current_education}
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500">
              Countries Interested
            </label>
            <p className="text-sm sm:text-base text-gray-800">
              {Array.isArray(enquiry.country_interested)
                ? enquiry.country_interested.join(", ")
                : enquiry.country_interested}
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500">
              Enquiry Status
            </label>
            <p className="text-sm sm:text-base text-gray-800">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  enquiry.enquiry_status === "New"
                    ? "bg-blue-100 text-blue-800"
                    : enquiry.enquiry_status === "In Progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : enquiry.enquiry_status === "Admitted"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {enquiry.enquiry_status}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500">
              Enquiry Source
            </label>
            <p className="text-sm sm:text-base text-gray-800">
              {enquiry.Source_Enquiry}
            </p>
          </div>
        </div>
      </div>
      {detailEnquiry ? (
        <DetailEnquiryView
          detailEnquiry={detailEnquiry}
          onEdit={() => setShowEditModal(true)}
          onDownload={handleDownload}
        />
      ) : (
        !loadingDetail && (
          <div className="card">
            <div className="text-center py-10 sm:py-12">
              <FileText
                className="mx-auto mb-3 sm:mb-4 text-gray-300"
                size={56}
              />
              <h3 className="text-md sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                No Detailed Profile Available
              </h3>
              <p className="text-sm text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                Create a detailed profile to capture comprehensive student
                information including education history, test scores, work
                experience, and document uploads.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center mx-auto text-sm sm:text-base"
              >
                <Plus size={18} className="mr-1 sm:mr-2" /> Create Detailed
                Profile
              </button>
            </div>
          </div>
        )
      )}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Detailed Student Profile"
        size="full"
      >
        <DetailEnquiryForm
          selectedEnquiry={enquiry}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Detailed Student Profile"
        size="full"
      >
        <DetailEnquiryForm
          selectedEnquiry={enquiry}
          editData={detailEnquiry}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </div>
  );
};

export default DetailedEnquiry;
