"use client";

/**
 * Pagos - Histórico de cuánto ha pagado cada cliente (negocio).
 */

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Navbar } from "@/app/components/navbar";
import { ErrorAlert, PageHeader, Panel, StatCard } from "@/app/components/ui";
import { EarningsService } from "@/app/services/earnings.service";
import { TenantError } from "@/app/domain/tenant.types";
import { TenantPaymentHistory } from "@/app/domain/earnings.types";

function currency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Meses transcurridos (inclusive) desde `fromDate` hasta hoy. */
function monthsSince(fromDate: string | null): number {
  if (!fromDate) return 0;
  // Acepta "YYYY-MM-DD" o un datetime ISO completo (created_at del tenant).
  const from = new Date(
    fromDate.includes("T") ? fromDate : fromDate + "T00:00:00"
  );
  if (isNaN(from.getTime())) return 0;
  const now = new Date();
  const months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth()) +
    1; // +1 para incluir el mes de inicio.
  return Math.max(months, 1);
}

interface ExpectedBreakdown {
  rate: number; // tarifa mensual de referencia (máx. de total/meses por pago)
  monthsExpected: number; // meses desde la creación del tenant hasta hoy
  expected: number; // rate * monthsExpected
  received: number; // suma de pagos
  diff: number; // expected - received (lo no cobrado); <=0 significa al corriente
}

/**
 * Esperado vs. recibido por cliente.
 * Tarifa mensual de referencia = máximo de (monto / meses) entre sus pagos,
 * de modo que un pago de varios meses (p. ej. 3 meses juntos) no infle la
 * tarifa; se normaliza a costo por mes.
 * Meses esperados = desde la creación del tenant hasta hoy (inclusive).
 * Si no hay fecha de creación, cae al primer pago como respaldo.
 */
function computeExpected(
  h: TenantPaymentHistory,
  tenantCreatedAt: string | null
): ExpectedBreakdown {
  const rate = h.payments.reduce((m, p) => {
    const months = p.months && p.months > 0 ? p.months : 1;
    return Math.max(m, p.amount / months);
  }, 0);
  const startDate = tenantCreatedAt ?? h.first_payment;
  const monthsExpected = monthsSince(startDate);
  const expected = rate * monthsExpected;
  const received = h.total_paid;
  return {
    rate,
    monthsExpected,
    expected,
    received,
    diff: expected - received,
  };
}

type EnvFilter = "all" | "real" | "sandbox";

function PagosContent() {
  const { state } = useAuth();

  const [history, setHistory] = useState<TenantPaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<EnvFilter>("real");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!state.token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    EarningsService.getPaymentsByTenant(state.token)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof TenantError
              ? err.message
              : "No se pudo obtener el histórico de pagos."
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

  const filtered = useMemo(() => {
    return history.filter((h) => {
      if (envFilter === "real" && h.is_sandbox) return false;
      if (envFilter === "sandbox" && !h.is_sandbox) return false;
      return true;
    });
  }, [history, envFilter]);

  const totals = useMemo(() => {
    const totalPaid = filtered.reduce((s, h) => s + h.total_paid, 0);
    return { totalPaid };
  }, [filtered]);

  // Esperado vs. recibido por cliente (tarifa = máx. monto/mes, meses desde la
  // fecha de creación del tenant hasta hoy).
  const breakdowns = useMemo(() => {
    const createdAtByTenant = new Map<number, string | null>(
      state.tenants.map((t) => [t.id, t.created_at])
    );
    const map = new Map<number, ExpectedBreakdown>();
    for (const h of filtered) {
      const createdAt = createdAtByTenant.get(h.tenant_id) ?? null;
      map.set(h.tenant_id, computeExpected(h, createdAt));
    }
    return map;
  }, [filtered, state.tenants]);

  const totalUncollected = useMemo(
    () =>
      Array.from(breakdowns.values()).reduce(
        (s, b) => s + Math.max(0, b.diff),
        0
      ),
    [breakdowns]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Pagos"
          subtitle="Histórico de cuánto ha pagado cada cliente."
          action={
            !loading && !error ? (
              <div>
                <label htmlFor="env-filter" className="sr-only">
                  Entorno
                </label>
                <select
                  id="env-filter"
                  value={envFilter}
                  onChange={(e) => setEnvFilter(e.target.value as EnvFilter)}
                  className="min-h-9 cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <option value="real">Reales</option>
                  <option value="all">Todos</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
            ) : undefined
          }
        />

        {loading && <PagosSkeleton />}

        {error && <ErrorAlert>{error}</ErrorAlert>}

        {!loading && !error && (
          <>
            {/* Resumen */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard
                icon="income"
                label="Total cobrado"
                value={currency(totals.totalPaid)}
                tone="positive"
              />
              <StatCard
                icon="alert"
                label="No cobrado (estimado)"
                value={currency(totalUncollected)}
                tone={totalUncollected > 0 ? "negative" : "positive"}
                hint="Esperado menos recibido, sumado de todos los clientes."
              />
            </div>

            {/* Detalle por cliente (expandible) */}
            {filtered.length > 0 && (
              <Panel title="Detalle por cliente" flush>
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="min-w-full">
                    <thead className="bg-brand">
                      <tr>
                        <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white/80">
                          Cliente
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                          Recibido
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                          Esperado
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                          No cobrado
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                          Pagos
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white/80">
                          Primer pago
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white/80">
                          Último pago
                        </th>
                        <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white/80">
                          <span className="sr-only">Detalle</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-row-divider">
                      {filtered.map((h) => {
                        const open = expandedId === h.tenant_id;
                        const b = breakdowns.get(h.tenant_id);
                        const uncollected = b ? Math.max(0, b.diff) : 0;
                        return (
                          <React.Fragment key={h.tenant_id}>
                            <tr className="transition-colors hover:bg-row-hover motion-reduce:transition-none">
                              <td className="px-5 py-3 text-sm font-semibold text-foreground">
                                {h.name}{" "}
                                <span className="font-normal text-caption">
                                  ({h.short_name})
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-green-700">
                                {currency(h.total_paid)}
                              </td>
                              <td className="px-5 py-3 text-right text-sm tabular-nums text-muted">
                                {b ? currency(b.expected) : "—"}
                                {b && (
                                  <span className="block text-xs text-caption">
                                    {currency(b.rate)}/mes × {b.monthsExpected}{" "}
                                    {b.monthsExpected === 1 ? "mes" : "meses"}
                                  </span>
                                )}
                              </td>
                              <td
                                className={
                                  "px-5 py-3 text-right text-sm font-semibold tabular-nums " +
                                  (uncollected > 0
                                    ? "text-red-600"
                                    : "text-green-700")
                                }
                              >
                                {uncollected > 0 ? currency(uncollected) : "Al día"}
                              </td>
                              <td className="px-5 py-3 text-right text-sm tabular-nums text-muted">
                                {h.payments_count}
                              </td>
                              <td className="px-5 py-3 text-sm text-muted">
                                {formatDate(h.first_payment)}
                              </td>
                              <td className="px-5 py-3 text-sm text-muted">
                                {formatDate(h.last_payment)}
                              </td>
                              <td className="px-5 py-3 text-right text-sm">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedId(open ? null : h.tenant_id)
                                  }
                                  aria-expanded={open}
                                  className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                >
                                  {open ? "Ocultar" : "Ver pagos"}
                                </button>
                              </td>
                            </tr>
                            {open && (
                              <tr className="bg-row-hover">
                                <td colSpan={8} className="px-5 py-3">
                                  <ul className="divide-y divide-row-divider rounded-lg border border-line bg-paper">
                                    {h.payments.map((p) => (
                                      <li
                                        key={p.id}
                                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                                      >
                                        <span className="text-muted">
                                          {formatDate(p.date)} · {p.months}{" "}
                                          {p.months === 1 ? "mes" : "meses"}
                                        </span>
                                        <span className="font-semibold tabular-nums text-foreground">
                                          {currency(p.amount)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function PagosSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Cargando pagos...</span>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 rounded-brand bg-line" />
        ))}
      </div>
      <div className="h-64 rounded-brand bg-line" />
    </div>
  );
}

export default function PagosPage() {
  return (
    <ProtectedRoute>
      <PagosContent />
    </ProtectedRoute>
  );
}
