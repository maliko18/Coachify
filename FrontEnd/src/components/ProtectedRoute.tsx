import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  const location = useLocation();
  const role = localStorage.getItem("role"); // 🔥 IMPORTANT

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)]"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }



  return <Outlet />;
}