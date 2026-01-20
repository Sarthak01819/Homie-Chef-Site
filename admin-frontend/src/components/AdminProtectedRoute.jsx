import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminProtectedRoute = ({ children }) => {
    const { admin, loading } = useAdminAuth();

    if (loading) return <p>Checking admin access...</p>;

    if (!admin) return <Navigate to="/login" replace />;

    return children;
};

export default AdminProtectedRoute;
