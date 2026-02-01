import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isCoach = user?.roles?.includes("coach");
  const isUser = user?.roles?.includes("user");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (isCoach) {
      navigate("/coach/dashboard");
    } else if (isUser) {
      navigate("/user/dashboard");
    }
  };

  return (
    <nav className="bg-[color:var(--navbar)] px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-2xl font-bold text-white">
        <span className="text-[color:var(--accent)]">🏸</span>
        <span className="font-extrabold">Coachify</span>
      </div>

      <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
        <li className="text-[color:var(--accent)] cursor-pointer" onClick={() => navigate("/")}>Home</li>
        {!user && (
          <>
            <li className="cursor-pointer hover:text-[color:var(--accent)]">
              Coaches 
            </li>
            <li className="cursor-pointer hover:text-[color:var(--accent)]">
              User 
            </li>
          </>
        )}
        <li className="cursor-pointer hover:text-[color:var(--accent)]">
          Pages 
        </li>
        <li className="cursor-pointer hover:text-[color:var(--accent)]">
          Blog 
        </li>
        <li className="cursor-pointer hover:text-[color:var(--accent)]">
          Contact Us
        </li>
      </ul>
      <div className="flex gap-3">
        {user ? (
          <>
            <button
              onClick={handleDashboardClick}
              className="bg-white text-[color:var(--navbar)] px-5 py-2 rounded-xl font-semibold hover:bg-gray-800 hover:text-white duration-800"
            >
              {isCoach ? "Coach Dashboard" : "User Dashboard"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-600 duration-800"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[color:var(--navbar)] px-5 py-2 rounded-xl font-semibold hover:bg-gray-800 hover:text-white duration-800 "
          >
            Login / Register
          </button>
        )}

        <button className="bg-[color:var(--primary)] text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2">
          List Your Court
        </button>
      </div>
    </nav>
  );
};

export default Header;
