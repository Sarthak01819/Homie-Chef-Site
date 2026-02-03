import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import Layout from "./components/Layout";
import DeliveryLogs from "./pages/DeliveryLogs";
import Analytics from "./pages/Analytics";
import CustomizationRequests from "./pages/CustomizationRequests";
import Controls from "./pages/Controls";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route
        path="/users"
        element={
          <AdminProtectedRoute>
            <Layout>
              <AdminUsers />
            </Layout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/customizations"
        element={
          <AdminProtectedRoute>
            <CustomizationRequests />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/controls"
        element={
          <AdminProtectedRoute>
            <Controls />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <AdminProtectedRoute>
            <Analytics />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/deliveries"
        element={
          <AdminProtectedRoute>
            <Layout>
              <DeliveryLogs />
            </Layout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <AdminProtectedRoute>
            <Layout>
              <AdminAuditLogs />
            </Layout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <AdminProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <AdminProtectedRoute>
            <Layout>
              <AdminOrders />
            </Layout>
          </AdminProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
