import { useEffect, useState } from "react";
import axiosClient from "../api/axios";
import Header from "../components/Header";

type Programme = {
  id: number;
  titre: string;
  description: string;
  prix?: number;
  duree_semaines?: number;
  type?: string;
  coach?: {
    full_name: string;
  };
  already_reserved?: boolean;
  pivot?: {
    statut: string;
    reserved_at: string;
  };
};

export default function MyProgrammeReservationsPage() {
  const [reservedProgrammes, setReservedProgrammes] = useState<Programme[]>([]);
  const [availableProgrammes, setAvailableProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [reservingId, setReservingId] = useState<number | null>(null);

const fetchData = async () => {
  try {
    const resAvailable = await axiosClient.get("/test/programmes?statut=publie");
    setAvailableProgrammes(resAvailable.data.data || []);
  } catch (err) {
    console.error("Erreur programmes disponibles:", err);
    setAvailableProgrammes([]);
    setMessage("Erreur lors du chargement des programmes disponibles.");
    setMessageType("error");
  }

  try {
    const resReserved = await axiosClient.get("/test/programmes/reservations")
    setReservedProgrammes(resReserved.data.data || []);
  } catch (err) {
    console.error("Erreur programmes réservés:", err);
    setReservedProgrammes([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);


  const handleReserve = async (programmeId: number) => {
  try {
    setReservingId(programmeId);

    const res = await axiosClient.post(`/test/programmes/${programmeId}/reserve`);

    setMessage(res.data.message || "Programme réservé avec succès.");
    setMessageType("success");
    await fetchData();
  } catch (err: any) {
    console.error(err);
    setMessage(err.response?.data?.message || "Erreur réservation.");
    setMessageType("error");
  } finally {
    setReservingId(null);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="p-8">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />

      <div className="p-8 max-w-6xl mx-auto">

        {/* MESSAGE */}
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

        {/* ===================== */}
        {/* MES PROGRAMMES */}
        {/* ===================== */}
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Mes programmes réservés
        </h1>

        {reservedProgrammes.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-gray-500 mb-10">
            Vous n’avez encore réservé aucun programme.
          </div>
        ) : (
          <div className="grid gap-6 mb-12">
            {reservedProgrammes.map((programme) => (
              <div
                key={programme.id}
                className="bg-white p-6 rounded-2xl border shadow-sm"
              >
                <h2 className="text-xl font-bold">{programme.titre}</h2>
                <p className="text-gray-600 mt-2">{programme.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Réservé le : {programme.pivot?.reserved_at ?? "-"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ===================== */}
        {/* PROGRAMMES DISPONIBLES */}
        {/* ===================== */}
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Programmes disponibles
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {availableProgrammes.map((programme) => {
            const isReserved = programme.already_reserved;

            return (
              <div
                key={programme.id}
                className="bg-white p-6 rounded-2xl border shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">{programme.titre}</h2>

                  {isReserved && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Déjà réservé
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mt-2">{programme.description}</p>

                <p className="text-sm text-gray-500 mt-2">
                  Coach : {programme.coach?.full_name ?? "-"}
                </p>

                <p className="text-sm text-gray-500">
                  Prix : {programme.prix ?? 0} €
                </p>

                <button
                  onClick={() => handleReserve(programme.id)}
                  disabled={isReserved || reservingId === programme.id}
                  className={`mt-4 w-full py-3 rounded-xl font-semibold transition ${
                    isReserved
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : reservingId === programme.id
                      ? "bg-green-300 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isReserved
                    ? "Déjà réservé"
                    : reservingId === programme.id
                    ? "Réservation..."
                    : "Réserver"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}