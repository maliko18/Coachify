import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
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
  onClick,
}: {
  title: string;
  icon: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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


const [activeSection, setActiveSection] = useState<CoachSection>("dashboard");

type StatusTab = "upcoming" | "completed" | "cancelled";
type TypeTab = "court" | "coaching";
type CoachSection = "dashboard" | "bookings" | "earnings" | "wallet";

const [bookingsStatus, setBookingsStatus] = useState<StatusTab>("upcoming");
const [bookingsType, setBookingsType] = useState<TypeTab>("coaching");
const [bookingsSearch, setBookingsSearch] = useState("");

const [seances, setSeances] = useState<any[]>([]);
const [loadingSeances, setLoadingSeances] = useState(false);
const [errorSeances, setErrorSeances] = useState("");

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

const fetchSeances = async () => {
  setLoadingSeances(true);
  setErrorSeances("");
  try {
    const res = await axiosClient.get("/coach/seances");
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setSeances(data);
  } catch (e: any) {
    setErrorSeances(e?.response?.data?.message || "Erreur lors du chargement des séances");
  } finally {
    setLoadingSeances(false);
  }
};

type Seance = {
  id: number;
  coach_id: number;
  titre: string;
  date: string;          // YYYY-MM-DD
  heure_debut: string;   // HH:MM:SS ou HH:MM
  duree: number;
  type: string;          // individuelle | collective | en_ligne ...
  statut: string;        // planifiee | en_cours | terminee | annulee ...
  capacite_max?: number | null;
  lieu?: string | null;
  notes?: string | null;
};

const [openActionId, setOpenActionId] = useState<number | null>(null);

// modal
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<"view" | "edit">("view");
const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);

// form (edit)
const [editForm, setEditForm] = useState({
  titre: "",
  date: "",
  heure_debut: "",
  duree: 60,
  type: "individuelle",
  statut: "planifiee",
  capacite_max: 1,
  lieu: "",
  notes: "",
});

const [actionLoading, setActionLoading] = useState(false);


const openViewSeance = async (id: number) => {
  setActionLoading(true);
  try {
    const res = await axiosClient.get(`/coach/seances/${id}`);
    const data: Seance = res.data;
    setSelectedSeance(data);
    setModalMode("view");
    setIsModalOpen(true);
  } catch (e: any) {
    alert(e?.response?.data?.message || "Impossible de charger la séance");
  } finally {
    setActionLoading(false);
  }
};

const openEditSeance = async (id: number) => {
  setActionLoading(true);
  try {
    const res = await axiosClient.get(`/coach/seances/${id}`);
    const data: Seance = res.data;

    setSelectedSeance(data);
    setEditForm({
      titre: data.titre || "",
      date: data.date || "",
      heure_debut: (data.heure_debut || "").slice(0, 5), // HH:MM
      duree: data.duree ?? 60,
      type: data.type || "individuelle",
      statut: data.statut || "planifiee",
      capacite_max: data.capacite_max ?? 1,
      lieu: data.lieu ?? "",
      notes: data.notes ?? "",
    });

    setModalMode("edit");
    setIsModalOpen(true);
  } catch (e: any) {
    alert(e?.response?.data?.message || "Impossible de charger la séance");
  } finally {
    setActionLoading(false);
  }
};

const saveEditSeance = async () => {
  if (!selectedSeance?.id) return;

  try {
    const payload = {
      titre: editForm.titre,
      date: editForm.date,                 // "YYYY-MM-DD"
      heure_debut: editForm.heure_debut.length === 5
        ? `${editForm.heure_debut}:00`      // "HH:MM:SS"
        : editForm.heure_debut,
      duree: Number(editForm.duree),
      type: editForm.type,
      statut: editForm.statut,
      capacite_max: Number(editForm.capacite_max),
      lieu: editForm.lieu ?? "",
      notes: editForm.notes ?? "",
    };

    await axiosClient.put(`/coach/seances/${selectedSeance.id}`, payload);

    setIsModalOpen(false);
    fetchSeances();
  } catch (err: any) {
    console.error(err);
    const msg =
      err?.response?.data?.message ||
      JSON.stringify(err?.response?.data) ||
      "Invalid data";
    alert(msg);
  }
};

const deleteSeance = async (id: number) => {
  const ok = window.confirm("Supprimer cette séance ?");
  if (!ok) return;

  setActionLoading(true);
  try {
    await axiosClient.delete(`/coach/seances/${id}`);

    // refresh list
    await fetchSeances();

    setOpenActionId(null);
    if (selectedSeance?.id === id) {
      setIsModalOpen(false);
      setSelectedSeance(null);
    }
  } catch (e: any) {
    alert(e?.response?.data?.message || "Delete failed");
  } finally {
    setActionLoading(false);
  }
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedSeance(null);
};


// ===================== EARNINGS (PAIEMENTS) =====================

type Money = { amount: number; formatted: string; currency: string };



type Payment = {
  id: number;
  montant: Money;
  devise?: string;
  date_paiement: string; // ISO
  methode: string;
  methode_label?: string;
  statut: "en_attente" | "valide" | "refuse" | "rembourse" | "annule";
  statut_label?: string;
  reference?: string;
  description?: string;
  client?: {
    id: number;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
};

type PaymentStats = {
  periode: { debut: string; fin: string };
  chiffre_affaires: number;
  total_rembourse: number;
  ca_net: number;
  en_attente: number;
  nombre_paiements: number;
  nombre_valides: number;
  repartition_methode?: Record<string, { nombre: number; total: number; label: string }>;
};

type PeriodKey = "week" | "month" | "year" | "custom";

const [earningsPeriod, setEarningsPeriod] = useState<PeriodKey>("week");
const [earningsSearch, setEarningsSearch] = useState("");
const [earningsStatus, setEarningsStatus] = useState<string>(""); // "" = all

const [earningsDateDebut, setEarningsDateDebut] = useState<string>("");
const [earningsDateFin, setEarningsDateFin] = useState<string>("");

const [payments, setPayments] = useState<Payment[]>([]);
const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
const [loadingEarnings, setLoadingEarnings] = useState(false);
const [errorEarnings, setErrorEarnings] = useState("");

const [openPaymentActionId, setOpenPaymentActionId] = useState<number | null>(null);
const [earningsActionLoading, setEarningsActionLoading] = useState(false);

// refund modal
const [refundModalOpen, setRefundModalOpen] = useState(false);
const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
const [refundAmount, setRefundAmount] = useState<string>("");
const [refundMotif, setRefundMotif] = useState<string>("");

// helpers date
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const startOfWeekMonday = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

// set default dates when period changes
useMemo(() => {
  const now = new Date();
  let a = new Date(now);
  let b = new Date(now);

  if (earningsPeriod === "week") {
    a = startOfWeekMonday(now);
    b = new Date(a);
    b.setDate(a.getDate() + 6);
  } else if (earningsPeriod === "month") {
    a = startOfMonth(now);
    b = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (earningsPeriod === "year") {
    a = startOfYear(now);
    b = new Date(now.getFullYear(), 11, 31);
  } else {
    // custom: keep current values
    return null;
  }

  // update states safely (only if empty or changing period)
  setEarningsDateDebut(toISODate(a));
  setEarningsDateFin(toISODate(b));
  return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [earningsPeriod]);

const buildPaymentsParams = () => {
  const params: any = {};
  if (earningsDateDebut) params.date_debut = earningsDateDebut;
  if (earningsDateFin) params.date_fin = earningsDateFin;
  if (earningsStatus) params.statut = earningsStatus;
  return params;
};

const fetchEarnings = async () => {
  setLoadingEarnings(true);
  setErrorEarnings("");

  try {
    const params = buildPaymentsParams();

    const [listRes, statsRes] = await Promise.all([
      axiosClient.get("/coach/paiements", { params }),
      axiosClient.get("/coach/paiements-statistiques", {
        params: { date_debut: earningsDateDebut, date_fin: earningsDateFin },
      }),
    ]);

    const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data ?? []);
    setPayments(list);
    setPaymentStats(statsRes.data);
  } catch (e: any) {
    setErrorEarnings(e?.response?.data?.message || "Erreur lors du chargement des paiements");
  } finally {
    setLoadingEarnings(false);
  }
};

// auto fetch when entering earnings + when date range changes
useMemo(() => {
  if (activeSection === "earnings" && earningsDateDebut && earningsDateFin) {
    fetchEarnings();
  }
  return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeSection, earningsDateDebut, earningsDateFin, earningsStatus]);

const postPaymentAction = async (id: number, action: "valider" | "annuler") => {
  setEarningsActionLoading(true);
  try {
    await axiosClient.post(`/coach/paiements/${id}/${action}`, {});
    await fetchEarnings();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Action échouée");
  } finally {
    setEarningsActionLoading(false);
    setOpenPaymentActionId(null);
  }
};

const openRefundModal = (p: Payment) => {
  setRefundTarget(p);
  setRefundAmount(String(p?.montant?.amount ?? ""));
  setRefundMotif("");
  setRefundModalOpen(true);
};

const submitRefund = async () => {
  if (!refundTarget?.id) return;
  const amountNumber = Number(refundAmount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    alert("Montant de remboursement invalide");
    return;
  }

  setEarningsActionLoading(true);
  try {
    await axiosClient.post(`/coach/paiements/${refundTarget.id}/rembourser`, {
      montant: amountNumber,
      motif: refundMotif || "Remboursement",
    });
    setRefundModalOpen(false);
    setRefundTarget(null);
    await fetchEarnings();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Remboursement échoué");
  } finally {
    setEarningsActionLoading(false);
  }
};



const deletePayment = async (id: number) => {
  const ok = window.confirm("Supprimer ce paiement ?");
  if (!ok) return;

  setEarningsActionLoading(true);
  try {
    await axiosClient.delete(`/coach/paiements/${id}`);
    await fetchEarnings();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Suppression échouée");
  } finally {
    setEarningsActionLoading(false);
    setOpenPaymentActionId(null);
  }
};

// --------- Chart data (build from payments list) ---------
const chartData = useMemo(() => {
  // two series: validés vs en_attente
  // group by day for week/month, by month for year
  const items = payments || [];
  const group: Record<string, { label: string; valid: number; pending: number }> = {};

  const isYear = earningsPeriod === "year";
  const keyOf = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    if (isYear) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${d.getFullYear()}-${m}`;
    }
    return iso.slice(0, 10);
  };

  for (const p of items) {
    const k = keyOf(p.date_paiement);
    if (!k) continue;

    if (!group[k]) group[k] = { label: k, valid: 0, pending: 0 };

    const amount = Number(p.montant?.amount ?? 0) || 0;
    if (p.statut === "valide") group[k].valid += amount;
    if (p.statut === "en_attente") group[k].pending += amount;
  }

  const rows = Object.values(group).sort((a, b) => a.label.localeCompare(b.label));

  // prettify labels
  const pretty = rows.map((r) => {
    if (isYear) {
      const [y, m] = r.label.split("-");
      return { ...r, label: `${m}/${y}` };
    }
    // dd/mm
    const [y, m, d] = r.label.split("-");
    return { ...r, label: `${d}/${m}` };
  });

  // if empty, create placeholders for week view
  if (pretty.length === 0 && earningsPeriod === "week" && earningsDateDebut) {
    const base = new Date(earningsDateDebut);
    const tmp = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      tmp.push({ label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, valid: 0, pending: 0 });
    }
    return tmp;
  }

  return pretty;
}, [payments, earningsPeriod, earningsDateDebut]);

const chartMax = useMemo(() => {
  let m = 0;
  for (const r of chartData) {
    m = Math.max(m, r.valid, r.pending);
  }
  return m || 1;
}, [chartData]);

function MiniBarChart({
  data,
  max,
}: {
  data: { label: string; valid: number; pending: number }[];
  max: number;
}) {
  return (
    <div className="mt-5">
      {/* axis */}
      <div className="h-[320px] w-full rounded-2xl bg-gray-50 border border-gray-100 p-6">
        <div className="h-full flex items-end justify-between gap-4">
          {data.map((r) => {
            const h1 = Math.round((r.valid / max) * 100);
            const h2 = Math.round((r.pending / max) * 100);

            return (
              <div key={r.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-2 h-[260px]">
                  {/* series-1 (valid) */}
                  <div
                    className="w-5 rounded-t-lg bg-lime-400"
                    style={{ height: `${h1}%` }}
                    title={`Validés: ${r.valid.toFixed(2)}`}
                  />
                  {/* series-2 (pending) */}
                  <div
                    className="w-5 rounded-t-lg bg-emerald-700"
                    style={{ height: `${h2}%` }}
                    title={`En attente: ${r.pending.toFixed(2)}`}
                  />
                </div>
                <div className="text-xs text-gray-500 font-semibold">{r.label}</div>
              </div>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-lime-400" />
            Validés
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-700" />
            En attente
          </div>
        </div>
      </div>
    </div>
  );
}



type Facture = {
  id: number;
  numero: string;
  montant_ttc?: number; // parfois number simple
  montant_ttc_formatted?: string; // si jamais
  montant_ht?: number;
  tva?: number;
  date_emission: string;   // YYYY-MM-DD
  date_echeance: string;   // YYYY-MM-DD
  statut: "brouillon" | "emise" | "payee" | "annulee" | "en_retard";
  statut_label?: string;
  est_en_retard?: boolean;
  client?: { id: number; first_name?: string; last_name?: string; full_name?: string };
};

type FactureStats = {
  total_factures: number;
  total_ht: number;
  total_ttc: number;
  par_statut: Record<string, number>;
  montant_paye: number;
  montant_en_attente: number;
};

const [factures, setFactures] = useState<Facture[]>([]);
const [loadingFactures, setLoadingFactures] = useState(false);
const [errorFactures, setErrorFactures] = useState("");

const [facturesStats, setFacturesStats] = useState<FactureStats | null>(null);
const [loadingFacturesStats, setLoadingFacturesStats] = useState(false);

const [walletSearch, setWalletSearch] = useState("");
const [walletStatut, setWalletStatut] = useState<
  "all" | "brouillon" | "emise" | "payee" | "annulee" | "en_retard"
>("all");

// simple période (tu peux garder “This Week” UI only, ou faire date_debut/date_fin)
const [walletDateDebut, setWalletDateDebut] = useState<string>("");
const [walletDateFin, setWalletDateFin] = useState<string>("");

const [openFactureActionId, setOpenFactureActionId] = useState<number | null>(null);



const fetchFactures = async () => {
  setLoadingFactures(true);
  setErrorFactures("");
  try {
    const params: any = {};

    if (walletStatut !== "all") params.statut = walletStatut;
    if (walletDateDebut) params.date_debut = walletDateDebut;
    if (walletDateFin) params.date_fin = walletDateFin;

    // search côté front: numero + nom client
    const res = await axiosClient.get("/coach/factures", { params });
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setFactures(data);
  } catch (e: any) {
    setErrorFactures(e?.response?.data?.message || "Erreur lors du chargement des factures");
  } finally {
    setLoadingFactures(false);
  }
};

const fetchFacturesStats = async () => {
  setLoadingFacturesStats(true);
  try {
    const params: any = {};
    if (walletDateDebut) params.date_debut = walletDateDebut;
    if (walletDateFin) params.date_fin = walletDateFin;

    const res = await axiosClient.get("/coach/factures-stats", { params });
    setFacturesStats(res.data);
  } catch {
    setFacturesStats(null);
  } finally {
    setLoadingFacturesStats(false);
  }
};

// Download PDF (backend: /factures/{id}/pdf) :contentReference[oaicite:6]{index=6}
const downloadFacturePdf = async (id: number) => {
  try {
    const res = await axiosClient.get(`/coach/factures/${id}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    alert(e?.response?.data?.message || "Téléchargement PDF impossible");
  }
};

// Actions facture (cycle de vie) :contentReference[oaicite:7]{index=7}
const actionFacture = async (id: number, action: "emettre" | "payer" | "annuler") => {
  try {
    await axiosClient.post(`/coach/factures/${id}/${action}`);
    await fetchFactures();
    await fetchFacturesStats();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Action impossible");
  } finally {
    setOpenFactureActionId(null);
  }
};

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
  active={activeSection === "dashboard"}
  onClick={() => setActiveSection("dashboard")}
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
        title="Offers"
        icon={requestsIcon}
        onClick={() => navigate("/coach/offres")}
      />

      <QuickNavCard
  title="Bookings"
  icon={bookingsIcon}
  active={activeSection === "bookings"}
  onClick={() => {
  setActiveSection("bookings");
  fetchSeances();
}}
/>

      <QuickNavCard
        title="Chat"
        icon={chatIcon}
      />

      <QuickNavCard
  title="Earnings"
  icon={earningsIcon}
  active={activeSection === "earnings"}
  onClick={() => {
    setActiveSection("earnings");
    // fetchEarnings sera appelé via useEffect quand la section est active
  }}
/>

      <QuickNavCard
  title="Wallet"
  icon={walletIcon}
  active={activeSection === "wallet"}
  onClick={() => {
    setActiveSection("wallet");
    fetchFactures();
    fetchFacturesStats();
  }}
/>

      <QuickNavCard
        title="Profile Setting"
        icon={profileIcon}
      />

    </div>
  </div>
</div>



      {/* Content */}
     {activeSection === "bookings" && (
  <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Bookings</h2>
          <p className="text-gray-500 mt-1">
            Effortlessly track and manage your completed bookings
          </p>
        </div>

  
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["upcoming","completed","cancelled"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBookingsStatus(t)}
              className={
                bookingsStatus === t
                  ? "px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
                  : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
              }
            >
              {t === "upcoming" ? "Upcoming" : t === "completed" ? "Completed" : "Cancelled"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setBookingsType("court")}
            className={
              bookingsType === "court"
                ? "px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
                : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
            }
          >
            Court
          </button>
          <button
            onClick={() => setBookingsType("coaching")}
            className={
              bookingsType === "coaching"
                ? "px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
                : "px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold"
            }
          >
            Coaching
          </button>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <input
          value={bookingsSearch}
          onChange={(e) => setBookingsSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-80 max-w-full border border-gray-200 rounded-xl px-4 py-3"
        />

        <button
          onClick={fetchSeances}
          className="px-4 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
            <div className="col-span-4">Titre</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-3">Type / Statut</div>
            <div className="col-span-2">Action</div>
          </div>

          {loadingSeances && <p className="mt-4 text-gray-500">Loading…</p>}
          {errorSeances && <p className="mt-4 text-red-600">{errorSeances}</p>}

          <div className="divide-y divide-gray-100">
            {seances
              .filter((s) => {
                // filtre search simple
                if (!bookingsSearch.trim()) return true;
                const q = bookingsSearch.toLowerCase();
                return String(s.titre ?? s.title ?? "").toLowerCase().includes(q);
              })
              .map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4">
                  <div className="col-span-4">
                    <p className="font-bold text-gray-900">{s.titre ?? s.title ?? `Séance #${s.id}`}</p>
                    <p className="text-sm text-gray-500">{s.lieu ?? "-"}</p>
                  </div>

                  <div className="col-span-3 text-sm text-gray-700">
                    <p>{s.date ?? "-"}</p>
                    <p className="text-gray-500">
                      {s.heure_debut ?? s.start_time ?? "--:--"} - {s.heure_fin ?? s.end_time ?? "--:--"}
                    </p>
                  </div>

                  <div className="col-span-3 text-sm text-gray-700">
                    <p className="font-semibold">{s.type ?? "-"}</p>
                    <p className="text-gray-500">{s.statut ?? "-"}</p>
                  </div>

                  <div className="relative">
  <button
    onClick={() =>
      setOpenActionId((prev) => (prev === s.id ? null : s.id))
    }
    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
  >
    •••
  </button>

  {openActionId === s.id && (
    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
      <button
        onClick={() => {
          setOpenActionId(null);
          openViewSeance(s.id);
        }}
        className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
      >
        👁️ View
      </button>

      <button
        onClick={() => {
          setOpenActionId(null);
          setSelectedSeance(s);
          setIsModalOpen(true);
          setModalMode("edit");
        }}
        className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
      >
        ✏️ Edit
      </button>

      <button
        onClick={() => deleteSeance(s.id)}
        className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left"
      >
        🗑️ Delete
      </button>
    </div>
  )}
</div>
                </div>
              ))}

            {!loadingSeances && !errorSeances && seances.length === 0 && (
              <p className="mt-4 text-gray-500">Aucune séance trouvée.</p>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {modalMode === "view" ? "Seance Details" : "Edit Seance"}
        </h2>
        <button onClick={closeModal}>✕</button>
      </div>

      {modalMode === "view" && selectedSeance && (
        <div className="space-y-2 text-sm">
          <p><b>Title:</b> {selectedSeance.titre}</p>
          <p><b>Date:</b> {selectedSeance.date}</p>
          <p><b>Start:</b> {selectedSeance.heure_debut}</p>
          <p><b>Duration:</b> {selectedSeance.duree} min</p>
          <p><b>Type:</b> {selectedSeance.type}</p>
          <p><b>Status:</b> {selectedSeance.statut}</p>
        </div>
      )}

      {modalMode === "edit" && (
        <div className="space-y-3">
          <input
            value={editForm.titre}
            onChange={(e) => setEditForm({...editForm, titre: e.target.value})}
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
            className="w-full border p-2 rounded"
          />

          <input
            type="time"
            value={editForm.heure_debut}
            onChange={(e) => setEditForm({...editForm, heure_debut: e.target.value})}
            className="w-full border p-2 rounded"
          />

          <button
  type="button"
  onClick={saveEditSeance}
  className="bg-black text-white px-4 py-2 rounded"
>
  Save
</button>
        </div>
      )}

    </div>
  </div>
)}

      {/* NOTE: court tab */}
      {bookingsType === "court" && (
        <p className="mt-4 text-sm text-orange-600">
          ⚠️ Court bookings: pas d’endpoint backend fourni dans le guide. Utilise Coaching = Séances.
        </p>
      )}
    </div>
  </div>
)}

{activeSection === "earnings" && (
  <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header (like screenshot) */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Invoices</h2>
          <p className="text-gray-500 mt-1">
            Maximize your coaching earnings and financial success
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-[280px] max-w-full">
            <input
              value={earningsSearch}
              onChange={(e) => setEarningsSearch(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-sm"
            />
            <span className="text-gray-500">🔎</span>
          </div>

          {/* Status dropdown like “All Invoices” */}
          <select
            value={earningsStatus}
            onChange={(e) => setEarningsStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-white"
          >
            <option value="">All Invoices</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validé</option>
            <option value="refuse">Refusé</option>
            <option value="rembourse">Remboursé</option>
            <option value="annule">Annulé</option>
          </select>

          {/* Period dropdown like “This Week” */}
          <select
            value={earningsPeriod}
            onChange={(e) => setEarningsPeriod(e.target.value as PeriodKey)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom</option>
          </select>

          <button
            onClick={fetchEarnings}
            className="px-4 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Custom date range (only if custom) */}
      {earningsPeriod === "custom" && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-700">Date début</label>
            <input
              type="date"
              value={earningsDateDebut}
              onChange={(e) => setEarningsDateDebut(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Date fin</label>
            <input
              type="date"
              value={earningsDateFin}
              onChange={(e) => setEarningsDateFin(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3"
            />
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
            <button
              onClick={fetchEarnings}
              className="px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Stats row (optional but aligned backend) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: paymentStats ? `${paymentStats.chiffre_affaires.toFixed(2)} €` : "—" },
          { label: "Net", value: paymentStats ? `${paymentStats.ca_net.toFixed(2)} €` : "—" },
          { label: "Pending", value: paymentStats ? `${paymentStats.en_attente.toFixed(2)} €` : "—" },
          { label: "Refunded", value: paymentStats ? `${paymentStats.total_rembourse.toFixed(2)} €` : "—" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
            <p className="text-sm text-gray-600 font-semibold">{c.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart like screenshot */}
      <MiniBarChart data={chartData} max={chartMax} />

      {/* Table like screenshot */}
      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-2">Date & Time</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Action</div>
          </div>

          {loadingEarnings && <p className="mt-4 text-gray-500">Loading…</p>}
          {errorEarnings && <p className="mt-4 text-red-600">{errorEarnings}</p>}

          <div className="divide-y divide-gray-100">
            {payments
              .filter((p) => {
                if (!earningsSearch.trim()) return true;
                const q = earningsSearch.toLowerCase();
                const clientName =
                  (p.client?.full_name ||
                    `${p.client?.first_name ?? ""} ${p.client?.last_name ?? ""}`.trim()) ?? "";
                return (
                  String(clientName).toLowerCase().includes(q) ||
                  String(p.reference ?? "").toLowerCase().includes(q) ||
                  String(p.description ?? "").toLowerCase().includes(q) ||
                  String(p.methode_label ?? p.methode ?? "").toLowerCase().includes(q) ||
                  String(p.statut_label ?? p.statut ?? "").toLowerCase().includes(q)
                );
              })
              .map((p) => {
                const clientName =
                  p.client?.full_name ||
                  `${p.client?.first_name ?? ""} ${p.client?.last_name ?? ""}`.trim() ||
                  `Client #${p.client?.id ?? "-"}`;

                const dateOnly = (p.date_paiement || "").slice(0, 10);
                const timeOnly = (p.date_paiement || "").slice(11, 16);

                return (
                  <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4">
                    <div className="col-span-3 flex items-center gap-3">
                      {/* avatar placeholder (backend ne donne pas d'image) */}
                      <div className="w-12 h-12 rounded-xl bg-gray-200" />
                      <div>
                        <p className="font-bold text-gray-900">{clientName}</p>
                        <p className="text-sm text-gray-500">{p.reference ?? `PAY-${p.id}`}</p>
                      </div>
                    </div>

                    <div className="col-span-2 text-sm text-gray-700">
                      {p.methode_label ?? p.methode}
                    </div>

                    <div className="col-span-2 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">{dateOnly || "-"}</p>
                      <p className="text-gray-500">{timeOnly || ""}</p>
                    </div>

                    <div className="col-span-2 font-extrabold text-gray-900">
                      {p.montant?.formatted ?? `${p.montant?.amount ?? 0} ${p.montant?.currency ?? ""}`}
                    </div>

                    <div className="col-span-2">
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold inline-flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-sm" />
                        {p.statut_label ?? p.statut}
                      </span>
                    </div>

                    <div className="col-span-1 relative flex justify-end">
                      <button
                        disabled={earningsActionLoading}
                        onClick={() => setOpenPaymentActionId((prev) => (prev === p.id ? null : p.id))}
                        className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center disabled:opacity-50"
                      >
                        •••
                      </button>

                      {openPaymentActionId === p.id && (
                        <div className="absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          <button
                            onClick={() => postPaymentAction(p.id, "valider")}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            ✅ Validate
                          </button>
                          <button
                            onClick={() => postPaymentAction(p.id, "annuler")}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            ⛔ Cancel
                          </button>
                          <button
                            onClick={() => {
                              setOpenPaymentActionId(null);
                              openRefundModal(p);
                            }}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            💸 Refund
                          </button>
                          <button
                            onClick={() => deletePayment(p.id)}
                            className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {!loadingEarnings && !errorEarnings && payments.length === 0 && (
              <p className="mt-4 text-gray-500">Aucun paiement trouvé.</p>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOpen && refundTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setRefundModalOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Refund Payment</h3>
              <button onClick={() => setRefundModalOpen(false)} className="text-xl font-bold text-gray-500">×</button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {refundTarget.reference ?? `PAY-${refundTarget.id}`} • {refundTarget.montant?.formatted ?? ""}
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Reason</label>
                <input
                  value={refundMotif}
                  onChange={(e) => setRefundMotif(e.target.value)}
                  placeholder="Reason..."
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  disabled={earningsActionLoading}
                  onClick={submitRefund}
                  className="px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-50"
                >
                  Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
)}

{activeSection === "wallet" && (
  <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Wallet</h2>
          <p className="text-gray-500 mt-1">
            Factures (stats, PDF, cycle de vie)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              value={walletSearch}
              onChange={(e) => setWalletSearch(e.target.value)}
              placeholder="Search (numero / client)..."
              className="w-72 max-w-full border border-gray-200 rounded-xl px-4 py-3 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </div>

          <select
            value={walletStatut}
            onChange={(e) => setWalletStatut(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">All</option>
            <option value="brouillon">Brouillon</option>
            <option value="emise">Émise</option>
            <option value="payee">Payée</option>
            <option value="annulee">Annulée</option>
            <option value="en_retard">En retard</option>
          </select>

          <input
            type="date"
            value={walletDateDebut}
            onChange={(e) => setWalletDateDebut(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
          />
          <input
            type="date"
            value={walletDateFin}
            onChange={(e) => setWalletDateFin(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
          />

          <button
            onClick={() => { fetchFactures(); fetchFacturesStats(); }}
            className="px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards (backend stats) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm text-gray-500 font-semibold">Total TTC</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {loadingFacturesStats ? "…" : `${facturesStats?.total_ttc?.toFixed(2) ?? "0.00"} €`}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm text-gray-500 font-semibold">Paid</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            {loadingFacturesStats ? "…" : `${facturesStats?.montant_paye?.toFixed(2) ?? "0.00"} €`}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm text-gray-500 font-semibold">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {loadingFacturesStats ? "…" : `${facturesStats?.montant_en_attente?.toFixed(2) ?? "0.00"} €`}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm text-gray-500 font-semibold">Total Invoices</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {loadingFacturesStats ? "…" : `${facturesStats?.total_factures ?? 0}`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[1050px]">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Dates</div>
            <div className="col-span-2">Amount (TTC)</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {loadingFactures && <p className="mt-4 text-gray-500">Loading…</p>}
          {errorFactures && <p className="mt-4 text-red-600">{errorFactures}</p>}

          <div className="divide-y divide-gray-100">
            {factures
              .filter((f) => {
                if (!walletSearch.trim()) return true;
                const q = walletSearch.toLowerCase();
                const clientName =
                  (f.client?.full_name ||
                    `${f.client?.first_name ?? ""} ${f.client?.last_name ?? ""}`).trim();
                return (
                  String(f.numero ?? "").toLowerCase().includes(q) ||
                  clientName.toLowerCase().includes(q)
                );
              })
              .map((f) => {
                const clientName =
                  (f.client?.full_name ||
                    `${f.client?.first_name ?? ""} ${f.client?.last_name ?? ""}`).trim() || "—";

                return (
                  <div key={f.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4">
                    <div className="col-span-3">
                      <p className="font-bold text-gray-900">{f.numero ?? `FAC#${f.id}`}</p>
                      <p className="text-xs text-gray-500">ID: {f.id}</p>
                    </div>

                    <div className="col-span-3">
                      <p className="font-semibold text-gray-900">{clientName}</p>
                      <p className="text-xs text-gray-500">client_id: {f.client?.id ?? "—"}</p>
                    </div>

                    <div className="col-span-2 text-sm text-gray-700">
                      <p>Emit: {f.date_emission ?? "—"}</p>
                      <p className="text-gray-500">Due: {f.date_echeance ?? "—"}</p>
                    </div>

                    <div className="col-span-2 font-extrabold text-emerald-700">
                      {(typeof f.montant_ttc === "number" ? f.montant_ttc : 0).toFixed(2)} €
                    </div>

                    <div className="col-span-1">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-2
                          ${
                            f.statut === "payee"
                              ? "bg-emerald-100 text-emerald-700"
                              : f.statut === "emise"
                              ? "bg-blue-100 text-blue-700"
                              : f.statut === "en_retard"
                              ? "bg-red-100 text-red-700"
                              : f.statut === "annulee"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {f.statut_label ?? f.statut}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end relative">
                      <button
                        type="button"
                        onClick={() => setOpenFactureActionId(openFactureActionId === f.id ? null : f.id)}
                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                      >
                        •••
                      </button>

                      {openFactureActionId === f.id && (
                        <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                          <button
                            type="button"
                            onClick={() => downloadFacturePdf(f.id)}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            ⬇️ Download PDF
                          </button>

                          <div className="h-px bg-gray-100" />

                          <button
                            type="button"
                            onClick={() => actionFacture(f.id, "emettre")}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            📤 Émettre
                          </button>

                          <button
                            type="button"
                            onClick={() => actionFacture(f.id, "payer")}
                            className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            ✅ Marquer payée
                          </button>

                          <button
                            type="button"
                            onClick={() => actionFacture(f.id, "annuler")}
                            className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left"
                          >
                            ⛔ Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {!loadingFactures && !errorFactures && factures.length === 0 && (
              <p className="mt-4 text-gray-500">Aucune facture trouvée.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  </div>
)}
{activeSection === "dashboard" && (
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
      )}
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
