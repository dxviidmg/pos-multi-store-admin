"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Acceso no autorizado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/tenants"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Volver a Negocios
          </Link>
        </div>
      </div>
    </div>
  );
}
