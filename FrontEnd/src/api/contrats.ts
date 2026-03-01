import axiosClient from "./axios";
import type { MoneyField } from "./offres";

export type ContratStatut = "en_attente" | "actif" | "suspendu" | "termine" | "annule";

export interface Contrat {
  id: number;
  statut: ContratStatut;
  statut_label: string;
  date_debut: string;
  date_fin?: string;
  seances_totales: number;
  seances_consommees: number;
  seances_restantes: number;
  montant_total: MoneyField;
  montant_paye: MoneyField;
  montant_restant: MoneyField;
  est_paye_integralement: boolean;
  renouvellement_auto: boolean;
  date_prochain_renouvellement?: string | null;
  notes?: string;
  is_actif: boolean;
  is_expire: boolean;
  client: { id: number; first_name: string; last_name: string; email: string };
  offre: { id: number; nom: string; [key: string]: unknown };
  coach: { id: number; bio: string };
  created_at: string;
  updated_at: string;
}

export interface CreateContratPayload {
  client_id: number;
  offre_id: number;
  date_debut: string;
  montant_total: number;
  date_fin?: string;
  statut?: ContratStatut;
  seances_totales?: number;
  montant_paye?: number;
  notes?: string;
  renouvellement_auto?: boolean;
}

export type UpdateContratPayload = Partial<CreateContratPayload>;

export interface ContratFilters {
  statut?: ContratStatut;
  client_id?: number;
  offre_id?: number;
}

const contratsApi = {
  /** GET /api/coach/contrats */
  list: (filters?: ContratFilters) =>
    axiosClient.get<Contrat[]>("/coach/contrats", { params: filters }).then((r) => r.data),

  /** GET /api/coach/contrats/:id */
  get: (id: number) =>
    axiosClient.get<Contrat>(`/coach/contrats/${id}`).then((r) => r.data),

  /** POST /api/coach/contrats */
  create: (payload: CreateContratPayload) =>
    axiosClient.post<Contrat>("/coach/contrats", payload).then((r) => r.data),

  /** PUT /api/coach/contrats/:id */
  update: (id: number, payload: UpdateContratPayload) =>
    axiosClient.put<Contrat>(`/coach/contrats/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/contrats/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/contrats/${id}`).then((r) => r.data),

  /** GET /api/coach/contrats-expiration?jours=7 */
  expiringSoon: (jours = 7) =>
    axiosClient.get<Contrat[]>("/coach/contrats-expiration", { params: { jours } }).then((r) => r.data),
};

export default contratsApi;
