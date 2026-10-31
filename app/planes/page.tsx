"use client";

/**
 * Planes - Lista de planes con precio, tipo de facturación y cuántos
 * negocios (tenants) tienen cada plan asignado.
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
} from "@/app/components/ui";
import { TenantService } from "@/app/services/tenant.service";
import { PlanStats, TenantError } from "@/app/domain/tenant.types";
import { formatCurrency } from "@/app/utils/earnings";

function PlanesContent() {
  const { state } = useAuth();

  const [plans, setPlans] = useState<PlanStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "M" | "S">("all");
  const [sandboxFilter, setSandboxFilter] = useState<"all" | "sandbox" | "real">("all");

  useEffect(() => {
    if (!state.token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    TenantService.getPlansWithStats(state.token)
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof TenantError
              ? err.message
              : "No se pudieron obtener los planes."
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

  const filteredPlans = useMemo(() => {
    const list = plans ?? [];
    return list.filter((p) => {
      if (typeFilter !== "all" && p.billing_type !== typeFilter) return false;
      if (sandboxFilter === "sandbox" && !p.is_sandbox) return false;
      if (sandboxFilter === "real" && p.is_sandbox) return false;
      return true;
    });
  }, [plans, typeFilter, sandboxFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageCard>
          <PageHeader
            title="Planes"
            subtitle="Planes disponibles, su precio y cuántos negocios los usan."
          />

          {loading && <PlanesSkeleton />}

          {error && <ErrorAlert>{error}</ErrorAlert>}

          {!loading && !error && plans && (
            <>
              <Panel bare title="Listado de planes">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-lg">
                  <div>
                    <label htmlFor="type-filter" className="mb-1 block text-xs font-semibold text-muted">
                      Tipo de facturación
                    </label>
                    <select
                      id="type-filter"
                      value={typeFilter}
                      onChange={(e) =>
                        setTypeFilter(e.target.value as "all" | "M" | "S")
                      }
                      className="min-h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <option value="all">Todos</option>
                      <option value="M">Manual</option>
                      <option value="S">Suscripción</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sandbox-filter" className="mb-1 block text-xs font-semibold text-muted">
                      Entorno
                    </label>
                    <select
                      id="sandbox-filter"
                      value={sandboxFilter}
                      onChange={(e) =>
                        setSandboxFilter(e.target.value as "all" | "sandbox" | "real")
                      }
                      className="min-h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <option value="all">Todos</option>
                      <option value="real">Reales</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>
                </div>

                {filteredPlans.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">
                    No hay planes que coincidan con el filtro.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="min-w-full">
                      <thead className="bg-brand">
                        <tr>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            Plan
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            Tipo
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            ID MP
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            Precio
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            N° sucursales
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                            Negocios con este plan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-row-divider">
                        {filteredPlans.map((plan) => (
                          <tr key={plan.id} className="transition-colors hover:bg-row-hover motion-reduce:transition-none">
                            <td className="px-5 py-3 text-sm font-semibold text-foreground">
                              {plan.name}
                              {plan.is_sandbox && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 align-middle text-xs font-semibold text-purple-800">
                                  Sandbox
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-sm">
                              <span
                                className={
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                                  (plan.billing_type === "S"
                                    ? "bg-brand/10 text-brand"
                                    : "bg-amber-50 text-amber-700")
                                }
                              >
                                {plan.billing_type === "S" ? "Suscripción" : "Manual"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted">
                              {plan.mp_plan_id ? (
                                <code className="rounded bg-row-hover px-1.5 py-0.5 text-xs tabular-nums">
                                  {plan.mp_plan_id}
                                </code>
                              ) : (
                                <span className="text-caption">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right text-sm tabular-nums text-foreground">
                              {formatCurrency(plan.price)}
                            </td>
                            <td className="px-5 py-3 text-right text-sm tabular-nums text-muted">
                              {plan.stores}
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                              {plan.tenants_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </>
          )}
        </PageCard>
      </main>
    </div>
  );
}

function PlanesSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Cargando planes...</span>
      <div className="h-48 rounded-brand bg-line" />
    </div>
  );
}

export default function PlanesPage() {
  return (
    <ProtectedRoute>
      <PlanesContent />
    </ProtectedRoute>
  );
}
