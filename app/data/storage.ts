/**
 * Data Layer - Gestión de token y persistencia
 */

import { STORAGE_KEYS } from "@/app/constants";

export class TokenStorage {
  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  static setUser(user: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  static getUser(): any {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static removeUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  static clear(): void {
    this.removeToken();
    this.removeUser();
  }
}
