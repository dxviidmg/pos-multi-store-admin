/**
 * Service Layer - API de autenticación
 */

import { AuthCredentials, AuthResponse, AuthError } from "@/app/domain/auth.types";
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from "@/app/constants";

export class AuthService {
  /**
   * Realiza login con credenciales
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message =
          error.detail ||
          error.non_field_errors?.[0] ||
          ERROR_MESSAGES.LOGIN_FAILED;

        throw new AuthError(
          "LOGIN_FAILED",
          message,
          response.status
        );
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new AuthError(
          "NETWORK_ERROR",
          ERROR_MESSAGES.NETWORK_ERROR
        );
      }

      throw new AuthError(
        "UNKNOWN_ERROR",
        ERROR_MESSAGES.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Valida el token con el servidor
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VALIDATE_TOKEN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Cierra sesión en el servidor
   */
  static async logout(token: string): Promise<void> {
    try {
      // Abortar si el servidor no responde en 5s (evita peticiones colgadas).
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch {
      // Continuar incluso si falla el logout remoto
    }
  }
}
