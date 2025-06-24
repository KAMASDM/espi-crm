// src/components/VisaDocument/VisaDocumentForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { COUNTRIES } from "../../utils/constants";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const VisaDocumentForm = ({ onClose, onSuccess, editData = null }) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: editData || { requirements: [] },
  });
  const [loading, setLoading] = useState(false);
  // const country = watch("countryCode");

  const onSubmit = async (data) => {
    if (!data.countryCode || data.requirements.length === 0) {
      toast.error("Please select a country and add at least one document");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "visaDocumentRequirements", data.countryCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          requirements: data.requirements,
          updatedAt: serverTimestamp(),
        });
        toast.success("Visa documents updated successfully!");
      } else {
        await setDoc(docRef, {
          countryCode: data.countryCode,
          requirements: data.requirements,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Visa documents created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving visa documents:", error);
      toast.error(`Failed to save visa documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    const currentRequirements = watch("requirements") || [];
    setValue("requirements", [...currentRequirements, ""]);
  };

  const handleRemoveDocument = (index) => {
    const currentRequirements = watch("requirements") || [];
    setValue(
      "requirements",
      currentRequirements.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Visa Document Requirements
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              {...register("countryCode", { required: true })}
              className="input-field"
              disabled={!!editData}
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documents *
            </label>
            <div className="space-y-2">
              {(watch("requirements") || []).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    {...register(`requirements.${index}`)}
                    className="input-field flex-1"
                    placeholder="Document name"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddDocument}
                className="btn-secondary flex items-center mt-2"
              >
                <Plus size={16} className="mr-1" /> Add Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={loading}
        >
          <X size={16} className="inline mr-1" />
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <Loader2 size={16} className="inline mr-1 animate-spin" />
          ) : (
            <Save size={16} className="inline mr-1" />
          )}
          {loading ? "Saving..." : editData ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default VisaDocumentForm;
