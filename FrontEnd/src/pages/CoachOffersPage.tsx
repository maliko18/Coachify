import { useEffect, useMemo, useState } from "react";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import offresApi from "../api/offres";
import type {
  CreateOffrePayload,
  Offre,
  OffreStatut,
  OffreType,
} from "../api/offres";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

type FormState = {
  nom: string;
  description: string;
  type: OffreType;
  prix: string;
  tva: string;
  devise: string;
  nombre_seances: string;
  duree_jours: string;
  capacite_max: string;
  statut: OffreStatut;
  est_visible: boolean;
  prix_promotion: string;
  date_debut_promotion: string;
  date_fin_promotion: string;
};

const defaultForm: FormState = {
  nom: "",
  description: "",
  type: "pack_seance",
  prix: "",
  tva: "20",
  devise: "EUR",
  nombre_seances: "",
  duree_jours: "",
  capacite_max: "",
  statut: "active",
  est_visible: true,
  prix_promotion: "",
  date_debut_promotion: "",
  date_fin_promotion: "",
};

const typeOptions: OffreType[] = [
  "pack_seance",
  "abonnement",
  "collectif",
  "programme_numerique",
  "produit",
];

const statutOptions: OffreStatut[] = ["active", "inactive", "archivee"];

export default function CoachOffersPage() {
  const { user } = useAuth();

  const isCoach = useMemo(
    () => !!user?.roles?.some((role) => role.name === "coach"),
    [user]
  );

  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<"" | OffreType>("");
  const [filterStatut, setFilterStatut] = useState<"" | OffreStatut>("");

  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingOffreId, setEditingOffreId] = useState<number | null>(null);

  const fetchOffres = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offresApi.list({
        ...(filterType ? { type: filterType } : {}),
        ...(filterStatut ? { statut: filterStatut } : {}),
      });
      setOffres(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger les offres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, [filterType, filterStatut]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingOffreId(null);
  };

  const startEdit = (offre: Offre) => {
    setEditingOffreId(offre.id);
    setForm({
      nom: offre.nom || "",
      description: offre.description || "",
      type: offre.type,
      prix: String(offre.prix?.amount ?? ""),
      tva: String(offre.tva ?? "20"),
      devise: offre.devise || "EUR",
      nombre_seances:
        offre.nombre_seances !== undefined && offre.nombre_seances !== null
          ? String(offre.nombre_seances)
          : "",
      duree_jours:
        offre.duree_jours !== undefined && offre.duree_jours !== null
          ? String(offre.duree_jours)
          : "",
      capacite_max:
        offre.capacite_max !== undefined && offre.capacite_max !== null
          ? String(offre.capacite_max)
          : "",
      statut: offre.statut,
      est_visible: offre.est_visible,
      prix_promotion:
        offre.prix_promotion?.amount !== undefined && offre.prix_promotion?.amount !== null
          ? String(offre.prix_promotion.amount)
          : "",
      date_debut_promotion: offre.date_debut_promotion?.slice(0, 10) || "",
      date_fin_promotion: offre.date_fin_promotion?.slice(0, 10) || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = (): CreateOffrePayload => ({
    nom: form.nom.trim(),
    description: form.description.trim() || undefined,
    type: form.type,
    prix: Number(form.prix),
    tva: form.tva ? Number(form.tva) : undefined,
    devise: form.devise.trim() || "EUR",
    nombre_seances: form.nombre_seances ? Number(form.nombre_seances) : undefined,
    duree_jours: form.duree_jours ? Number(form.duree_jours) : undefined,
    capacite_max: form.capacite_max ? Number(form.capacite_max) : undefined,
    statut: form.statut,
    est_visible: form.est_visible,
    prix_promotion: form.prix_promotion ? Number(form.prix_promotion) : null,
    date_debut_promotion: form.date_debut_promotion || null,
    date_fin_promotion: form.date_fin_promotion || null,
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nom.trim() || !form.prix) {
      setError("Les champs nom et prix sont obligatoires.");
      return;
    }

    if (Number(form.prix) < 0) {
      setError("Le prix ne peut pas être négatif.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = buildPayload();
      if (editingOffreId) {
        await offresApi.update(editingOffreId, payload);
      } else {
        await offresApi.create(payload);
      }
      resetForm();
      await fetchOffres();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Enregistrement impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    const confirmed = window.confirm("Supprimer cette offre ?");
    if (!confirmed) return;

    setError(null);
    try {
      await offresApi.delete(id);
      if (editingOffreId === id) {
        resetForm();
      }
      await fetchOffres();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div
        className="relative w-full h-[220px] flex items-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="relative z-10 px-12 text-left">
          <p className="text-sm font-extrabold tracking-widest text-lime-300">🏋️ COACHIFY</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">Gestion des offres</h1>
          <p className="mt-3 text-white/90 text-sm font-semibold">
            Home <span className="mx-2">›</span> Coach Dashboard <span className="mx-2">›</span> Offres
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        {!isCoach && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            Accès réservé aux coachs.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        {isCoach && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {editingOffreId ? "Modifier une offre" : "Créer une offre"}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Configure ton offre et publie-la pour tes clients.
                  </p>
                </div>
                {editingOffreId && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                    onClick={resetForm}
                  >
                    Annuler la modification
                  </button>
                )}
              </div>

              <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Nom *"
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Prix *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.prix}
                  onChange={(e) => setForm((prev) => ({ ...prev, prix: e.target.value }))}
                />

                <select
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value as OffreType }))
                  }
                >
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  value={form.statut}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, statut: e.target.value as OffreStatut }))
                  }
                >
                  {statutOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="TVA"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.tva}
                  onChange={(e) => setForm((prev) => ({ ...prev, tva: e.target.value }))}
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Devise"
                  value={form.devise}
                  onChange={(e) => setForm((prev) => ({ ...prev, devise: e.target.value }))}
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Nombre de séances"
                  type="number"
                  min="0"
                  value={form.nombre_seances}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre_seances: e.target.value }))
                  }
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Durée (jours)"
                  type="number"
                  min="0"
                  value={form.duree_jours}
                  onChange={(e) => setForm((prev) => ({ ...prev, duree_jours: e.target.value }))}
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Capacité max"
                  type="number"
                  min="0"
                  value={form.capacite_max}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, capacite_max: e.target.value }))
                  }
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  placeholder="Prix promotion"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.prix_promotion}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, prix_promotion: e.target.value }))
                  }
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  type="date"
                  value={form.date_debut_promotion}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date_debut_promotion: e.target.value }))
                  }
                />

                <input
                  className="h-11 px-4 rounded-xl border border-gray-200"
                  type="date"
                  value={form.date_fin_promotion}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date_fin_promotion: e.target.value }))
                  }
                />

                <textarea
                  className="md:col-span-2 min-h-[96px] p-4 rounded-xl border border-gray-200"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />

                <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.est_visible}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, est_visible: e.target.checked }))
                    }
                  />
                  Offre visible
                </label>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 rounded-xl bg-green-700 text-white font-bold disabled:opacity-70"
                  >
                    {submitting
                      ? "Enregistrement..."
                      : editingOffreId
                      ? "Mettre à jour"
                      : "Créer l'offre"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-extrabold text-gray-900">Mes offres</h2>

                <div className="flex gap-3">
                  <select
                    className="h-11 px-4 rounded-xl border border-gray-200"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as "" | OffreType)}
                  >
                    <option value="">Tous les types</option>
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-11 px-4 rounded-xl border border-gray-200"
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value as "" | OffreStatut)}
                  >
                    <option value="">Tous les statuts</option>
                    {statutOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="mt-6 text-gray-500">Chargement des offres...</p>
              ) : offres.length === 0 ? (
                <p className="mt-6 text-gray-500">Aucune offre trouvée.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="py-3 pr-3">Nom</th>
                        <th className="py-3 pr-3">Type</th>
                        <th className="py-3 pr-3">Prix</th>
                        <th className="py-3 pr-3">Statut</th>
                        <th className="py-3 pr-3">Visible</th>
                        <th className="py-3 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offres.map((offre) => (
                        <tr key={offre.id} className="border-b border-gray-50">
                          <td className="py-3 pr-3 font-semibold text-gray-900">{offre.nom}</td>
                          <td className="py-3 pr-3 text-gray-700">{offre.type_label}</td>
                          <td className="py-3 pr-3 text-gray-700">{offre.prix?.formatted}</td>
                          <td className="py-3 pr-3">
                            <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs">
                              {offre.statut}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-gray-700">{offre.est_visible ? "Oui" : "Non"}</td>
                          <td className="py-3 pr-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                                onClick={() => startEdit(offre)}
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 rounded-lg bg-red-50 text-red-600 font-semibold"
                                onClick={() => onDelete(offre.id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
