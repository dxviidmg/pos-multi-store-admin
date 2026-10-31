/**
 * Utilidades para manejo de errores
 */

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Error desconocido";
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || error instanceof Error && error.name === "NetworkError";
}
