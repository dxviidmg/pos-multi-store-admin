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
