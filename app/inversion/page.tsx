"use client";

/**
 * Inversión - Ingresos vs costos, con escenarios de sueldo de desarrollo.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Navbar } from "@/app/components/navbar";
import {
  ErrorAlert,
  PageCard,
  PageHeader,
  Panel,
  StatCard,
} from "@/app/components/ui";
import { EarningsService } from "@/app/services/earnings.service";
import { TenantError } from "@/app/domain/tenant.types";
import {
  SALARY_SCENARIOS,
  buildEarningsSummary,
  computeMrr,
  computePayback,
  computeMonthlyProfit,
  getManualIncome,
  formatCurrency,
  formatMonths,
  recoveryDate,
} from "@/app/utils/earnings";

function InversionContent() {
  const { state } = useAuth();

  const [totalIncome, setTotalIncome] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salaryIndex, setSalaryIndex] = useState(0);

  useEffect(() => {
    if (!state.token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    EarningsService.getPaymentsTotal(state.token)
      .then((data) => {
        if (!cancelled) setTotalIncome(data.total_income);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof TenantError
              ? err.message
              : "No se pudieron obtener los ingresos."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state.token]);

  const scenario = SALARY_SCENARIOS[salaryIndex];

  const manualIncome = getManualIncome();
  const dbIncome = totalIncome ?? 0;

  const summary = useMemo(
    () => buildEarningsSummary(dbIncome + manualIncome, scenario),
    [dbIncome, manualIncome, scenario]
  );

  const mrr = useMemo(() => computeMrr(state.tenants), [state.tenants]);

  const monthlyProfit = useMemo(() => computeMonthlyProfit(mrr), [mrr]);

  // Recuperación sin considerar Render (a ritmo de MRR) y considerándolo
  // (a ritmo de ganancia neta mensual = MRR - Render).
  const payback = useMemo(
    () => computePayback(summary.net, mrr),
    [summary.net, mrr]
  );
  const paybackNet = useMemo(
    () => computePayback(summary.net, monthlyProfit.net),
    [summary.net, monthlyProfit.net]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageCard>
        <PageHeader
          title="Inversión"
          subtitle="Ingresos menos inversión (desarrollo + costos)."
        />

        {loading && <InversionSkeleton />}

        {error && <ErrorAlert>{error}</ErrorAlert>}

        {!loading && !error && (
          <>
            {/* Ganancia neta mensual (MRR - Render) */}
            <Panel bare
              title="Ganancia neta mensual"
              subtitle="MRR menos el costo mensual de Render."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  icon="recurring"
                  label="Ingreso mensual (MRR)"
                  value={formatCurrency(monthlyProfit.mrr)}
                  tone="positive"
                  hint="Mensualidades de los negocios activos."
                />
                <StatCard
                  icon="wallet"
                  label="Costo Render / mes"
                  value={formatCurrency(monthlyProfit.recurringCost)}
                  tone="negative"
                />
                <StatCard
                  icon={monthlyProfit.net >= 0 ? "up" : "down"}
                  label="Ganancia neta / mes"
                  value={formatCurrency(monthlyProfit.net)}
                  tone={monthlyProfit.net >= 0 ? "positive" : "negative"}
                  hint="MRR menos costo de Render."
                />
              </div>
            </Panel>

            {/* Balance acumulado (sin valuar mi desarrollo) */}
            <Panel bare
              title="Balance acumulado"
              subtitle="Lo que ha entrado y lo que salió de tu bolsillo, sin contar tu sueldo."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  icon="income"
                  label="Ingresos"
                  value={formatCurrency(summary.totalIncome)}
                  tone="positive"
                  hint={
                    manualIncome > 0
                      ? `${formatCurrency(dbIncome)} en sistema + ${formatCurrency(manualIncome)} manuales`
                      : undefined
                  }
                />
                <StatCard
                  icon="wallet"
                  label="Otros costos (de bolsillo)"
                  value={formatCurrency(summary.otherCosts)}
                  tone="neutral"
                />
                <StatCard
                  icon="net"
                  label="Neto SIN desarrollo"
                  value={formatCurrency(summary.netWithoutDevelopment)}
                  tone={summary.netWithoutDevelopment >= 0 ? "positive" : "negative"}
                  hint="Ingresos menos lo que salió de mi bolsillo."
                />
              </div>
            </Panel>

            {/* Valuando mi desarrollo (depende del sueldo elegido) */}
            <Panel bare
              title="Valor de mi desarrollo"
              subtitle="Elige el sueldo mensual con el que valuar el trabajo de desarrollo."
              action={
                <p className="text-xs text-muted tabular-nums sm:text-right">
                  {formatCurrency(scenario.hourly)}/h ·{" "}
                  {summary.totalHours.toFixed(0)} h
                </p>
              }
            >
              <div
                role="radiogroup"
                aria-label="Sueldo mensual para valuar el desarrollo"
                className="grid w-full grid-cols-2 border-b border-line sm:grid-cols-4"
              >
                {SALARY_SCENARIOS.map((s, i) => (
                  <button
                    key={s.monthly}
                    type="button"
                    role="radio"
                    aria-checked={i === salaryIndex}
                    onClick={() => setSalaryIndex(i)}
                    className={
                      "-mb-px min-h-11 w-full cursor-pointer border-b-2 px-3 py-3 text-center text-xs font-semibold tabular-nums transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand motion-reduce:transition-none sm:px-4 sm:text-sm " +
                      (i === salaryIndex
                        ? "border-brand text-brand"
                        : "border-transparent text-muted hover:border-line-strong hover:text-foreground")
                    }
                  >
                    {formatCurrency(s.monthly)}/mes
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  icon="dev"
                  label="Desarrollo (mi sueldo)"
                  value={formatCurrency(summary.developmentCost)}
                  tone="neutral"
                />
                <StatCard
                  icon="wallet"
                  label="Total de costos"
                  value={formatCurrency(summary.totalCost)}
                  tone="neutral"
                  hint="Desarrollo + otros costos."
                />
                <StatCard
                  icon={summary.net >= 0 ? "up" : "down"}
                  label="Neto CON desarrollo"
                  value={formatCurrency(summary.net)}
                  tone={summary.net >= 0 ? "positive" : "negative"}
                  hint="Ingresos menos todos los costos, pagándome mi sueldo."
                />
              </div>
            </Panel>

            {/* Recuperación de inversión */}
            <Panel bare title="Recuperación de inversión">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {payback.recovered ? (
                  <StatCard
                    icon="check"
                    label="Inversión recuperada"
                    value={formatCurrency(summary.net)}
                    tone="positive"
                    hint="Ya recuperaste la inversión: el neto es positivo."
                  />
                ) : (
                  <>
                    <StatCard
                      icon="down"
                      label="Falta por recuperar"
                      value={formatCurrency(payback.remaining)}
                      tone="negative"
                    />
                    <StatCard
                      icon="clock"
                      label="Recuperación sin considerar Render"
                      value={
                        payback.months !== null
                          ? formatMonths(payback.months)
                          : "—"
                      }
                      tone="brand"
                      hint={
                        payback.months !== null
                          ? `≈ ${recoveryDate(payback.months)} · ${payback.months.toFixed(1)} meses a ${formatCurrency(payback.mrr)}/mes de MRR`
                          : "Sin MRR para proyectar el tiempo de recuperación."
                      }
                    />
                    <StatCard
                      icon="clock"
                      label="Recuperación considerando Render"
                      value={
                        paybackNet.months !== null
                          ? formatMonths(paybackNet.months)
                          : "—"
                      }
                      tone="brand"
                      hint={
                        paybackNet.months !== null
                          ? `≈ ${recoveryDate(paybackNet.months)} · ${paybackNet.months.toFixed(1)} meses a ${formatCurrency(monthlyProfit.net)}/mes de ganancia neta`
                          : "La ganancia neta mensual no es positiva: no se recupera a este ritmo."
                      }
                    />
                  </>
                )}
              </div>
            </Panel>

            {/* Desglose de costos */}
            <Panel bare title="Desglose de costos">
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="min-w-full">
                  <thead className="bg-brand">
                    <tr>
                      <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white/80">
                        Concepto
                      </th>
                      <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white/80">
                        Detalle
                      </th>
                      <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-row-divider">
                    {summary.rows.map((row, i) => (
                      <tr key={i} className="transition-colors hover:bg-row-hover motion-reduce:transition-none">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">
                          {row.description}
                        </td>
                        <td className="px-5 py-3 text-sm text-muted">
                          {row.detail}
                        </td>
                        <td className="px-5 py-3 text-right text-sm tabular-nums text-foreground">
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-line-strong bg-row-hover">
                      <td className="px-5 py-3 text-sm font-semibold text-foreground" colSpan={2}>
                        Total costos
                      </td>
                      <td className="px-5 py-3 text-right text-base font-bold tabular-nums text-foreground">
                        {formatCurrency(summary.totalCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Panel>
          </>
        )}
        </PageCard>
      </main>
    </div>
  );
}

function InversionSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Cargando ingresos...</span>
      <div className="mb-5 h-20 rounded-brand bg-line" />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 rounded-brand bg-line" />
        ))}
      </div>
      <div className="h-36 rounded-brand bg-line" />
    </div>
  );
}

export default function InversionPage() {
  return (
    <ProtectedRoute>
      <InversionContent />
    </ProtectedRoute>
  );
}
