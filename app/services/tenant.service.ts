/**
 * Service Layer - API de tenants (negocios)
 */

import { Tenant, TenantError } from "@/app/domain/tenant.types";
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from "@/app/constants";

export class TenantService {
  /**
   * Obtiene la lista de todos los tenants del sistema.
   * Requiere un token de un superusuario; de lo contrario el backend
   * responde 403.
   */
  static async getTenants(token: string): Promise<Tenant[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.TENANTS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 403) {
        throw new TenantError(
          "NO_PERMISSION",
          ERROR_MESSAGES.TENANTS_NO_PERMISSION,
          403
        );
      }

      if (!response.ok) {
        throw new TenantError(
          "FETCH_FAILED",
          ERROR_MESSAGES.TENANTS_FETCH_FAILED,
          response.status
        );
      }

      const data: Tenant[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new TenantError("NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR);
      }

      throw new TenantError(
        "UNKNOWN_ERROR",
        ERROR_MESSAGES.TENANTS_FETCH_FAILED
      );
    }
  }
}
