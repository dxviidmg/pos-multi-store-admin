"use client";

/**
 * CreatePlanModal - Alta de un plan desde el panel admin.
 *
 * Si el plan es de suscripción, el backend lo registra en Mercado Pago;
 * si MP falla, no se crea nada y se muestra el error.
 */

import React, { useState } from "react";
import { Modal, PrimaryButton } from "@/app/components/ui";
import {
  TenantService,
  CreatePlanInput,
  UpdatePlanInput,
} from "@/app/services/tenant.service";
import { PlanStats, TenantError } from "@/app/domain/tenant.types";

type BillingType = "M" | "S";

export function CreatePlanModal({
  token,
  plan,
  onClose,
  onCreated,
}: {
  token: string;
  /** Si se pasa un plan, el modal entra en modo edición. */
  plan?: PlanStats;
  onClose: () => void;
  onCreated: () => void;
}) {
  const isEdit = !!plan;
  const [billingType, setBillingType] = useState<BillingType>(
    plan?.billing_type ?? "M"
  );
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(plan ? String(plan.price) : "");
  const [stores, setStores] = useState(plan ? String(plan.stores) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PlanStats | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const priceNum = parseFloat(price);
    const storesNum = parseInt(stores, 10);

    if (!name.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }
    if (!Number.isInteger(storesNum) || storesNum < 1) {
      setError("El número de sucursales debe ser un entero de al menos 1.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let result: PlanStats;
      if (isEdit && plan) {
        const input: UpdatePlanInput = {
          name: name.trim(),
          price: priceNum,
          stores: storesNum,
        };
        result = await TenantService.updatePlan(token, plan.id, input);
      } else {
        const input: CreatePlanInput = {
          name: name.trim(),
          price: priceNum,
          stores: storesNum,
          billing_type: billingType,
        };
        result = await TenantService.createPlan(token, input);
      }
      setDone(result);
      onCreated();
    } catch (err) {
      setError(
        err instanceof TenantError
          ? err.message
          : isEdit
            ? "No se pudo actualizar el plan."
            : "No se pudo crear el plan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "min-h-11 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  const labelClass =
    "mb-1 block text-xs font-semibold uppercase tracking-wider text-muted";

  const isSubscription = billingType === "S";

  return (
    <Modal title={isEdit ? "Editar plan" : "Crear plan"} onClose={onClose}>
      {done ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">
              {isEdit ? "Plan actualizado correctamente." : "Plan creado correctamente."}
            </p>
            {done.billing_type === "S" && done.mp_plan_id && (
              <p className="mt-1">
                {isEdit ? "Actualizado" : "Registrado"} en Mercado Pago (ID:{" "}
                {done.mp_plan_id}).
              </p>
            )}
          </div>
          <PrimaryButton onClick={onClose}>Cerrar</PrimaryButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="billing-type" className={labelClass}>
              Tipo de facturación
            </label>
            <select
              id="billing-type"
              value={billingType}
              disabled={isEdit}
              onChange={(e) => setBillingType(e.target.value as BillingType)}
              className={
                inputClass +
                (isEdit ? " cursor-not-allowed opacity-60" : " cursor-pointer")
              }
            >
              <option value="M">Manual</option>
              <option value="S">Suscripción (Mercado Pago)</option>
            </select>
            {isEdit && (
              <p className="mt-1 text-xs text-muted">
                El tipo de facturación no se puede cambiar.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="plan-name" className={labelClass}>
              Nombre
            </label>
            <input
              id="plan-name"
              type="text"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan-price" className={labelClass}>
                Precio (MXN)
              </label>
              <input
                id="plan-price"
                type="number"
                min={1}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="plan-stores" className={labelClass}>
                N° sucursales
              </label>
              <input
                id="plan-stores"
                type="number"
                min={1}
                step={1}
                value={stores}
                onChange={(e) => setStores(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {isSubscription && !isEdit && (
            <p className="rounded-lg bg-brand/5 px-3 py-2 text-xs text-muted">
              Al crear este plan se registrará automáticamente en Mercado Pago
              (mensual, MXN). Si Mercado Pago rechaza la operación, el plan no
              se creará.
            </p>
          )}

          {isSubscription && isEdit && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Este plan está vinculado a Mercado Pago. Cambiar el precio aplica
              solo a nuevas suscripciones; los suscriptores actuales conservan
              su monto. Si Mercado Pago rechaza el cambio, no se guardará nada.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={submitting}>
            {submitting
              ? isEdit
                ? "Guardando…"
                : "Creando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear plan"}
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}
