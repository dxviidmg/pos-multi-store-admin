/**
 * Service Layer - API de ingresos (pagos).
 */

import { PaymentsTotal, TenantPaymentHistory } from "@/app/domain/earnings.types";
import { TenantError } from "@/app/domain/tenant.types";
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from "@/app/constants";

export class EarningsService {
  /**
   * Obtiene la suma total de todos los pagos (Payment.total) del sistema.
   * Requiere token de superusuario; de lo contrario el backend responde 403.
   */
  static async getPaymentsTotal(token: string): Promise<PaymentsTotal> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS_TOTAL}`,
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

      return (await response.json()) as PaymentsTotal;
    } catch (error) {
      if (error instanceof TenantError) throw error;
      if (error instanceof TypeError) {
        throw new TenantError("NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw new TenantError(
        "UNKNOWN_ERROR",
        ERROR_MESSAGES.TENANTS_FETCH_FAILED
      );
    }
  }

  /**
   * Obtiene el histórico de pagos agrupado por tenant (negocio).
   * Requiere token de superusuario; de lo contrario el backend responde 403.
   */
  static async getPaymentsByTenant(
    token: string
  ): Promise<TenantPaymentHistory[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS_BY_TENANT}`,
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

      return (await response.json()) as TenantPaymentHistory[];
    } catch (error) {
      if (error instanceof TenantError) throw error;
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
