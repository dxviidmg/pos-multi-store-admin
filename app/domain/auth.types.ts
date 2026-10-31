/**
 * Domain types para autenticación
 */

import { Tenant } from "./tenant.types";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user_id: number;
  token: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  tenant_id: number;
  tenant_name: string;
  tenant_short_name: string;
  store_id: number;
  store_name: string;
  store_type: string;
  store_type_display: string;
  store_printer?: string;
  role: "owner" | "manager" | "staff";
  store_count?: number;
  access_blocked?: boolean;
  access_until?: string;
  is_superuser?: boolean;
}

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: "owner" | "manager" | "staff";
  tenantId: number;
  tenantName: string;
  storeId: number;
  storeName: string;
  storeType: string;
  isSuperuser: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  accessBlocked: boolean;
  accessUntil: string | null;
  storeCount?: number;
  hasPermission: boolean; // True si NO tiene tenant_id (solo admins del sistema)
  tenants: Tenant[];
  tenantsLoading: boolean;
  tenantsError: string | null;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}
