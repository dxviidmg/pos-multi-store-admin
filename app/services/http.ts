/**
 * Service Layer - Cliente HTTP compartido.
 *
 * Centraliza la lógica repetida de fetch autenticado contra el backend:
 * cabecera de token, manejo de 403, respuestas no-OK y errores de red.
 * Cada servicio provee su propia fábrica de errores de dominio.
 */

import { API_BASE_URL } from "@/app/constants";

/** Fábrica de errores de dominio para mapear fallos HTTP/red. */
export interface ApiErrorFactory {
  /** El backend respondió 403 (sin permisos). */
  noPermission: () => Error;
  /** El backend respondió con otro código de error (no-OK). */
  fetchFailed: (status: number) => Error;
  /** Fallo de red (servidor inalcanzable). */
  network: () => Error;
  /** Cualquier otro error inesperado. */
  unknown: () => Error;
  /** Error con un mensaje específico devuelto por el backend. */
  withMessage: (message: string, status?: number) => Error;
}

/**
 * GET autenticado que devuelve JSON tipado `T`.
 * Lanza errores de dominio construidos por `errors`.
 */
export async function apiGet<T>(
  path: string,
  token: string,
  errors: ApiErrorFactory
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
  } catch (error) {
    // fetch solo rechaza por fallos de red (TypeError).
    if (error instanceof TypeError) throw errors.network();
    throw errors.unknown();
  }

  if (response.status === 403) throw errors.noPermission();
  if (!response.ok) throw errors.fetchFailed(response.status);

  try {
    return (await response.json()) as T;
  } catch {
    // Cuerpo no es JSON válido o se interrumpió la lectura.
    throw errors.unknown();
  }
}

/**
 * POST autenticado con cuerpo JSON que devuelve JSON tipado `T`.
 * En respuestas no-OK intenta extraer el campo `error`/`detail` del cuerpo
 * para un mensaje más preciso; si no, usa la fábrica de errores.
 */
export async function apiPost<T>(
  path: string,
  token: string,
  body: unknown,
  errors: ApiErrorFactory
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof TypeError) throw errors.network();
    throw errors.unknown();
  }

  if (response.status === 403) throw errors.noPermission();

  if (!response.ok) {
    // Intentar leer el mensaje de error del backend ({ error } o { detail }).
    const data = await response.json().catch(() => null);
    const message =
      data && (data.error || data.detail)
        ? (data.error as string) || (data.detail as string)
        : null;
    throw message
      ? errors.withMessage(message, response.status)
      : errors.fetchFailed(response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw errors.unknown();
  }
}
