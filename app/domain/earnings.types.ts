/**
 * Domain types para la sección de ganancias (ingresos vs costos).
 */

/** Si un renglón es una entrada (ingreso) o una salida (gasto). */
export type EntryKind = "income" | "expense";

/** Un renglón de costo ya calculado, listo para mostrar. */
export interface CostRow {
  description: string;
  detail?: string;
  amount: number;
  /** Entrada (ingreso) o gasto. Por defecto, gasto. */
  kind: EntryKind;
  /** true si es un cargo/ingreso recurrente; false si es único. */
  recurring: boolean;
}

/** Escenario de sueldo mensual para valuar el desarrollo. */
export interface SalaryScenario {
  monthly: number;
  hourly: number; // monthly / 176 (22 días hábiles × 8 h)
}

/** Resumen financiero para un escenario de sueldo dado. */
export interface EarningsSummary {
  totalIncome: number;
  developmentCost: number;
  otherCosts: number;
  totalCost: number;
  net: number; // ingresos - todos los costos (incluye desarrollo)
  netWithoutDevelopment: number; // ingresos - costos (sin desarrollo)
  rows: CostRow[];
  totalHours: number;
}

export interface PaymentsTotal {
  total_income: number;
  payments_count: number;
}

/** Un pago individual del histórico de un tenant. */
export interface TenantPayment {
  id: number;
  amount: number;
  months: number;
  date: string | null; // YYYY-MM-DD
  start_of_validity: string | null;
  end_of_validity: string | null;
}

/** Histórico de pagos agrupado por tenant (negocio). */
export interface TenantPaymentHistory {
  tenant_id: number;
  name: string;
  short_name: string;
  is_sandbox: boolean;
  total_paid: number;
  payments_count: number;
  first_payment: string | null;
  last_payment: string | null;
  payments: TenantPayment[];
}
