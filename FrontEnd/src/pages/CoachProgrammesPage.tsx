import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axios";
import Header from "../components/Header";
import CoachQuickNavBar from "../components/CoachQuickNavBar";
import DashboardHeroBanner from "../components/DashboardHeroBanner";

type ProgrammeType =
  | "perte_de_poids"
  | "prise_de_masse"
  | "remise_en_forme"
  | "endurance"
  | "force"
  | "personnalise";

type ProgrammeStatut = "brouillon" | "publie" | "archive";

type Programme = {
  id: number;
  titre: string;
  description?: string;
  duree_semaines: number;
  type: ProgrammeType;
  statut: ProgrammeStatut;
  prix?: number | null;
  nombre_exercices?: number;
  created_at?: string;
};

const PROGRAMME_TYPES: ProgrammeType[] = [
  "perte_de_poids",
  "prise_de_masse",
  "remise_en_forme",
  "endurance",
  "force",
  "personnalise",
];

const PROGRAMME_STATUTS: ProgrammeStatut[] = ["brouillon", "publie", "archive"];

type FormState = {
  titre: string;
  description: string;
  duree_semaines: string;
  type: ProgrammeType;
  statut: ProgrammeStatut;
  prix: string;
};

const defaultForm: FormState = {
  titre: "",
  description: "",
  duree_semaines: "8",
  type: "remise_en_forme",
  statut: "brouillon",
  prix: "",
};

const mapProgramme = (programme: any): Programme => ({
  ...programme,
  prix:
    programme?.prix === null || programme?.prix === undefined
      ? null
      : Number(programme.prix),
});

function formToPayload(form: FormState) {
  return {
    titre: form.titre.trim(),
    description: form.description.trim() || undefined,
    duree_semaines: Number(form.duree_semaines),
    type: form.type,
    statut: form.statut,
    prix: form.prix.trim() ? Number(form.prix) : null,
  };
}

export default function CoachProgrammesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProgrammeId, setEditingProgrammeId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const params: { type?: ProgrammeType; statut?: ProgrammeStatut } = {};
      if (typeFilter !== "all") {
        params.type = typeFilter as ProgrammeType;
      }
      if (statutFilter !== "all") {
        params.statut = statutFilter as ProgrammeStatut;
      }

      const res = await axiosClient.get("/coach/programmes", { params });
      setProgrammes((res.data.data || []).map(mapProgramme));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Impossible de charger les programmes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, [typeFilter, statutFilter]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingProgrammeId(null);
    setShowForm(false);
  };

  const filteredProgrammes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return programmes;
    }

    return programmes.filter(
      (p) =>
        p.titre.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    );
  }, [programmes, search]);

  const createProgramme = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await axiosClient.post("/coach/programmes", formToPayload(form));
      const created = mapProgramme(res.data.data);
      setProgrammes((prev) => [created, ...prev]);
      setSuccessMessage("Programme cree avec succes.");
      resetForm();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Erreur lors de la creation du programme.");
    } finally {
      setSaving(false);
    }
  };

  const updateProgramme = async () => {
    if (!editingProgrammeId) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await axiosClient.put(
        `/coach/programmes/${editingProgrammeId}`,
        formToPayload(form)
      );
      const updated = mapProgramme(res.data.data);
      setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSuccessMessage("Programme mis a jour avec succes.");
      resetForm();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Erreur lors de la mise a jour du programme.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProgramme = async (id: number) => {
    try {
      await axiosClient.delete(`/coach/programmes/${id}`);
      setProgrammes((prev) => prev.filter((p) => p.id !== id));
      setSuccessMessage("Programme supprime avec succes.");
      setErrorMessage("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Erreur lors de la suppression du programme.");
    }
  };

  const startEdit = (programme: Programme) => {
    setEditingProgrammeId(programme.id);
    setForm({
      titre: programme.titre,
      description: programme.description || "",
      duree_semaines: String(programme.duree_semaines || 8),
      type: programme.type,
      statut: programme.statut,
      prix: programme.prix === null || programme.prix === undefined ? "" : String(programme.prix),
    });
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const applyProgrammeAction = async (
    programmeId: number,
    action: "publier" | "depublier" | "archiver" | "dupliquer"
  ) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const res = await axiosClient.post(`/coach/programmes/${programmeId}/${action}`);
      const returned = res?.data?.data;

      if (action === "dupliquer" && returned) {
        setProgrammes((prev) => [mapProgramme(returned), ...prev]);
      } else if (returned) {
        const updated = mapProgramme(returned);
        setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        await fetchProgrammes();
      }

      setSuccessMessage(`Action ${action} executee avec succes.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || `Erreur pendant l'action ${action}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <DashboardHeroBanner
        title="Programmes Coach"
        breadcrumb="Home › Coach Dashboard › Programmes"
      />
      <CoachQuickNavBar activeKey="programmes" />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Module Programme</h1>
            <p className="mt-1 text-slate-600">Gestion des programmes </p>
          </div>

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
            {showForm ? "Fermer" : "Nouveau programme"}
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un programme"
            className="h-11 rounded-lg border border-slate-200 px-3"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3"
          >
            <option value="all">Tous types</option>
            {PROGRAMME_TYPES.map((value) => (
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
            {PROGRAMME_STATUTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            onClick={fetchProgrammes}
            className="h-11 rounded-lg bg-slate-900 px-4 font-semibold text-white hover:bg-slate-800"
          >
            Rafraichir
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {editingProgrammeId ? "Modifier le programme" : "Creer un programme"}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.titre}
                onChange={(e) => setForm((prev) => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre *"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="number"
                min={1}
                max={52}
                value={form.duree_semaines}
                onChange={(e) => setForm((prev) => ({ ...prev, duree_semaines: e.target.value }))}
                placeholder="Duree (semaines)"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ProgrammeType }))}
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {PROGRAMME_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                value={form.statut}
                onChange={(e) => setForm((prev) => ({ ...prev, statut: e.target.value as ProgrammeStatut }))}
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {PROGRAMME_STATUTS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={0}
                value={form.prix}
                onChange={(e) => setForm((prev) => ({ ...prev, prix: e.target.value }))}
                placeholder="Prix"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={editingProgrammeId ? updateProgramme : createProgramme}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : editingProgrammeId ? "Mettre a jour" : "Creer"}
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
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Duree</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Exercices</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                    Chargement des programmes...
                  </td>
                </tr>
              ) : filteredProgrammes.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                    Aucun programme trouve.
                  </td>
                </tr>
              ) : (
                filteredProgrammes.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{p.titre}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.description || "-"}</p>
                    </td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">{p.duree_semaines} sem.</td>
                    <td className="px-4 py-3">{p.statut}</td>
                    <td className="px-4 py-3">{p.nombre_exercices ?? 0}</td>
                    <td className="px-4 py-3">{p.prix ?? 0} EUR</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteProgramme(p.id)}
                          className="rounded-lg border border-red-300 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={() => applyProgrammeAction(p.id, "publier")}
                          className="rounded-lg border border-emerald-300 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Publier
                        </button>
                        <button
                          onClick={() => applyProgrammeAction(p.id, "depublier")}
                          className="rounded-lg border border-amber-300 px-3 py-1 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                        >
                          Depublier
                        </button>
                        <button
                          onClick={() => applyProgrammeAction(p.id, "archiver")}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Archiver
                        </button>
                        <button
                          onClick={() => applyProgrammeAction(p.id, "dupliquer")}
                          className="rounded-lg border border-indigo-300 px-3 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Dupliquer
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