/**
 * Utilidades de cálculo para la sección de ganancias.
 */

import costsData from "@/app/data/costs.json";
import {
  CostRow,
  EarningsSummary,
  SalaryScenario,
} from "@/app/domain/earnings.types";
import { Tenant } from "@/app/domain/tenant.types";

export const SALARY_SCENARIOS: SalaryScenario[] = [7000, 10000, 15000, 20000, 25000, 30000].map(
  (monthly) => ({ monthly, hourly: monthly / 30 / 8 })
);

/** Total de horas de desarrollo sumando todos los repos del JSON. */
export function getTotalDevHours(): number {
  return costsData.development.repos.reduce((sum, r) => sum + r.hours, 0);
}

/**
 * Ingresos manuales: pagos realmente recibidos pero que no están en la base
 * de datos (p. ej. porque se borraron). Se suman al total de ingresos.
 */
export function getManualIncome(): number {
  const manual = (costsData as { manualIncome?: { amount: number }[] })
    .manualIncome;
  return manual ? manual.reduce((sum, r) => sum + r.amount, 0) : 0;
}

/**
 * Costo mensual recurrente de infraestructura (ej. Render/OnRender).
 * Suma el `unitCost` de todos los cargos recurrentes del JSON, ya que son
 * cargos que se repiten cada mes.
 */
export function getMonthlyRecurringCost(): number {
  return costsData.recurring.reduce((sum, r) => sum + r.unitCost, 0);
}

/**
 * Ganancia neta mensual = ingreso mensual recurrente (MRR) menos el costo
 * mensual recurrente de infraestructura (Render).
 */
export interface MonthlyProfit {
  mrr: number;
  recurringCost: number;
  net: number;
}

type BillableTenant = Pick<
  Tenant,
  "has_access" | "is_sandbox" | "is_paid" | "is_cancelled" | "monthly_amount"
>;

/** Activo y facturable: real (no sandbox), no cancelado y con acceso vigente. */
function isActiveReal(t: BillableTenant): boolean {
  return !t.is_sandbox && !t.is_cancelled;
}

/** MRR: mensualidades de los negocios reales activos (no cancelados, con acceso). */
export function computeMrr(tenants: BillableTenant[]): number {
  return tenants.reduce(
    (sum, t) => sum + (isActiveReal(t) ? t.monthly_amount : 0),
    0
  );
}

/** Cobrado este mes: mensualidades de los negocios reales activos. */
export function computePaidThisMonth(tenants: BillableTenant[]): {
  amount: number;
  paidCount: number;
  totalCount: number;
} {
  const active = tenants.filter(isActiveReal);
  return {
    amount: active.reduce((sum, t) => sum + t.monthly_amount, 0),
    paidCount: active.length,
    totalCount: active.length,
  };
}

export function computeMonthlyProfit(mrr: number): MonthlyProfit {
  const recurringCost = getMonthlyRecurringCost();
  return { mrr, recurringCost, net: mrr - recurringCost };
}

/**
 * Número de cobros efectivos de un cargo recurrente que inicia en "YYYY-MM"
 * y se cobra el día `billingDay` de cada mes. Solo cuenta cobros cuya fecha
 * ya pasó (o es hoy). Si se pasa `untilYm` ("YYYY-MM"), el conteo se detiene
 * al final de ese mes (cargo recurrente ya terminado).
 *
 * Ej: inicio "2025-09", billingDay 2, hoy 2026-10-30 ->
 *   cobros el 2025-09-02, 2025-10-02, ..., 2026-10-02 = 14 cobros.
 */
function billingCountSince(
  sinceYm: string,
  billingDay = 1,
  untilYm?: string
): number {
  const [y, m] = sinceYm.split("-").map(Number);
  const now = new Date();
  let count = 0;
  // Recorrer mes a mes desde el inicio hasta el mes actual (o hasta `untilYm`).
  let cursor = new Date(y, m - 1, billingDay);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let end = today;
  if (untilYm) {
    const [uy, um] = untilYm.split("-").map(Number);
    // Último día del mes de fin, para incluir el cobro de ese mes.
    const untilEnd = new Date(uy, um, 0);
    end = untilEnd < today ? untilEnd : today;
  }
  while (cursor <= end) {
    count++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, billingDay);
  }
  return count;
}

/**
 * Construye el resumen financiero para un escenario de sueldo dado.
 */
export function buildEarningsSummary(
  totalIncome: number,
  scenario: SalaryScenario
): EarningsSummary {
  const totalHours = getTotalDevHours();
  const developmentCost = totalHours * scenario.hourly;

  const rows: CostRow[] = [];

  // Ingresos manuales (entradas recibidas que no están en la BD).
  const manualIncome = (costsData as {
    manualIncome?: { description: string; amount: number; month: string }[];
  }).manualIncome;
  if (manualIncome) {
    for (const m of manualIncome) {
      rows.push({
        description: m.description,
        detail: `Entrada manual · ${m.month}`,
        amount: m.amount,
        kind: "income",
        recurring: false,
      });
    }
  }

  // Desarrollo
  rows.push({
    description: costsData.development.description,
    detail: `${totalHours.toFixed(1)} h × ${formatCurrency(
      scenario.hourly
    )}/h (sueldo ${formatCurrency(scenario.monthly)}/mes)`,
    amount: developmentCost,
    kind: "expense",
    recurring: false,
  });

  // Costos recurrentes (ej. Render)
  let recurringTotal = 0;
  for (const r of costsData.recurring as {
    description: string;
    unitCost: number;
    since: string;
    billingDay?: number;
    until?: string;
  }[]) {
    const charges = billingCountSince(r.since, r.billingDay ?? 1, r.until);
    const amount = charges * r.unitCost;
    recurringTotal += amount;
    const period = r.until
      ? `${r.since} a ${r.until} (terminado)`
      : `desde ${r.since}, día ${r.billingDay ?? 1}`;
    rows.push({
      description: r.description,
      detail: `${charges} cobros × ${formatCurrency(r.unitCost)} (${period})`,
      amount,
      kind: "expense",
      recurring: true,
    });
  }

  // Costos fijos
  let fixedTotal = 0;
  for (const f of costsData.fixed as {
    quantity: number;
    description: string;
    unitCost: number;
    amount: number;
    month?: string;
  }[]) {
    fixedTotal += f.amount;
    const base = `${f.quantity} × ${formatCurrency(f.unitCost)}`;
    rows.push({
      description: f.description,
      detail: f.month ? `${base} · ${f.month}` : base,
      amount: f.amount,
      kind: "expense",
      recurring: false,
    });
  }

  const otherCosts = recurringTotal + fixedTotal;
  const totalCost = developmentCost + otherCosts;

  return {
    totalIncome,
    developmentCost,
    otherCosts,
    totalCost,
    net: totalIncome - totalCost,
    netWithoutDevelopment: totalIncome - otherCosts,
    rows,
    totalHours,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

/**
 * Resultado del cálculo de recuperación de inversión (payback).
 */
export interface PaybackResult {
  recovered: boolean; // true si el neto ya es >= 0
  remaining: number; // cuánto falta por recuperar (0 si ya recuperado)
  mrr: number; // ingreso mensual recurrente usado
  months: number | null; // meses estimados (null si MRR = 0 y aún falta)
}

/**
 * Calcula en cuánto tiempo se recupera la inversión dado el neto actual
 * y el ingreso mensual recurrente (MRR).
 */
export function computePayback(net: number, mrr: number): PaybackResult {
  if (net >= 0) {
    return { recovered: true, remaining: 0, mrr, months: 0 };
  }
  const remaining = Math.abs(net);
  const months = mrr > 0 ? remaining / mrr : null;
  return { recovered: false, remaining, mrr, months };
}

/**
 * Convierte una cantidad de meses (decimal) a un texto legible:
 * "1 año y 2 meses", "8 meses", etc.
 */
export function formatMonths(months: number): string {
  const total = Math.ceil(months);
  const years = Math.floor(total / 12);
  const rem = total % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years > 1 ? "s" : ""}`);
  if (rem > 0) parts.push(`${rem} mes${rem > 1 ? "es" : ""}`);
  return parts.length ? parts.join(" y ") : "menos de 1 mes";
}

/**
 * Fecha exacta estimada de recuperación: hoy + `months` meses (redondeado
 * hacia arriba al mes). Devuelve algo como "octubre de 2027".
 */
export function recoveryDate(months: number): string {
  const d = new Date();
  d.setDate(1); // evita desbordes por días (p. ej. 31 + 1 mes).
  d.setMonth(d.getMonth() + Math.ceil(months));
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}
