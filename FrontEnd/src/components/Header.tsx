import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-[color:var(--navbar)] px-10 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 text-2xl font-bold text-white">
        <span className="text-[color:var(--accent)]">🏸</span>
        <span className="font-extrabold">Coachify</span>
      </div>

      {/* Menu */}
      <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
        <li className="text-[color:var(--accent)] cursor-pointer">Home</li>
        <li className="cursor-pointer hover:text-[color:var(--accent)]">
          Coaches 
        </li>
        <li className="cursor-pointer hover:text-[color:var(--accent)]">
          User 
        </li>
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
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-[color:var(--navbar)] px-5 py-2 rounded-xl font-semibold hover:bg-gray-800 hover:text-white duration-800 "
        >
          Login / Register
        </button>

        <button className="bg-[color:var(--primary)] text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2">
          ✔ List Your Court
        </button>
      </div>
    </nav>
  );
};

export default Header;
