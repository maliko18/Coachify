import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import axiosClient from "../api/axios";

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

export default function CoachesPage() {
  const navigate = useNavigate();

  const [coaches, setCoaches] = useState<Coach[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [lessonType, setLessonType] = useState("all");
const [location, setLocation] = useState("all");
const [radius, setRadius] = useState("10");
const [maxPrice, setMaxPrice] = useState("250");

useEffect(() => {
  let isMounted = true;

  const loadCoaches = async () => {
    setLoading(true);
    setError("");

    const endpoints = ["/coaches", "/client/offres", "/coach/offres"];
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
    setError(lastErrorMessage || "Impossible de charger les coachs depuis l'API.");
    setLoading(false);
  };

  loadCoaches();

  return () => {
    isMounted = false;
  };
}, []);

  const lessonTypes = useMemo(
  () => [
    "all",
    ...Array.from(
      new Set(
        coaches.flatMap((coach) => coach.specialties || [])
      )
    ),
  ],
  [coaches]
);

const locations = useMemo(() => {
  const cities = coaches
    .map((coach) => coach.city)
    .filter((city): city is string => typeof city === "string" && city.trim() !== "");

  return ["all", ...Array.from(new Set(cities))];
}, [coaches]);

  const filteredCoaches = useMemo(() => {
  return coaches.filter((coach) => {
    const coachName = coach.full_name || "";
    const coachBio = coach.bio || "";
    const coachCity = coach.city || "";
    const coachPrice = Number(coach.hourly_rate || 0);

    const matchesSearch =
      coachName.toLowerCase().includes(search.toLowerCase()) ||
      coachBio.toLowerCase().includes(search.toLowerCase());

    const matchesLesson =
      lessonType === "all" ||
      (coach.specialties || []).includes(lessonType);

    const matchesLocation =
      location === "all" || coachCity === location;

    const matchesPrice = coachPrice <= Number(maxPrice);

    return matchesSearch && matchesLesson && matchesLocation && matchesPrice;
  });
}, [coaches, search, lessonType, location, maxPrice]);

  const clearAll = () => {
    setSearch("");
    setLessonType("all");
    setLocation("all");
    setRadius("10");
    setMaxPrice("250");
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-10 text-center text-gray-600">Chargement des coachs...</div>
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
          <h1 className="text-4xl font-extrabold text-white">Coaches & Offers</h1>
          <p className="mt-3 text-white/90 text-sm font-semibold">
            Home <span className="mx-2">›</span> Coaches
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Advanced <span className="text-emerald-600">Search</span>
              </h2>
              <button onClick={clearAll} className="text-red-500 font-semibold">
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              <input
                className="w-full h-12 rounded-xl border border-gray-200 px-4"
                placeholder="What are you looking for"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div>
                <p className="font-extrabold text-gray-900 mb-2">Lesson type</p>
                <select
                  className="w-full h-12 rounded-xl border border-gray-200 px-4"
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                >
                  {lessonTypes.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All specialties" : item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="font-extrabold text-gray-900 mb-2">Location</p>
                <select
                  className="w-full h-12 rounded-xl border border-gray-200 px-4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {locations.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All locations" : item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="font-extrabold text-gray-900 mb-2">Radius</p>
                <select
                  className="w-full h-12 rounded-xl border border-gray-200 px-4"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>

              <div>
                <p className="font-extrabold text-gray-900 mb-2">Price Range (max)</p>
                <input
                  type="range"
                  min="80"
                  max="300"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">Up to ${maxPrice}/hr</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {filteredCoaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded-2xl border border-gray-200 bg-white p-0 shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr]">
                  <div className="relative">
                    <div className="w-full h-full min-h-[230px] bg-slate-200 flex items-center justify-center text-5xl font-bold text-slate-600">
  {coach.full_name?.charAt(0) || "C"}
</div>
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-sky-500 text-white font-semibold text-sm">
  Coach
</span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                       <p className="text-sm font-semibold text-amber-600">
  {coach.experience_years ?? 0} years of experience
</p>
<h2 className="text-5xl font-extrabold text-gray-900 mt-1">{coach.full_name}</h2>
<p className="text-gray-500 mt-1">📍 {coach.city || "Location not specified"}</p>
<p className="text-gray-600 mt-3 max-w-2xl">{coach.bio || "No biography available."}</p>
                      </div>

                      <span className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xl whitespace-nowrap">
  From ${coach.hourly_rate ?? 0} /hr
</span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/coaches/${coach.id}/profile`)}
                        className="h-12 px-6 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-100"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => navigate(`/book-coach/${coach.id}`)}
                        className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                      >
                        Book Now
                      </button>

                      <button
                        onClick={() => navigate(`/client/coaches/${coach.id}/programmes`)}
                        className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        View Programmes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredCoaches.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-semibold">
                Aucun coach trouvé avec ces filtres.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
