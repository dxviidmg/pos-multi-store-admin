/**
 * Constantes de la aplicación
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  LOGIN: "/api/api-token-auth/",
  VALIDATE_TOKEN: "/api/auth/verify/",
  LOGOUT: "/api/auth/logout/",
  TENANTS: "/api/tenants/",
  TENANTS_CREATE: "/api/tenants/create/",
  PAYMENTS_TOTAL: "/api/payments-total/",
  PAYMENTS_BY_TENANT: "/api/payments-by-tenant/",
};

export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/negocios",
  NO_PERMISSION: "/no-permission",
  UNAUTHORIZED: "/unauthorized",
};

export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
} as const;

export const ERROR_MESSAGES = {
  LOGIN_FAILED: "Error en la autenticación",
  NETWORK_ERROR: "No se pudo conectar con el servidor",
  UNKNOWN_ERROR: "Error desconocido durante la autenticación",
  NO_PERMISSION: "No tienes acceso. Este frontend es solo para administradores del sistema.",
  TENANTS_FETCH_FAILED: "No se pudo obtener la lista de negocios.",
  TENANTS_NO_PERMISSION: "No tienes permisos para ver los negocios.",
};
