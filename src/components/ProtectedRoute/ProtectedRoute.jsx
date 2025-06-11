import React from "react";
import { toast } from "react-hot-toast";
import { Navigate } from "react-router-dom";
import Loading from "../Common/Loading";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <Loading size="default" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    toast.error("You are not authorized to view this page.");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
