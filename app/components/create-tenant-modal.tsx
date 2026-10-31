"use client";

/**
 * CreateTenantModal - Alta manual de un negocio desde el panel admin.
 */

import React, { useEffect, useState } from "react";
import { Modal, PrimaryButton } from "@/app/components/ui";
import { TenantService, Plan, CreateTenantResult } from "@/app/services/tenant.service";
import { TenantError } from "@/app/domain/tenant.types";

/** Capitaliza cada palabra (igual que el registro público). */
const capitalizeWords = (value: string) =>
  value.toLowerCase().replace(/\b(\w)/g, (m) => m.toUpperCase());

/** Minúsculas y solo [a-z0-9.] (igual que el registro público). */
const sanitizeShortName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9.]/g, "");

const currency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

type ShortNameStatus = "idle" | "checking" | "available" | "taken";

const SHORT_NAME_DEBOUNCE_MS = 450;

export function CreateTenantModal({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [shortNameStatus, setShortNameStatus] =
    useState<ShortNameStatus>("idle");
  const [planId, setPlanId] = useState<string>(""); // "" = sin plan
  const [plans, setPlans] = useState<Plan[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateTenantResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    TenantService.getPlans(token)
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch(() => {
        // Si falla, el select queda vacío (se puede crear sin plan).
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Verificación de disponibilidad del short_name (con debounce).
  useEffect(() => {
    const value = shortName.trim();
    if (!value) {
      setShortNameStatus("idle");
      return;
    }
    let ignore = false;
    setShortNameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const { exists } = await TenantService.checkShortNameExists(
          token,
          value
        );
        if (!ignore) setShortNameStatus(exists ? "taken" : "available");
      } catch {
        if (!ignore) setShortNameStatus("idle");
      }
    }, SHORT_NAME_DEBOUNCE_MS);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [shortName, token]);

  const canSubmit =
    name.trim().length > 0 &&
    shortName.trim().length > 0 &&
    planId !== "" &&
    shortNameStatus === "available";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await TenantService.createTenant(token, {
        name: name.trim(),
        short_name: shortName.trim(),
        plan_id: Number(planId),
      });
      onCreated(); // recarga la lista en segundo plano
      setCreated(result); // muestra la pantalla de éxito con el usuario
      setSubmitting(false);
    } catch (err) {
      setError(
        err instanceof TenantError
          ? err.message
          : "No se pudo crear el negocio."
      );
      setSubmitting(false);
    }
  };

  const copyCredentials = async () => {
    if (!created) return;
    const text = `Usuario: ${created.owner_username}\nContraseña: ${created.owner_username}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard puede no estar disponible (http, permisos); se ignora.
    }
  };

  return (
    <Modal
      title={created ? "Negocio creado" : "Nuevo negocio"}
      onClose={onClose}
    >
      {created ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-green-600">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800">
              <span className="font-semibold">{created.name}</span> se creó
              correctamente.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line-strong bg-row-hover p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Usuario
                </span>
                <code className="text-sm font-semibold tabular-nums text-foreground">
                  {created.owner_username}
                </code>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Contraseña
                </span>
                <code className="text-sm font-semibold tabular-nums text-foreground">
                  {created.owner_username}
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={copyCredentials}
              className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
              aria-label="Copiar usuario y contraseña"
            >
              {copied ? (
                <>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" />
                  </svg>
                  Copiar usuario y contraseña
                </>
              )}
            </button>

            <p className="text-xs text-caption">
              El usuario y la contraseña inicial son iguales. El propietario
              debe cambiar la contraseña al iniciar sesión.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton onClick={onClose}>Listo</PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="tenant-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
              Nombre del negocio
            </label>
            <input
              id="tenant-name"
            type="text"
            value={name}
            onChange={(e) => setName(capitalizeWords(e.target.value))}
            autoFocus
            required
            maxLength={100}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Ej: Mi Tienda"
            className="min-h-10 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-foreground placeholder-caption focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="tenant-short" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Clave del negocio
          </label>
          <div className="relative">
            <input
              id="tenant-short"
              type="text"
              value={shortName}
              onChange={(e) => setShortName(sanitizeShortName(e.target.value))}
              required
              maxLength={10}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={shortNameStatus === "taken"}
              placeholder="Ej: mitienda, mi.tienda, mt"
              className={
                "min-h-10 w-full rounded-lg border bg-paper px-3 py-2 pr-10 text-sm lowercase tabular-nums text-foreground placeholder-caption focus:outline-none focus:ring-2 " +
                (shortNameStatus === "taken"
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : shortNameStatus === "available"
                  ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                  : "border-line-strong focus:border-brand focus:ring-brand/30")
              }
            />
            <span className="absolute inset-y-0 right-3 flex items-center">
              {shortNameStatus === "checking" && (
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-brand motion-reduce:animate-none" />
              )}
              {shortNameStatus === "available" && (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              {shortNameStatus === "taken" && (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-600">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
            </span>
          </div>
          <p
            className={
              "mt-1 text-xs " +
              (shortNameStatus === "taken"
                ? "text-red-600"
                : shortNameStatus === "available"
                ? "text-green-700"
                : "text-caption")
            }
          >
            {shortNameStatus === "taken"
              ? "Esta clave ya está en uso. Prueba otra."
              : shortNameStatus === "available"
              ? "Clave disponible."
              : "Identificador único. Minúsculas, letras, números y punto. Máx. 10."}
          </p>
        </div>

        <div>
          <label htmlFor="tenant-plan" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Plan
          </label>
          <select
            id="tenant-plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            required
            className="min-h-10 w-full cursor-pointer rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="" disabled>
              Selecciona un plan
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {currency(p.price)}/mes · {p.stores}{" "}
                {p.stores === 1 ? "tienda" : "tiendas"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded-lg border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-row-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
          >
            Cancelar
          </button>
          <PrimaryButton type="submit" disabled={!canSubmit} loading={submitting}>
            {submitting ? "Creando..." : "Crear negocio"}
          </PrimaryButton>
        </div>
        </form>
      )}
    </Modal>
  );
}
