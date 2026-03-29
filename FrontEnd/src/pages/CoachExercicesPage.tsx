import { useEffect, useMemo, useState } from "react";
import type {
  CreateExercicePayload,
  Exercice,
  ExerciceCategorie,
  ExerciceNiveau,
} from "../api/exercices";
import exercicesApi from "../api/exercices";
import Header from "../components/Header";

const CATEGORIES: ExerciceCategorie[] = [
  "musculation",
  "cardio",
  "stretching",
  "yoga",
  "pilates",
  "crossfit",
  "boxe",
  "fonctionnel",
  "equilibre",
  "plyometrie",
  "autre",
];

const NIVEAUX: ExerciceNiveau[] = ["debutant", "intermediaire", "avance", "expert"];

type FormState = {
  nom: string;
  categorie: ExerciceCategorie;
  niveau: ExerciceNiveau;
  description: string;
  consignes: string;
  muscles_cibles_text: string;
  materiel_text: string;
  duree_estimee: string;
  series_defaut: string;
  repetitions_defaut: string;
  repos_defaut: string;
  est_public: boolean;
  est_actif: boolean;
};

const defaultFormState: FormState = {
  nom: "",
  categorie: "musculation",
  niveau: "debutant",
  description: "",
  consignes: "",
  muscles_cibles_text: "",
  materiel_text: "",
  duree_estimee: "",
  series_defaut: "",
  repetitions_defaut: "",
  repos_defaut: "",
  est_public: true,
  est_actif: true,
};

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPayload(form: FormState): CreateExercicePayload {
  return {
    nom: form.nom.trim(),
    categorie: form.categorie,
    niveau: form.niveau,
    description: form.description.trim() || undefined,
    consignes: form.consignes.trim() || undefined,
    muscles_cibles: splitCsv(form.muscles_cibles_text),
    materiel: splitCsv(form.materiel_text),
    duree_estimee: form.duree_estimee ? Number(form.duree_estimee) : undefined,
    series_defaut: form.series_defaut ? Number(form.series_defaut) : undefined,
    repetitions_defaut: form.repetitions_defaut ? Number(form.repetitions_defaut) : undefined,
    repos_defaut: form.repos_defaut ? Number(form.repos_defaut) : undefined,
    est_public: form.est_public,
    est_actif: form.est_actif,
  };
}

function fromExercice(exercice: Exercice): FormState {
  return {
    nom: exercice.nom,
    categorie: exercice.categorie,
    niveau: exercice.niveau,
    description: exercice.description || "",
    consignes: exercice.consignes || "",
    muscles_cibles_text: (exercice.muscles_cibles || []).join(", "),
    materiel_text: (exercice.materiel || []).join(", "),
    duree_estimee: exercice.duree_estimee ? String(exercice.duree_estimee) : "",
    series_defaut: exercice.series_defaut ? String(exercice.series_defaut) : "",
    repetitions_defaut: exercice.repetitions_defaut ? String(exercice.repetitions_defaut) : "",
    repos_defaut: exercice.repos_defaut ? String(exercice.repos_defaut) : "",
    est_public: exercice.est_public,
    est_actif: exercice.est_actif,
  };
}

export default function CoachExercicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Exercice[]>([]);

  const [search, setSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [niveauFilter, setNiveauFilter] = useState<string>("all");

  const [form, setForm] = useState<FormState>(defaultFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadExercices = async () => {
    try {
      setLoading(true);
      const filters: {
        categorie?: ExerciceCategorie;
        niveau?: ExerciceNiveau;
        search?: string;
      } = {};

      if (categorieFilter !== "all") {
        filters.categorie = categorieFilter as ExerciceCategorie;
      }
      if (niveauFilter !== "all") {
        filters.niveau = niveauFilter as ExerciceNiveau;
      }
      if (search.trim()) {
        filters.search = search.trim();
      }

      const res = await exercicesApi.list(filters);
      setItems(res.data || []);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Impossible de charger les exercices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieFilter, niveauFilter]);

  const resetForm = () => {
    setForm(defaultFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredLocally = useMemo(() => {
    if (!search.trim()) {
      return items;
    }

    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.nom.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.consignes || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const submitForm = async () => {
    if (!form.nom.trim()) {
      setError("Le nom de l'exercice est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = toPayload(form);

      if (editingId) {
        const updated = await exercicesApi.update(editingId, payload);
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await exercicesApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Exercice) => {
    setEditingId(item.id);
    setForm(fromExercice(item));
    setShowForm(true);
  };

  const removeExercice = async (id: number) => {
    try {
      await exercicesApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Module Exercice</h1>
            <p className="mt-1 text-slate-600">Gestion des exercices du coach</p>
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
            {showForm ? "Fermer" : "Nouvel exercice"}
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un exercice"
            className="h-11 rounded-lg border border-slate-200 px-3"
          />

          <select
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3"
          >
            <option value="all">Toutes categories</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={niveauFilter}
            onChange={(e) => setNiveauFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3"
          >
            <option value="all">Tous niveaux</option>
            {NIVEAUX.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            onClick={loadExercices}
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
              {editingId ? "Modifier l'exercice" : "Creer un exercice"}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.nom}
                onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom *"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <select
                value={form.categorie}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, categorie: e.target.value as ExerciceCategorie }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                value={form.niveau}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, niveau: e.target.value as ExerciceNiveau }))
                }
                className="h-11 rounded-lg border border-slate-200 px-3"
              >
                {NIVEAUX.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                value={form.muscles_cibles_text}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, muscles_cibles_text: e.target.value }))
                }
                placeholder="Muscles cibles (csv)"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />

              <textarea
                value={form.consignes}
                onChange={(e) => setForm((prev) => ({ ...prev, consignes: e.target.value }))}
                placeholder="Consignes"
                className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />

              <input
                value={form.materiel_text}
                onChange={(e) => setForm((prev) => ({ ...prev, materiel_text: e.target.value }))}
                placeholder="Materiel (csv)"
                className="h-11 rounded-lg border border-slate-200 px-3 md:col-span-2"
              />

              <input
                type="number"
                min={1}
                value={form.duree_estimee}
                onChange={(e) => setForm((prev) => ({ ...prev, duree_estimee: e.target.value }))}
                placeholder="Duree estimee (secondes)"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="number"
                min={1}
                value={form.series_defaut}
                onChange={(e) => setForm((prev) => ({ ...prev, series_defaut: e.target.value }))}
                placeholder="Series defaut"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="number"
                min={1}
                value={form.repetitions_defaut}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, repetitions_defaut: e.target.value }))
                }
                placeholder="Repetitions defaut"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <input
                type="number"
                min={0}
                value={form.repos_defaut}
                onChange={(e) => setForm((prev) => ({ ...prev, repos_defaut: e.target.value }))}
                placeholder="Repos defaut (secondes)"
                className="h-11 rounded-lg border border-slate-200 px-3"
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.est_public}
                  onChange={(e) => setForm((prev) => ({ ...prev, est_public: e.target.checked }))}
                />
                Exercice public
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.est_actif}
                  onChange={(e) => setForm((prev) => ({ ...prev, est_actif: e.target.checked }))}
                />
                Exercice actif
              </label>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={submitForm}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : editingId ? "Mettre a jour" : "Creer"}
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
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Duree</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                    Chargement des exercices...
                  </td>
                </tr>
              ) : filteredLocally.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                    Aucun exercice trouve.
                  </td>
                </tr>
              ) : (
                filteredLocally.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.nom}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.description || "-"}</p>
                    </td>
                    <td className="px-4 py-3">{item.categorie_label || item.categorie}</td>
                    <td className="px-4 py-3">{item.niveau_label || item.niveau}</td>
                    <td className="px-4 py-3">{item.duree_formatee || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.est_actif
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.est_actif ? "Actif" : "Inactif"}
                      </span>
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
                          onClick={() => removeExercice(item.id)}
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
