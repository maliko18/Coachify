import { Routes, Route, Navigate } from "react-router-dom";
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
import CoachProfileSettingsPage from "./pages/CoachProfileSettingsPage";
import BookingsPage from "./pages/BookingsPage";
import CoachesPage from "./pages/CoachesPage";
import BookCoachPage from "./pages/BookCoachPage";
import CoachProfilePage from "./pages/CoachProfilePage.tsx";
import CoachProgrammesPage from "./pages/CoachProgrammesPage";
import CoachPublicProgrammesPage from "./pages/CoachPublicProgrammesPage";
import CoachMessagesPage from "./pages/CoachMessagesPage";
import UserMessagesPage from "./pages/UserMessagesPage";
import CoachAnalyticsPage from "./pages/CoachAnalyticsPage";
import MyProgrammeReservationsPage from "./pages/MyProgrammeReservationsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAuditPage from "./pages/AdminAuditPage";
import GymManagerSeancesPage from "./pages/GymManagerSeancesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import BlogGrid from "./components/BlogGrid";
import ServicesPage from "./pages/ServicesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";

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
            <BlogGrid />
          </>
        }
      />

      <Route path="/services" element={<ServicesPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:postId" element={<BlogPostPage />} />
      <Route path="/contact" element={<ContactPage />} />
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
        <Route path="/user/messages" element={<UserMessagesPage />} />

        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        <Route path="/coach/profile" element={<CoachProfileSettingsPage />} />
        <Route path="/coach/offres" element={<CoachOffersPage />} />
        <Route path="/coach/seances" element={<CoachSeancesPage />} />
        <Route path="/coach/exercices" element={<CoachExercicesPage />} />
        <Route path="/coach/programmes" element={<CoachProgrammesPage />} />
        <Route path="/coach/messages" element={<CoachMessagesPage />} />
        <Route path="/coach/analytics" element={<CoachAnalyticsPage />} />

        <Route path="/gym/dashboard" element={<AdminDashboardPage />} />
        <Route path="/gym/users" element={<AdminUsersPage />} />
        <Route path="/gym/equipements" element={<AdminAuditPage />} />
        <Route path="/gym/seances" element={<GymManagerSeancesPage />} />

        <Route
          path="/admin/dashboard"
          element={<Navigate to="/gym/dashboard" replace />}
        />
        <Route
          path="/admin/users"
          element={<Navigate to="/gym/users" replace />}
        />
        <Route
          path="/admin/audit"
          element={<Navigate to="/gym/equipements" replace />}
        />

        <Route
          path="/client/programmes/reservations"
          element={<MyProgrammeReservationsPage />}
        />
        <Route
          path="/client/coaches/:coachId/programmes"
          element={<CoachPublicProgrammesPage />}
        />

        <Route
          path="/book-coach"
          element={<Navigate to="/coaches" replace />}
        />
        <Route path="/book-coach/:coachId" element={<BookCoachPage />} />
      </Route>
    </Routes>
  );
}
