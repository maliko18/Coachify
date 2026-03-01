import axiosClient from "./axios";

export type SeanceType = "individuelle" | "collective" | "en_ligne";
export type SeanceStatut = "planifiee" | "en_cours" | "terminee" | "annulee";
export type PresenceStatut = "inscrit" | "present" | "absent" | "excuse";

export interface SeanceClient {
  id: number;
  user: { id: number; full_name: string; email: string };
  statut_presence: PresenceStatut;
  feedback_client?: string | null;
  feedback_coach?: string | null;
  note?: number | null;
}

export interface Seance {
  id: number;
  titre: string;
  date: string;
  heure_debut: string;
  duree: number;
  type: SeanceType;
  capacite_max: number;
  statut: SeanceStatut;
  lieu?: string;
  notes?: string;
  places_restantes: number;
  est_complete: boolean;
  coach: { id: number; bio: string };
  clients: SeanceClient[];
  clients_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSeancePayload {
  titre: string;
  date: string;
  heure_debut: string;
  duree: number;
  type: SeanceType;
  capacite_max: number;
  lieu?: string;
  notes?: string;
}

export type UpdateSeancePayload = Partial<CreateSeancePayload>;

const seancesApi = {
  /** GET /api/coach/seances */
  list: () =>
    axiosClient.get<Seance[]>("/coach/seances").then((r) => r.data),

  /** GET /api/client/seances  (for logged-in client) */
  mySeances: () =>
    axiosClient.get<Seance[]>("/client/seances").then((r) => r.data),

  /** GET /api/coach/seances/:id */
  get: (id: number) =>
    axiosClient.get<Seance>(`/coach/seances/${id}`).then((r) => r.data),

  /** POST /api/coach/seances */
  create: (payload: CreateSeancePayload) =>
    axiosClient.post<Seance>("/coach/seances", payload).then((r) => r.data),

  /** PUT /api/coach/seances/:id */
  update: (id: number, payload: UpdateSeancePayload) =>
    axiosClient.put<Seance>(`/coach/seances/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/seances/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/seances/${id}`).then((r) => r.data),

  /** POST /api/coach/seances/:id/inscrire */
  inscrireClient: (seanceId: number, client_id: number) =>
    axiosClient.post<Seance>(`/coach/seances/${seanceId}/inscrire`, { client_id }).then((r) => r.data),

  /** DELETE /api/coach/seances/:id/desinscrire/:clientId */
  desinscrireClient: (seanceId: number, clientId: number) =>
    axiosClient.delete(`/coach/seances/${seanceId}/desinscrire/${clientId}`).then((r) => r.data),

  /** PUT /api/coach/seances/:id/presence/:clientId */
  marquerPresence: (seanceId: number, clientId: number, statut_presence: PresenceStatut) =>
    axiosClient
      .put(`/coach/seances/${seanceId}/presence/${clientId}`, { statut_presence })
      .then((r) => r.data),

  /** PUT /api/coach/seances/:id/feedback-coach/:clientId */
  feedbackCoach: (seanceId: number, clientId: number, feedback_coach: string, note: number) =>
    axiosClient
      .put(`/coach/seances/${seanceId}/feedback-coach/${clientId}`, { feedback_coach, note })
      .then((r) => r.data),

  /** POST /api/client/seances/:id/feedback */
  feedbackClient: (seanceId: number, feedback_client: string, note: number) =>
    axiosClient
      .post(`/client/seances/${seanceId}/feedback`, { feedback_client, note })
      .then((r) => r.data),
};

export default seancesApi;
