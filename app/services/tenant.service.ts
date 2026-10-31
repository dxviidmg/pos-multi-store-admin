/**
 * Service Layer - API de tenants (negocios)
 */

import { Tenant, TenantError } from "@/app/domain/tenant.types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/app/constants";
import { apiGet, ApiErrorFactory } from "@/app/services/http";

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
};

export class TenantService {
  /**
   * Obtiene la lista de todos los tenants del sistema.
   * Requiere un token de superusuario; de lo contrario el backend responde 403.
   */
  static getTenants(token: string): Promise<Tenant[]> {
    return apiGet<Tenant[]>(API_ENDPOINTS.TENANTS, token, tenantApiErrors);
  }
}
