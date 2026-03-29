import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute() {
  const { token, user, isLoading } = useAuth();

  const isRestoringSession = Boolean(token) && !user && isLoading;

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  if (token && user) {
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

    const isAdmin =
      !!user?.roles?.some(
        (role) => role.name === "gym_manager" || role.name === "admin",
      ) ||
      user?.selectedRole === "gym_manager" ||
      user?.selectedRole === "admin" ||
      roleFromStorage === "gym_manager" ||
      roleFromStorage === "admin" ||
      storedSelectedRole === "gym_manager" ||
      storedSelectedRole === "admin";

    return (
      <Navigate
        to={
          isAdmin
            ? "/gym/dashboard"
            : isCoach
              ? "/coach/dashboard"
              : "/user/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}
