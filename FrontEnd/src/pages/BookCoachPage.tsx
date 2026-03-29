import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import axiosClient from "../api/axios";
import avatar1 from "../assets/avatar-01.jpg";
import { PAIEMENT_METHODES, type PaiementMethode } from "../api/paiements";

const stepLabels = [
  "Type of Booking",
  "Time & Date",
  "Personal Information",
  "Order Confirmation",
  "Payment",
] as const;

const timeSlots = ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
const dayColumns = [
  { day: "Monday", date: "Apr 24" },
  { day: "Tuesday", date: "Apr 25" },
  { day: "Wednesday", date: "Apr 26" },
  { day: "Thursday", date: "Apr 27" },
];

const PAYMENT_LABELS: Record<PaiementMethode, string> = {
  carte_bancaire: "Credit Card",
  virement: "Bank Transfer",
  especes: "Cash",
  cheque: "Cheque",
  paypal: "PayPal",
  stripe: "Stripe",
  prelevement: "Direct Debit",
  autre: "Other",
};

type CoachLookupItem = {
  id: number | string;
  full_name: string;
  bio?: string;
  specialties?: string[];
  experience_years?: number;
  hourly_rate?: number;
  city?: string | null;
};

const extractPriceAmount = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && typeof value.amount === "number") {
    return value.amount;
  }
  return 0;
};

const normalizeApiCoach = (coach: any): CoachLookupItem => ({
  id: coach.id,
  full_name:
    coach.full_name ||
    `${coach.user?.first_name ?? ""} ${coach.user?.last_name ?? ""}`.trim() ||
    coach.name ||
    "Coach",
  bio: coach.bio || "",
  specialties: coach.specialties || [],
  experience_years: Number(coach.experience_years || 0),
  hourly_rate: extractPriceAmount(coach.hourly_rate),
  city: coach.city || coach.user?.city || null,
});

const normalizeCoachFromOffre = (offre: any): CoachLookupItem | null => {
  const coach = offre?.coach;
  if (!coach) return null;
  return normalizeApiCoach(coach);
};

export default function BookCoachPage() {
  const { coachId } = useParams();
  const navigate = useNavigate();

  const [apiCoach, setApiCoach] = useState<any | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [coachError, setCoachError] = useState("");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaiementMethode[]>(PAIEMENT_METHODES);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaiementMethode>("carte_bancaire");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  useEffect(() => {
    const loadMethodsFromDb = async () => {
      try {
        const res = await axiosClient.get("/coach/paiements", { params: { per_page: 100 } });
        const payload = res.data?.data ?? res.data;
        const list: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const methodsFromDb = Array.from(
          new Set(
            list
              .map((p: any) => p?.methode)
              .filter((m: any): m is PaiementMethode => PAIEMENT_METHODES.includes(m)),
          ),
        );

        if (methodsFromDb.length > 0) {
          setAvailablePaymentMethods(methodsFromDb);
          setSelectedPaymentMethod(methodsFromDb[0]);
        }
      } catch {
        setAvailablePaymentMethods(PAIEMENT_METHODES);
      }
    };

    loadMethodsFromDb();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const numericId = Number(coachId);
    if (Number.isNaN(numericId)) {
      setLoadingCoach(false);
      return;
    }

    const loadCoach = async () => {
      const endpoints = ["/coaches", "/client/offres", "/coach/offres"];
      let lastErrorMessage = "";

      for (const endpoint of endpoints) {
        try {
          const res = await axiosClient.get(endpoint);
          const raw = res.data?.data ?? res.data;
          let items: any[] = [];

          if (endpoint === "/client/offres" || endpoint === "/coach/offres") {
            const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
            const mapped = rows
              .map(normalizeCoachFromOffre)
              .filter(Boolean) as CoachLookupItem[];
            const byId: Record<string, CoachLookupItem> = {};
            for (const coach of mapped) {
              byId[String(coach.id)] = coach;
            }
            items = Object.values(
              byId,
            );
          } else {
            const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
            items = rows.map(normalizeApiCoach);
          }

          const found = items.find((item: any) => Number(item.id) === numericId);
          if (found) {
            if (isMounted) setApiCoach(found);
            return;
          }
        } catch (err: any) {
          lastErrorMessage = err?.response?.data?.message || "";
        }
      }

      if (isMounted) {
        setApiCoach(null);
        setCoachError(lastErrorMessage || "Impossible de charger le coach depuis l'API.");
      }
    };

    loadCoach().finally(() => {
      if (isMounted) setLoadingCoach(false);
    });

    return () => {
      isMounted = false;
    };
  }, [coachId]);

  const coach = useMemo(() => {
    if (apiCoach) {
      const hourlyRate = Number(apiCoach.hourly_rate || 0);
      return {
        id: String(apiCoach.id),
        name: apiCoach.full_name,
        rating: 4.8,
        reviews: 0,
        bio: apiCoach.bio || "Coach profile",
        location: apiCoach.city || "Location not specified",
        lessonType: (apiCoach.specialties && apiCoach.specialties[0]) || "General",
        level: (apiCoach.experience_years || 0) >= 5 ? "Professional" : "Rookie",
        image: avatar1,
        offers: [
          {
            id: "session",
            title: "Only Book a Coach for Session",
            description: "Reserve une seance simple avec le coach.",
            pricePerHour: hourlyRate || 100,
          },
          {
            id: "training",
            title: "Commit To Training With Coach & Lessons",
            description: "Pack d'entrainement avec suivi.",
            pricePerHour: Math.max((hourlyRate || 100) - 20, 50),
          },
        ],
      };
    }

    return null;
  }, [apiCoach]);

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<"session" | "training">("session");
  const [selectedDay, setSelectedDay] = useState(dayColumns[2]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["5:00 PM", "6:00 PM", "7:00 PM"]);

  const [name, setName] = useState("Rodick Tramliar");
  const [email, setEmail] = useState("contact@example.com");
  const [phone, setPhone] = useState("+15656 556558");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");

  const getProductsList = async (coachNumericId: number) => {
    const res = await axiosClient.get("/produits", { params: { coach_id: coachNumericId, per_page: 100 } });
    const payload = res.data?.data ?? res.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(res.data?.data?.data)) return res.data.data.data;

    return [] as any[];
  };

  const persistClientInvoice = (invoiceData: any) => {
    const key = "CLIENT_INVOICES";
    const prev = localStorage.getItem(key);
    const parsed = prev ? JSON.parse(prev) : [];
    const next = [invoiceData, ...parsed].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const persistCoachBookingRequest = (requestData: any) => {
    const key = "COACH_BOOKING_REQUESTS";
    const prev = localStorage.getItem(key);
    const parsed = prev ? JSON.parse(prev) : [];
    const next = [requestData, ...parsed].slice(0, 200);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const confirmPaymentAndBook = async () => {
    if (isSubmittingOrder) return;

    const coachSnapshot = coach;
    if (!coachSnapshot) {
      setCheckoutError("Coach introuvable.");
      return;
    }

    setCheckoutError("");
    setCheckoutSuccess("");
    setIsSubmittingOrder(true);

    try {
      const quantity = Math.max(selectedSlots.length, 1);
      const fallbackSubtotal = quantity * (Number(apiCoach?.hourly_rate || 0) || 100);
      const coachNumericId = Number(coachSnapshot.id);
      const products = await getProductsList(coachNumericId);

      if (!Array.isArray(products) || products.length === 0) {
        setCheckoutError("Aucun produit actif pour ce coach. Impossible de finaliser l'achat.");
        return;
      }

      const selectedProduct =
        products.find((p: any) => String(p?.type || "").toLowerCase() !== "physique") || products[0];

      if (!selectedProduct?.id) {
        setCheckoutError("Produit invalide pour la commande.");
        return;
      }

      const orderRes = await axiosClient.post("/commandes", {
        items: [{ produit_id: selectedProduct.id, quantite: quantity }],
      });

      const order = orderRes.data?.data ?? orderRes.data;
      const totalAmount = Number(order?.total ?? fallbackSubtotal);

      const invoice = {
        id: `INV-${order?.id ?? Date.now()}`,
        commande_id: order?.id,
        coach_id: coachNumericId,
        coach_name: coachSnapshot.name,
        amount: totalAmount,
        currency: "EUR",
        payment_method: selectedPaymentMethod,
        payment_method_label: PAYMENT_LABELS[selectedPaymentMethod],
        status: "paid",
        created_at: new Date().toISOString(),
        booking_date: selectedDay.date,
        booking_slots: selectedSlots,
        customer_name: name,
        customer_email: email,
      };

      persistClientInvoice(invoice);
      persistCoachBookingRequest({
        id: `REQ-${order?.id ?? Date.now()}`,
        source: "order",
        coach_id: coachNumericId,
        coach_name: coachSnapshot.name,
        client_name: name,
        client_email: email,
        statut: "attente",
        total: totalAmount,
        payment_method: selectedPaymentMethod,
        payment_method_label: PAYMENT_LABELS[selectedPaymentMethod],
        date_commande: new Date().toISOString(),
        booking_date: selectedDay.date,
        booking_slots: selectedSlots,
      });
      setCheckoutSuccess(`Paiement confirmé. Facture ${invoice.id} créée.`);

      setTimeout(() => {
        navigate("/user/bookings");
      }, 1200);
    } catch (err: any) {
      const rawMessage = String(err?.response?.data?.message || err?.message || "");
      const isMissingProductsTable =
        rawMessage.includes("Base table or view not found") ||
        rawMessage.includes("Table") && rawMessage.includes("produits") ||
        rawMessage.includes("SQLSTATE[42S02]");

      if (isMissingProductsTable) {
        const localRequestId = Date.now();
        const totalAmount = Math.max(selectedSlots.length, 1) * (Number(apiCoach?.hourly_rate || 0) || 100);
        const invoice = {
          id: `INV-LOCAL-${localRequestId}`,
          commande_id: `LOCAL-${localRequestId}`,
          coach_id: Number(coachSnapshot.id),
          coach_name: coachSnapshot.name,
          amount: totalAmount,
          currency: "EUR",
          payment_method: selectedPaymentMethod,
          payment_method_label: PAYMENT_LABELS[selectedPaymentMethod],
          status: "paid",
          created_at: new Date().toISOString(),
          booking_date: selectedDay.date,
          booking_slots: selectedSlots,
          customer_name: name,
          customer_email: email,
          source: "local-fallback",
        };

        persistClientInvoice(invoice);
        persistCoachBookingRequest({
          id: `REQ-LOCAL-${localRequestId}`,
          source: "local-fallback",
          coach_id: Number(coachSnapshot.id),
          coach_name: coachSnapshot.name,
          client_name: name,
          client_email: email,
          statut: "attente",
          total: totalAmount,
          payment_method: selectedPaymentMethod,
          payment_method_label: PAYMENT_LABELS[selectedPaymentMethod],
          date_commande: new Date().toISOString(),
          booking_date: selectedDay.date,
          booking_slots: selectedSlots,
        });

        setCheckoutSuccess(`Paiement confirmé. Facture ${invoice.id} créée (mode fallback).`);
        setTimeout(() => {
          navigate("/user/bookings");
        }, 1200);
      } else {
        setCheckoutError(rawMessage || "Impossible de finaliser le paiement.");
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loadingCoach) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-gray-600">Chargement du coach...</div>
      </div>
    );
  }

  if (coachError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-red-600">{coachError}</div>
      </div>
    );
  }

  if (!coach) {
    return <Navigate to="/coaches" replace />;
  }

  const activeOffer = coach.offers.find((offer) => offer.id === bookingType) || coach.offers[0];
  const totalHours = Math.max(selectedSlots.length, 1);
  const subtotal = activeOffer.pricePerHour * totalHours;

  const next = () => setStep((prev) => Math.min(prev + 1, 5));
  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div
        className="relative w-full h-[220px] flex items-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="relative z-10 px-12 text-left">
          <h1 className="text-5xl font-extrabold text-white">Book A Coach</h1>
          <p className="mt-3 text-white/90 text-sm font-semibold">
            Home <span className="mx-2">›</span> Book A Coach
          </p>
        </div>
      </div>

      <div className="bg-white border-y border-gray-200 py-7 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 text-lg font-extrabold text-gray-500">
          {stepLabels.map((label, idx) => {
            const number = idx + 1;
            const active = number === step;
            return (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xl ${
                    active ? "bg-emerald-600" : "bg-slate-500"
                  }`}
                >
                  {number}
                </span>
                <span className={active ? "text-gray-900" : "text-slate-500"}>{label}</span>
                {number < 5 && <span className="mx-1 text-slate-400">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-7">
        {(step === 1 || step === 2 || step === 4 || step === 5) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-5xl font-extrabold text-gray-900 text-center">
              {stepLabels[step - 1]}
            </h2>
            <p className="text-center text-gray-500 mt-2">
              {step === 1 && "Unlock Your Potential with a Personal Coach"}
              {step === 2 && "Book your training session at a time and date that suits your needs."}
              {step === 4 && "Booking confirmed. Contact support for changes/inquiries."}
              {step === 5 && "Securely make your payment for the booking."}
            </p>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={coach.image} alt={coach.name} className="w-24 h-24 rounded-xl object-cover" />
                <div>
                  <p className="text-amber-600 font-semibold">
                    {coach.rating} • {coach.reviews} Reviews
                  </p>
                  <h3 className="text-4xl font-extrabold text-gray-900">{coach.name}</h3>
                  <p className="text-gray-600 mt-1">{coach.bio}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white px-6 py-5 border border-gray-100 min-w-[170px]">
                <p className="text-gray-500 text-sm">Starts From</p>
                <p className="text-4xl font-extrabold text-emerald-600">
                  ${activeOffer.pricePerHour}
                  <span className="text-lg text-gray-500">/hr</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10">
            <h3 className="text-4xl font-extrabold text-center text-gray-900">How do you prefer to book your Coach?</h3>
            <p className="text-center text-gray-500 mt-2">Please Select the Options below</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <button
                onClick={() => setBookingType("session")}
                className={`p-6 rounded-lg text-left text-xl font-bold ${
                  bookingType === "session"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-500 text-white"
                }`}
              >
                Only Book a Coach for Session
              </button>

              <button
                onClick={() => setBookingType("training")}
                className={`p-6 rounded-lg text-left text-xl font-bold ${
                  bookingType === "training"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-500 text-white"
                }`}
              >
                Commit To Training With Coach & Lessons
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="grid grid-cols-4 gap-3 text-center">
                {dayColumns.map((column) => (
                  <button
                    key={column.day}
                    onClick={() => setSelectedDay(column)}
                    className={`rounded-xl border p-3 ${
                      selectedDay.day === column.day ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                    }`}
                  >
                    <p className="font-extrabold text-gray-900">{column.day}</p>
                    <p className="text-gray-500">{column.date}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map((slot) => {
                  const active = selectedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`h-14 rounded-lg border font-bold ${
                        active
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h4 className="text-3xl font-extrabold text-gray-900">Booking Details</h4>
              <div className="mt-4 space-y-3 text-gray-600 text-xl">
                <p>{selectedDay.date}, 2026</p>
                <p>
                  {selectedSlots.length > 0
                    ? `${selectedSlots[0]} to ${selectedSlots[selectedSlots.length - 1]}`
                    : "Choisissez un horaire"}
                </p>
                <p>Total Hour : {totalHours} Hrs</p>
              </div>
              <div className="mt-6 rounded-xl bg-emerald-600 text-white text-center py-4 text-4xl font-extrabold">
                Subtotal : ${subtotal}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-5xl font-extrabold text-center text-gray-900">Personal Information</h2>
            <p className="text-center text-gray-500 mt-2">
              Ensure accurate and complete information for a smooth booking process.
            </p>

            <div className="mt-7 rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-4xl font-extrabold text-gray-900">Enter Details</h3>

              <input className="w-full h-14 px-4 rounded-xl bg-gray-50 border border-gray-200" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full h-14 px-4 rounded-xl bg-gray-50 border border-gray-200" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full h-14 px-4 rounded-xl bg-gray-50 border border-gray-200" placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="w-full h-14 px-4 rounded-xl bg-gray-50 border border-gray-200" placeholder="Enter Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <textarea className="w-full min-h-[90px] p-4 rounded-xl bg-gray-50 border border-gray-200" placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Booking Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xl">
              <div>
                <p className="font-bold text-gray-900">Coach Name</p>
                <p className="text-gray-600">{coach.name}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Appointment Date</p>
                <p className="text-gray-600">{selectedDay.day}, {selectedDay.date}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Appointment Start</p>
                <p className="text-gray-600">{selectedSlots[0] || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Appointment End</p>
                <p className="text-gray-600">{selectedSlots[selectedSlots.length - 1] || "-"}</p>
              </div>
            </div>

            <hr className="my-5" />

            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xl">
              <div>
                <p className="font-bold text-gray-900">Name</p>
                <p className="text-gray-600">{name || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Contact Email Address</p>
                <p className="text-gray-600">{email || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Phone Number</p>
                <p className="text-gray-600">{phone || "-"}</p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-4xl font-extrabold text-gray-900">Order Summary</h3>
              <div className="mt-5 space-y-3 text-xl text-gray-700">
                <p>{selectedDay.date}, 2026</p>
                <p>{selectedSlots[0] || "-"} to {selectedSlots[selectedSlots.length - 1] || "-"}</p>
                <p>Total Hour : {totalHours} Hrs</p>
                <p className="text-emerald-600 font-extrabold text-3xl">Subtotal : ${subtotal}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-4xl font-extrabold text-gray-900">Checkout</h3>
              <label className="mt-6 block text-xl font-bold text-gray-900">Select Payment Gateway</label>

              <div className="mt-3 space-y-3">
                {availablePaymentMethods.map((method) => (
                  <label key={method} className="rounded-xl border border-gray-200 p-4 text-xl flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === method}
                      onChange={() => setSelectedPaymentMethod(method)}
                    />
                    {PAYMENT_LABELS[method]}
                  </label>
                ))}
              </div>

              {checkoutError && <p className="mt-4 text-red-600 font-semibold">{checkoutError}</p>}
              {checkoutSuccess && <p className="mt-4 text-emerald-600 font-semibold">{checkoutSuccess}</p>}

              <button
                onClick={confirmPaymentAndBook}
                disabled={isSubmittingOrder}
                className="mt-6 h-12 px-6 rounded-xl bg-emerald-600 text-white font-extrabold disabled:opacity-50"
              >
                {isSubmittingOrder ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-gray-100 p-5 flex justify-center gap-3">
          <button
            onClick={back}
            disabled={step === 1}
            className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-extrabold disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={step === 5}
            className="h-12 px-6 rounded-xl bg-slate-900 text-white font-extrabold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
