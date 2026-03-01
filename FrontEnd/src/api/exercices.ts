import axiosClient from "./axios";

export type ExerciceCategorie =
  | "musculation" | "cardio" | "stretching" | "yoga" | "pilates"
  | "crossfit" | "boxe" | "fonctionnel" | "equilibre" | "plyometrie" | "autre";

export type ExerciceNiveau = "debutant" | "intermediaire" | "avance" | "expert";

export interface Media {
  type: "video" | "image";
  url: string;
}

export interface Exercice {
  id: number;
  nom: string;
  description?: string;
  consignes?: string;
  categorie: ExerciceCategorie;
  categorie_label: string;
  niveau: ExerciceNiveau;
  niveau_label: string;
  materiel: string[];
  medias: Media[];
  muscles_cibles: string[];
  duree_estimee?: number;
  duree_formatee?: string;
  series_defaut?: number;
  repetitions_defaut?: number;
  repos_defaut?: number;
  est_public: boolean;
  est_actif: boolean;
  coach: { id: number; bio: string };
  created_at: string;
  updated_at: string;
}

export interface ExerciceCollection {
  data: Exercice[];
  meta: {
    total: number;
    categories: ExerciceCategorie[];
    niveaux: ExerciceNiveau[];
  };
}

export interface CreateExercicePayload {
  nom: string;
  categorie: ExerciceCategorie;
  niveau: ExerciceNiveau;
  description?: string;
  consignes?: string;
  materiel?: string[];
  medias?: Media[];
  muscles_cibles?: string[];
  duree_estimee?: number;
  series_defaut?: number;
  repetitions_defaut?: number;
  repos_defaut?: number;
  est_public?: boolean;
  est_actif?: boolean;
}

export type UpdateExercicePayload = Partial<CreateExercicePayload>;

export interface ExerciceFilters {
  categorie?: ExerciceCategorie;
  niveau?: ExerciceNiveau;
  muscle?: string;
  search?: string;
}

const exercicesApi = {
  /** GET /api/coach/exercices */
  list: (filters?: ExerciceFilters) =>
    axiosClient.get<ExerciceCollection>("/coach/exercices", { params: filters }).then((r) => r.data),

  /** GET /api/coach/exercices/:id */
  get: (id: number) =>
    axiosClient.get<Exercice>(`/coach/exercices/${id}`).then((r) => r.data),

  /** POST /api/coach/exercices */
  create: (payload: CreateExercicePayload) =>
    axiosClient.post<Exercice>("/coach/exercices", payload).then((r) => r.data),

  /** PUT /api/coach/exercices/:id */
  update: (id: number, payload: UpdateExercicePayload) =>
    axiosClient.put<Exercice>(`/coach/exercices/${id}`, payload).then((r) => r.data),

  /** DELETE /api/coach/exercices/:id */
  delete: (id: number) =>
    axiosClient.delete(`/coach/exercices/${id}`).then((r) => r.data),
};

export default exercicesApi;
