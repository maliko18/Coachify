import { useState, useRef, useEffect } from "react";
import axiosClient from "../api/axios";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import booking1 from "../assets/booking-01.jpg";
import booking2 from "../assets/booking-02.jpg";
import booking3 from "../assets/booking-03.jpg";
import booking4 from "../assets/booking-04.jpg";
import booking5 from "../assets/booking-05.jpg";
import booking6 from "../assets/booking-06.jpg";
import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";
import avatar4 from "../assets/avatar-04.jpg";
import avatar5 from "../assets/avatar-05.jpg";
import Header from "../components/Header";
import ClientQuickNavBar from "../components/ClientQuickNavBar";

// ── Types ──────────────────────────────────────────────────
type BookingStatus = "Upcoming" | "Completed" | "On Going" | "Cancelled";

interface Booking {
  id: number;
  image: string;
  courtName: string;
  dateTime: string;
  payment: string;
  status: BookingStatus;
  coachName: string;
  coachAvatar: string;
  reviewCount: number;
  stars: number;
  location: string;
  pricePerHour: string;
  rank: string;
  bookedOn: string;
  bookingType: string;
  totalHours: number;
  bookingAmount: string;
  serviceCharge: string;
  totalPaid: string;
  paidOn: string;
  transactionId: string;
  paymentType: string;
  cancellationReason?: string;
  cancellationBy?: string;
  cancellationDate?: string;
}

type ApiSeance = {
  id: number;
  titre?: string;
  date?: string;
  heure_debut?: string;
  duree?: number;
  statut?: "planifiee" | "en_cours" | "terminee" | "annulee" | string;
  lieu?: string;
  coach?: {
    id?: number;
    user?: { full_name?: string; first_name?: string; last_name?: string };
  };
};

const seanceToBookingStatus = (statut?: string): BookingStatus => {
  if (statut === "terminee") return "Completed";
  if (statut === "en_cours") return "On Going";
  if (statut === "annulee") return "Cancelled";
  return "Upcoming";
};

const seanceToCoachBookingStatus = (statut?: string): CoachBookingStatus => {
  if (statut === "terminee") return "Completed";
  if (statut === "en_cours") return "Accepted";
  if (statut === "annulee") return "Cancelled";
  return "Awaiting";
};

const formatDateTime = (date?: string, heure?: string): string => {
  if (!date) return "-";
  const iso = `${date}${heure ? `T${heure}` : ""}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return `${date}${heure ? ` ${heure}` : ""}`;
  return parsed.toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ALL_BOOKINGS: Booking[] = [];

// ── Coach booking types ──────────────────────────────────
type CoachBookingStatus = "Accepted" | "Awaiting" | "Completed" | "Cancelled";

interface CoachBooking {
  id: number;
  avatar: string;
  coachName: string;
  bookedOn: string;
  bookingType: string;
  dateTime: string;
  payment: string;
  status: CoachBookingStatus;
  stars: number;
  location: string;
  pricePerHour: string;
  rank: string;
  totalHours: number;
  bookingAmount: string;
  serviceCharge: string;
  totalPaid: string;
  paidOn: string;
  transactionId: string;
  paymentType: string;
  cancellationReason?: string;
  cancellationBy?: string;
  cancellationDate?: string;
}

const ALL_COACH_BOOKINGS: CoachBooking[] = [];

const coachStatusStyle: Record<CoachBookingStatus, string> = {
  Accepted:  "bg-green-100 text-green-700",
  Awaiting:  "bg-purple-100 text-purple-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const CoachStatusIcon = ({ status }: { status: CoachBookingStatus }) => {
  if (status === "Accepted") return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

// ── Status badge colours ──────────────────────────────────
const statusStyle: Record<BookingStatus, string> = {
  Upcoming:  "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  "On Going":"bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

// ── Stars renderer ────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < count ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </span>
  );
}

// ── Details Modal ─────────────────────────────────────────
function DetailsModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-gray-900">Coach Booking Details</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[booking.status]}`}>{booking.status}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
        </div>

        <div className="px-7 py-6 space-y-6">

          {/* Court Information */}
          <section>
            <h3 className="text-base font-extrabold text-gray-900 mb-3">Court Information</h3>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                <div className="h-12 w-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  <img src={booking.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{booking.coachName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Stars count={booking.stars} />
                    <span className="text-xs text-gray-400">{booking.reviewCount} Reviews</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-800">{booking.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Price Per Hour</p>
                <p className="text-sm font-semibold text-green-600">{booking.pricePerHour} / hr</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Rank</p>
                <p className="text-sm font-semibold text-gray-800">{booking.rank}</p>
              </div>
            </div>
          </section>

          {/* Appointment Information */}
          <section>
            <h3 className="text-base font-extrabold text-gray-900 mb-3">Appointment Information</h3>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Booked On</p>
                <p className="text-sm font-semibold text-gray-800">{booking.bookedOn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Booking Type</p>
                <p className="text-sm font-semibold text-gray-800">{booking.bookingType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date &amp; Time</p>
                <p className="text-sm font-semibold text-gray-800">{booking.dateTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Number of Hours</p>
                <p className="text-sm font-semibold text-gray-800">{booking.totalHours}</p>
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <h3 className="text-base font-extrabold text-gray-900 mb-3">Payment Details</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Coaching Booking Amount</p>
                  <p className="text-sm font-semibold text-gray-800">{booking.bookingAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Number of Hours</p>
                  <p className="text-sm font-semibold text-gray-800">{booking.totalHours}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Service Charge</p>
                  <p className="text-sm font-semibold text-green-600">{booking.serviceCharge}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Amount Paid</p>
                  <p className="text-sm font-bold text-green-600">{booking.totalPaid}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Paid On</p>
                  <p className="text-sm font-semibold text-gray-800">{booking.paidOn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                  <p className="text-sm font-semibold text-gray-800 break-all">{booking.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Payment type</p>
                  <p className="text-sm font-semibold text-gray-800">{booking.paymentType}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Reason for Cancellation (only if cancelled) */}
          {booking.status === "Cancelled" && (
            <section>
              <h3 className="text-base font-extrabold text-gray-900 mb-3">Reason for Cancellation</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-bold text-red-500 mb-1">{booking.cancellationBy}</p>
                <p className="text-sm text-gray-600">{booking.cancellationReason}</p>
                <p className="text-xs text-gray-400 mt-2">Sent on {booking.cancellationDate}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-7 py-5 border-t border-gray-100">
          {booking.status === "Cancelled" ? (
            <button className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
              Initiate Refund
            </button>
          ) : (
            <div />
          )}
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action dropdown ───────────────────────────────────────
function ActionMenu({ onCancel, onEdit, onDelete }: { onCancel: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-full bg-green-700 hover:bg-green-800 text-white flex items-center justify-center text-lg font-bold leading-none transition"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 bg-white rounded-xl shadow-xl border border-gray-100 w-44 py-1 text-sm">
          <button onClick={() => { onCancel(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
            <span>↩</span> Cancel Booking
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
            <span>✎</span> Edit
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-red-500">
            <span>🗑</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
type FilterTab = BookingStatus;
type ViewMode = "Courts" | "Coaches";

export default function BookingsPage() {
  const [filterTab, setFilterTab] = useState<FilterTab>("Upcoming");
  const [viewMode, setViewMode] = useState<ViewMode>("Courts");
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [sortBy, setSortBy] = useState("Relevance");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(ALL_BOOKINGS);
  const [coachBookings, setCoachBookings] = useState<CoachBooking[]>(ALL_COACH_BOOKINGS);
  const [selectedCoachBooking, setSelectedCoachBooking] = useState<CoachBooking | null>(null);
  const [coachFilterTab, setCoachFilterTab] = useState<CoachBookingStatus>("Accepted");
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLocalBookings = (customerEmail?: string): { courts: Booking[]; coaches: CoachBooking[] } => {
      const rawInvoices = localStorage.getItem("CLIENT_INVOICES");
      const parsedInvoices: any[] = rawInvoices ? JSON.parse(rawInvoices) : [];

      const filteredInvoices = customerEmail
        ? parsedInvoices.filter((inv: any) => String(inv?.customer_email || "").toLowerCase() === customerEmail.toLowerCase())
        : parsedInvoices;

      const imagePool = [booking1, booking2, booking3, booking4, booking5, booking6];
      const avatarPool = [avatar1, avatar2, avatar3, avatar4, avatar5];

      const localCourts: Booking[] = filteredInvoices.map((inv: any, index: number) => ({
        id: Number(String(inv?.commande_id || Date.now()).replace(/\D/g, "")) || Date.now() + index,
        image: imagePool[index % imagePool.length],
        courtName: String(inv?.coach_name || "Coach booking"),
        dateTime: `${inv?.booking_date || "-"} ${Array.isArray(inv?.booking_slots) ? inv.booking_slots.join(", ") : ""}`.trim(),
        payment: `${Number(inv?.amount || 0).toFixed(2)} €`,
        status: "Upcoming",
        coachName: String(inv?.coach_name || "Coach"),
        coachAvatar: "",
        reviewCount: 0,
        stars: 5,
        location: "-",
        pricePerHour: "-",
        rank: "Coach",
        bookedOn: String(inv?.booking_date || "-"),
        bookingType: "Booking",
        totalHours: Array.isArray(inv?.booking_slots) ? inv.booking_slots.length : 1,
        bookingAmount: `${Number(inv?.amount || 0).toFixed(2)} €`,
        serviceCharge: "0.00 €",
        totalPaid: `${Number(inv?.amount || 0).toFixed(2)} €`,
        paidOn: String(inv?.created_at || "-"),
        transactionId: String(inv?.id || `INV-${index + 1}`),
        paymentType: String(inv?.payment_method_label || inv?.payment_method || "-"),
      }));

      const localCoaches: CoachBooking[] = filteredInvoices.map((inv: any, index: number) => ({
        id: Number(String(inv?.commande_id || Date.now()).replace(/\D/g, "")) || Date.now() + index,
        avatar: avatarPool[index % avatarPool.length],
        coachName: String(inv?.coach_name || "Coach"),
        bookedOn: String(inv?.booking_date || "-"),
        bookingType: "Booking",
        dateTime: `${inv?.booking_date || "-"} ${Array.isArray(inv?.booking_slots) ? inv.booking_slots.join(", ") : ""}`.trim(),
        payment: `${Number(inv?.amount || 0).toFixed(2)} €`,
        status: "Accepted",
        stars: 5,
        location: "-",
        pricePerHour: "-",
        rank: "Coach",
        totalHours: Array.isArray(inv?.booking_slots) ? inv.booking_slots.length : 1,
        bookingAmount: `${Number(inv?.amount || 0).toFixed(2)} €`,
        serviceCharge: "0.00 €",
        totalPaid: `${Number(inv?.amount || 0).toFixed(2)} €`,
        paidOn: String(inv?.created_at || "-"),
        transactionId: String(inv?.id || `INV-${index + 1}`),
        paymentType: String(inv?.payment_method_label || inv?.payment_method || "-"),
      }));

      return { courts: localCourts, coaches: localCoaches };
    };

    const loadFromApi = async () => {
      setLoadingData(true);
      setLoadingError("");
      try {
        const [userRes, seancesRes] = await Promise.all([
          axiosClient.get("/user"),
          axiosClient.get("/client/seances"),
        ]);

        if (!isMounted) return;

        const user = userRes.data?.data ?? userRes.data;
        const userEmail = String(user?.email || "");
        const local = loadLocalBookings(userEmail);

        const items: ApiSeance[] = Array.isArray(seancesRes.data)
          ? seancesRes.data
          : (seancesRes.data?.data ?? []);

        const mappedBookings: Booking[] = items.map((seance, index) => {
          const imgPool = [booking1, booking2, booking3, booking4, booking5, booking6];
          const image = imgPool[index % imgPool.length];
          const coachName =
            seance.coach?.user?.full_name ||
            `${seance.coach?.user?.first_name ?? ""} ${seance.coach?.user?.last_name ?? ""}`.trim() ||
            "Coach";
          const dateTime = formatDateTime(seance.date, seance.heure_debut);
          const durationHours = Number(seance.duree || 60) / 60;

          return {
            id: seance.id,
            image,
            courtName: seance.titre || `Séance #${seance.id}`,
            dateTime,
            payment: "-",
            status: seanceToBookingStatus(seance.statut),
            coachName,
            coachAvatar: "",
            reviewCount: 0,
            stars: 5,
            location: seance.lieu || "Non précisé",
            pricePerHour: "-",
            rank: "Coach",
            bookedOn: seance.date || "-",
            bookingType: "Séance",
            totalHours: durationHours,
            bookingAmount: "-",
            serviceCharge: "-",
            totalPaid: "-",
            paidOn: "-",
            transactionId: `SEANCE-${seance.id}`,
            paymentType: "-",
          };
        });

        const mappedCoachBookings: CoachBooking[] = items.map((seance, index) => {
          const avatarPool = [avatar1, avatar2, avatar3, avatar4, avatar5];
          const avatar = avatarPool[index % avatarPool.length];
          const coachName =
            seance.coach?.user?.full_name ||
            `${seance.coach?.user?.first_name ?? ""} ${seance.coach?.user?.last_name ?? ""}`.trim() ||
            "Coach";

          return {
            id: seance.id,
            avatar,
            coachName,
            bookedOn: seance.date || "-",
            bookingType: "Séance",
            dateTime: formatDateTime(seance.date, seance.heure_debut),
            payment: "-",
            status: seanceToCoachBookingStatus(seance.statut),
            stars: 5,
            location: seance.lieu || "Non précisé",
            pricePerHour: "-",
            rank: "Coach",
            totalHours: Number(seance.duree || 60) / 60,
            bookingAmount: "-",
            serviceCharge: "-",
            totalPaid: "-",
            paidOn: "-",
            transactionId: `SEANCE-${seance.id}`,
            paymentType: "-",
          };
        });

        setBookings([...local.courts, ...mappedBookings]);
        setCoachBookings([...local.coaches, ...mappedCoachBookings]);
        setLoadingData(false);
      } catch (error: any) {
        if (!isMounted) return;
        const msg = error?.response?.data?.message || "";
        const local = loadLocalBookings();
        setBookings(local.courts);
        setCoachBookings(local.coaches);
        if (local.courts.length === 0 && local.coaches.length === 0) {
          setLoadingError(msg || "Impossible de charger les réservations client.");
        } else {
          setLoadingError("");
        }
        setLoadingData(false);
      }
    };

    loadFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  // Courts filtered
  const filtered = bookings.filter(
    (b) =>
      b.status === filterTab &&
      b.courtName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Coaches filtered
  const coachFiltered = coachBookings.filter(
    (b) =>
      b.status === coachFilterTab &&
      b.coachName.toLowerCase().includes(search.toLowerCase())
  );
  const coachTotalPages = Math.max(1, Math.ceil(coachFiltered.length / perPage));
  const coachPaginated = coachFiltered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = (id: number) => setBookings((prev) => prev.filter((b) => b.id !== id));
  const handleCancel = (id: number) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" as BookingStatus } : b)));
  const handleCoachDelete = (id: number) => setCoachBookings((prev) => prev.filter((b) => b.id !== id));
  const handleCoachCancel = (id: number) =>
    setCoachBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" as CoachBookingStatus } : b)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── HERO ── */}
      <div
        className="relative w-full h-[260px] flex items-center"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">My Bookings</h1>
          <p className="text-sm text-gray-200 mt-2">Home <span className="mx-1">›</span> My Bookings</p>
        </div>
        <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
        <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
        <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
      </div>

      {/* ── NAV TABS ── */}
      <ClientQuickNavBar activeKey="bookings" />

      {/* ── FILTER TABS + DROPDOWNS ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-wrap items-center justify-between gap-4">
        {/* Status tabs — switches based on view mode */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {viewMode === "Courts"
            ? (["Upcoming", "Completed", "On Going", "Cancelled"] as FilterTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilterTab(t); setPage(1); }}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                    filterTab === t ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))
            : (["Accepted", "Awaiting", "Completed", "Cancelled"] as CoachBookingStatus[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setCoachFilterTab(t); setPage(1); }}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                    coachFilterTab === t ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))
          }
        </div>

        {/* Time + Sort dropdowns */}
        <div className="flex items-center gap-3">
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none cursor-pointer">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <div className="flex items-center gap-2 h-10 rounded-xl border border-gray-200 bg-white px-4">
            <span className="text-sm text-gray-500">Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer">
              <option>Relevance</option>
              <option>Date</option>
              <option>Price</option>
              <option>Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="max-w-7xl mx-auto px-6 mt-6 mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">My Bookings</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage and track all your upcoming court bookings.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="h-10 w-52 rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-4 text-sm placeholder:text-gray-400 outline-none focus:border-green-500"
                />
              </div>
              {/* Courts / Coaches toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button onClick={() => setViewMode("Courts")} className={`px-5 h-10 text-sm font-semibold transition ${viewMode === "Courts" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Courts</button>
                <button onClick={() => setViewMode("Coaches")} className={`px-5 h-10 text-sm font-semibold transition ${viewMode === "Coaches" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Coaches</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loadingData && <p className="px-6 py-4 text-sm text-gray-500">Chargement des réservations...</p>}
            {loadingError && <p className="px-6 py-4 text-sm text-red-600">{loadingError}</p>}
            {viewMode === "Courts" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Court Name <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Data &amp; Time <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Payment <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Status <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Details <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No bookings found.</td></tr>
                  ) : paginated.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={b.image} alt={b.courtName} className="h-11 w-11 rounded-xl object-cover flex-shrink-0" />
                          <span className="font-semibold text-gray-900">{b.courtName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{b.dateTime}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{b.payment}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusStyle[b.status]}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedBooking(b)} className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 font-semibold text-sm transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <ActionMenu onCancel={() => handleCancel(b.id)} onEdit={() => setSelectedBooking(b)} onDelete={() => handleDelete(b.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* ── COACHES TABLE ── */
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Coach Name <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Booking Type <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Date &amp; Time <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Payment <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Status <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Details <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">Reviews <span className="text-gray-400">↕</span></th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coachPaginated.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No coach bookings found.</td></tr>
                  ) : coachPaginated.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      {/* Coach Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={b.avatar} alt={b.coachName} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">{b.coachName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Booked on : {b.bookedOn}</p>
                          </div>
                        </div>
                      </td>
                      {/* Booking Type */}
                      <td className="px-6 py-4 text-gray-700">{b.bookingType}</td>
                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        {b.dateTime.split("\n").map((line, i) => (
                          <p key={i} className={i === 0 ? "text-gray-800 font-medium" : "text-blue-500 font-medium text-xs mt-0.5"}>{line}</p>
                        ))}
                      </td>
                      {/* Payment */}
                      <td className="px-6 py-4 font-bold text-gray-900">{b.payment}</td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${coachStatusStyle[b.status]}`}>
                          <CoachStatusIcon status={b.status} />
                          {b.status}
                        </span>
                      </td>
                      {/* Details */}
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedCoachBooking(b)} className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 font-semibold text-sm transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </td>
                      {/* Reviews */}
                      <td className="px-6 py-4">
                        <Stars count={b.stars} />
                      </td>
                      {/* Action */}
                      <td className="px-6 py-4">
                        <ActionMenu onCancel={() => handleCoachCancel(b.id)} onEdit={() => setSelectedCoachBooking(b)} onDelete={() => handleCoachDelete(b.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
            {/* Per-page */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Show</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 outline-none">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Page buttons */}
            {(() => { const tp = viewMode === "Courts" ? totalPages : coachTotalPages; return (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center text-xs">«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center text-xs">‹</button>
              {Array.from({ length: tp }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${p === page ? "bg-green-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(tp, p + 1))} disabled={page === tp} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center text-xs">›</button>
              <button onClick={() => setPage(tp)} disabled={page === tp} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center text-xs">»</button>
            </div>
            ); })()}
          </div>
        </div>
      </div>

      {/* ── DETAILS MODAL (courts) ── */}
      {selectedBooking && <DetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}

      {/* ── DETAILS MODAL (coaches) ── */}
      {selectedCoachBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-gray-900">Coach Booking Details</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${coachStatusStyle[selectedCoachBooking.status]}`}>{selectedCoachBooking.status}</span>
              </div>
              <button onClick={() => setSelectedCoachBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
            </div>
            <div className="px-7 py-6 space-y-6">
              <section>
                <h3 className="text-base font-extrabold text-gray-900 mb-3">Coach Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                    <img src={selectedCoachBooking.avatar} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedCoachBooking.coachName}</p>
                      <Stars count={selectedCoachBooking.stars} />
                    </div>
                  </div>
                  <div><p className="text-xs text-gray-400 mb-1">Location</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.location}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Price Per Hour</p><p className="text-sm font-semibold text-green-600">{selectedCoachBooking.pricePerHour} / hr</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Rank</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.rank}</p></div>
                </div>
              </section>
              <section>
                <h3 className="text-base font-extrabold text-gray-900 mb-3">Appointment Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-gray-400 mb-1">Booked On</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.bookedOn}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Booking Type</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.bookingType}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Date &amp; Time</p><p className="text-sm font-semibold text-gray-800 whitespace-pre-line">{selectedCoachBooking.dateTime}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Total Number of Hours</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.totalHours}</p></div>
                </div>
              </section>
              <section>
                <h3 className="text-base font-extrabold text-gray-900 mb-3">Payment Details</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><p className="text-xs text-gray-400 mb-1">Coaching Booking Amount</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.bookingAmount}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Number of Hours</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.totalHours}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Service Charge</p><p className="text-sm font-semibold text-green-600">{selectedCoachBooking.serviceCharge}</p></div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-gray-400 mb-1">Total Amount Paid</p><p className="text-sm font-bold text-green-600">{selectedCoachBooking.totalPaid}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Paid On</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.paidOn}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Transaction ID</p><p className="text-sm font-semibold text-gray-800 break-all">{selectedCoachBooking.transactionId}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Payment type</p><p className="text-sm font-semibold text-gray-800">{selectedCoachBooking.paymentType}</p></div>
                  </div>
                </div>
              </section>
              {selectedCoachBooking.status === "Cancelled" && (
                <section>
                  <h3 className="text-base font-extrabold text-gray-900 mb-3">Reason for Cancellation</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-500 mb-1">{selectedCoachBooking.cancellationBy}</p>
                    <p className="text-sm text-gray-600">{selectedCoachBooking.cancellationReason}</p>
                    <p className="text-xs text-gray-400 mt-2">Sent on {selectedCoachBooking.cancellationDate}</p>
                  </div>
                </section>
              )}
            </div>
            <div className="flex items-center justify-between px-7 py-5 border-t border-gray-100">
              {selectedCoachBooking.status === "Cancelled" ? (
                <button className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Initiate Refund</button>
              ) : <div />}
              <button onClick={() => setSelectedCoachBooking(null)} className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
