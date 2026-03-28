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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [error, setError] = useState("");
  const [reservedProgrammeIds, setReservedProgrammeIds] = useState<number[]>([]);
  const [reservingId, setReservingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coachProgrammesRes, reservationsRes] = await Promise.all([
          axiosClient.get(`/client/coaches/${coachId}/programmes`),
          axiosClient.get("/client/programmes/reservations"),
        ]);

        setCoach(coachProgrammesRes.data.coach);
        setProgrammes(coachProgrammesRes.data.data || []);

        const reservations = reservationsRes.data.data || [];
        setReservedProgrammeIds(reservations.map((item: Programme) => item.id));
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les programmes du coach.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coachId]);

  const handleReserve = async (programmeId: number) => {
    if (reservedProgrammeIds.includes(programmeId)) {
      setMessage("Vous avez déjà réservé ce programme.");
      setMessageType("error");
      return;
    }

    try {
      setReservingId(programmeId);

      const res = await axiosClient.post(
        `/client/programmes/${programmeId}/reserve`
      );

      setMessage(res.data.message || "Programme réservé avec succès.");
      setMessageType("success");
      setReservedProgrammeIds((prev) => [...prev, programmeId]);
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Erreur lors de la réservation."
      );
      setMessageType("error");
    } finally {
      setReservingId(null);
    }
  };

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

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl border font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {programmes.map((programme) => {
              const isReserved = reservedProgrammeIds.includes(programme.id);
              const isLoadingThisOne = reservingId === programme.id;

              return (
                <div
                  key={programme.id}
                  className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 relative"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {programme.titre}
                    </h2>

                    {isReserved && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        Already reserved
                      </span>
                    )}
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
                    onClick={() => handleReserve(programme.id)}
                    disabled={isReserved || isLoadingThisOne}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      isReserved
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : isLoadingThisOne
                        ? "bg-green-300 text-white cursor-wait"
                        : "bg-[#15803d] hover:bg-[#166534] text-white"
                    }`}
                  >
                    {isReserved
                      ? "Déjà réservé"
                      : isLoadingThisOne
                      ? "Réservation..."
                      : "Réserver ce programme"}
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