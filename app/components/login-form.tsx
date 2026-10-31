"use client";

import React, { useState, FormEvent } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { state, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(credentials);
      router.push("/negocios");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative w-full max-w-md space-y-8 rounded-brand bg-gradient-to-br from-brand-dark via-brand to-brand-light p-8 shadow-[0_24px_60px_rgba(11,18,51,0.35)] sm:p-10">
        {/* Header */}
        <div className="text-center">
          <div aria-hidden="true" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-brand-dark shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            SVAdmin
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Sistema de gestión de negocios
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error/Warning Message */}
          {state.error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {state.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-white"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={credentials.username}
              onChange={handleInputChange}
              disabled={state.loading}
              className="mt-1.5 block min-h-11 w-full appearance-none rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-base text-foreground placeholder-caption shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-row-hover motion-reduce:transition-none sm:text-sm"
              placeholder="usuario"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-white"
            >
              Contraseña
            </label>
            <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={handleInputChange}
              disabled={state.loading}
              className="mt-1.5 block min-h-11 w-full appearance-none pr-12 rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-base text-foreground placeholder-caption shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-row-hover motion-reduce:transition-none sm:text-sm"
              placeholder="contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 mt-1.5 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-caption hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                {showPassword ? (
                  <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4.2 9.5 6-.4.8-1.2 1.9-2.3 3M6.5 7.6C4.6 9 3.4 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9M9.9 9.9a3 3 0 004.2 4.2" />
                ) : (
                  <path d="M2.5 12C3.5 10.2 7 6 12 6s8.5 4.2 9.5 6c-1 1.8-4.5 6-9.5 6S3.5 13.8 2.5 12zM12 9a3 3 0 100 6 3 3 0 000-6z" />
                )}
              </svg>
            </button>
          </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.loading}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition-colors hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {state.loading && (
              <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark/30 border-t-brand-dark motion-reduce:animate-none" />
            )}
            {state.loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-white/60">
          Credenciales de prueba: usuario / contraseña
        </p>
      </div>
    </div>
  );
}
