"use client";

/**
 * Navbar - Barra de navegación del panel de administración.
 */

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth.context";

const NAV_ITEMS = [
  { label: "Negocios", href: "/tenants" },
  { label: "Inversión", href: "/inversion" },
];

export function Navbar() {
  const { state, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Marca + menú */}
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Admin
            </span>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                      (isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Usuario + logout */}
          <div className="flex items-center gap-4">
            {state.user?.fullName && (
              <span className="hidden text-sm text-gray-600 sm:inline">
                {state.user.fullName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
