import React from "react";

export type IconName = "income" | "recurring" | "dev" | "wallet" | "net" | "check" | "alert" | "up" | "down" | "store" | "clock" | "menu" | "close";

const ICON_PATHS: Record<IconName, string> = {
  income: "M3 17l6-6 4 4 8-8M15 7h6v6",
  recurring: "M4 4v6h6M20 20v-6h-6M5.6 15a8 8 0 0013.6 2M18.4 9A8 8 0 004.8 7",
  dev: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  wallet: "M3 7a2 2 0 012-2h13v4M3 7v10a2 2 0 002 2h14a1 1 0 001-1v-3M3 7h15a2 2 0 012 2v2h-4a2 2 0 000 4h4",
  net: "M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3",
  check: "M5 13l4 4L19 7",
  alert: "M12 9v4m0 4h.01M10.3 4.2L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z",
  store: "M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  up: "M7 17L17 7M9 7h8v8",
  down: "M7 7l10 10M17 9v8H9",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* --- Tonos de color compartidos entre páginas --- */

export type Tone = "positive" | "negative" | "neutral" | "brand";

export const TONE_TEXT: Record<Tone, string> = {
  positive: "text-green-700",
  negative: "text-red-600",
  neutral: "text-foreground",
  brand: "text-brand",
};

export const TONE_CHIP: Record<Tone, string> = {
  positive: "bg-green-50 text-green-700",
  negative: "bg-red-50 text-red-600",
  neutral: "bg-brand/5 text-brand",
  brand: "bg-brand/5 text-brand",
};

/**
 * Encabezado de página uniforme: título, subtítulo opcional y acción a la
 * derecha. Se usa igual en /negocios e /inversion.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Tarjeta de métrica compacta y uniforme (reemplaza StatTile y SummaryCard).
 */
export function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
  hint,
  className = "",
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-brand border border-line bg-paper p-4 shadow-sm " + className
      }
    >
      <div className="flex items-center gap-2.5">
        <span
          className={
            "flex h-8 w-8 items-center justify-center rounded-lg " +
            TONE_CHIP[tone]
          }
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className={"mt-2 text-xl font-bold tabular-nums " + TONE_TEXT[tone]}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-caption">{hint}</p>}
    </div>
  );
}

/**
 * Cifra con etiqueta (para desgloses / fórmulas). Compartida entre páginas.
 */
export function Figure({
  label,
  value,
  tone = "neutral",
  large,
  note,
}: {
  label: string;
  value: string;
  tone?: Tone;
  large?: boolean;
  note?: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p
        className={
          "mt-1 font-bold tabular-nums " +
          (large ? "text-2xl " : "text-xl ") +
          TONE_TEXT[tone]
        }
      >
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-caption">{note}</p>}
    </div>
  );
}

/**
 * Card blanca única que envuelve el contenido de una página (como el
 * contenedor principal de pos-multi-store). Las secciones internas usan
 * <Panel bare>.
 */
export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-brand border border-line bg-paper p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
      {children}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  flush,
  bare,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  flush?: boolean;
  /** Sin tarjeta propia: sección dentro de una tarjeta mayor. */
  bare?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        bare
          ? "mt-5 border-t border-line pt-5"
          : "mb-5 overflow-hidden rounded-brand border border-line bg-paper shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
      }
    >
      <div
        className={
          "flex items-start justify-between gap-4 pb-3 " +
          (bare ? "" : "px-5 pt-5")
        }
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={flush || bare ? "" : "px-5 pb-5"}>{children}</div>
    </section>
  );
}

export function ErrorAlert({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-brand border border-red-200 bg-red-50 p-4"
    >
      <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <div>
        {title && <h3 className="text-sm font-semibold text-red-800">{title}</h3>}
        <p className="text-sm text-red-700">{children}</p>
      </div>
    </div>
  );
}

/**
 * Modal accesible con backdrop. Cierra con Escape o clic fuera.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Evitar scroll del fondo mientras el modal está abierto.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-brand bg-paper shadow-[0_24px_60px_rgba(11,18,51,0.35)] sm:rounded-brand"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-row-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Botón primario de marca, uniforme en el panel. */
export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  className = "",
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none " +
        className
      }
    >
      {loading && (
        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
      )}
      {children}
    </button>
  );
}
