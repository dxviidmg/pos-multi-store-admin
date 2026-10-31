"use client";

/**
 * Negocios (Tenants) - Lista de negocios del sistema.
 */

import React, { useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Navbar } from "@/app/components/navbar";

type SandboxFilter = "all" | "sandbox" | "real";
type DomiciliadaFilter = "all" | "yes" | "no";

function TenantsContent() {
  const { state } = useAuth();

  const [sandboxFilter, setSandboxFilter] = useState<SandboxFilter>("all");
  const [domiciliadaFilter, setDomiciliadaFilter] =
    useState<DomiciliadaFilter>("all");

  const filteredTenants = useMemo(() => {
    return state.tenants.filter((tenant) => {
      if (sandboxFilter === "sandbox" && !tenant.is_sandbox) return false;
      if (sandboxFilter === "real" && tenant.is_sandbox) return false;
      if (domiciliadaFilter === "yes" && !tenant.is_domiciliada) return false;
      if (domiciliadaFilter === "no" && tenant.is_domiciliada) return false;
      return true;
    });
  }, [state.tenants, sandboxFilter, domiciliadaFilter]);

  const monthlyTotal = useMemo(
    () =>
      filteredTenants.reduce(
        (sum, t) => sum + (t.is_paid ? t.monthly_amount : 0),
        0
      ),
    [filteredTenants]
  );

  const currency = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);

  const formatNextPayment = (dateStr: string | null) => {
    if (!dateStr) return "Sin definir";

    const date = new Date(dateStr);
    const now = new Date();
    // Comparar por día (sin hora) para evitar desfases.
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Negocios
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenido, {state.user?.fullName}
          </p>
        </div>
        {/* Access Warning */}
        {state.accessBlocked && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Acceso limitado
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Tu suscripción venció el{" "}
                  {state.accessUntil &&
                    new Date(state.accessUntil).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de negocios (tenants) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Negocios (tenants)
            </h2>
            {!state.tenantsLoading && !state.tenantsError && (
              <span className="text-sm text-gray-500">
                {filteredTenants.length} de {state.tenants.length}
              </span>
            )}
          </div>

          {/* Filtros */}
          {!state.tenantsLoading && !state.tenantsError && (
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Entorno
                </label>
                <select
                  value={sandboxFilter}
                  onChange={(e) =>
                    setSandboxFilter(e.target.value as SandboxFilter)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="real">Reales</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Domiciliada
                </label>
                <select
                  value={domiciliadaFilter}
                  onChange={(e) =>
                    setDomiciliadaFilter(e.target.value as DomiciliadaFilter)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="yes">Domiciliadas</option>
                  <option value="no">No domiciliadas</option>
                </select>
              </div>
              <div className="ml-auto flex flex-col justify-end">
                <span className="block text-xs font-medium text-gray-500 mb-1">
                  Ingreso mensual (pagados)
                </span>
                <span className="text-lg font-semibold text-green-700">
                  {currency(monthlyTotal)}
                </span>
              </div>
            </div>
          )}

          {state.tenantsLoading && (
            <p className="text-sm text-gray-600">Cargando negocios...</p>
          )}

          {state.tenantsError && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-700">{state.tenantsError}</p>
            </div>
          )}

          {!state.tenantsLoading &&
            !state.tenantsError &&
            filteredTenants.length === 0 && (
              <p className="text-sm text-gray-600">
                No hay negocios que coincidan con los filtros.
              </p>
            )}

          {!state.tenantsLoading &&
            !state.tenantsError &&
            filteredTenants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entorno
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domiciliada
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago mensual
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Próximo pago
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {tenant.name}{" "}
                          <span className="font-normal text-gray-500">
                            ({tenant.short_name})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={
                              "inline-flex rounded-full px-2 text-xs font-semibold leading-5 " +
                              (tenant.is_sandbox
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800")
                            }
                          >
                            {tenant.is_sandbox ? "Sandbox" : "Real"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tenant.is_domiciliada ? "Sí" : "No"}
                        </td>
                        <td
                          className={
                            "px-4 py-3 text-sm text-right font-semibold " +
                            (tenant.is_paid
                              ? "text-gray-900"
                              : "text-red-600")
                          }
                          title={
                            tenant.is_paid
                              ? "Pagado / vigente"
                              : "Sin pago vigente"
                          }
                        >
                          {currency(tenant.monthly_amount)}
                          {!tenant.is_paid && (
                            <span className="block text-xs font-normal">
                              Sin pagar
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatNextPayment(tenant.next_payment_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Owner Info */}
        {state.user?.role === "owner" && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Información del propietario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Total de sucursales</p>
                <p className="text-lg font-medium text-blue-900">
                  {state.storeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Acceso bloqueado</p>
                <p className="text-lg font-medium text-blue-900">
                  {state.accessBlocked ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </div>
        )}
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
