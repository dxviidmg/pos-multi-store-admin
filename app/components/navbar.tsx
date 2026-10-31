"use client";

/**
 * Navbar - Barra de navegación del panel de administración.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth.context";
import { Icon } from "@/app/components/ui";

const NAV_ITEMS = [
  { label: "Negocios", href: "/negocios" },
  { label: "Pagos", href: "/pagos" },
  { label: "Planes", href: "/planes" },
  { label: "Inversión", href: "/inversion" },
];

export function Navbar() {
  const { state, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  const isActiveHref = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-brand shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Marca + menú (desktop) */}
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tight text-white">
              SVAdmin
            </span>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => {
                const isActive = isActiveHref(item.href);
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

          {/* Usuario + logout (desktop) */}
          <div className="hidden items-center gap-4 sm:flex">
            {state.user?.fullName && (
              <span className="text-sm text-white/80">
                {state.user.fullName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Botón hamburguesa (móvil) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 sm:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Panel desplegable (móvil) */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-white/10 px-4 pb-4 pt-2 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = isActiveHref(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "min-h-11 rounded-md px-3 py-2.5 text-base font-semibold transition-colors " +
                    (isActive
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-white/10 pt-3">
            {state.user?.fullName && (
              <p className="px-3 pb-2 text-sm text-white/70">
                {state.user.fullName}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="min-h-11 w-full rounded-md bg-white/10 px-4 py-2.5 text-left text-base font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
