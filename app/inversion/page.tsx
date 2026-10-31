"use client";

/**
 * Inversión - Ingresos vs costos, con escenarios de sueldo de desarrollo.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Navbar } from "@/app/components/navbar";
import { EarningsService } from "@/app/services/earnings.service";
import { TenantError } from "@/app/domain/tenant.types";
import {
  SALARY_SCENARIOS,
  buildEarningsSummary,
  computePayback,
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

  // MRR = ingreso mensual recurrente = suma de monthly_amount de los
  // tenants activos (con acceso vigente) que NO son sandbox.
  const mrr = useMemo(
    () =>
      state.tenants.reduce(
        (sum, t) =>
          sum + (t.has_access && !t.is_sandbox ? t.monthly_amount : 0),
        0
      ),
    [state.tenants]
  );

  const payback = useMemo(
    () => computePayback(summary.net, mrr),
    [summary.net, mrr]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Inversión
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Ingresos menos inversión (desarrollo + costos).
          </p>
        </div>

        {loading && (
          <p className="text-sm text-gray-600">Cargando ingresos...</p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Selector de sueldo */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Sueldo mensual para valuar el desarrollo
              </label>
              <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                {SALARY_SCENARIOS.map((s, i) => (
                  <button
                    key={s.monthly}
                    onClick={() => setSalaryIndex(i)}
                    className={
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors " +
                      (i === salaryIndex
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100")
                    }
                  >
                    {formatCurrency(s.monthly)}/mes
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatCurrency(scenario.hourly)}/hora ·{" "}
                {summary.totalHours.toFixed(1)} horas de desarrollo
              </p>
            </div>

            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <SummaryCard
                label="Ingresos"
                value={formatCurrency(summary.totalIncome)}
                color="text-green-700"
              />
              <SummaryCard
                label="Desarrollo (mi sueldo)"
                value={formatCurrency(summary.developmentCost)}
                color="text-gray-900"
              />
              <SummaryCard
                label="Otros costos (de bolsillo)"
                value={formatCurrency(summary.otherCosts)}
                color="text-gray-900"
              />
              <SummaryCard
                label="Neto SIN desarrollo"
                value={formatCurrency(summary.netWithoutDevelopment)}
                color={
                  summary.netWithoutDevelopment >= 0
                    ? "text-green-700"
                    : "text-red-600"
                }
                hint="Como soy jefe y empleado: ingresos menos lo que salió de mi bolsillo."
              />
              <SummaryCard
                label="Neto CON desarrollo"
                value={formatCurrency(summary.net)}
                color={summary.net >= 0 ? "text-green-700" : "text-red-600"}
                hint="Ingresos menos todos los costos, pagándome mi sueldo."
              />
            </div>

            {/* Recuperación de inversión */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recuperación de inversión
              </h2>

              {payback.recovered ? (
                <p className="text-sm text-green-700 font-medium">
                  Ya recuperaste la inversión. El neto es positivo (
                  {formatCurrency(summary.net)}).
                </p>
              ) : payback.mrr <= 0 ? (
                <p className="text-sm text-red-600">
                  Aún faltan {formatCurrency(payback.remaining)} por recuperar,
                  pero no hay ingreso mensual recurrente (MRR) con el cual
                  proyectar el tiempo de recuperación.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Falta por recuperar</p>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(payback.remaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Ingreso mensual (MRR)
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(payback.mrr)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Tiempo estimado de recuperación
                    </p>
                    <p className="text-xl font-bold text-blue-700 mt-1">
                      {payback.months !== null
                        ? formatMonths(payback.months)
                        : "—"}
                    </p>
                    {payback.months !== null && (
                      <p className="text-xs text-gray-500 mt-1">
                        ≈ {payback.months.toFixed(1)} meses a este ritmo
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desglose de costos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Desglose de costos
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalle
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {row.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {row.detail}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td
                        className="px-4 py-3 text-sm font-semibold text-gray-900"
                        colSpan={2}
                      >
                        Total costos
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(summary.totalCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={"text-2xl font-bold mt-1 " + color}>{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
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
