"use client";

/**
 * Protected Route Component - Verifica autenticación
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth.context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.loading) return;

    // Si no está autenticado
    if (!state.isAuthenticated) {
      router.push("/login");
      return;
    }

    // Si requiere un rol específico
    if (requiredRole && state.user && state.user.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [state.isAuthenticated, state.loading, state.user, requiredRole, router]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  if (requiredRole && state.user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
