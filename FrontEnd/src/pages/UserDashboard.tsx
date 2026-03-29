import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg"; // temporaire si pas booking
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import stat01 from "../assets/statistics-01.svg";
import stat02 from "../assets/statistics-02.svg";
import stat03 from "../assets/statistics-03.svg";
import stat04 from "../assets/statistics-04.svg";
import bookingImg from "../assets/booking-01.jpg";
import booking from "../assets/booking-02.jpg";
import booking2 from "../assets/booking-03.jpg";
import booking3 from "../assets/booking-04.jpg";
import booking4 from "../assets/booking-05.jpg";
import booking5 from "../assets/booking-06.jpg";
import walletbg from "../assets/walletbg.png";
import Header from "../components/Header";
import programmesIcon from "../assets/programmes.svg";
import axiosClient from "../api/axios";





type SessionStatus = "upcoming" | "completed" | "cancelled";

type Session = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "individual" | "group";
  location?: string;
  coachName: string;
  status: SessionStatus;
};

type Program = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progressPct: number; // 0-100
  nextWorkout?: string;
  access: "owned" | "trial";
};

type Payment = {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  amountEUR: number;
  status: "paid" | "pending" | "failed";
};

type Message = {
  id: string;
  from: string;
  channel: "Coach" | "Group";
  preview: string;
  date: string; // YYYY-MM-DD
  unread: boolean;
};

type ApiSeance = {
  id: number;
  titre?: string;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
  duree?: number;
  statut?: string;
  lieu?: string;
  coach?: {
    user?: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

type DashboardTx = {
  id: string;
  coachName: string;
  date: string;
  time: string;
  amount: number;
  paidOn: string;
  status: "paid" | "pending" | "failed";
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export default function UserDashboard() {

  function InvoiceRow({
  img,
  academy,
  court,
  date,
  time,
  amount,
  paidOn,
}: {
  img: string;
  academy: string;
  court: string;
  date: string;
  time: string;
  amount: string;
  paidOn: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center text-sm">
      {/* Court */}
      <div className="col-span-4 flex items-center gap-3">
        <img
          src={img}
          alt={academy}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{academy}</p>
          <p className="text-sm text-green-700">{court}</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="col-span-3 text-gray-600">
        <p>{date}</p>
        <p>{time}</p>
      </div>

      {/* Payment */}
      <div className="col-span-2 font-semibold text-gray-900">
        {amount}
      </div>

      {/* Paid On */}
      <div className="col-span-2 text-gray-600">
        {paidOn}
      </div>

      {/* Status */}
      <div className="col-span-1 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 font-semibold text-xs">
          ✓ Paid
        </span>
        <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
          ⋯
        </button>
      </div>
    </div>
  );
}


  function FavouriteRow({
  img,
  name,
  count,
}: {
  img: string;
  name: string;
  count: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <img
          src={img}
          alt={name}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <p className="text-sm text-gray-500">{count}</p>
        </div>
      </div>

      <span className="text-gray-400 text-xl">›</span>
    </div>
  );
}


  // =========================
// Helper component
// =========================
function BookingRow({
  img,
  academy,
  court,
  guests,
  duration,
  date,
  time,
  price,
}: {
  img: string;
  academy: string;
  court: string;
  guests: string;
  duration: string;
  date: string;
  time: string;
  price: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <img
          src={img}
          alt={academy}
          className="h-14 w-14 rounded-xl object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{academy}</p>
          <p className="text-sm text-green-700">{court}</p>
          <p className="text-sm text-gray-500 mt-1">
            Guests : {guests} | {duration}
          </p>
        </div>
      </div>

      {/* Middle */}
      <div>
        <p className="text-sm font-semibold text-gray-900">Date & Time</p>
        <p className="text-sm text-gray-500 mt-1">{date}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <p className="text-lg font-extrabold text-green-700">{price}</p>
        <button className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
          ⋯
        </button>
      </div>
    </div>
  );
}

  const navigate = useNavigate();

 
  const [sessions, setSessions] = useState<Session[]>([]);

  const programs: Program[] = useMemo(
    () => [
      {
        id: "p1",
        name: "Glutes & Quads Builder",
        level: "Intermediate",
        progressPct: 42,
        nextWorkout: "Day 3 — Quads Focus",
        access: "owned",
      },
      {
        id: "p2",
        name: "Core & Posture Fix",
        level: "Beginner",
        progressPct: 65,
        nextWorkout: "Session — Plank Variations",
        access: "owned",
      },
      {
        id: "p3",
        name: "Fat Loss Starter Pack",
        level: "Beginner",
        progressPct: 20,
        nextWorkout: "Day 2 — Full Body",
        access: "trial",
      },
    ],
    []
  );
  const [stravaLoading, setStravaLoading] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<DashboardTx[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const messages: Message[] = useMemo(
    () => [
      {
        id: "m1",
        from: "Coach Sarah",
        channel: "Coach",
        preview: "Nice work last session. For next time, increase squat depth slightly.",
        date: "2026-01-26",
        unread: true,
      },
      {
        id: "m2",
        from: "Leg Day Group",
        channel: "Group",
        preview: "Reminder: Group HIIT Friday 19:00. Bring water + towel.",
        date: "2026-01-25",
        unread: false,
      },
    ],
    []
  );

  
  const progress = useMemo(
    () => ({
      weeklyWorkouts: 4,
      caloriesWeek: 1870,
      stepsAvg: 8200,
      streakDays: 11,
      chart: [3, 4, 2, 5, 4, 3, 4], 
    }),
    []
  );

  const upcoming = useMemo(
    () => sessions.filter((s) => s.status === "upcoming").slice(0, 4),
    [sessions]
  );

  const recentBookings = useMemo(() => sessions.slice(0, 5), [sessions]);

  const todayAppointment = useMemo(() => {
    return upcoming[0] ?? null;
  }, [upcoming]);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);

  const totalSpent = useMemo(() => payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amountEUR, 0), [payments]);

  const walletBalance = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amountEUR, 0);
    const failed = payments.filter((p) => p.status === "failed").reduce((acc, p) => acc + p.amountEUR, 0);
    return paid - failed;
  }, [payments]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const [userRes, seancesRes, commandesRes] = await Promise.all([
          axiosClient.get("/user"),
          axiosClient.get("/client/seances"),
          axiosClient.get("/commandes", { params: { per_page: 100 } }),
        ]);

        if (!isMounted) return;

        const user = userRes.data?.data ?? userRes.data;
        const email = String(user?.email || "");

        const seancesPayload = seancesRes.data?.data ?? seancesRes.data;
        const seances: ApiSeance[] = Array.isArray(seancesPayload)
          ? seancesPayload
          : Array.isArray(seancesPayload?.data)
          ? seancesPayload.data
          : [];

        const mappedSessions: Session[] = seances.map((s) => {
          const coachName =
            s.coach?.user?.full_name ||
            `${s.coach?.user?.first_name ?? ""} ${s.coach?.user?.last_name ?? ""}`.trim() ||
            "Coach";
          const statut = String(s.statut || "").toLowerCase();
          const status: SessionStatus =
            statut.includes("term") ? "completed" : statut.includes("annul") ? "cancelled" : "upcoming";

          return {
            id: String(s.id),
            title: s.titre || `Séance #${s.id}`,
            date: s.date || "",
            time: (s.heure_debut || "").slice(0, 5),
            type: String(s.type || "").toLowerCase().includes("group") ? "group" : "individual",
            location: s.lieu || "Non précisé",
            coachName,
            status,
          };
        });

        const cmdPayload = commandesRes.data?.data ?? commandesRes.data;
        const commandes: any[] = Array.isArray(cmdPayload)
          ? cmdPayload
          : Array.isArray(cmdPayload?.data)
          ? cmdPayload.data
          : [];

        const apiTx: DashboardTx[] = commandes.map((c: any) => {
          const coachUser = c?.coach?.user;
          const coachName = coachUser
            ? `${coachUser.first_name ?? ""} ${coachUser.last_name ?? ""}`.trim()
            : `Coach #${c?.coach_id ?? "-"}`;
          const createdAt = String(c?.date_commande || c?.created_at || new Date().toISOString());
          const statut = String(c?.statut || "").toLowerCase();
          const status: DashboardTx["status"] = statut === "annule" ? "failed" : statut === "attente" ? "pending" : "paid";

          return {
            id: `CMD-${c?.id}`,
            coachName,
            date: formatDate(createdAt),
            time: formatTime(createdAt),
            amount: Number(c?.total || 0),
            paidOn: formatDate(createdAt),
            status,
          };
        });

        const rawInv = localStorage.getItem("CLIENT_INVOICES");
        const parsedInv: any[] = rawInv ? JSON.parse(rawInv) : [];
        const localTx: DashboardTx[] = parsedInv
          .filter((inv: any) => !email || String(inv?.customer_email || "").toLowerCase() === email.toLowerCase())
          .map((inv: any) => ({
            id: String(inv?.id || `INV-${Date.now()}`),
            coachName: String(inv?.coach_name || "Coach"),
            date: formatDate(inv?.created_at),
            time: formatTime(inv?.created_at),
            amount: Number(inv?.amount || 0),
            paidOn: formatDate(inv?.created_at),
            status: "paid",
          }));

        const mergedTx = [...apiTx, ...localTx].sort((a, b) => b.id.localeCompare(a.id));

        setSessions(mappedSessions);
        setTransactions(mergedTx);
        setPayments(
          mergedTx.map((tx) => ({
            id: tx.id,
            date: tx.paidOn,
            label: tx.coachName,
            amountEUR: tx.amount,
            status: tx.status,
          })),
        );
      } catch {
        if (!isMounted) return;
      } finally {
        if (isMounted) setLoadingDashboard(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const cancelSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
    );
  };

  const handleConnectStrava = async () => {
  try {
    setStravaLoading(true);
    const res = await axiosClient.get("/integrations/strava/connect");
    window.location.href = res.data.url;
  } catch (error) {
    console.error("Erreur connexion Strava:", error);
  } finally {
    setStravaLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
{/* Hero Header (image section) */}
<div
  className="relative w-full h-[260px] flex items-center"
  style={{
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
    <div className="flex items-start justify-between gap-6">
      {/* Left */}
      <div>
        <p className="text-sm uppercase tracking-widest text-[color:var(--accent)] font-bold mb-2">
          🏋️‍♀️ Coachify
        </p>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          User Dashboard
        </h1>

        <p className="text-sm text-gray-200 mt-2">
          Home <span className="mx-1">›</span> User Dashboard
        </p>
      </div>

      {/* Right buttons (optional like your old top bar) */}
      <div className="flex items-center gap-3">
        

        
      </div>
    </div>
  </div>
</div>
{/* Quick Navigation */}
<div className="max-w-7xl mx-auto px-6 mt-10">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">

    {/* Dashboard (ACTIVE) */}
    <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-700 text-white p-6 shadow-sm">
      <img src={dashboardIcon} alt="Dashboard" className="h-7 w-7" />
      <span className="font-semibold text-sm">Dashboard</span>
    </button>

    {/* My Bookings */}
    <button
      onClick={() => navigate("/user/bookings")}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
    >
      <img src={bookingsIcon} alt="My Bookings" className="h-7 w-7" />
      <span className="font-semibold text-sm text-gray-700">
        My Bookings
      </span>
    </button>

    {/* Wallet */}
    <button
      onClick={() => navigate("/user/wallet")}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
    >
      <img src={walletIcon} alt="Wallet" className="h-7 w-7" />
      <span className="font-semibold text-sm text-gray-700">Wallet</span>
    </button>

{/* My Programmes */}
<button
  onClick={() => navigate("/client/programmes/reservations")}
  className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
>
  <img src={programmesIcon} alt="My Programmes" className="h-7 w-7" />
  <span className="font-semibold text-sm text-gray-700">
    My Programmes
  </span>
</button>

    {/* Profile Setting */}
    <button
      onClick={() => navigate("/user/profile")}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
    >
      <img src={profileIcon} alt="Profile Setting" className="h-7 w-7" />
      <span className="font-semibold text-sm text-gray-700">
        Profile Setting
      </span>
    </button>

    <button
  onClick={handleConnectStrava}
  className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
>
  <span className="font-semibold text-sm text-gray-700">
    {stravaLoading ? "Connexion..." : "Connect Strava"}
  </span>
</button>

  </div>
</div>




      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

       {/* Statistics */}
<div className="max-w-7xl mx-auto px-6 mt-12">
  <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
    {/* Header */}
    <div>
      <h2 className="text-lg font-extrabold text-gray-900">
        Statistics
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Boost your game with stats and goals tailored to you
      </p>
    </div>

    {/* Cards */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Total Court Booked */}
      <div className="rounded-2xl bg-[#FAFAF7] p-6 flex items-center justify-between">
        <div>
          <p className="text-3xl font-extrabold text-green-700">{loadingDashboard ? "..." : sessions.length}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Total Court Booked
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
          <img src={stat01} alt="Total Court Booked" className="h-6 w-6" />
        </div>
      </div>

      {/* Total Coaches Booked */}
      <div className="rounded-2xl bg-[#FAFAF7] p-6 flex items-center justify-between">
        <div>
          <p className="text-3xl font-extrabold text-green-700">{loadingDashboard ? "..." : new Set(sessions.map((s) => s.coachName)).size}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Total Coaches Booked
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
          <img src={stat02} alt="Total Coaches Booked" className="h-6 w-6" />
        </div>
      </div>

      {/* Total Lessons */}
      <div className="rounded-2xl bg-[#FAFAF7] p-6 flex items-center justify-between">
        <div>
          <p className="text-3xl font-extrabold text-green-700">{loadingDashboard ? "..." : sessions.filter((s) => s.status === "completed").length}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Total Lessons
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
          <img src={stat03} alt="Total Lessons" className="h-6 w-6" />
        </div>
      </div>

      {/* Payments */}
      <div className="rounded-2xl bg-[#FAFAF7] p-6 flex items-center justify-between">
        <div>
          <p className="text-3xl font-extrabold text-green-700">{loadingDashboard ? "..." : `${totalSpent.toFixed(2)} €`}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Payments
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
          <img src={stat04} alt="Payments" className="h-6 w-6" />
        </div>
      </div>

    </div>
  </div>
</div>


        {/* Today's Appointment */}
<div className="max-w-7xl mx-auto px-6 mt-12">
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

    {/* Header */}
    <div>
      <h2 className="text-lg font-extrabold text-gray-900">
        Todays Appointment
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Your Personal Badminton Schedule
      </p>
    </div>

    {/* Divider */}
    <div className="mt-6 border-t border-gray-100" />

    {/* Appointment Row */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-6 items-center">

      {/* Court */}
      <div className="flex items-center gap-4 md:col-span-1">
        <img
          src={bookingImg}
          alt="Court"
          className="h-12 w-12 rounded-xl object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">{todayAppointment?.title || "Aucun rendez-vous"}</p>
          <p className="text-sm text-gray-500">{todayAppointment?.location || "-"}</p>
        </div>
      </div>

      {/* Appointment Date */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Appointment Date
        </p>
        <p className="text-sm text-gray-500">{todayAppointment?.date || "-"}</p>
      </div>

      {/* Start Time */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Start Time
        </p>
        <p className="text-sm text-gray-500">{todayAppointment?.time || "-"}</p>
      </div>

      {/* End Time */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Appointment End Time
        </p>
        <p className="text-sm text-gray-500">-</p>
      </div>

      {/* Guests */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Additional Guests
        </p>
        <p className="text-sm text-gray-500">-</p>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Location
        </p>
        <p className="text-sm text-gray-500">{todayAppointment?.location || "-"}</p>
      </div>

    </div>
  </div>
</div>


        {/* My Bookings + Wallet */}
<div className="max-w-7xl mx-auto px-6 mt-12">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* ================= LEFT: MY BOOKINGS ================= */}
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            My Bookings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Court Reservations Made Easy
          </p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold">
            Court
          </button>
          <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">
            Coaching
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 border-t border-gray-100" />

      {/* Booking rows */}
      <div className="mt-6 space-y-6">

        {recentBookings.map((b, idx) => (
          <BookingRow
            key={b.id}
            img={[booking, booking2, booking3, booking4, booking5][idx % 5]}
            academy={b.title}
            court={b.location || "-"}
            guests="-"
            duration={b.time ? `${b.time}` : "-"}
            date={b.date || "-"}
            time={b.time || "-"}
            price="-"
          />
        ))}

        {recentBookings.length === 0 && (
          <p className="text-sm text-gray-500">Aucune réservation trouvée.</p>
        )}

      </div>
    </div>

    {/* ================= RIGHT COLUMN ================= */}
<div className="flex flex-col gap-6">

  {/* ===== Wallet Balance (COMPACT) ===== */}
  <div
    className="relative bg-green-700 rounded-2xl p-6 text-white overflow-hidden"
    style={{
      backgroundImage: `url(${walletbg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">Your Wallet Balance</p>
        <p className="text-2xl font-extrabold mt-1">{walletBalance.toFixed(2)} €</p>
      </div>

      <button className="px-4 py-2 rounded-xl bg-lime-400 text-green-900 font-semibold text-sm">
        Add Payment
      </button>
    </div>
  </div>

  {/* ===== Upcoming Appointment ===== */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-extrabold text-gray-900">
          Upcoming Appointment
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage all your upcoming court bookings.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-lg bg-green-700 text-white text-sm font-semibold">
          Court
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
          Coaching
        </button>
      </div>
    </div>

    <div className="mt-5 border-t border-gray-100 pt-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={booking}
          alt="Leap Sports Academy"
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{todayAppointment?.title || "Aucun rendez-vous"}</p>
          <p className="text-sm text-gray-500">{todayAppointment?.location || "-"} • {todayAppointment?.time || "-"}</p>
        </div>
      </div>

      <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
        ⋯
      </button>
    </div>
  </div>

  {/* ===== My Favourites ===== */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-extrabold text-gray-900">
          My Favourites
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          My favourite court lists
        </p>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-lg bg-green-700 text-white text-sm font-semibold">
          Court
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
          Coaching
        </button>
      </div>
    </div>

    <div className="mt-5 divide-y divide-gray-100">

      <FavouriteRow
        img={booking2}
        name="Wing Sports Academy"
        count="10 Bookings"
      />

      <FavouriteRow
        img={booking3}
        name="Feather Badminton"
        count="20 Bookings"
      />

      <FavouriteRow
        img={booking4}
        name="Bwing Sports Academy"
        count="30 Bookings"
      />

    </div>
  </div>

</div>


  </div>
</div>


        {/* ================= Recent Invoices ================= */}
<div className="max-w-7xl mx-auto px-6 mt-12">
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">
          Recent Invoices
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Access recent invoices related to court bookings
        </p>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold">
          Court
        </button>
        <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">
          Coaching
        </button>
      </div>
    </div>

    {/* Table Header */}
    <div className="mt-6 grid grid-cols-12 gap-4 bg-[#FAFAF7] px-5 py-3 rounded-xl text-sm font-semibold text-gray-700">
      <div className="col-span-4">Court Name</div>
      <div className="col-span-3">Date & Time</div>
      <div className="col-span-2">Payment</div>
      <div className="col-span-2">Paid On</div>
      <div className="col-span-1">Status</div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-100 mt-2">

      {transactions.slice(0, 5).map((tx, idx) => (
        <InvoiceRow
          key={tx.id}
          img={[booking, booking2, booking3, booking4, booking5][idx % 5]}
          academy={tx.coachName}
          court="Booking"
          date={tx.date}
          time={tx.time}
          amount={`${tx.amount.toFixed(2)} €`}
          paidOn={tx.paidOn}
        />
      ))}

      {transactions.length === 0 && (
        <p className="px-5 py-4 text-sm text-gray-500">Aucune facture trouvée.</p>
      )}

    </div>
  </div>
</div>


       
      </div>
    </div>
  );
}



function KpiCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-2">{hint}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-extrabold text-gray-900">{value}</span>
    </div>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-end gap-2 h-28">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-lg bg-[color:var(--primary)]"
              style={{ height: `${Math.round((v / max) * 100)}%` }}
              title={`${v}`}
            />
            <span className="text-[10px] text-gray-400">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
