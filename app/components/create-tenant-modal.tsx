"use client";

/**
 * CreateTenantModal - Alta manual de un negocio desde el panel admin.
 */

import React, { useState } from "react";
import { Modal, PrimaryButton } from "@/app/components/ui";
import { TenantService } from "@/app/services/tenant.service";
import { TenantError } from "@/app/domain/tenant.types";

/** Capitaliza cada palabra (igual que el registro público). */
const capitalizeWords = (value: string) =>
  value.toLowerCase().replace(/\b(\w)/g, (m) => m.toUpperCase());

/** Minúsculas y solo [a-z0-9.] (igual que el registro público). */
const sanitizeShortName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9.]/g, "");

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && shortName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await TenantService.createTenant(token, {
        name: name.trim(),
        short_name: shortName.trim(),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof TenantError
          ? err.message
          : "No se pudo crear el negocio."
      );
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Nuevo negocio" onClose={onClose}>
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
            placeholder="Ej: mitienda, mi.tienda, mt"
            className="min-h-10 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm lowercase tabular-nums text-foreground placeholder-caption focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-caption">
            Identificador único. Minúsculas, letras, números y punto. Máx. 10.
          </p>
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
    </Modal>
  );
}
