import axiosClient from "./axios";

export type DashboardPeriod = "week" | "month" | "year";

export interface CoachKpis {
  ca?: number;
  taux_remplissage?: number;
  fidelisation?: number;
  panier_moyen?: number;
  top_offres?: unknown[];
}

const getData = <T>(payload: unknown): T | null => {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data?: T }).data ?? null;
  }
  return (payload as T) ?? null;
};

const getNestedNumber = (value: unknown, keys: string[] = []): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;

  if (typeof value === "object" && value !== null) {
    for (const key of keys) {
      const nested = (value as Record<string, unknown>)[key];
      const parsed = getNestedNumber(nested, []);
      if (parsed !== 0) return parsed;
    }
  }

  return 0;
};

const coachDashboardApi = {
  /** GET /api/coach/dashboard/kpis */
  kpis: async (period: DashboardPeriod = "month") => {
    const res = await axiosClient.get("/coach/dashboard/kpis", {
      params: { period },
    });
    const raw = getData<Record<string, unknown>>(res.data) ?? {};

    return {
      ...raw,
      ca: getNestedNumber(raw.ca, ["total", "ca"]),
      taux_remplissage: getNestedNumber(raw.taux_remplissage, [
        "taux_remplissage",
        "total",
      ]),
      fidelisation: getNestedNumber(raw.fidelisation, [
        "taux_fidelisation",
        "total",
      ]),
      panier_moyen: getNestedNumber(raw.panier_moyen, [
        "panier_moyen",
        "total",
      ]),
    } as CoachKpis;
  },

  /** GET /api/coach/dashboard/ca */
  ca: async (period: DashboardPeriod = "month") => {
    const res = await axiosClient.get("/coach/dashboard/ca", {
      params: { period },
    });
    const raw = getData<unknown>(res.data);
    return getNestedNumber(raw, ["total", "ca"]);
  },

  /** GET /api/coach/dashboard/taux-remplissage */
  tauxRemplissage: async (period: DashboardPeriod = "month") => {
    const res = await axiosClient.get("/coach/dashboard/taux-remplissage", {
      params: { period },
    });
    const raw = getData<unknown>(res.data);
    return getNestedNumber(raw, ["taux_remplissage", "total"]);
  },
};

export default coachDashboardApi;
