/**
 * Domain types para la sección de ganancias (ingresos vs costos).
 */

/** Un renglón de costo ya calculado, listo para mostrar. */
export interface CostRow {
  description: string;
  detail?: string;
  amount: number;
}

/** Escenario de sueldo mensual para valuar el desarrollo. */
export interface SalaryScenario {
  monthly: number;
  hourly: number; // monthly / 30 / 8
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
