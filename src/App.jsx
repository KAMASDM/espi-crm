// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext'; //
import Layout from './components/common/Layout'; //
import LoadingSpinner from './components/common/LoadingSpinner'; //

// Pages
import Login from './pages/Login'; //
import Dashboard from './pages/Dashboard'; //
import Students from './pages/Students'; //
import DetailedEnquiry from './pages/DetailEnquiry'; //
import Universities from './pages/Universities'; //
import Courses from './pages/Courses'; //
import Assessments from './pages/Assessments'; //
import Applications from './pages/Applications'; //
import Payments from './pages/Payments'; //
import Reports from './pages/Reports'; //
import Chat from './pages/Chat'; //

// New Admin Pages
import UserManagement from './pages/UserManagement'; // Import new page
import BranchManagement from './pages/BranchManagement'; // Import new page
import { USER_ROLES } from './utils/constants'; //

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // Optional: redirect to a 'Not Authorized' page or back to dashboard
    toast.error("You are not authorized to view this page.");
    return <Navigate to="/" />; 
  }
  
  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, userProfile, loading } = useAuth(); // Add userProfile and loading
  
  if (loading && !user) { // Show loading spinner only if truly loading initial auth state
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  
  // Ensure userProfile is loaded before rendering protected routes that depend on role
  if (loading || (user && !userProfile)) {
      return <LoadingSpinner />;
  }


  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.RECEPTION]}><Students /></ProtectedRoute>} />
        <Route path="/students/:enquiryId/details" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR]}><DetailedEnquiry /></ProtectedRoute>} />
        <Route path="/universities" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.PROCESSOR]}><Universities /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.PROCESSOR]}><Courses /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.PROCESSOR, USER_ROLES.COUNSELLOR]}><Assessments /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.PROCESSOR, USER_ROLES.COUNSELLOR]}><Applications /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.ACCOUNTANT, USER_ROLES.RECEPTION]}><Payments /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER]}><Reports /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/user-management" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN]}><UserManagement /></ProtectedRoute>} />
        <Route path="/branch-management" element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN]}><BranchManagement /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;