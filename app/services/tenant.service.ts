/**
 * Service Layer - API de tenants (negocios)
 */

import { Tenant, TenantError } from "@/app/domain/tenant.types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/app/constants";
import { apiGet, apiPost, ApiErrorFactory } from "@/app/services/http";

/** Errores de dominio para las llamadas que requieren superusuario. */
export const tenantApiErrors: ApiErrorFactory = {
  noPermission: () =>
    new TenantError("NO_PERMISSION", ERROR_MESSAGES.TENANTS_NO_PERMISSION, 403),
  fetchFailed: (status) =>
    new TenantError("FETCH_FAILED", ERROR_MESSAGES.TENANTS_FETCH_FAILED, status),
  network: () =>
    new TenantError("NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR),
  unknown: () =>
    new TenantError("UNKNOWN_ERROR", ERROR_MESSAGES.TENANTS_FETCH_FAILED),
  withMessage: (message, status) =>
    new TenantError("REQUEST_FAILED", message, status),
};

/** Datos para crear un negocio manualmente desde el admin. */
export interface CreateTenantInput {
  name: string;
  short_name: string;
  is_sandbox?: boolean;
  plan_id?: number | null;
}

/** Respuesta del alta manual de un negocio. */
export interface CreateTenantResult {
  id: number;
  name: string;
  short_name: string;
  is_sandbox: boolean;
  owner_username: string;
}

export class TenantService {
  /**
   * Obtiene la lista de todos los tenants del sistema.
   * Requiere un token de superusuario; de lo contrario el backend responde 403.
   */
  static getTenants(token: string): Promise<Tenant[]> {
    return apiGet<Tenant[]>(API_ENDPOINTS.TENANTS, token, tenantApiErrors);
  }

  /**
   * Alta manual de un negocio (sin Mercado Pago). Requiere superusuario.
   */
  static createTenant(
    token: string,
    input: CreateTenantInput
  ): Promise<CreateTenantResult> {
    return apiPost<CreateTenantResult>(
      API_ENDPOINTS.TENANTS_CREATE,
      token,
      input,
      tenantApiErrors
    );
  }
}
