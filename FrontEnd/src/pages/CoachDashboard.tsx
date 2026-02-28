import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import courtsIcon from "../assets/court-icon.svg";
import requestsIcon from "../assets/request-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import chatIcon from "../assets/chat-icon.svg";
import earningsIcon from "../assets/invoice-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import stat01 from "../assets/statistics-01.svg";
import stat02 from "../assets/statistics-02.svg";
import stat03 from "../assets/statistics-03.svg";
import stat04 from "../assets/statistics-04.svg";
import bookingImg from "../assets/booking-01.jpg"; 
import coachImg from "../assets/avatar-01.jpg";     
import fav1 from "../assets/avatar-02.jpg"; 
import fav2 from "../assets/avatar-03.jpg";
import fav3 from "../assets/avatar-04.jpg";  
import fav4 from "../assets/avatar-05.jpg";
import fav5 from "../assets/avatar-06.jpg";
import booking2 from "../assets/booking-02.jpg"; 
import booking3 from "../assets/booking-03.jpg"; 
import booking4 from "../assets/booking-04.jpg"; 
import booking5 from "../assets/booking-05.jpg";
import booking6 from "../assets/booking-06.jpg";
import walletbkg from "../assets/walletbg.png"; 


type Client = {
  id: string;
  name: string;
  group?: string;
  active: boolean;
};

type Session = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "individual" | "group";
  capacity?: number;
  booked?: number;
};

type RevenueStat = {
  label: string;
  value: string;
  hint: string;
};

export default function CoachDashboard() {

  function BookingRow({
  id,
  img,
  name,
  type,
  date,
  time,
  price,
}: {
  id: string;
  img: string;
  name: string;
  type: string;
  date: string;
  time: string;
  price: string;
}) {
  return (
    <div className="py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src={img} className="w-14 h-14 rounded-xl object-cover" />
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-sm text-green-600">{type}</p>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p className="font-semibold text-gray-900">Date & Time</p>
        <p>{date}</p>
        <p>{time}</p>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-lg font-extrabold text-green-600">{price}</p>
        <div className="relative">
  <button
    type="button"
    onClick={() =>
      setOpenBookingMenuId(openBookingMenuId === id ? null : id)
    }
    className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
  >
    •••
  </button>

  {openBookingMenuId === id && (
    <div className="absolute right-0 top-12 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
      <button
  type="button"
  onClick={() => {
    alert("Cancel clicked (UI only)");
    setOpenBookingMenuId(null);
  }}
  className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
>
  ⓧ Cancel
</button>
    </div>
  )}
</div>
      </div>
    </div>
  );
}


  function RequestRow({
  img,
  name,
  court,
}: {
  img: string;
  name: string;
  court: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <img src={img} className="w-12 h-12 rounded-xl object-cover" />
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{court} • 06:00 PM to 08:00 PM</p>
        </div>
      </div>

      <button className="w-8 h-8 rounded-full border border-gray-200 text-gray-400">
        •••
      </button>
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src={img} className="w-12 h-12 rounded-xl object-cover" />
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{count}</p>
        </div>
      </div>

      <span className="text-gray-400 text-xl">›</span>
    </div>
  );
}

  function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 flex items-center justify-between">
      <div>
        <p className="text-2xl font-extrabold text-green-700">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center">
        <img src={icon} alt={label} className="w-7 h-7" />
      </div>
    </div>
  );
}

function BadgeDone({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
      ✓ {label}
    </span>
  );
}

function BadgeTodo({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold">
      ✕ {label}
    </span>
  );
}


  function QuickNavCard({
  title,
  icon,
  active = false,
  badge,
}: {
  title: string;
  icon: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`
        relative cursor-pointer rounded-2xl border p-6
        flex flex-col items-center justify-center gap-3
        transition-all duration-200
        ${
          active
            ? "bg-green-700 text-white border-green-700"
            : "bg-white border-gray-200 text-gray-800 hover:bg-green-700 hover:text-white"
        }
      `}
    >
      {badge && (
        <span className="absolute top-3 right-4 text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}

      <img
        src={icon}
        alt={title}
        className={`w-7 h-7 ${
          active ? "invert" : "group-hover:invert"
        }`}
      />

      <p className="font-semibold text-sm">{title}</p>
    </div>
  );
}

  const navigate = useNavigate();

  // Mock data (UI only)
  const clients: Client[] = useMemo(
    () => [
      { id: "c1", name: "Alice Martin", active: true },
      { id: "c2", name: "Yassine El Amrani", active: true, group: "HIIT Group" },
      { id: "c3", name: "Lina Dupont", active: false },
      { id: "c4", name: "Group – Leg Day", active: true, group: "Leg Day" },
    ],
    []
  );

  const sessions: Session[] = useMemo(
    () => [
      {
        id: "s1",
        title: "1-to-1 Strength Session",
        date: "2026-01-28",
        time: "18:30",
        type: "individual",
      },
      {
        id: "s2",
        title: "Group HIIT",
        date: "2026-01-30",
        time: "19:00",
        type: "group",
        capacity: 12,
        booked: 9,
      },
    ],
    []
  );

  const revenueStats: RevenueStat[] = useMemo(
    () => [
      { label: "Monthly Revenue", value: "€2,450", hint: "Subscriptions + packs" },
      { label: "Active Clients", value: "18", hint: "All contracts combined" },
      { label: "Fill Rate", value: "82%", hint: "Group sessions" },
      { label: "Retention", value: "91%", hint: "Last 3 months" },
    ],
    []
  );

    // ✅ Booking Requests tabs
  const [bookingTab, setBookingTab] = useState<"court" | "coaching">("court");

  const bookingRequestsCourt = [
    { img: booking2, name: "Wing Sports Academy", court: "Court 1" },
    { img: booking3, name: "Feather Badminton", court: "Court 1" },
    { img: booking4, name: "Bwing Sports Academy", court: "Court 3" },
  ];

  // ✅ This matches your screenshot (Coaching tab)
  const bookingRequestsCoaching = [
    { img: coachImg, name: "Kevin Anderson", court: "Court 1" },
    { img: fav2, name: "Kevin Anderson", court: "Court 2" },
    { img: fav3, name: "Kevin Anderson", court: "Court 3" },
  ];

  const bookingRequestsData =
    bookingTab === "court" ? bookingRequestsCourt : bookingRequestsCoaching;
  
  const [earningsHover, setEarningsHover] = useState<null | "court" | "coaching">(null);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
const [walletAmount, setWalletAmount] = useState("");
const [selectedValue, setSelectedValue] = useState<null | "v1" | "v2" | "v3" | "v4">("v1");
const [gateway, setGateway] = useState<"card" | "paypal">("paypal");

const [myBookingsTab, setMyBookingsTab] = useState<"court" | "coaching">("court");
const [openBookingMenuId, setOpenBookingMenuId] = useState<string | null>(null);

const myBookingsCourt = [
  { id: "court-1", img: booking2, title: "Leap Sports Academy", subtitle: "Court 1", guests: "Guests : 4", duration: "2 Hrs", date: "Mon, Jul 11", time: "06:00 PM - 08:00 PM", price: "$400" },
  { id: "court-2", img: booking3, title: "Wing Sports Academy", subtitle: "Court 2", guests: "Guests : 3", duration: "1 Hr",  date: "Tue, Jul 12", time: "07:00 PM - 08:00 PM", price: "$240" },
  { id: "court-3", img: booking4, title: "Feather Badminton",   subtitle: "Court 1", guests: "Guests : 1", duration: "4 Hrs", date: "Wed, Jul 13", time: "10:00 PM - 11:00 PM", price: "$320" },
  { id: "court-4", img: booking5, title: "Bwing Sports Academy", subtitle: "Court 3", guests: "Guests : 5", duration: "6 Hrs", date: "Thu, Jul 14", time: "09:00 AM - 10:00 AM", price: "$710" },
  { id: "court-5", img: booking6, title: "Wing Sports Academy",  subtitle: "Court 2", guests: "Guests : 3", duration: "1 Hr",  date: "Tue, Jul 12", time: "07:00 PM - 08:00 PM", price: "$240" },
  { id: "court-6", img: bookingImg, title: "Marsh Academy",      subtitle: "Court 2", guests: "Guests : 3", duration: "2 Hrs", date: "Fri, Jul 15", time: "11:00 AM - 12:00 PM", price: "$820" },
];

const myBookingsCoaching = [
  { id: "coach-1", img: coachImg, title: "Kevin Anderson",    subtitle: "Onetime",        guests: "Guests : 4", duration: "2 Hrs", date: "Mon, Jul 11", time: "06:00 PM - 08:00 PM", price: "$400" },
  { id: "coach-2", img: fav2,     title: "Angela Roudrigez",  subtitle: "Single Lesson",  guests: "Guests : 3", duration: "1 Hr",  date: "Tue, Jul 12", time: "07:00 PM - 08:00 PM", price: "$240" },
  { id: "coach-3", img: fav3,     title: "Evon Raddick",      subtitle: "Onetime",        guests: "Guests : 1", duration: "4 Hrs", date: "Wed, Jul 13", time: "10:00 PM - 11:00 PM", price: "$320" },
  { id: "coach-4", img: fav2,     title: "Angela Roudrigez",  subtitle: "Single Lesson",  guests: "Guests : 3", duration: "1 Hr",  date: "Tue, Jul 12", time: "07:00 PM - 08:00 PM", price: "$240" },
  { id: "coach-5", img: fav4,     title: "Harry Richardson",  subtitle: "Onetime",        guests: "Guests : 5", duration: "6 Hrs", date: "Thu, Jul 14", time: "09:00 AM - 10:00 AM", price: "$710" },
  { id: "coach-6", img: fav1,     title: "Pete Hill",         subtitle: "Onetime",        guests: "Guests : 3", duration: "2 Hrs", date: "Fri, Jul 15", time: "11:00 AM - 12:00 PM", price: "$820" },
];

const myBookingsData = myBookingsTab === "court" ? myBookingsCourt : myBookingsCoaching;

const [invoiceTab, setInvoiceTab] = useState<"court" | "coaching">("court");

const invoicesCourt = [
  {
    id: "inv-court-1",
    img: bookingImg,
    name: "Leap Sports Academy",
    sub: "Court 1",
    date: "Mon, Jul 11",
    time: "06:00 PM - 08:00 PM",
    payment: "$800",
    paidOn: "Jul 11, 2023",
    status: "Paid",
  },
  {
    id: "inv-court-2",
    img: booking2,
    name: "Wing Sports Academy",
    sub: "Court 2",
    date: "Tue, Jul 12",
    time: "05:00 PM - 06:00 PM",
    payment: "$120",
    paidOn: "Jul 12, 2023",
    status: "Paid",
  },
  {
    id: "inv-court-3",
    img: booking3,
    name: "Feather Badminton",
    sub: "Court 3",
    date: "Wed, Jul 13",
    time: "10:00 AM - 11:00 AM",
    payment: "$470",
    paidOn: "Jul 13, 2023",
    status: "Paid",
  },
  {
    id: "inv-court-4",
    img: booking4,
    name: "Bwing Sports Academy",
    sub: "Court 4",
    date: "Thu, Jul 14",
    time: "12:00 PM - 01:00 PM",
    payment: "$200",
    paidOn: "Jul 14, 2023",
    status: "Paid",
  },
];

const invoicesCoaching = [
  {
    id: "inv-coach-1",
    img: coachImg,
    name: "Kevin Anderson",
    sub: "Booked on : 25 May 2023",
    invoice: "Onetime",
    date: "Mon, Jul 11",
    time: "06:00 PM - 08:00 PM",
    payment: "$800",
    paidOn: "Jul 11, 2023",
    status: "Paid",
  },
  {
    id: "inv-coach-2",
    img: fav2,
    name: "Angela Roudrigez",
    sub: "Booked on : 26 May 2023",
    invoice: "Single Lesson",
    date: "Tue, Jul 12",
    time: "05:00 PM - 06:00 PM",
    payment: "$120",
    paidOn: "Jul 12, 2023",
    status: "Paid",
  },
  {
    id: "inv-coach-3",
    img: fav3,
    name: "Evon Raddickz",
    sub: "Booked on : 27 May 2023",
    invoice: "Onetime",
    date: "Wed, Jul 13",
    time: "10:00 AM - 11:00 AM",
    payment: "$470",
    paidOn: "Jul 13, 2023",
    status: "Paid",
  },
  {
    id: "inv-coach-4",
    img: fav4,
    name: "Harry Richardson",
    sub: "Booked on : 28 May 2023",
    invoice: "Onetime",
    date: "Thu, Jul 14",
    time: "12:00 PM - 01:00 PM",
    payment: "$200",
    paidOn: "Jul 14, 2023",
    status: "Paid",
  },
];

const invoicesData = invoiceTab === "court" ? invoicesCourt : invoicesCoaching;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER (same as User, Coach active) ================= */}
<div className="bg-white border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 h-24 flex items-center">
    {/* Logo */}
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-xl">🏋️</span>
      <span className="text-2xl font-extrabold text-gray-900">
        Coachify
      </span>
    </div>

    {/* Menu center */}
    <div className="flex-1 flex justify-center">
      <nav className="flex items-center gap-8 text-sm font-semibold text-gray-700">
        <button onClick={() => navigate("/")}>Home</button>

        <button className="text-green-700 font-extrabold">
          Coaches
        </button>

        <button onClick={() => navigate("/user/dashboard")}>
          User
        </button>

        <button>Pages</button>
        <button>Blog</button>
        <button>Contact Us</button>
      </nav>
    </div>

    {/* Right icons */}
    <div className="flex items-center gap-3 shrink-0">
      <button className="h-10 w-10 rounded-xl bg-gray-100">🔎</button>
      <button className="h-10 w-10 rounded-xl bg-gray-100">🔔</button>
      <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
        C
      </div>
    </div>
  </div>
</div>

{/* ================= HERO ================= */}
<div
  className="relative w-full h-[260px] flex items-center"
  style={{
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

  <div className="relative z-10 px-12 text-left">
    <p className="text-sm font-extrabold tracking-widest text-lime-300">
      🏋️ COACHIFY
    </p>

    <h1 className="mt-3 text-4xl font-extrabold text-white">
      Coach Dashboard
    </h1>

    <p className="mt-3 text-white/90 text-sm font-semibold">
      Home <span className="mx-2">›</span> Coach Dashboard
    </p>
  </div>
</div>

{/* ================= QUICK NAV (Coach) ================= */}
<div className="bg-gray-50">
  <div className="px-12 lg:px-24 py-10">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">

      <QuickNavCard
        title="Dashboard"
        icon={dashboardIcon}
        active
      />

      <QuickNavCard
        title="Courts"
        icon={courtsIcon}
      />

      <QuickNavCard
        title="Requests"
        icon={requestsIcon}
        badge="03"
      />

      <QuickNavCard
        title="Bookings"
        icon={bookingsIcon}
      />

      <QuickNavCard
        title="Chat"
        icon={chatIcon}
      />

      <QuickNavCard
        title="Earnings"
        icon={earningsIcon}
      />

      <QuickNavCard
        title="Wallet"
        icon={walletIcon}
      />

      <QuickNavCard
        title="Profile Setting"
        icon={profileIcon}
      />

    </div>
  </div>
</div>



      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ================= STATS + PROFILE ================= */}
<div className="grid gap-6 lg:grid-cols-2">

  {/* --------- STATISTICS (LEFT) --------- */}
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
    <h2 className="text-xl font-extrabold text-gray-900">Statistics</h2>
    <p className="text-gray-500 mt-1">
      Track progress and improve coaching performance
    </p>

    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <StatCard
        icon={stat01}
        value="78"
        label="Total Courts Booked"
      />
      <StatCard
        icon={stat02}
        value="06"
        label="Upcoming Bookings"
      />
      <StatCard
        icon={stat03}
        value="45"
        label="Total Lessons Taken"
      />
      <StatCard
        icon={stat04}
        value="$45,056"
        label="Payments"
      />
    </div>
  </div>

  {/* --------- PROFILE (RIGHT) --------- */}
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
    <h2 className="text-xl font-extrabold text-gray-900">Profile</h2>
    <p className="text-gray-500 mt-1">
      Impress potential students with an interesting profile
    </p>

    {/* Progress */}
    <div className="mt-6">
      <div className="flex justify-between text-sm font-semibold text-gray-700">
        <span>Today</span>
        <span>70%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-green-600 w-[70%]" />
      </div>
    </div>

    {/* Completed */}
    <div className="mt-6">
      <p className="text-sm font-bold text-gray-900">Completed</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <BadgeDone label="Basic Details" />
        <BadgeDone label="Payment Setup" />
        <BadgeDone label="Availability" />
      </div>
    </div>

    {/* Need to complete */}
    <div className="mt-6">
      <p className="text-sm font-bold text-gray-900">Need to Complete</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <BadgeTodo label="Setup level for your Profile" />
        <BadgeTodo label="Add Lesson type" />
      </div>
    </div>
  </div>

</div>


        {/* ================= UPCOMING / NEXT APPOINTMENT ================= */}
<div className="mt-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-xl font-extrabold text-gray-900">
        Ongoing Appointment
      </h2>
      <p className="text-gray-500 mt-1">
        Manage appointments with our convenient scheduling system
      </p>
    </div>

    <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition duration-200">
  Complete
</span>
  </div>

  <div className="mt-6 grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
    {/* Court */}
    <div className="flex items-center gap-3 md:col-span-2">
      <img
        src={bookingImg}   
        alt="Court"
        className="w-14 h-14 rounded-xl object-cover"
      />
      <div>
        <p className="font-bold text-gray-900">Leap Sports Academy</p>
        <p className="text-sm text-gray-500">Standard Synthetic Court 1</p>
      </div>
    </div>

    {/* Client */}
    <div className="flex items-center gap-3">
      <img
        src={coachImg}   // 👈 second image you mentioned
        alt="Client"
        className="w-10 h-10 rounded-full object-cover"
      />
      <p className="font-semibold text-gray-900">Harry</p>
    </div>

    {/* Date */}
    <div>
      <p className="text-sm font-semibold text-gray-900">Appointment Date</p>
      <p className="text-sm text-gray-500">Mon, Jul 11</p>
    </div>

    {/* Start */}
    <div>
      <p className="text-sm font-semibold text-gray-900">Start Time</p>
      <p className="text-sm text-gray-500">05:25 AM</p>
    </div>

    {/* End */}
    <div>
      <p className="text-sm font-semibold text-gray-900">End Time</p>
      <p className="text-sm text-gray-500">06:25 AM</p>
    </div>

    {/* Guests */}
    <div>
      <p className="text-sm font-semibold text-gray-900">
        Additional Guests
      </p>
      <p className="text-sm text-gray-500">4</p>
    </div>
  </div>
</div>


<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* ================= BOOKING REQUESTS ================= */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <div className="flex justify-between items-start">
    <div>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        Booking Requests
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          03
        </span>
      </h2>
      <p className="text-gray-500 text-sm mt-1">
        Easily handle court booking requests
      </p>
    </div>

    <div className="flex gap-2 bg-gray-50 p-1 rounded-full">
  <button
    onClick={() => setBookingTab("court")}
    className={
      bookingTab === "court"
        ? "bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
        : "bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
    }
  >
    Court
  </button>

  <button
    onClick={() => setBookingTab("coaching")}
    className={
      bookingTab === "coaching"
        ? "bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
        : "bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
    }
  >
    Coaching
  </button>
</div>
  </div>

  <div className="mt-5 divide-y">
    {bookingRequestsData.map((b, i) => (
      <div key={i} className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={b.img} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <p className="font-semibold text-sm text-gray-900">{b.name}</p>
            <p className="text-xs text-gray-500">
              {b.court} | 06:00 PM – 08:00 PM
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500">Date: Tue, Jul 11</p>
      </div>
    ))}
  </div>
</div>


  {/* ================= MY FAVOURITES ================= */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <div className="flex justify-between items-start">
    <div>
      <h2 className="text-lg font-bold text-gray-900">
        My Favourites
      </h2>
      <p className="text-gray-500 text-sm mt-1">
        Lorem Ipsum is simply
      </p>
    </div>

    <button className="text-sm font-semibold text-gray-700 hover:underline">
      View All
    </button>
  </div>

  <div className="mt-5 divide-y">
    {[
      { img: fav1, name: "Harry", count: "10 Bookings", date: "Tue, Jul 11" },
      { img: fav2, name: "Johnson", count: "15 Bookings", date: "Wed, Jul 10" },
      { img: fav3, name: "Andy", count: "12 Bookings", date: "Fri, Jul 13" },
    ].map((f, i) => (
      <div key={i} className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* 🔥 SQUARE AVATAR */}
          <img
            src={f.img}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900">{f.name}</p>
            <p className="text-xs text-gray-500">{f.count}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Date: {f.date}
        </p>
      </div>
    ))}
  </div>
</div>


  {/* ================= EARNINGS ================= */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-extrabold text-gray-900">
        Earnings
      </h2>

      <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
        <option>This Week</option>
      </select>
    </div>

    <div className="mt-8 flex justify-center">
  <div className="relative w-40 h-40 flex items-center justify-center">
    {/* SVG donut */}
    <svg viewBox="0 0 36 36" className="w-40 h-40">
      {/* Background ring */}
      <path
        d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="4"
      />

      {/* Courts segment (example: 65%) */}
      <path
        d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
        fill="none"
        stroke="#22c55e"
        strokeWidth="4"
        strokeDasharray="65 35"
        strokeDashoffset="0"
        onMouseEnter={() => setEarningsHover("court")}
        onMouseLeave={() => setEarningsHover(null)}
        style={{ cursor: "pointer" }}
      />

      {/* Coaching segment (example: 15%) */}
      {/* 65% already used, so this starts after it => dashoffset -65 */}
      <path
        d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
        fill="none"
        stroke="#86efac"
        strokeWidth="4"
        strokeDasharray="15 85"
        strokeDashoffset="-65"
        onMouseEnter={() => setEarningsHover("coaching")}
        onMouseLeave={() => setEarningsHover(null)}
        style={{ cursor: "pointer" }}
      />
    </svg>

    {/* Center label */}
    <div className="absolute w-28 h-28 bg-white rounded-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {earningsHover === "court"
            ? "Courts (65%)"
            : earningsHover === "coaching"
            ? "Coaching (15%)"
            : "Total Earnings"}
        </p>
        <p className="text-2xl font-extrabold text-gray-900">4050</p>
      </div>
    </div>
      </div>
    </div>
  </div>

</div>

{/* ================= MY AVAILABILITY ================= */}
<div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
  
  {/* Header */}
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-lg font-extrabold text-gray-900">
        My Availability
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Easily communicate your availability for a seamless coaching experience.
      </p>
    </div>

    <div className="flex gap-3">
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
        <option>This Week</option>
      </select>

      <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
        Edit Availability
      </button>
    </div>
  </div>

  {/* Days */}
  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {[
      { date: "23 Jul 2023", day: "Monday" },
      { date: "24 Jul 2023", day: "Tuesday" },
      { date: "25 Jul 2023", day: "Wednesday" },
      { date: "26 Jul 2023", day: "Thursday" },
      { date: "27 Jul 2023", day: "Friday" },
      { date: "28 Jul 2023", day: "Saturday" },
    ].map((d, i) => (
      <div
        key={i}
        className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"
      >
        <p className="font-semibold text-gray-900 text-sm">{d.date}</p>
        <p className="text-xs text-gray-500 mt-1">{d.day}</p>

        <div className="mt-4">
          <p className="text-xs text-gray-500">Time</p>
          <p className="text-sm font-semibold text-green-600 mt-1">
            09:00 AM to 7:00 PM
          </p>
        </div>
      </div>
    ))}
  </div>

</div>


{/* BOOKINGS + SIDEBAR */}
<div className="mt-10 grid gap-6 lg:grid-cols-3">
  
  {/* LEFT – MY BOOKINGS */}
<div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
  {/* Header + Tabs */}
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
        My Bookings
      </h2>
      <p className="text-gray-500 mt-1">Expertly manage court bookings</p>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
      <button
        type="button"
        onClick={() => {
          setMyBookingsTab("court");
          setOpenBookingMenuId(null);
        }}
        className={
          myBookingsTab === "court"
            ? "px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
            : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
        }
      >
        Court
      </button>

      <button
        type="button"
        onClick={() => {
          setMyBookingsTab("coaching");
          setOpenBookingMenuId(null);
        }}
        className={
          myBookingsTab === "coaching"
            ? "px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
            : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
        }
      >
        Coaching
      </button>
    </div>
  </div>

  {/* Rows */}
  <div className="mt-6 divide-y divide-gray-100">
    {myBookingsData.map((b) => (
      <div
        key={b.id}
        className="py-4 flex items-center justify-between relative"
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <img src={b.img} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-gray-900">{b.title}</p>
            <p className="text-sm text-green-600">{b.subtitle}</p>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span>{b.guests}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{b.duration}</span>
            </div>
          </div>
        </div>

        {/* Middle */}
        <div className="text-sm text-gray-500">
          <p className="font-semibold text-gray-900">Date & Time</p>
          <p>{b.date}</p>
          <p>{b.time}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 relative">
          <p className="text-lg font-extrabold text-green-600">{b.price}</p>

          {/* 3 dots */}
          <button
            type="button"
            onClick={() =>
              setOpenBookingMenuId((prev) => (prev === b.id ? null : b.id))
            }
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
          >
            •••
          </button>

          {/* Dropdown */}
          {openBookingMenuId === b.id && (
            <div className="absolute right-0 top-12 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                type="button"
                onClick={() => {
                  alert(`Cancel booking: ${b.id} (UI only)`);
                  setOpenBookingMenuId(null);
                }}
                className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                ⓧ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

  {/* RIGHT SIDEBAR */}
<div className="space-y-6">

  {/* WALLET */}
  <div
    className="rounded-2xl p-6 text-white"
    style={{
      backgroundImage: `url(${walletbkg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">Your Wallet Balance</p>
        <p className="text-3xl font-extrabold mt-1">$4,544</p>
      </div>

      <button
  onClick={() => setIsWalletModalOpen(true)}
  className="px-4 py-2 rounded-xl border border-lime-300 text-lime-200 font-semibold"
>
  Add Payment
</button>
    </div>
    {isWalletModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay */}
    <button
  type="button"
  className="absolute inset-0 bg-black/50"
  onClick={() => setIsWalletModalOpen(false)}
  aria-label="Close modal"
/>

    {/* Modal */}
    <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="text-lg font-extrabold text-gray-900">Add Payment to Wallet</h3>
        <button
          onClick={() => setIsWalletModalOpen(false)}
          className="text-red-500 text-xl font-bold leading-none"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
        {/* Wallet balance card */}
        <div className="rounded-2xl bg-emerald-700 text-white p-5">
          <p className="text-sm opacity-90 font-semibold">Your Wallet Balance</p>
          <p className="text-4xl font-extrabold mt-2">$4,544</p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Amount</label>
         <input
  type="number"
  min="0"
  value={walletAmount}
  onChange={(e) => setWalletAmount(e.target.value)}
  placeholder="Enter Amount"
  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
/>
        </div>

        {/* OR */}
        <div className="text-sm font-extrabold text-gray-900">OR</div>

        {/* Quick values */}
        <div className="space-y-3">
          {[
            { key: "v1", label: "Add Value 1", amount: 80 },
            { key: "v2", label: "Add Value 2", amount: 60 },
            { key: "v3", label: "Add Value 3", amount: 120 },
            { key: "v4", label: "Add Value 4", amount: 120 },
          ].map((v) => {
            const active = selectedValue === (v.key as any);
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  setSelectedValue(v.key as any);
                  setWalletAmount(String(v.amount));
                }}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-4 transition
                  ${active ? "border-emerald-600 bg-emerald-50" : "border-gray-200 bg-gray-50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-5 w-5 rounded border flex items-center justify-center text-white text-xs font-black
                      ${active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-300"}
                    `}
                  >
                    {active ? "✓" : ""}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{v.label}</span>
                </div>

                <span
                  className={`px-4 py-2 rounded-xl text-sm font-extrabold
                    ${active ? "bg-sky-500 text-white" : "bg-white text-gray-400 border border-gray-200"}
                  `}
                >
                  + ${v.amount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gateway */}
        <div className="rounded-2xl bg-amber-50/40 border border-amber-100 p-4">
          <p className="font-extrabold text-gray-900 mb-3">Select Payment Gateway</p>

          <button
            type="button"
            onClick={() => setGateway("card")}
            className={`w-full flex items-center gap-3 rounded-xl border px-4 py-4 bg-white
              ${gateway === "card" ? "border-emerald-600" : "border-gray-200"}
            `}
          >
            <span className={`h-4 w-4 rounded-full border flex items-center justify-center
              ${gateway === "card" ? "border-emerald-600" : "border-gray-300"}
            `}>
              {gateway === "card" && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
            </span>
            <span className="text-sm font-semibold text-gray-700">Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setGateway("paypal")}
            className={`mt-3 w-full flex items-center gap-3 rounded-xl border px-4 py-4 bg-white
              ${gateway === "paypal" ? "border-emerald-600" : "border-gray-200"}
            `}
          >
            <span className={`h-4 w-4 rounded-full border flex items-center justify-center
              ${gateway === "paypal" ? "border-emerald-600" : "border-gray-300"}
            `}>
              {gateway === "paypal" && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
            </span>
            <span className="text-sm font-semibold text-gray-700">Paypal</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setWalletAmount("");
            setSelectedValue(null);
            setGateway("paypal");
          }}
          className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold"
        >
          Reset
        </button>

        <button
          onClick={() => {
            // UI only for now
            setIsWalletModalOpen(false);
          }}
          className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
  </div>

  {/* NOTIFICATIONS */}
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
    <div className="flex justify-between items-center">
      <h3 className="font-extrabold text-gray-900">Notifications</h3>
      <button className="text-sm font-semibold text-green-600">
        Mark all as read
      </button>
    </div>

    <div className="mt-4 space-y-3">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex gap-3">
          <img
            src={fav3}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">
              John Smith has booked an appointment
            </p>
            <p className="text-sm text-gray-500">1h ago</p>

            <div className="mt-3 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Accept
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hookup">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
        <img
          src={booking2}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">
            Admin has approved your “Marsh Academy”
          </p>
          <p className="text-sm text-gray-500">1h ago</p>

          <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* RECENT CHATS */}
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
    <div className="flex justify-between items-center">
      <h3 className="font-extrabold text-gray-900">Recent Chats</h3>
      <button className="text-sm font-semibold text-green-600">
        Go to Chat
      </button>
    </div>

    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <img
          src={fav4}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">Harry</p>
          <p className="text-sm text-gray-500">10 Bookings</p>
        </div>
        <span className="ml-auto text-xs text-gray-400">2 min ago</span>
      </div>

      <div className="flex items-center gap-3">
        <img
          src={fav2}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">Johnson</p>
          <p className="text-sm text-gray-500">15 Bookings</p>
        </div>
        <span className="ml-auto text-xs text-gray-400">2 min ago</span>
      </div>
    </div>
  </div>

</div>

</div>


{/* ================= RECENT INVOICES ================= */}
<div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
  {/* Header */}
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-xl font-extrabold text-gray-900">Recent Invoices</h2>
      <p className="text-gray-500 mt-1">
        Lorem Ipsum is simply dummy text of the printing
      </p>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
      <button
        type="button"
        onClick={() => setInvoiceTab("court")}
        className={
          invoiceTab === "court"
            ? "px-4 py-2 rounded-lg bg-[color:var(--primary)] text-white text-sm font-semibold"
            : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
        }
      >
        Court
      </button>

      <button
        type="button"
        onClick={() => setInvoiceTab("coaching")}
        className={
          invoiceTab === "coaching"
            ? "px-4 py-2 rounded-lg bg-[color:var(--primary)] text-white text-sm font-semibold"
            : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
        }
      >
        Coaching
      </button>
    </div>
  </div>

  {/* Table header */}
  <div className="mt-6 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
    <div className="col-span-4">Court Name</div>
    <div className="col-span-2">Invoice</div>
    <div className="col-span-3">Date & Time</div>
    <div className="col-span-1">Payment</div>
    <div className="col-span-1">Paid On</div>
    <div className="col-span-1">Status</div>
  </div>

  {/* Rows */}
  <div className="divide-y divide-gray-100">
    {invoicesData.map((row) => (
      <div key={row.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4">
        {/* Name + image */}
        <div className="col-span-4 flex items-center gap-3">
          <img src={row.img} className="w-12 h-12 rounded-lg object-cover" />
          <div>
            <p className="font-bold text-gray-900">{row.name}</p>
            <p className="text-sm text-green-600">{row.sub}</p>
          </div>
        </div>

        {/* Invoice type */}
        <div className="col-span-2 text-sm text-gray-700">
          {invoiceTab === "coaching" ? (row as any).invoice : "—"}
        </div>

        {/* Date & time */}
        <div className="col-span-3 text-sm text-gray-700">
          <p>{row.date}</p>
          <p className="text-gray-500">{row.time}</p>
        </div>

        {/* Payment */}
        <div className="col-span-1 font-semibold">{row.payment}</div>

        {/* Paid on */}
        <div className="col-span-1 text-sm text-gray-700">{row.paidOn}</div>

        {/* Status */}
        <div className="col-span-1">
          <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold inline-flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-sm" />
            {row.status}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
{/* ================= END RECENT INVOICES ================= */}







        {/* Footer hint */}
        
      </div>
    </div>
  );
}

function ActionCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-between">
      <p className="font-bold text-gray-900">{title}</p>
      <button
        className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)]"
        onClick={() => alert(`${title} (UI)`)}
      >
        Open
      </button>
    </div>
  );
}
