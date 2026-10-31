"use client";

/**
 * Hook para verificar permisos y acceso
 */

import { useAuth } from "@/app/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UsePermissionsOptions {
  requiredRole?: string;
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const { state } = useAuth();
  const router = useRouter();
  const { requiredRole } = options;

  useEffect(() => {
    // Si sigue cargando, no hacer nada
    if (state.loading) return;

    // Si no está autenticado, redirigir al login
    if (!state.isAuthenticated) {
      router.push("/login");
      return;
    }

    // Si requiere un rol específico
    if (requiredRole && state.user?.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [state.isAuthenticated, state.loading, state.user, requiredRole, router]);

  return {
    isReady: !state.loading && state.isAuthenticated,
    user: state.user,
  };
}
