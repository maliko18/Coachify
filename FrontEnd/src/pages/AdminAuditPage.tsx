import { useEffect, useState } from "react";
import Header from "../components/Header";
import adminApi, { type GymEquipementRow } from "../api/admin";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function AdminAuditPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<GymEquipementRow[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const loadEquipements = async (
    targetPage = page,
    targetLowStock = lowStockOnly,
  ) => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.equipements({
        page: targetPage,
        per_page: 20,
        low_stock_only: targetLowStock,
      });
      setRows(res.data || []);
      setPage(res.current_page || targetPage);
      setLastPage(res.last_page || 1);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Impossible de charger les equipements."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipements(1, lowStockOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Equipements de la salle
            </h1>
            <p className="mt-1 text-slate-600">
              Supervision globale des equipements physiques proposes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Stock faible uniquement
            </label>
            <button
              type="button"
              onClick={() => loadEquipements(page, lowStockOnly)}
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
            <p className="text-sm text-slate-600">
              Chargement des equipements...
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">Aucun equipement trouve.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">Coach</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Alerte</th>
                  <th className="px-3 py-2">Etat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {row.nom}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {row.coach?.name || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.stock_quantite}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.alerte_stock}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          row.is_low_stock
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {row.is_low_stock ? "Stock faible" : "OK"}
                      </span>
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
            onClick={() => loadEquipements(page - 1, lowStockOnly)}
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
            onClick={() => loadEquipements(page + 1, lowStockOnly)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
