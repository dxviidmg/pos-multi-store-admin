"use client";

/**
 * Negocios - Lista de negocios del sistema.
 */

import React, { useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Navbar } from "@/app/components/navbar";
import { ErrorAlert, PageCard, PageHeader, Panel, PrimaryButton, StatCard } from "@/app/components/ui";
import { CreateTenantModal } from "@/app/components/create-tenant-modal";
import { CreatePaymentModal } from "@/app/components/create-payment-modal";
import { computeMrr, computePaidThisMonth, formatCurrency } from "@/app/utils/earnings";
import { Tenant } from "@/app/domain/tenant.types";

type SandboxFilter = "all" | "sandbox" | "real";
type DomiciliadaFilter = "all" | "yes" | "no";
type StatusFilter = "active" | "cancelled" | "all";

function TenantsContent() {
  const { state, refreshTenants } = useAuth();

  const [sandboxFilter, setSandboxFilter] = useState<SandboxFilter>("all");
  const [domiciliadaFilter, setDomiciliadaFilter] =
    useState<DomiciliadaFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [payingTenant, setPayingTenant] = useState<Tenant | null>(null);

  const filteredTenants = useMemo(() => {
    return state.tenants.filter((tenant) => {
      if (sandboxFilter === "sandbox" && !tenant.is_sandbox) return false;
      if (sandboxFilter === "real" && tenant.is_sandbox) return false;
      if (domiciliadaFilter === "yes" && !tenant.is_domiciliada) return false;
      if (domiciliadaFilter === "no" && tenant.is_domiciliada) return false;
      if (statusFilter === "active" && tenant.is_cancelled) return false;
      if (statusFilter === "cancelled" && !tenant.is_cancelled) return false;
      return true;
    });
  }, [state.tenants, sandboxFilter, domiciliadaFilter, statusFilter]);

  const activeRealCount = useMemo(
    () =>
      state.tenants.filter(
        (t) => !t.is_sandbox && !t.is_cancelled && t.has_access
      ).length,
    [state.tenants]
  );

  const mrr = useMemo(() => computeMrr(state.tenants), [state.tenants]);
  const paidThisMonth = useMemo(
    () => computePaidThisMonth(state.tenants),
    [state.tenants]
  );

  const ready = !state.tenantsLoading && !state.tenantsError;

  const formatNextPayment = (dateStr: string | null) => {
    if (!dateStr) return "Sin definir";

    const date = new Date(dateStr);
    const now = new Date();
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round(
      (startOfDay(date).getTime() - startOfDay(now).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 0 && diffDays < 10) {
      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "En 1 día";
      return `En ${diffDays} días`;
    }

    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageCard>
        <PageHeader
          title="Negocios"
          subtitle="Negocios registrados y estado de sus pagos."
          action={
            state.token ? (
              <PrimaryButton onClick={() => setShowCreate(true)}>
                + Nuevo negocio
              </PrimaryButton>
            ) : undefined
          }
        />

        {showCreate && state.token && (
          <CreateTenantModal
            token={state.token}
            onClose={() => setShowCreate(false)}
            onCreated={refreshTenants}
          />
        )}

        {payingTenant && state.token && (
          <CreatePaymentModal
            token={state.token}
            tenant={payingTenant}
            onClose={() => setPayingTenant(null)}
            onCreated={refreshTenants}
          />
        )}

        {state.accessBlocked && (
          <ErrorAlert title="Acceso limitado">
            Tu suscripción venció el{" "}
            {state.accessUntil &&
              new Date(state.accessUntil).toLocaleDateString("es-ES")}
          </ErrorAlert>
        )}

        {/* Resumen de ingresos (mismas tarjetas que /inversion) */}
        {ready && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon="store"
              label="Negocios reales activos"
              value={String(activeRealCount)}
              tone="brand"
              hint="No sandbox, no cancelados y con acceso vigente."
            />
            <StatCard
              icon="recurring"
              label="MRR (ingreso mensual)"
              value={formatCurrency(mrr)}
              tone="positive"
              hint="MRR potencial: mensualidades de los negocios reales no cancelados, si todos pagan."
            />
            <StatCard
              icon="income"
              label="MRR pagado"
              value={formatCurrency(paidThisMonth.amount)}
              tone="positive"
              hint={
                mrr > 0
                  ? `${Math.round((paidThisMonth.amount / mrr) * 100)}% del MRR · ${paidThisMonth.paidCount}/${paidThisMonth.totalCount} al corriente`
                  : "Sin MRR para comparar"
              }
            />
          </div>
        )}

        {/* Lista de negocios */}
        <Panel bare
          title="Listado"
        >
          {ready && (
<div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="sandbox-filter" className="mb-1 block text-xs font-semibold text-muted">
                    Entorno
                  </label>
                  <select
                    id="sandbox-filter"
                    value={sandboxFilter}
                    onChange={(e) =>
                      setSandboxFilter(e.target.value as SandboxFilter)
                    }
                    className="min-h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <option value="all">Todos</option>
                    <option value="real">Reales</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status-filter" className="mb-1 block text-xs font-semibold text-muted">
                    Estado
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                    className="min-h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <option value="active">Activos</option>
                    <option value="cancelled">Cancelados</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="domiciliada-filter" className="mb-1 block text-xs font-semibold text-muted">
                    Domiciliada
                  </label>
                  <select
                    id="domiciliada-filter"
                    value={domiciliadaFilter}
                    onChange={(e) =>
                      setDomiciliadaFilter(e.target.value as DomiciliadaFilter)
                    }
                    className="min-h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <option value="all">Todas</option>
                    <option value="yes">Domiciliadas</option>
                    <option value="no">No domiciliadas</option>
                  </select>
                </div>
              </div>
          )}

          {state.tenantsLoading && (
            <div role="status" aria-live="polite" className="animate-pulse space-y-3 motion-reduce:animate-none">
              <span className="sr-only">Cargando negocios...</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 rounded-lg bg-line" />
              ))}
            </div>
          )}

          {state.tenantsError && <ErrorAlert>{state.tenantsError}</ErrorAlert>}

          {ready && filteredTenants.length === 0 && (
            <p className="rounded-xl border border-dashed border-line-strong py-10 text-center text-sm text-muted">
              No hay negocios que coincidan con los filtros.
            </p>
          )}

          {ready && filteredTenants.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="min-w-full">
                <thead className="bg-brand">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Nombre
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Entorno
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Domiciliada
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Pago mensual
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Próximo pago
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold text-white/80">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-row-divider">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="transition-colors hover:bg-row-hover motion-reduce:transition-none">
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">
                        {tenant.name}{" "}
                        <span className="font-normal text-caption">
                          ({tenant.short_name})
                        </span>
                        {tenant.is_cancelled && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 align-middle text-xs font-semibold text-red-700">
                            Cancelado
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span
                          className={
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                            (tenant.is_sandbox
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-50 text-green-700")
                          }
                        >
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                          {tenant.is_sandbox ? "Sandbox" : "Real"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted">
                        {tenant.is_domiciliada ? "Sí" : "No"}
                      </td>
                      <td
                        className={
                          "px-5 py-3 text-sm text-right font-semibold tabular-nums " +
                          (tenant.is_paid ? "text-foreground" : "text-red-600")
                        }
                        title={
                          tenant.is_paid ? "Pagado / vigente" : "Sin pago vigente"
                        }
                      >
                        {formatCurrency(tenant.monthly_amount)}
                        {!tenant.is_paid && (
                          <span className="block text-xs font-normal">
                            Sin pagar
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted">
                        {formatNextPayment(tenant.next_payment_date)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!tenant.is_cancelled && (
                          <button
                            type="button"
                            onClick={() => setPayingTenant(tenant)}
                            className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
                          >
                            + Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Owner Info */}
        {state.user?.role === "owner" && (
          <Panel bare title="Información del propietario">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted">Total de sucursales</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-brand">
                  {state.storeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Acceso bloqueado</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-brand">
                  {state.accessBlocked ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </Panel>
        )}
        </PageCard>
      </main>
    </div>
  );
}

export default function TenantsPage() {
  return (
    <ProtectedRoute>
      <TenantsContent />
    </ProtectedRoute>
  );
}
