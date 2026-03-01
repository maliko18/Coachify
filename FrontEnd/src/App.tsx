import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import CoachDashboard from "./pages/CoachDashboard";
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
        <Route path="/coach/dashboard" element={<CoachDashboard />} />

      </Route>
    </Routes>
    
  );
}
