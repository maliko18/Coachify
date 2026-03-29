import axiosClient from "./axios";

type CollectionResponse<T> = { data: T[]; meta?: Record<string, unknown> };

const unwrapCollection = <T>(payload: T[] | CollectionResponse<T>): T[] => {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
};

export type FactureStatut = "brouillon" | "emise" | "payee" | "annulee" | "en_retard";

export const FACTURE_STATUTS: FactureStatut[] = [
  "brouillon",
  "emise",
  "payee",
  "annulee",
  "en_retard",
];

export interface Facture {
  id: number;
  numero: string;
  client_id: number;
  paiement_id?: number | null;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  date_emission: string;
  date_echeance: string;
  statut: FactureStatut;
  statut_label: string;
  pdf_path?: string | null;
  notes?: string;
  est_en_retard: boolean;
  client: { id: number; first_name: string; last_name: string; [key: string]: unknown };
  created_at: string;
  updated_at: string;
}

export interface FactureStats {
  total_factures: number;
  total_ht: number;
  total_ttc: number;
  par_statut: Record<FactureStatut, number>;
  montant_paye: number;
  montant_en_attente: number;
}

export interface CreateFacturePayload {
  client_id: number;
  montant_ht: number;
  date_emission: string;
  date_echeance: string;
  tva?: number;
  statut?: FactureStatut;
  notes?: string;
}

export type UpdateFacturePayload = Partial<CreateFacturePayload>;

export interface FactureFilters {
  statut?: FactureStatut;
  client_id?: number;
  en_retard?: boolean;
  date_debut?: string;
  date_fin?: string;
}

export interface FactureStatsFilters {
  date_debut?: string;
  date_fin?: string;
}

const facturesApi = {
  /** GET /api/coach/factures */
  list: (filters?: FactureFilters) =>
    axiosClient
      .get<Facture[] | CollectionResponse<Facture>>("/coach/factures", { params: filters })
      .then((r) => unwrapCollection(r.data)),

  /** GET /api/coach/factures/:id */
  get: (id: number) =>
    axiosClient.get<Facture>(`/coach/factures/${id}`).then((r) => r.data),

  /** POST /api/coach/factures */
  create: (payload: CreateFacturePayload) =>
    axiosClient.post<Facture>("/coach/factures", payload).then((r) => r.data),

  /** PUT /api/coach/factures/:id */
  update: (id: number, payload: UpdateFacturePayload) =>
    axiosClient.put<Facture>(`/coach/factures/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/factures/:id  — interdit si payée */
  delete: (id: number) =>
    axiosClient.delete(`/coach/factures/${id}`).then(() => undefined),

  /** POST /api/coach/factures/:id/emettre  (brouillon → emise) */
  emettre: (id: number) =>
    axiosClient.post<Facture>(`/coach/factures/${id}/emettre`).then((r) => r.data),

  /** POST /api/coach/factures/:id/payer */
  payer: (id: number) =>
    axiosClient.post<Facture>(`/coach/factures/${id}/payer`).then((r) => r.data),

  /** POST /api/coach/factures/:id/annuler  — interdit si payée */
  annuler: (id: number) =>
    axiosClient.post<Facture>(`/coach/factures/${id}/annuler`).then((r) => r.data),

  /** GET /api/coach/factures/:id/pdf */
  pdfUrl: (id: number): string => `/coach/factures/${id}/pdf`,

  /** GET /api/coach/factures-en-retard */
  enRetard: () =>
    axiosClient
      .get<Facture[] | CollectionResponse<Facture>>("/coach/factures-en-retard")
      .then((r) => unwrapCollection(r.data)),

  /** GET /api/coach/factures-stats */
  stats: (filters?: FactureStatsFilters) =>
    axiosClient.get<FactureStats>("/coach/factures-stats", { params: filters }).then((r) => r.data),
};

export default facturesApi;
