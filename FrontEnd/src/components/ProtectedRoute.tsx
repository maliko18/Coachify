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

  const isAdmin =
    !!user?.roles?.some(
      (r) => r.name === "gym_manager" || r.name === "admin",
    ) ||
    user?.selectedRole === "gym_manager" ||
    user?.selectedRole === "admin" ||
    roleFromStorage === "gym_manager" ||
    roleFromStorage === "admin" ||
    storedSelectedRole === "gym_manager" ||
    storedSelectedRole === "admin";

  const isUserArea =
    location.pathname.startsWith("/user/") ||
    location.pathname === "/user" ||
    location.pathname.startsWith("/client/") ||
    location.pathname.startsWith("/book-coach");

  const isCoachArea =
    location.pathname.startsWith("/coach/") || location.pathname === "/coach";

  const isAdminArea =
    location.pathname.startsWith("/gym/") ||
    location.pathname === "/gym" ||
    location.pathname.startsWith("/admin/") ||
    location.pathname === "/admin";

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

  if (isAdmin && !isAdminArea) {
    return <Navigate to="/gym/dashboard" replace />;
  }

  if (!isAdmin && isAdminArea) {
    return (
      <Navigate to={isCoach ? "/coach/dashboard" : "/user/dashboard"} replace />
    );
  }

  if (isUserArea && isCoach) {
    return <Navigate to="/coach/dashboard" replace />;
  }

  if (isCoachArea && !isCoach) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}
