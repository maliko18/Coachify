import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import WalletPage from "./pages/WalletPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingsPage from "./pages/BookingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header />
            <Hero />
            <HowItWorks />
          </>
        }
      />
      
      {/* Routes pour les visiteurs (non connectés) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Routes protégées (connectés) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/wallet" element={<WalletPage />} />
        <Route path="/user/bookings" element={<BookingsPage />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/coach/dashboard" element={<CoachDashboard />} />

      </Route>
    </Routes>
    
  );
}
