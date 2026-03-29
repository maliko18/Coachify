import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token, user, isLoading } = useAuth();
  const location = useLocation();

  const roleFromStorage = localStorage.getItem("role") || "";
  const storedUserRaw = localStorage.getItem("USER");
  let storedSelectedRole = "";

  if (storedUserRaw) {
    try {
      const storedUser = JSON.parse(storedUserRaw);
      storedSelectedRole = String(storedUser?.selectedRole || "");
    } catch {
      storedSelectedRole = "";
    }
  }

  const isCoach =
    !!user?.roles?.some((r) => r.name === "coach") ||
    user?.selectedRole === "coach" ||
    roleFromStorage === "coach" ||
    storedSelectedRole === "coach";

  const isUserArea =
    location.pathname.startsWith("/user/") ||
    location.pathname === "/user" ||
    location.pathname.startsWith("/client/") ||
    location.pathname.startsWith("/book-coach");

  const isCoachArea =
    location.pathname.startsWith("/coach/") || location.pathname === "/coach";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isUserArea && isCoach) {
    return <Navigate to="/coach/dashboard" replace />;
  }

  if (isCoachArea && !isCoach) {
    return <Navigate to="/user/dashboard" replace />;
  }


  return <Outlet />;
}