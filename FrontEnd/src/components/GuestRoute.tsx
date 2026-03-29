import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  if (token) {
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
      !!user?.roles?.some((role) => role.name === "coach") ||
      user?.selectedRole === "coach" ||
      roleFromStorage === "coach" ||
      storedSelectedRole === "coach";

    return (
      <Navigate to={isCoach ? "/coach/dashboard" : "/user/dashboard"} replace />
    );
  }

  return <Outlet />;
}
