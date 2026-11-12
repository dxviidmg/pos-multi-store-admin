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
    <div className="fixed inset-0 flex flex-col bg-[#171A4A] bg-[radial-gradient(520px_circle_at_85%_8%,rgba(255,176,32,0.22),transparent_60%),radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:auto,22px_22px] md:flex-row md:bg-paper md:bg-none">
      {/* Panel de marca (solo escritorio) */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-[#171A4A] px-12 text-center md:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="SmartVenta"
          className="mb-8 h-auto w-full max-w-[312px]"
        />
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">
          Administración multi-negocio
        </h2>
        <p className="mx-auto max-w-sm leading-relaxed text-white/80">
          Gestiona negocios, planes y pagos de todos tus clientes desde un solo
          lugar.
        </p>
      </div>

      {/* Panel del formulario */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-8 sm:px-12 md:bg-background">
        <div className="w-full max-w-[360px] md:max-w-[420px] md:rounded-xl md:border md:border-line md:bg-paper md:p-8 md:shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.svg"
            alt="SmartVenta"
            className="mx-auto mb-8 h-auto w-36 md:hidden"
          />
          <h1 className="mb-1 text-center text-2xl font-bold text-white md:text-left md:text-3xl md:text-foreground">
            Bienvenido
          </h1>
          <p className="mb-6 text-center text-sm text-white/80 md:mb-8 md:text-left md:text-base md:text-muted">
            Ingresa tus credenciales para continuar
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error/Warning Message */}
            {state.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg bg-red-600 p-3 text-sm font-medium text-white"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{state.error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-white md:text-foreground"
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
                className="block text-sm font-semibold text-white md:text-foreground"
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
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 mt-1.5 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-caption hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
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
              disabled={
                state.loading ||
                !credentials.username.trim() ||
                !credentials.password.trim()
              }
              className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-base font-bold text-brand-dark shadow-sm transition-colors hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A4A] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none md:bg-[#171A4A] md:text-white md:hover:bg-brand-dark md:focus-visible:ring-[#171A4A] md:focus-visible:ring-offset-paper"
            >
              {state.loading && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current motion-reduce:animate-none"
                />
              )}
              {state.loading ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
