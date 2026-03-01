// Central export for all API services
export { default as offresApi } from "./offres";
export { default as contratsApi } from "./contrats";
export { default as exercicesApi } from "./exercices";
export { default as paiementsApi } from "./paiements";
export { default as seancesApi } from "./seances";
export { default as programmesApi } from "./programmes";
export { default as facturesApi } from "./factures";
export { default as axiosClient } from "./axios";

// Re-export all types
export type * from "./offres";
export type * from "./contrats";
export type * from "./exercices";
export type * from "./paiements";
export type * from "./seances";
export type * from "./programmes";
export type * from "./factures";
