// Types TypeScript pour l'API Backend
// Copiez ce fichier dans votre projet frontend

/**
 * Rôles disponibles dans l'application
 */
export type UserRole =
    | "prospect"
    | "client"
    | "coach"
    | "gym_manager"
    | "admin";

/**
 * Structure d'un rôle
 */
export interface Role {
    id: number;
    name: UserRole;
    description: string;
}

/**
 * Structure de la localisation
 */
export interface Location {
    latitude: number;
    longitude: number;
}

/**
 * Structure du tarif horaire
 */
export interface HourlyRate {
    amount: number;
    formatted: string;
    currency: string;
}

/**
 * Structure du profil Coach
 */
export interface Coach {
    id: number;
    bio: string | null;
    specialties: string[];
    certifications: string[];
    experience_years: number;
    hourly_rate: HourlyRate | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Structure de l'utilisateur
 */
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    avatar: string | null;
    location: Location | null;
    roles: Role[];
    coach: Coach | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Réponse d'inscription/connexion
 */
export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
}

/**
 * Structure d'une erreur de validation
 */
export interface ValidationErrors {
    [key: string]: string[];
}

/**
 * Structure d'erreur API
 */
export interface ApiError {
    success: false;
    message: string;
    error: {
        code: string;
        status: number;
        errors?: ValidationErrors;
        required_roles?: UserRole[];
        debug?: any;
    };
}

/**
 * Données d'inscription
 */
export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: "prospect" | "coach";
}

/**
 * Données de connexion
 */
export interface LoginData {
    email: string;
    password: string;
}

/**
 * Réponse wrapper pour GET /api/user
 */
export interface UserResponse {
    data: User;
}

/**
 * Réponse du dashboard coach
 */
export interface CoachDashboardResponse {
    message: string;
    coach: Coach;
}

/**
 * Réponse des statistiques
 */
export interface StatisticsResponse {
    message: string;
    // TODO: Définir la structure quand l'endpoint sera implémenté
}

/**
 * Helper type pour vérifier les rôles
 */
export type RoleChecker = (role: UserRole | UserRole[]) => boolean;

/**
 * Configuration de l'API
 */
export const API_CONFIG = {
    BASE_URL: "http://127.0.0.1:8000/api",
    HEADERS: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
} as const;

/**
 * Codes d'erreur
 */
export enum ErrorCode {
    UNAUTHENTICATED = "UNAUTHENTICATED",
    FORBIDDEN = "FORBIDDEN",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    SERVER_ERROR = "SERVER_ERROR",
}

/**
 * Endpoints de l'API
 */
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "/register",
        LOGIN: "/login",
        LOGOUT: "/logout",
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: "/reset-password",
    },
    USER: {
        ME: "/user",
    },
    COACH: {
        DASHBOARD: "/coach/dashboard",
        CLIENTS: "/coach/clients",
        STATISTICS: "/coach/statistics",
    },
    ADMIN: {
        USERS: "/admin/users",
        STATISTICS: "/admin/statistics",
    },
    GYM: {
        DASHBOARD: "/gym/dashboard",
        EQUIPMENT: "/gym/equipment",
    },
    STATISTICS: "/statistics",
} as const;

/**
 * Type guard pour vérifier si une réponse est une erreur
 */
export function isApiError(response: any): response is ApiError {
    return response && response.success === false && response.error;
}

/**
 * Type guard pour vérifier si c'est une erreur de validation
 */
export function isValidationError(error: ApiError): boolean {
    return error.error.code === ErrorCode.VALIDATION_ERROR;
}

/**
 * Helper pour extraire le message d'erreur
 */
export function getErrorMessage(error: ApiError): string {
    if (isValidationError(error)) {
        const errors = error.error.errors;
        if (errors) {
            const firstKey = Object.keys(errors)[0];
            return errors[firstKey][0];
        }
    }
    return error.message;
}

/**
 * Helper pour vérifier si un utilisateur a un rôle
 */
export function hasRole(user: User | null, role: UserRole): boolean {
    return user?.roles?.some((r) => r.name === role) ?? false;
}

/**
 * Helper pour vérifier si un utilisateur a l'un des rôles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user?.roles?.some((r) => roles.includes(r.name)) ?? false;
}

/**
 * Helper pour obtenir le token depuis le localStorage
 */
export function getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
}

/**
 * Helper pour sauvegarder le token
 */
export function setAuthToken(token: string): void {
    localStorage.setItem("auth_token", token);
}

/**
 * Helper pour supprimer le token
 */
export function removeAuthToken(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
}

/**
 * Helper pour obtenir l'utilisateur depuis le localStorage
 */
export function getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Helper pour sauvegarder l'utilisateur
 */
export function setStoredUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
}
