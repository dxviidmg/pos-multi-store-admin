/**
 * Service Layer - API de ingresos (pagos).
 */

import {
  CreatePaymentResult,
  PaymentsTotal,
  TenantPaymentHistory,
} from "@/app/domain/earnings.types";
import { API_ENDPOINTS } from "@/app/constants";
import { apiGet, apiPost } from "@/app/services/http";
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

  /**
   * Registra manualmente un pago para un negocio dado el número de meses.
   * El backend calcula el monto (plan × meses) y las fechas de vigencia.
   * Requiere token de superusuario; de lo contrario el backend responde 403.
   */
  static createPayment(
    token: string,
    tenantId: number,
    months: number
  ): Promise<CreatePaymentResult> {
    return apiPost<CreatePaymentResult>(
      API_ENDPOINTS.PAYMENTS_CREATE,
      token,
      { tenant_id: tenantId, months },
      tenantApiErrors
    );
  }
}
