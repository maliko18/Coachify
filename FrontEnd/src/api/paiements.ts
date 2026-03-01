import axiosClient from "./axios";
import type { MoneyField } from "./offres";

export type PaiementMethode =
  | "carte_bancaire" | "virement" | "especes" | "cheque"
  | "paypal" | "stripe" | "prelevement" | "autre";

export type PaiementStatut = "en_attente" | "valide" | "refuse" | "rembourse" | "annule";

export interface Paiement {
  id: number;
  montant: MoneyField;
  devise: string;
  date_paiement: string;
  methode: PaiementMethode;
  methode_label: string;
  statut: PaiementStatut;
  statut_label: string;
  reference: string;
  reference_externe?: string;
  description?: string;
  notes?: string;
  montant_rembourse?: MoneyField | null;
  montant_net: MoneyField;
  date_remboursement?: string | null;
  motif_remboursement?: string | null;
  is_remboursable: boolean;
  is_valide: boolean;
  client: Record<string, unknown>;
  contrat?: Record<string, unknown> | null;
  coach: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaiementStatistiques {
  periode: { debut: string; fin: string };
  chiffre_affaires: number;
  total_rembourse: number;
  ca_net: number;
  en_attente: number;
  nombre_paiements: number;
  nombre_valides: number;
  repartition_methode: Record<
    string,
    { nombre: number; total: number; label: string }
  >;
}

export interface CreatePaiementPayload {
  client_id: number;
  montant: number;
  date_paiement: string;
  methode: PaiementMethode;
  contrat_id?: number;
  devise?: string;
  statut?: PaiementStatut;
  reference_externe?: string;
  description?: string;
  notes?: string;
}

export type UpdatePaiementPayload = Partial<CreatePaiementPayload>;

export interface PaiementFilters {
  statut?: PaiementStatut;
  client_id?: number;
  methode?: PaiementMethode;
  contrat_id?: number;
  date_debut?: string;
  date_fin?: string;
}

const paiementsApi = {
  /** GET /api/coach/paiements */
  list: (filters?: PaiementFilters) =>
    axiosClient.get<Paiement[]>("/coach/paiements", { params: filters }).then((r) => r.data),

  /** GET /api/coach/paiements/:id */
  get: (id: number) =>
    axiosClient.get<Paiement>(`/coach/paiements/${id}`).then((r) => r.data),

  /** POST /api/coach/paiements */
  create: (payload: CreatePaiementPayload) =>
    axiosClient.post<Paiement>("/coach/paiements", payload).then((r) => r.data),

  /** PUT /api/coach/paiements/:id */
  update: (id: number, payload: UpdatePaiementPayload) =>
    axiosClient.put<Paiement>(`/coach/paiements/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/paiements/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/paiements/${id}`).then((r) => r.data),

  /** POST /api/coach/paiements/:id/valider */
  valider: (id: number) =>
    axiosClient.post<Paiement>(`/coach/paiements/${id}/valider`).then((r) => r.data),

  /** POST /api/coach/paiements/:id/rembourser */
  rembourser: (id: number, montant: number, motif: string) =>
    axiosClient.post<Paiement>(`/coach/paiements/${id}/rembourser`, { montant, motif }).then((r) => r.data),

  /** POST /api/coach/paiements/:id/annuler */
  annuler: (id: number) =>
    axiosClient.post<Paiement>(`/coach/paiements/${id}/annuler`).then((r) => r.data),

  /** GET /api/coach/paiements-statistiques */
  statistiques: (date_debut?: string, date_fin?: string) =>
    axiosClient
      .get<PaiementStatistiques>("/coach/paiements-statistiques", { params: { date_debut, date_fin } })
      .then((r) => r.data),
};

export default paiementsApi;
