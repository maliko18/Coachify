import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCoach = (user?.roles && user.roles.length > 0 && user.roles.some(role => role.name === "coach")) || user?.selectedRole === "coach";
  const isClient =
  !!user?.roles?.some((role) => role.name === "client") ||
  user?.selectedRole === "client";
  const isUserRole =
    !!user?.roles?.some((role) => ["user", "client", "prospect"].includes(role.name)) ||
    ["user", "client", "prospect"].includes(user?.selectedRole || "");
  const isUser = isUserRole || (!!user && !isCoach);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const handleDashboardClick = () => {
    setDropdownOpen(false);
    if (isCoach) {
      navigate("/coach/dashboard");
    } else if (isUser) {
      navigate("/user/dashboard");
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <nav className="bg-[color:var(--navbar)] px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-2xl font-bold text-white">
        <span className="text-[color:var(--accent)]">🏸</span>
        <span className="font-extrabold">Coachify</span>
      </div>

      <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
        <li className="text-[color:var(--accent)] cursor-pointer" onClick={() => navigate("/")}>Home</li>
        <li
          className="cursor-pointer hover:text-[color:var(--accent)]"
          onClick={() => navigate("/coaches")}
        >
          Coach
        </li>
        {isClient && (
  <li
    className="cursor-pointer hover:text-[color:var(--accent)]"
    onClick={() => navigate("/client/programmes/reservations")}
  >
    My Programmes
  </li>
)}
        {!user && (
          <>
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
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-11 h-11 rounded-full bg-[color:var(--accent)] flex items-center justify-center text-white font-bold text-lg border-3 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              {getInitials()}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-700">
                {/* Signed in section */}
                <div className="px-6 py-4 border-b border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Signed in as</p>
                  <p className="text-white font-medium truncate">{user.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  

                  <button
                    onClick={handleDashboardClick}
                    className="w-full px-6 py-3 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    {isCoach ? "Coach Dashboard" : "My Dashboard"}
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/list-court");
                    }}
                    className="w-full px-6 py-3 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    List Your Court
                  </button>


                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 text-left text-blue-400 hover:bg-gray-700 transition-colors font-medium"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-[color:var(--navbar)] px-6 py-2 rounded-xl font-semibold hover:bg-gray-800 hover:text-white duration-300 whitespace-nowrap"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[color:var(--accent)] text-white px-8 py-2 rounded-xl font-semibold hover:bg-green-600 hover:shadow-lg duration-300 whitespace-nowrap"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
