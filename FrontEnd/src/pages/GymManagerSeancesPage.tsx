import { useEffect, useState } from "react";
import Header from "../components/Header";
import adminApi, { type GymSeanceRow } from "../api/admin";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function GymManagerSeancesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<GymSeanceRow[]>([]);
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const loadSeances = async (targetPage = page, targetStatut = statut) => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.seances({
        page: targetPage,
        per_page: 20,
        statut: targetStatut || undefined,
      });
      setRows(res.data || []);
      setPage(res.current_page || targetPage);
      setLastPage(res.last_page || 1);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Impossible de charger les seances."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeances(1, statut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Seances de la salle
            </h1>
            <p className="mt-1 text-slate-600">
              Vue globale des seances avec capacite et statut.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-4"
            >
              <option value="">Tous statuts</option>
              <option value="planifiee">Planifiee</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminee</option>
              <option value="annulee">Annulee</option>
            </select>
            <button
              type="button"
              onClick={() => loadSeances(page, statut)}
              className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white"
            >
              Rafraichir
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-600">Chargement des seances...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">Aucune seance trouvee.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2">Seance</th>
                  <th className="px-3 py-2">Coach</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Capacite</th>
                  <th className="px-3 py-2">Places restantes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-slate-800">
                        {row.titre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.type} - {row.lieu || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.coach?.name || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.date} {row.heure_debut}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{row.statut}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.inscrits} / {row.capacite_max}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.places_restantes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => loadSeances(page - 1, statut)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Precedent
          </button>
          <span className="px-2 text-sm text-slate-600">
            Page {page} / {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => loadSeances(page + 1, statut)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
