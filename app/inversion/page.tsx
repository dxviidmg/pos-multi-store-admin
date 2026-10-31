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
  Figure,
  Icon,
  PageHeader,
  Panel,
  StatCard,
  TONE_CHIP,
  TONE_TEXT,
} from "@/app/components/ui";
import { EarningsService } from "@/app/services/earnings.service";
import { TenantError } from "@/app/domain/tenant.types";
import {
  SALARY_SCENARIOS,
  buildEarningsSummary,
  computeMrr,
  computePayback,
  computeMonthlyProfit,
  formatCurrency,
  formatMonths,
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

  const summary = useMemo(
    () => buildEarningsSummary(totalIncome ?? 0, scenario),
    [totalIncome, scenario]
  );

  const mrr = useMemo(() => computeMrr(state.tenants), [state.tenants]);

  const payback = useMemo(
    () => computePayback(summary.net, mrr),
    [summary.net, mrr]
  );

  const monthlyProfit = useMemo(() => computeMonthlyProfit(mrr), [mrr]);

  const recoveredPct =
    summary.totalCost > 0
      ? Math.max(0, Math.min(100, (summary.totalIncome / summary.totalCost) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Inversión"
          subtitle="Ingresos menos inversión (desarrollo + costos)."
        />

        {loading && <InversionSkeleton />}

        {error && <ErrorAlert>{error}</ErrorAlert>}

        {!loading && !error && (
          <>
            {/* Selector de sueldo */}
            <Panel
              title="Escenario de sueldo"
              subtitle="Valor por hora usado para valuar tu desarrollo."
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
                className="grid grid-cols-2 gap-1 rounded-xl border border-line-strong bg-paper p-1 shadow-sm sm:inline-flex"
              >
                {SALARY_SCENARIOS.map((s, i) => (
                  <button
                    key={s.monthly}
                    type="button"
                    role="radio"
                    aria-checked={i === salaryIndex}
                    onClick={() => setSalaryIndex(i)}
                    className={
                      "min-h-10 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold tabular-nums transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none sm:px-4 sm:text-sm " +
                      (i === salaryIndex
                        ? "bg-brand text-white shadow-sm"
                        : "text-muted hover:bg-row-hover hover:text-foreground")
                    }
                  >
                    {formatCurrency(s.monthly)}/mes
                  </button>
                ))}
              </div>
            </Panel>

            {/* Resumen: tarjeta principal + métricas */}
            <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <HeroCard
                label="Neto CON desarrollo"
                value={formatCurrency(summary.net)}
                positive={summary.net >= 0}
                hint="Ingresos menos todos los costos, pagándome mi sueldo."
                recoveredPct={recoveredPct}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
                <StatCard
                  icon="income"
                  label="Ingresos"
                  value={formatCurrency(summary.totalIncome)}
                  tone="positive"
                />
                <StatCard
                  icon="recurring"
                  label="MRR (ingreso mensual)"
                  value={formatCurrency(monthlyProfit.mrr)}
                  tone="positive"
                  hint="Mensualidades de los negocios activos."
                />
                <StatCard
                  icon="dev"
                  label="Desarrollo (mi sueldo)"
                  value={formatCurrency(summary.developmentCost)}
                  tone="neutral"
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
                  className="sm:col-span-2"
                />
              </div>
            </div>

            {/* Ganancia neta mensual (MRR - Render) */}
            <Panel
              title="Ganancia neta mensual"
              subtitle="MRR menos el costo mensual de Render."
            >
              <div className="grid grid-cols-1 items-center gap-3 sm:gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <Figure
                  label="Ingreso mensual (MRR)"
                  value={formatCurrency(monthlyProfit.mrr)}
                  tone="positive"
                />
                <Operator>−</Operator>
                <Figure
                  label="Costo Render / mes"
                  value={formatCurrency(monthlyProfit.recurringCost)}
                  tone="negative"
                />
                <Operator>=</Operator>
                <Figure
                  label="Ganancia neta / mes"
                  value={formatCurrency(monthlyProfit.net)}
                  tone={monthlyProfit.net >= 0 ? "positive" : "negative"}
                  large
                />
              </div>
            </Panel>

            {/* Recuperación de inversión */}
            <Panel title="Recuperación de inversión">
              {payback.recovered ? (
                <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <Icon name="check" className="h-5 w-5 shrink-0" />
                  Ya recuperaste la inversión. El neto es positivo (
                  {formatCurrency(summary.net)}).
                </p>
              ) : payback.mrr <= 0 ? (
                <p className="flex items-start gap-2 text-sm text-red-600">
                  <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
                  Aún faltan {formatCurrency(payback.remaining)} por recuperar,
                  pero no hay ingreso mensual recurrente (MRR) con el cual
                  proyectar el tiempo de recuperación.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Figure
                    label="Falta por recuperar"
                    value={formatCurrency(payback.remaining)}
                    tone="negative"
                  />
                  <Figure
                    label="Ingreso mensual (MRR)"
                    value={formatCurrency(payback.mrr)}
                    tone="neutral"
                  />
                  <Figure
                    label="Tiempo estimado de recuperación"
                    value={
                      payback.months !== null ? formatMonths(payback.months) : "—"
                    }
                    tone="brand"
                    note={
                      payback.months !== null
                        ? `≈ ${payback.months.toFixed(1)} meses a este ritmo`
                        : undefined
                    }
                  />
                </div>
              )}
            </Panel>

            {/* Desglose de costos */}
            <Panel title="Desglose de costos">
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
      </main>
    </div>
  );
}

function Operator({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-row-hover text-lg font-light text-caption sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent sm:text-2xl"
    >
      {children}
    </span>
  );
}

function HeroCard({
  label,
  value,
  positive,
  hint,
  recoveredPct,
}: {
  label: string;
  value: string;
  positive: boolean;
  hint: string;
  recoveredPct: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-brand border border-line bg-row-hover p-5 shadow-sm">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-muted">
          <span
            className={
              "flex h-8 w-8 items-center justify-center rounded-lg " +
              (positive ? TONE_CHIP.positive : TONE_CHIP.negative)
            }
          >
            <Icon name={positive ? "up" : "down"} className="h-4 w-4" />
          </span>
          {label}
        </p>
        <p
          className={
            "mt-3 text-3xl font-bold tracking-tight tabular-nums " +
            (positive ? TONE_TEXT.positive : TONE_TEXT.negative)
          }
        >
          {value}
        </p>
        <p className="mt-2 text-xs text-caption">{hint}</p>
      </div>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Ingresos vs. costos totales</span>
          <span className="tabular-nums">{recoveredPct.toFixed(0)}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Porcentaje de costos cubierto por ingresos"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(recoveredPct)}
          className="h-2 overflow-hidden rounded-full bg-line-strong/60"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${recoveredPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InversionSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Cargando ingresos...</span>
      <div className="mb-5 h-20 rounded-brand bg-line" />
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-48 rounded-brand bg-line" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-brand bg-line" />
          ))}
        </div>
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
