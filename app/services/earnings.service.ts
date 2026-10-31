/**
 * Service Layer - API de ingresos (pagos).
 */

import { PaymentsTotal, TenantPaymentHistory } from "@/app/domain/earnings.types";
import { API_ENDPOINTS } from "@/app/constants";
import { apiGet } from "@/app/services/http";
import { tenantApiErrors } from "@/app/services/tenant.service";

export class EarningsService {
  /**
   * Obtiene la suma total de todos los pagos (Payment.total) del sistema.
   * Requiere token de superusuario; de lo contrario el backend responde 403.
   */
  static getPaymentsTotal(token: string): Promise<PaymentsTotal> {
    return apiGet<PaymentsTotal>(
      API_ENDPOINTS.PAYMENTS_TOTAL,
      token,
      tenantApiErrors
    );
  }

  /**
   * Obtiene el histórico de pagos agrupado por tenant (negocio).
   * Requiere token de superusuario; de lo contrario el backend responde 403.
   */
  static getPaymentsByTenant(token: string): Promise<TenantPaymentHistory[]> {
    return apiGet<TenantPaymentHistory[]>(
      API_ENDPOINTS.PAYMENTS_BY_TENANT,
      token,
      tenantApiErrors
    );
  }
}
