import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import CoachOffersPage from "./pages/CoachOffersPage";
import CoachExercicesPage from "./pages/CoachExercicesPage";
import CoachSeancesPage from "./pages/CoachSeancesPage";
import WalletPage from "./pages/WalletPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingsPage from "./pages/BookingsPage";
import CoachesPage from "./pages/CoachesPage";
import BookCoachPage from "./pages/BookCoachPage";
import CoachProfilePage from "./pages/CoachProfilePage.tsx";
import CoachProgrammesPage from "./pages/CoachProgrammesPage";
import CoachPublicProgrammesPage from "./pages/CoachPublicProgrammesPage";
import MyProgrammeReservationsPage from "./pages/MyProgrammeReservationsPage";
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

      <Route path="/coaches" element={<CoachesPage />} />
        <Route path="/coaches/:coachId/profile" element={<CoachProfilePage />} />
        <Route path="/coach/exercices" element={<CoachExercicesPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/wallet" element={<WalletPage />} />
        <Route path="/user/bookings" element={<BookingsPage />} />
        <Route path="/user/profile" element={<UserProfilePage />} />

        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        <Route path="/coach/offres" element={<CoachOffersPage />} />
        <Route path="/coach/seances" element={<CoachSeancesPage />} />
        <Route path="/coach/exercices" element={<CoachExercicesPage />} />
        <Route path="/coach/programmes" element={<CoachProgrammesPage />} />

        <Route path="/client/programmes/reservations" element={<MyProgrammeReservationsPage />} />
        <Route path="/client/coaches/:coachId/programmes" element={<CoachPublicProgrammesPage />} />

        <Route path="/book-coach/:coachId" element={<BookCoachPage />} />
      </Route>
    </Routes>
  );
}
