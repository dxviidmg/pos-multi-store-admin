"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Acceso no autorizado
          </h2>
          <p className="mt-2 text-sm text-muted">
            No tienes permisos para acceder a esta página.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/negocios"
            className="inline-flex items-center min-h-11 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-brand hover:bg-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Volver a Negocios
          </Link>
        </div>
      </div>
    </div>
  );
}
