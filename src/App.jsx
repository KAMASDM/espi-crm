import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { USER_ROLES } from "./utils/constants";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";
import Services from "./pages/Services";
import Branches from "./pages/Branches";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Dashboard from "./pages/Dashboard";
import Assessments from "./pages/Assessments";
import Universities from "./pages/Universities";
import Applications from "./pages/Applications";
import Layout from "./components/Common/Layout";
import Loading from "./components/Common/Loading";
import DetailedEnquiry from "./pages/DetailEnquiry";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import StudentDetails from "./components/Students/StudentDetails";

const AppRoutes = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading && !user) {
    return <Loading size="default" />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (loading || (!user && !userProfile)) {
    return <Loading size="default" />;
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
                USER_ROLES.COUNSELLOR,
                USER_ROLES.RECEPTION,
                USER_ROLES.AGENT,
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
                USER_ROLES.COUNSELLOR,
                USER_ROLES.RECEPTION,
              ]}
            >
              <DetailedEnquiry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.COUNSELLOR,
              ]}
            >
              <StudentDetails />
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
                USER_ROLES.PROCESSOR,
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
                USER_ROLES.PROCESSOR,
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
                USER_ROLES.ACCOUNTANT,
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
              allowedRoles={[USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN]}
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
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.SUPERADMIN,
                USER_ROLES.BRANCH_ADMIN,
                USER_ROLES.COUNSELLOR,
                USER_ROLES.PROCESSOR,
              ]}
            >
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN]}>
              <Branches />
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
