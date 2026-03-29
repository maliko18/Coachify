import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import coachDashboardApi, {
  type CoachKpis,
  type DashboardPeriod,
} from "../api/coachDashboard";
import CoachQuickNavBar from "../components/CoachQuickNavBar";
import DashboardHeroBanner from "../components/DashboardHeroBanner";

const periodOptions: Array<{ key: DashboardPeriod; label: string }> = [
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
  { key: "year", label: "Cette annee" },
];

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const formatMoney = (value: number) => `${Number(value || 0).toFixed(2)} €`;

const formatPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function CoachAnalyticsPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState<CoachKpis>({});
  const [ca, setCa] = useState(0);
  const [taux, setTaux] = useState(0);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [kpisData, caData, tauxData] = await Promise.all([
        coachDashboardApi.kpis(period),
        coachDashboardApi.ca(period),
        coachDashboardApi.tauxRemplissage(period),
      ]);

      setKpis(kpisData);
      setCa(caData);
      setTaux(tauxData);
    } catch (e: unknown) {
      setError(
        getApiErrorMessage(e, "Impossible de charger les analytics coach."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fidelityPercent = useMemo(
    () => Number(kpis.fidelisation ?? 0),
    [kpis.fidelisation],
  );
  const panierMoyen = useMemo(
    () => Number(kpis.panier_moyen ?? 0),
    [kpis.panier_moyen],
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <DashboardHeroBanner
        title="Analytics Coach"
        breadcrumb="Home › Coach Dashboard › Analytics"
      />
      <CoachQuickNavBar activeKey="courts" />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Analytics Coach
            </h1>
            <p className="mt-1 text-slate-600">
              Suivi du chiffre d'affaires et du taux de remplissage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-4"
            >
              {periodOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadAnalytics}
              className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white"
            >
              Rafraichir
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
            Chargement des analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className={cardClass}>
                <p className="text-sm text-slate-500">Chiffre d'affaires</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {formatMoney(ca)}
                </p>
              </div>

              <div className={cardClass}>
                <p className="text-sm text-slate-500">Taux de remplissage</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {formatPercent(taux)}
                </p>
              </div>

              <div className={cardClass}>
                <p className="text-sm text-slate-500">Fidelisation</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {formatPercent(fidelityPercent)}
                </p>
              </div>

              <div className={cardClass}>
                <p className="text-sm text-slate-500">Panier moyen</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {formatMoney(panierMoyen)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className={cardClass}>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Progression CA
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Données source: /coach/dashboard/ca
                </p>
                <div className="mt-5 h-3 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${Math.min(Math.max(taux, 0), 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Le taux de remplissage impacte directement le CA de la
                  periode.
                </p>
              </div>

              <div className={cardClass}>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Top offres
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Données source: /coach/dashboard/kpis
                </p>
                {Array.isArray(kpis.top_offres) &&
                kpis.top_offres.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {kpis.top_offres.slice(0, 5).map((offre, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg bg-slate-50 px-3 py-2"
                      >
                        {typeof offre === "string"
                          ? offre
                          : JSON.stringify(offre)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Aucune offre remontee pour cette periode.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
