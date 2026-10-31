"use client";

/**
 * Navbar - Barra de navegación del panel de administración.
 */

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth.context";

const NAV_ITEMS = [
  { label: "Negocios", href: "/negocios" },
  { label: "Pagos", href: "/pagos" },
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
    <header className="bg-brand shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Marca + menú */}
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tight text-white">
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
                      "rounded-md px-3 py-2 text-sm font-semibold transition-colors " +
                      (isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white")
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
              <span className="hidden text-sm text-white/80 sm:inline">
                {state.user.fullName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
