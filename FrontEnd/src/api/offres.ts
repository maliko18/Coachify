import axiosClient from "./axios";

export interface MoneyField {
  amount: number;
  formatted: string;
  currency: string;
}

export type OffreType =
  | "pack_seance"
  | "abonnement"
  | "collectif"
  | "programme_numerique"
  | "produit";

export type OffreStatut = "active" | "inactive" | "archivee";

export interface Offre {
  id: number;
  nom: string;
  description?: string;
  type: OffreType;
  type_label: string;
  prix: MoneyField;
  prix_ttc: MoneyField;
  tva: number;
  devise: string;
  nombre_seances?: number;
  duree_jours?: number;
  capacite_max?: number;
  options: unknown[];
  statut: OffreStatut;
  est_visible: boolean;
  en_promotion: boolean;
  prix_promotion?: MoneyField | null;
  prix_effectif: MoneyField;
  date_debut_promotion?: string | null;
  date_fin_promotion?: string | null;
  coach: { id: number; bio: string };
  contrats_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOffrePayload {
  nom: string;
  type: OffreType;
  prix: number;
  description?: string;
  tva?: number;
  devise?: string;
  nombre_seances?: number;
  duree_jours?: number;
  capacite_max?: number;
  options?: unknown[];
  statut?: OffreStatut;
  est_visible?: boolean;
  prix_promotion?: number | null;
  date_debut_promotion?: string | null;
  date_fin_promotion?: string | null;
}

export type UpdateOffrePayload = Partial<CreateOffrePayload>;

export interface OffreFilters {
  type?: OffreType;
  statut?: OffreStatut;
}

const offresApi = {
  /** GET /api/coach/offres */
  list: (filters?: OffreFilters) =>
    axiosClient.get<Offre[]>("/coach/offres", { params: filters }).then((r) => r.data),

  /** GET /api/coach/offres/:id */
  get: (id: number) =>
    axiosClient.get<Offre>(`/coach/offres/${id}`).then((r) => r.data),

  /** POST /api/coach/offres */
  create: (payload: CreateOffrePayload) =>
    axiosClient.post<Offre>("/coach/offres", payload).then((r) => r.data),

  /** PUT /api/coach/offres/:id */
  update: (id: number, payload: UpdateOffrePayload) =>
    axiosClient.put<Offre>(`/coach/offres/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/offres/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/offres/${id}`).then((r) => r.data),
};

export default offresApi;
