/**
 * Domain types para tenants (negocios)
 */

export interface Tenant {
  id: number;
  name: string;
  short_name: string;
  is_sandbox: boolean;
  is_cancelled: boolean;
  cancelled_at: string | null;
  is_domiciliada: boolean;
  subscription_status: "active" | "expired" | "cancelled";
  has_access: boolean;
  is_paid: boolean;
  monthly_amount: number;
  access_until: string | null;
  next_payment_date: string | null;
  created_at: string | null;
}

/**
 * Plan con estadísticas para la vista /planes: incluye el conteo de negocios
 * (tenants) que tienen el plan asignado y el tipo de facturación.
 */
export interface PlanStats {
  id: number;
  name: string;
  price: number;
  stores: number;
  billing_type: "M" | "S"; // M = manual, S = suscripción
  billing_type_label: string;
  mp_plan_id: string; // id del plan en Mercado Pago ("" si no tiene)
  is_sandbox: boolean;
  tenants_count: number;
}

export class TenantError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "TenantError";
  }
}
