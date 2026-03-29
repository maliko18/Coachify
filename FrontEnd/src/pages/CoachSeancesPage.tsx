import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import seancesApi from "../api/seances";
import DashboardHeroBanner from "../components/DashboardHeroBanner";
import type {
  CreateSeancePayload,
  Seance,
  SeanceStatut,
  SeanceType,
} from "../api/seances";
import axiosClient from "../api/axios";
import CoachQuickNavBar from "../components/CoachQuickNavBar";

const SEANCE_TYPES: SeanceType[] = ["individuelle", "collective", "en_ligne"];
const SEANCE_STATUTS: SeanceStatut[] = [
  "planifiee",
  "en_cours",
  "terminee",
  "annulee",
];

type FormState = {
  titre: string;
  date: string;
  heure_debut: string;
  duree: string;
  type: SeanceType;
  capacite_max: string;
  statut: SeanceStatut;
  lieu: string;
  notes: string;
};

const defaultFormState: FormState = {
  titre: "",
  date: "",
  heure_debut: "09:00",
  duree: "60",
  type: "individuelle",
  capacite_max: "1",
  statut: "planifiee",
  lieu: "",
  notes: "",
};

function normalizeSeancesResponse(res: any): Seance[] {
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res?.data)) {
    return res.data;
  }
  return [];
}

function formToPayload(form: FormState): CreateSeancePayload {
  return {
    titre: form.titre.trim(),
    date: form.date,
    heure_debut: form.heure_debut,
    duree: Number(form.duree),
    type: form.type,
    capacite_max: Number(form.capacite_max),
    lieu: form.lieu.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

function seanceToForm(seance: Seance): FormState {
  return {
    titre: seance.titre || "",
    date: seance.date || "",
    heure_debut: (seance.heure_debut || "09:00").slice(0, 5),
    duree: String(seance.duree || 60),
    type: seance.type || "individuelle",
    capacite_max: String(seance.capacite_max || 1),
    statut: seance.statut || "planifiee",
    lieu: seance.lieu || "",
    notes: seance.notes || "",
  };
}

export default function CoachSeancesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingIcs, setExportingIcs] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [error, setError] = useState("");
  const [calendarInfo, setCalendarInfo] = useState("");
  const [items, setItems] = useState<Seance[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);

  const loadSeances = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await seancesApi.list();
      setItems(normalizeSeancesResponse(res));
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Impossible de charger les seances.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeances();
  }, []);

  const resetForm = () => {
    setForm(defaultFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.titre || "").toLowerCase().includes(q) ||
        (item.lieu || "").toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatut =
        statutFilter === "all" || item.statut === statutFilter;
      return matchesSearch && matchesType && matchesStatut;
    });
  }, [items, search, typeFilter, statutFilter]);

  const submitForm = async () => {
    if (!form.titre.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!form.date) {
      setError("La date est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = formToPayload(form);

      if (editingId) {
        const updated = await seancesApi.update(editingId, {
          ...payload,
          statut: form.statut,
        } as any);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await seancesApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Seance) => {
    setEditingId(item.id);
    setForm(seanceToForm(item));
    setShowForm(true);
    setError("");
  };

  const deleteSeance = async (id: number) => {
    try {
      await seancesApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Erreur lors de la suppression.",
      );
    }
  };

  const exportIcs = async () => {
    try {
      setExportingIcs(true);
      setCalendarInfo("");
      const res = await axiosClient.get("/seances/export/ics", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "coach-seances.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setCalendarInfo("Export ICS termine.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Impossible d'exporter le calendrier ICS.",
      );
    } finally {
      setExportingIcs(false);
    }
  };

  const syncCalendar = async () => {
    try {
      setSyncingCalendar(true);
      setCalendarInfo("");
      const res = await axiosClient.post("/calendar/sync");
      const message = String(
        res.data?.message || "Synchronisation calendrier terminee.",
      );
      setCalendarInfo(message);
      setError("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Impossible de synchroniser le calendrier.",
      );
    } finally {
      setSyncingCalendar(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <DashboardHeroBanner
        title="Seances Coach"
        breadcrumb="Home › Coach Dashboard › Seances"
      />
      <CoachQuickNavBar activeKey="seances" />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Module Seance
            </h1>
            <p className="mt-1 text-slate-600">Gestion des seances coach</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={syncCalendar}
              disabled={syncingCalendar}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {syncingCalendar ? "Sync..." : "Sync calendrier"}
            </button>

            <button
              onClick={exportIcs}
              disabled={exportingIcs}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {exportingIcs ? "Export..." : "Exporter ICS"}
            </button>

            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              {showForm ? "Fermer" : "Nouvelle seance"}
            </button>
          </div>
        </div>

        {calendarInfo && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {calendarInfo}
          </div>
        )}

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher titre / lieu"
            className="h-11 rounded-lg border border-slate-200 px-3"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3"
          >
            <option value="all">Tous types</option>
            {SEANCE_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3"
          >
            <option value="all">Tous statuts</option>
            {SEANCE_STATUTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            onClick={loadSeances}
            className="h-11 rounded-lg bg-slate-900 px-4 font-semibold text-white hover:bg-slate-800"
          >
            Rafraichir
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {editingId ? "Modifier la seance" : "Creer une seance"}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.titre}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, titre: e.target.value }))
                }
                placeholder="Titre *"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="time"
                value={form.heure_debut}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, heure_debut: e.target.value }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="number"
                min={1}
                value={form.duree}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, duree: e.target.value }))
                }
                placeholder="Duree (minutes)"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as SeanceType,
                  }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {SEANCE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                value={form.statut}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    statut: e.target.value as SeanceStatut,
                  }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {SEANCE_STATUTS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={form.capacite_max}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, capacite_max: e.target.value }))
                }
                placeholder="Capacite max"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                value={form.lieu}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lieu: e.target.value }))
                }
                placeholder="Lieu"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Notes"
                className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={submitForm}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Mettre a jour"
                    : "Creer"}
              </button>

              <button
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Capacite</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    Chargement des seances...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    Aucune seance trouvee.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {item.titre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.lieu || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {item.date} {String(item.heure_debut || "").slice(0, 5)}
                    </td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.statut}</td>
                    <td className="px-4 py-3">
                      {item.clients_count}/{item.capacite_max}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteSeance(item.id)}
                          className="rounded-lg border border-red-300 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
