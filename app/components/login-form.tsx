"use client";

import React, { useState, FormEvent } from "react";
import { useAuth } from "@/app/contexts/auth.context";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { state, login } = useAuth();
  const router = useRouter();
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
      router.push("/tenants");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            POS Admin - Tenants
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de gestión de tenants
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error/Warning Message */}
          {state.error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
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
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
              placeholder="usuario"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={handleInputChange}
              disabled={state.loading}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
              placeholder="contraseña"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {state.loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-gray-500">
          Credenciales de prueba: usuario / contraseña
        </p>
      </div>
    </div>
  );
}
