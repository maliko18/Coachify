import axiosClient from "./axios";
import type { ExerciceCategorie, ExerciceNiveau } from "./exercices";

export type ProgrammeType =
  | "perte_de_poids" | "prise_de_masse" | "remise_en_forme"
  | "endurance" | "force" | "personnalise";

export type ProgrammeStatut = "brouillon" | "publie" | "archive";

export type JourSemaine =
  | "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";

export interface ProgrammeExercice {
  id: number;
  nom: string;
  description?: string;
  categorie: ExerciceCategorie;
  niveau: ExerciceNiveau;
  duree_estimee?: number;
  pivot: {
    ordre: number;
    jour_semaine: JourSemaine;
    series: number;
    repetitions?: number;
    duree_minutes?: number | null;
    repos_secondes: number;
    instructions?: string;
  };
}

export interface Programme {
  id: number;
  coach_id: number;
  titre: string;
  description?: string;
  duree_semaines: number;
  type: ProgrammeType;
  statut: ProgrammeStatut;
  prix?: string;
  est_gratuit: boolean;
  coach: { id: number; bio: string };
  exercices: ProgrammeExercice[];
  nombre_exercices: number;
  created_at: string;
  updated_at: string;
}

export interface ProgrammeCollection {
  data: Programme[];
  meta: { total: number; types: ProgrammeType[]; statuts: ProgrammeStatut[] };
}

export interface CreateProgrammePayload {
  titre: string;
  duree_semaines: number;
  type: ProgrammeType;
  description?: string;
  statut?: ProgrammeStatut;
  prix?: number;
}

export type UpdateProgrammePayload = Partial<CreateProgrammePayload>;

export interface AddExercicePayload {
  exercice_id: number;
  jour_semaine: JourSemaine;
  series: number;
  repos_secondes: number;
  repetitions?: number;
  duree_minutes?: number | null;
  instructions?: string;
  ordre?: number;
}

export type UpdateExercicePayload = Partial<Omit<AddExercicePayload, "exercice_id">>;

const programmesApi = {
  /** GET /api/coach/programmes */
  list: (filters?: { type?: ProgrammeType; statut?: ProgrammeStatut }) =>
    axiosClient.get<ProgrammeCollection>("/coach/programmes", { params: filters }).then((r) => r.data),

  /** GET /api/coach/programmes/:id */
  get: (id: number) =>
    axiosClient.get<Programme>(`/coach/programmes/${id}`).then((r) => r.data),

  /** POST /api/coach/programmes */
  create: (payload: CreateProgrammePayload) =>
    axiosClient.post<Programme>("/coach/programmes", payload).then((r) => r.data),

  /** PUT /api/coach/programmes/:id */
  update: (id: number, payload: UpdateProgrammePayload) =>
    axiosClient.put<Programme>(`/coach/programmes/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/programmes/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/programmes/${id}`).then((r) => r.data),

  /** POST /api/coach/programmes/:id/exercices */
  addExercice: (programmeId: number, payload: AddExercicePayload) =>
    axiosClient.post<Programme>(`/coach/programmes/${programmeId}/exercices`, payload).then((r) => r.data),

  /** PUT /api/coach/programmes/:id/exercices/:exerciceId */
  updateExercice: (programmeId: number, exerciceId: number, payload: UpdateExercicePayload) =>
    axiosClient
      .put<Programme>(`/coach/programmes/${programmeId}/exercices/${exerciceId}`, payload)
      .then((r) => r.data),

  /** DELETE /api/coach/programmes/:id/exercices/:exerciceId */
  removeExercice: (programmeId: number, exerciceId: number) =>
    axiosClient.delete(`/coach/programmes/${programmeId}/exercices/${exerciceId}`).then((r) => r.data),

  /** POST /api/coach/programmes/:id/publier */
  publier: (id: number) =>
    axiosClient.post<Programme>(`/coach/programmes/${id}/publier`).then((r) => r.data),

  /** POST /api/coach/programmes/:id/depublier */
  depublier: (id: number) =>
    axiosClient.post<Programme>(`/coach/programmes/${id}/depublier`).then((r) => r.data),

  /** POST /api/coach/programmes/:id/archiver */
  archiver: (id: number) =>
    axiosClient.post<Programme>(`/coach/programmes/${id}/archiver`).then((r) => r.data),

  /** POST /api/coach/programmes/:id/dupliquer */
  dupliquer: (id: number) =>
    axiosClient.post<Programme>(`/coach/programmes/${id}/dupliquer`).then((r) => r.data),
};

export default programmesApi;
