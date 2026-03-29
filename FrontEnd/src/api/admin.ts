import axiosClient from "./axios";

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  roles: AdminRole[];
  is_banned: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminStatistics {
  total_users: number;
  active_users: number;
  banned_users: number;
  coaches_count: number;
  clients_count: number;
  commandes_count: number;
  seances_today: number;
  seances_upcoming: number;
  low_stock_equipements: number;
}

export interface GymSeanceRow {
  id: number;
  titre: string;
  date: string;
  heure_debut: string;
  type: string;
  statut: string;
  lieu?: string;
  capacite_max: number;
  inscrits: number;
  places_restantes: number;
  coach?: {
    id?: number;
    name?: string;
    email?: string;
  };
}

export interface GymEquipementRow {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  stock_quantite: number;
  alerte_stock: number;
  visible: boolean;
  is_low_stock: boolean;
  coach?: {
    id?: number;
    name?: string;
    email?: string;
  };
}

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const unwrap = <T>(payload: unknown): T => {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const adminApi = {
  users: async (params?: {
    search?: string;
    role?: string;
    status?: "all" | "active" | "banned";
    per_page?: number;
    page?: number;
  }) => {
    const res = await axiosClient.get("/gym/users", { params });
    return unwrap<AdminUsersResponse>(res.data);
  },

  user: async (userId: number) => {
    const res = await axiosClient.get(`/gym/users/${userId}`);
    return unwrap<AdminUser>(res.data);
  },

  dashboard: async () => {
    const res = await axiosClient.get("/gym/dashboard");
    return unwrap<AdminStatistics>(res.data);
  },

  seances: async (params?: {
    statut?: string;
    per_page?: number;
    page?: number;
  }) => {
    const res = await axiosClient.get("/gym/seances", { params });
    return unwrap<PaginatedResponse<GymSeanceRow>>(res.data);
  },

  equipements: async (params?: {
    low_stock_only?: boolean;
    per_page?: number;
    page?: number;
  }) => {
    const res = await axiosClient.get("/gym/equipements", { params });
    return unwrap<PaginatedResponse<GymEquipementRow>>(res.data);
  },

  updateRoles: async (userId: number, roles: string[]) => {
    const res = await axiosClient.put(`/gym/users/${userId}/roles`, {
      roles,
    });
    return unwrap<AdminUser>(res.data);
  },

  ban: async (userId: number) => {
    const res = await axiosClient.post(`/gym/users/${userId}/ban`);
    return unwrap<AdminUser>(res.data);
  },

  unban: async (userId: number) => {
    const res = await axiosClient.post(`/gym/users/${userId}/unban`);
    return unwrap<AdminUser>(res.data);
  },
};

export default adminApi;
