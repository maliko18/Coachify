import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import adminApi, { type AdminStatistics } from "../api/admin";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStatistics | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await adminApi.dashboard();
        setStats(data);
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            "Impossible de charger le dashboard gym manager.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Gym Manager Dashboard
            </h1>
            <p className="mt-1 text-slate-600">
              Pilotage global de la salle: utilisateurs, seances et equipements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/gym/users")}
              className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white"
            >
              Gerer les utilisateurs
            </button>
            <button
              type="button"
              onClick={() => navigate("/gym/equipements")}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700"
            >
              Voir equipements
            </button>
            <button
              type="button"
              onClick={() => navigate("/gym/seances")}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700"
            >
              Voir seances
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
            Chargement dashboard admin...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Total utilisateurs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.total_users ?? 0}
                </p>
              </div>
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Utilisateurs actifs</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {stats?.active_users ?? 0}
                </p>
              </div>
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Utilisateurs bannis</p>
                <p className="mt-2 text-3xl font-extrabold text-rose-600">
                  {stats?.banned_users ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Coachs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.coaches_count ?? 0}
                </p>
              </div>
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Clients</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.clients_count ?? 0}
                </p>
              </div>
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Seances aujourd'hui</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.seances_today ?? 0}
                </p>
              </div>
              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Equipements stock faible
                </p>
                <p className="mt-2 text-3xl font-extrabold text-amber-600">
                  {stats?.low_stock_equipements ?? 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
