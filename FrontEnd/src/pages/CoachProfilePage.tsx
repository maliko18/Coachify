import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";

type Coach = {
  id: number | string;
  full_name: string;
  email: string;
  bio?: string;
  specialties?: string[];
  experience_years?: number;
  hourly_rate?: number;
  avatar?: string | null;
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

const normalizeApiCoach = (coach: any): Coach => ({
  id: coach.id,
  full_name:
    coach.full_name ||
    `${coach.user?.first_name ?? ""} ${coach.user?.last_name ?? ""}`.trim() ||
    coach.name ||
    "Coach",
  email: coach.email || coach.user?.email || "",
  bio: coach.bio || "",
  specialties: coach.specialties || [],
  experience_years: Number(coach.experience_years || 0),
  hourly_rate: extractPriceAmount(coach.hourly_rate),
  avatar: coach.avatar || coach.user?.avatar || null,
  city: coach.city || coach.user?.city || null,
});

const normalizeCoachFromOffre = (offre: any): Coach | null => {
  const coach = offre?.coach;
  if (!coach) return null;
  return normalizeApiCoach(coach);
};

export default function CoachProfilePage() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCoaches = async () => {
      setLoading(true);
      setError("");

      const endpoints = isGuest
        ? ["/coaches"]
        : ["/coaches", "/client/offres", "/coach/offres"];
      let lastErrorMessage = "";

      for (const endpoint of endpoints) {
        try {
          const res = await axiosClient.get(endpoint);
          if (!isMounted) {
            return;
          }

          const raw = res.data?.data ?? res.data;
          let apiCoaches: Coach[] = [];

          if (endpoint === "/client/offres" || endpoint === "/coach/offres") {
            const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
            const mapped: Coach[] = rows
              .map(normalizeCoachFromOffre)
              .filter((c): c is Coach => c !== null);
            const byId: Record<string, Coach> = {};
            for (const coach of mapped) {
              byId[String(coach.id)] = coach;
            }
            apiCoaches = Object.values(byId);
          } else {
            const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
            apiCoaches = rows.map(normalizeApiCoach);
          }

          if (apiCoaches.length > 0) {
            setCoaches(apiCoaches);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          lastErrorMessage = err?.response?.data?.message || "";
        }
      }

      if (!isMounted) {
        return;
      }

      setCoaches([]);
      setError(lastErrorMessage || "Impossible de charger le profil coach depuis l'API.");
      setLoading(false);
    };

    loadCoaches();

    return () => {
      isMounted = false;
    };
  }, [isGuest]);

  const coach = useMemo(() => {
    return coaches.find((item) => String(item.id) === String(coachId));
  }, [coaches, coachId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-gray-600">Chargement du profil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!coach) {
    return <Navigate to="/coaches" replace />;
  }

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
          <h1 className="text-4xl font-extrabold text-white">Coach Profile</h1>
          <p className="mt-3 text-white/90 text-sm font-semibold">
            Home <span className="mx-2">›</span> Coaches <span className="mx-2">›</span> Profile
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">{coach.full_name}</h2>
              <p className="text-gray-500 mt-2">{coach.city || "Location not specified"}</p>
              <p className="text-gray-700 mt-5 max-w-3xl">
                {coach.bio || "Aucune biographie disponible pour ce coach."}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-600 text-white px-6 py-5 min-w-[220px] text-center">
              <p className="text-sm opacity-90">Tarif horaire</p>
              <p className="text-4xl font-extrabold">${coach.hourly_rate ?? 0}</p>
              <p className="text-sm opacity-90">/ heure</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Experience</p>
              <p className="text-xl font-bold text-gray-900">
                {coach.experience_years ?? 0} years
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Specialties</p>
              <p className="text-xl font-bold text-gray-900">
                {(coach.specialties || []).length > 0
                  ? (coach.specialties || []).join(", ")
                  : "General coaching"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() =>
                isGuest ? navigate("/login") : navigate(`/book-coach/${coach.id}`)
              }
              className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
              title={
                isGuest
                  ? "Connectez-vous pour reserver une seance"
                  : "Reserver avec ce coach"
              }
            >
              Book Now
            </button>
            <button
              onClick={() =>
                isGuest
                  ? navigate("/login")
                  : navigate(`/client/coaches/${coach.id}/programmes`)
              }
              className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              title={
                isGuest
                  ? "Connectez-vous pour consulter les programmes clients"
                  : "Consulter les programmes"
              }
            >
              View Programmes
            </button>
            <button
              onClick={() => navigate("/coaches")}
              className="h-12 px-6 rounded-xl border border-gray-300 text-gray-800 font-bold hover:bg-gray-100"
            >
              Back to Coach List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
