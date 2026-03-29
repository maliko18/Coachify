import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axios";
import Header from "../components/Header";

type Programme = {
  id: number;
  titre: string;
  description: string;
  prix?: number;
  statut?: string;
  duree_semaines?: number;
  type?: string;
};

type Offre = {
  id: number;
  nom: string;
  description?: string;
  type?: string;
  prix?: any;
  prix_effectif?: any;
  duree_jours?: number;
  coach?: any;
};

type Coach = {
  id: number;
  full_name: string;
  email: string;
  bio?: string;
  specialties?: string[];
  experience_years?: number;
  hourly_rate?: number;
  city?: string | null;
};

export default function CoachPublicProgrammesPage() {
  const { coachId } = useParams();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const extractPriceAmount = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    if (value && typeof value === "object" && typeof value.amount === "number") {
      return value.amount;
    }
    return 0;
  };

  const normalizeCoach = (rawCoach: any): Coach | null => {
    if (!rawCoach) return null;
    return {
      id: Number(rawCoach.id),
      full_name:
        rawCoach.full_name ||
        `${rawCoach.user?.first_name ?? ""} ${rawCoach.user?.last_name ?? ""}`.trim() ||
        "Coach",
      email: rawCoach.email || rawCoach.user?.email || "",
      bio: rawCoach.bio || "",
      specialties: rawCoach.specialties || [],
      experience_years: Number(rawCoach.experience_years || 0),
      hourly_rate: extractPriceAmount(rawCoach.hourly_rate),
      city: rawCoach.city || rawCoach.user?.city || null,
    };
  };

  const mapOffreToProgramme = (offre: Offre): Programme => {
    const dureeSemaines = offre.duree_jours ? Math.max(1, Math.ceil(Number(offre.duree_jours) / 7)) : undefined;
    return {
      id: offre.id,
      titre: offre.nom,
      description: offre.description || "",
      prix: extractPriceAmount(offre.prix_effectif ?? offre.prix),
      duree_semaines: dureeSemaines,
      type: offre.type || "programme",
      statut: "active",
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const numericCoachId = Number(coachId);
        if (Number.isNaN(numericCoachId)) {
          setError("Coach invalide.");
          setProgrammes([]);
          return;
        }

        const endpoints = ["/client/offres", "/coach/offres", "/coach/programmes"];
        let lastErrorMessage = "";
        let fetchedAnyList = false;
        let loadedProgrammes: Programme[] = [];
        let loadedCoach: Coach | null = null;

        for (const endpoint of endpoints) {
          try {
            const res = await axiosClient.get(endpoint);
            fetchedAnyList = true;
            const raw = res.data?.data ?? res.data;
            const rows: any[] = Array.isArray(raw) ? raw : [];

            if (endpoint === "/coach/programmes") {
              const filteredProgrammes = rows
                .filter((item) => Number(item?.coach_id) === numericCoachId)
                .map((item) => ({
                  id: Number(item.id),
                  titre: item.titre || "Programme",
                  description: item.description || "",
                  prix: extractPriceAmount(item.prix),
                  duree_semaines: item.duree_semaines,
                  type: item.type,
                  statut: item.statut,
                }));

              if (filteredProgrammes.length > 0) {
                loadedProgrammes = filteredProgrammes;
                break;
              }
            } else {
              const coachOffers = rows.filter((offre: Offre) => Number(offre?.coach?.id) === numericCoachId);
              const programmeOffers = coachOffers.filter((offre: Offre) => {
                const type = String(offre?.type || "").toLowerCase();
                return type.includes("programme");
              });
              const source = programmeOffers.length > 0 ? programmeOffers : coachOffers;

              if (source.length > 0) {
                loadedProgrammes = source.map(mapOffreToProgramme);
                const coachFromOffre = normalizeCoach(source[0]?.coach);
                if (coachFromOffre) loadedCoach = coachFromOffre;
                break;
              }
            }
          } catch (err: any) {
            lastErrorMessage = err?.response?.data?.message || "";
            continue;
          }
        }

        setProgrammes(loadedProgrammes);
        if (loadedCoach) {
          setCoach(loadedCoach);
        }

        if (!loadedCoach) {
          try {
            const coachesRes = await axiosClient.get("/coaches");
            const coachRows: any[] = Array.isArray(coachesRes.data?.data)
              ? coachesRes.data.data
              : Array.isArray(coachesRes.data)
              ? coachesRes.data
              : [];
            const foundCoach = coachRows.find((c) => Number(c?.id) === numericCoachId);
            const mappedCoach = normalizeCoach(foundCoach);
            if (mappedCoach) setCoach(mappedCoach);
          } catch {
            // Ignore: /coaches may not be available in current backend.
          }
        }

        if (!fetchedAnyList && loadedProgrammes.length === 0) {
          setError(lastErrorMessage || "Impossible de charger les programmes du coach.");
        } else {
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les programmes du coach.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coachId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="p-8">Chargement des programmes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="p-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {coach && (
            <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                {coach.full_name}
              </h1>
              <p className="text-slate-500">{coach.email}</p>

              {coach.bio && <p className="mt-3 text-slate-700">{coach.bio}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {coach.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {programmes.length === 0 && (
              <div className="md:col-span-2 bg-white rounded-3xl shadow-md border border-slate-200 p-6 text-slate-600">
                Aucun programme trouve pour ce coach.
              </div>
            )}
            {programmes.map((programme) => {
              return (
                <div
                  key={programme.id}
                  className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 relative"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {programme.titre}
                    </h2>
                  </div>

                  <p className="text-slate-600 mb-4">{programme.description}</p>

                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <p><strong>Prix :</strong> {programme.prix ?? 0} €</p>
                    <p>
                      <strong>Durée :</strong> {programme.duree_semaines ?? "-"} semaines
                    </p>
                    <p><strong>Type :</strong> {programme.type ?? "-"}</p>
                  </div>

                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold bg-gray-300 text-gray-600 cursor-not-allowed"
                  >
                    Réservation indisponible sur cette page
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}