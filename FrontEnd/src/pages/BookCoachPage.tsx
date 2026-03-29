import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import { coachesData } from "../data/coaches";
import axiosClient from "../api/axios";
import avatar1 from "../assets/avatar-01.jpg";

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

export default function BookCoachPage() {
  const { coachId } = useParams();
  const navigate = useNavigate();

  const [apiCoach, setApiCoach] = useState<any | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(true);

  useEffect(() => {
    const numericId = Number(coachId);
    if (Number.isNaN(numericId)) {
      setLoadingCoach(false);
      return;
    }

    axiosClient
      .get("/client/coaches")
      .then((res) => {
        const found = (res.data.data || []).find((item: any) => Number(item.id) === numericId);
        setApiCoach(found || null);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingCoach(false));
  }, [coachId]);

  const staticCoach = useMemo(() => coachesData.find((item) => item.id === coachId), [coachId]);

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

    return staticCoach;
  }, [apiCoach, staticCoach]);

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<"session" | "training">("session");
  const [selectedDay, setSelectedDay] = useState(dayColumns[2]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["5:00 PM", "6:00 PM", "7:00 PM"]);

  const [name, setName] = useState("Rodick Tramliar");
  const [email, setEmail] = useState("contact@example.com");
  const [phone, setPhone] = useState("+15656 556558");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");

  if (loadingCoach) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-gray-600">Chargement du coach...</div>
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
              <div className="mt-3 rounded-xl border border-gray-200 p-4 text-xl">
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment" defaultChecked />
                  Credit Card
                </label>
              </div>
              <button
                onClick={() => navigate("/user/bookings")}
                className="mt-6 h-12 px-6 rounded-xl bg-emerald-600 text-white font-extrabold"
              >
                Confirm Payment
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
