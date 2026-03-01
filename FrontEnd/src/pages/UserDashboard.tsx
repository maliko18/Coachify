import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg"; // temporaire si pas booking
import chatIcon from "../assets/chat-icon.svg";
import invoicesIcon from "../assets/invoice-icon.svg";
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

 
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "s1",
      title: "Lower Body Strength",
      date: "2026-01-28",
      time: "18:30",
      type: "individual",
      location: "Coachify Studio",
      coachName: "Coach Sarah",
      status: "upcoming",
    },
    {
      id: "s2",
      title: "Group HIIT (8 spots)",
      date: "2026-01-30",
      time: "19:00",
      type: "group",
      location: "City Gym",
      coachName: "Coach Sarah",
      status: "upcoming",
    },
    {
      id: "s3",
      title: "Mobility & Recovery",
      date: "2026-01-22",
      time: "18:00",
      type: "individual",
      location: "Online",
      coachName: "Coach Sarah",
      status: "completed",
    },
  ]);

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

  const payments: Payment[] = useMemo(
    () => [
      { id: "pay1", date: "2026-01-10", label: "Monthly Subscription", amountEUR: 39.99, status: "paid" },
      { id: "pay2", date: "2025-12-18", label: "Pack 5 sessions", amountEUR: 75.0, status: "paid" },
      { id: "pay3", date: "2026-01-25", label: "Group Session Ticket", amountEUR: 8.0, status: "pending" },
    ],
    []
  );

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

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);

  const totalSpent = useMemo(() => payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amountEUR, 0), [payments]);

  const cancelSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
{/* ===================== HEADER ===================== */}

{/* Top Navbar */}
<div className="bg-white border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
    {/* Left: Logo */}
    <div className="flex items-center gap-3">
  <span className="text-2xl">🏋️‍♀️</span>
  <span className="text-2xl font-extrabold tracking-wide text-gray-900">
    Coachify
  </span>
</div>


    {/* Center: Menu */}
    <nav className="flex-1 flex justify-center items-center gap-8 text-sm font-semibold text-gray-600">
      <button
  onClick={() => navigate("/")}
  className="hover:text-gray-900 transition"
>
  Home
</button>


      <button className="hover:text-gray-900 transition">
        Coaches
      </button>

      {/* ACTIVE MENU */}
      <button className="font-extrabold text-lime-500">
        User
      </button>

      <button className="hover:text-gray-900 transition">
        Pages
      </button>

      <button className="hover:text-gray-900 transition">
        Blog
      </button>

      <button className="hover:text-gray-900 transition">
        Contact Us
      </button>
    </nav>

    {/* Right: Icons */}
    <div className="flex items-center gap-4">
      <button
        className="h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-lg"
        title="Search"
      >
        🔍
      </button>

      <button
        className="relative h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-lg"
        title="Notifications"
      >
        🔔
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          1
        </span>
      </button>

      <div
        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700"
        title="Profile"
      >
        U
      </div>
    </div>
  </div>
</div>



{/* ===================== END HEADER ===================== */}


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

    {/* Chat */}
    <button
      onClick={() => alert("Chat — coming soon")}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
    >
      <img src={chatIcon} alt="Chat" className="h-7 w-7" />
      <span className="font-semibold text-sm text-gray-700">Chat</span>
    </button>

    {/* Invoices */}
    <button
      onClick={() => alert("Invoices — coming soon")}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition"
    >
      <img src={invoicesIcon} alt="Invoices" className="h-7 w-7" />
      <span className="font-semibold text-sm text-gray-700">
        Invoices
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
          <p className="text-3xl font-extrabold text-green-700">78</p>
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
          <p className="text-3xl font-extrabold text-green-700">45</p>
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
          <p className="text-3xl font-extrabold text-green-700">06</p>
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
          <p className="text-3xl font-extrabold text-green-700">$45,056</p>
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
          <p className="text-sm font-semibold text-gray-900">
            Court Name
          </p>
          <p className="text-sm text-gray-500">
            Standard Synthetic Court 1
          </p>
        </div>
      </div>

      {/* Appointment Date */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Appointment Date
        </p>
        <p className="text-sm text-gray-500">
          Mon, Jul 11
        </p>
      </div>

      {/* Start Time */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Start Time
        </p>
        <p className="text-sm text-gray-500">
          05:25 AM
        </p>
      </div>

      {/* End Time */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Appointment End Time
        </p>
        <p className="text-sm text-gray-500">
          06:25 AM
        </p>
      </div>

      {/* Guests */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Additional Guests
        </p>
        <p className="text-sm text-gray-500">
          4
        </p>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Location
        </p>
        <p className="text-sm text-gray-500">
          Sant Marco
        </p>
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

        <BookingRow
          img={booking}
          academy="Leap Sports Academy"
          court="Court 1"
          guests="4"
          duration="2 Hrs"
          date="Mon, Jul 11"
          time="06:00 PM - 08:00 PM"
          price="$400"
        />

        <BookingRow
          img={booking2}
          academy="Wing Sports Academy"
          court="Court 2"
          guests="3"
          duration="1 Hr"
          date="Tue, Jul 12"
          time="07:00 PM - 08:00 PM"
          price="$240"
        />

        <BookingRow
          img={booking3}
          academy="Feather Badminton"
          court="Court 1"
          guests="1"
          duration="4 Hrs"
          date="Wed, Jul 13"
          time="10:00 PM - 11:00 PM"
          price="$320"
        />

        <BookingRow
          img={booking4}
          academy="Bwing Sports Academy"
          court="Court 3"
          guests="5"
          duration="6 Hrs"
          date="Thu, Jul 14"
          time="09:00 AM - 10:00 AM"
          price="$710"
        />

        {/* ✅ FIFTH BOOKING */}
        <BookingRow
          img={booking5}
          academy="Marsh Academy"
          court="Court 2"
          guests="3"
          duration="2 Hrs"
          date="Fri, Jul 15"
          time="11:00 AM - 12:00 PM"
          price="$820"
        />

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
        <p className="text-2xl font-extrabold mt-1">$4,544</p>
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
          <p className="font-semibold text-gray-900 text-sm">
            Leap Sports Academy
          </p>
          <p className="text-sm text-gray-500">
            Court 1 • 06:00 PM to 08:00 PM
          </p>
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

      <InvoiceRow
        img={booking}
        academy="Leap Sports Academy"
        court="Court 1"
        date="Mon, Jul 11"
        time="06:00 PM - 08:00 PM"
        amount="$800"
        paidOn="Jul 11, 2023"
      />

      <InvoiceRow
        img={booking2}
        academy="Wing Sports Academy"
        court="Court 2"
        date="Tue, Jul 12"
        time="05:00 PM - 06:00 PM"
        amount="$120"
        paidOn="Jul 12, 2023"
      />

      <InvoiceRow
        img={booking3}
        academy="Feather Badminton"
        court="Court 3"
        date="Wed, Jul 13"
        time="10:00 AM - 11:00 AM"
        amount="$470"
        paidOn="Jul 13, 2023"
      />

      <InvoiceRow
        img={booking4}
        academy="Bwing Sports Academy"
        court="Court 4"
        date="Thu, Jul 14"
        time="12:00 PM - 01:00 PM"
        amount="$200"
        paidOn="Jul 14, 2023"
      />

      <InvoiceRow
        img={booking5}
        academy="Marsh Academy"
        court="Court 5"
        date="Fri, Jul 15"
        time="08:00 AM - 09:00 AM"
        amount="$150"
        paidOn="Jul 15, 2023"
      />

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
