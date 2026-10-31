"use client";

/**
 * CreatePaymentModal - Registro manual de un pago para un negocio.
 *
 * El admin solo indica el número de meses; el backend calcula el monto
 * (plan × meses) y las fechas de vigencia a partir del último pago.
 */

import React, { useState } from "react";
import { Modal, PrimaryButton } from "@/app/components/ui";
import { EarningsService } from "@/app/services/earnings.service";
import { CreatePaymentResult } from "@/app/domain/earnings.types";
import { Tenant, TenantError } from "@/app/domain/tenant.types";
import { formatCurrency } from "@/app/utils/earnings";

export function CreatePaymentModal({
  token,
  tenant,
  onClose,
  onCreated,
}: {
  token: string;
  tenant: Tenant;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [months, setMonths] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatePaymentResult | null>(null);

  // Monto estimado (solo referencia visual; el backend es la fuente real).
  const estimated = tenant.monthly_amount * months;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!Number.isInteger(months) || months < 1) {
      setError("El número de meses debe ser un entero de al menos 1.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await EarningsService.createPayment(
        token,
        tenant.id,
        months
      );
      setCreated(result);
      onCreated();
    } catch (err) {
      setError(
        err instanceof TenantError
          ? err.message
          : "No se pudo registrar el pago."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso + "T00:00:00").toLocaleDateString("es-MX") : "—";

  return (
    <Modal title="Registrar pago" onClose={onClose}>
      {created ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">Pago registrado correctamente.</p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Negocio</dt>
              <dd className="font-medium text-foreground">{tenant.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Meses</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {created.months}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Monto</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {formatCurrency(created.total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Vigencia</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formatDate(created.start_of_validity)} –{" "}
                {formatDate(created.end_of_validity)}
              </dd>
            </div>
          </dl>
          <PrimaryButton onClick={onClose}>Cerrar</PrimaryButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-brand/5 p-3 text-sm">
            <p className="font-semibold text-foreground">{tenant.name}</p>
            <p className="text-muted">
              Mensualidad: {formatCurrency(tenant.monthly_amount)}
            </p>
          </div>

          <div>
            <label
              htmlFor="months"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Número de meses
            </label>
            <input
              id="months"
              type="number"
              min={1}
              step={1}
              value={months}
              autoFocus
              onChange={(e) => setMonths(parseInt(e.target.value, 10) || 0)}
              className="min-h-11 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>

          <div className="flex justify-between rounded-lg bg-row-hover px-3 py-2 text-sm">
            <span className="text-muted">Monto estimado</span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(estimated)}
            </span>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Registrando…" : "Registrar pago"}
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}
