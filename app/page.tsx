"use client";

import { useAuth } from "@/app/contexts/auth.context";
import { LoginForm } from "@/app/components/login-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.loading && state.isAuthenticated) {
      router.push("/tenants");
    }
  }, [state.isAuthenticated, state.loading, router]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Iniciando...</p>
        </div>
      </div>
    );
  }

  if (state.isAuthenticated) {
    return null;
  }

  return <LoginForm />;
}
