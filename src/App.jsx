import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Common/Layout";
import Loading from "./components/Common/Loading";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import DetailedEnquiry from "./pages/DetailEnquiry";
import Universities from "./pages/Universities";
import Courses from "./pages/Courses";
import Assessments from "./pages/Assessments";
import Applications from "./pages/Applications";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";

import Users from "./pages/Users";
import BranchManagement from "./pages/Branches";
import { USER_ROLES } from "./utils/constants";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <Loading />;
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

const AppRoutes = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading && !user) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (loading || (user && !userProfile)) {
    return <Loading />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.COUNSELLOR,
                USER_ROLES.RECEPTION,
              ]}
            >
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:enquiryId/details"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.COUNSELLOR,
              ]}
            >
              <DetailedEnquiry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/universities"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.COUNSELLOR,
                USER_ROLES.PROCESSOR,
              ]}
            >
              <Universities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.COUNSELLOR,
                USER_ROLES.PROCESSOR,
              ]}
            >
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.PROCESSOR,
                USER_ROLES.COUNSELLOR,
              ]}
            >
              <Assessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.PROCESSOR,
                USER_ROLES.COUNSELLOR,
              ]}
            >
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
                USER_ROLES.ACCOUNTANT,
                USER_ROLES.RECEPTION,
              ]}
            >
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.BRANCH_MANAGER,
              ]}
            >
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN]}
            >
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN]}>
              <BranchManagement />
            </ProtectedRoute>
          }
        />

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
              style: { background: "#363636", color: "#fff" },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
