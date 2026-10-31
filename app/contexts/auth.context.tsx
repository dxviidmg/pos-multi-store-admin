"use client";

/**
 * Auth Context & Provider - gestión centralizada del estado de autenticación
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  AuthState,
  AuthCredentials,
  AuthUser,
  AuthError,
} from "@/app/domain/auth.types";
import { Tenant, TenantError } from "@/app/domain/tenant.types";
import { AuthService } from "@/app/services/auth.service";
import { TenantService } from "@/app/services/tenant.service";
import { TokenStorage } from "@/app/data/storage";
import { ERROR_MESSAGES } from "@/app/constants";

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: AuthUser; token: string; accessBlocked: boolean; accessUntil: string | null; storeCount?: number; hasPermission: boolean } }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: { user: AuthUser; token: string; hasPermission: boolean } }
  | { type: "RESTORE_FAILED" }
  | { type: "TENANTS_START" }
  | { type: "TENANTS_SUCCESS"; payload: Tenant[] }
  | { type: "TENANTS_ERROR"; payload: string };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
  accessBlocked: false,
  accessUntil: null,
  hasPermission: false,
  tenants: [],
  tenantsLoading: false,
  tenantsError: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        accessBlocked: action.payload.accessBlocked,
        accessUntil: action.payload.accessUntil,
        storeCount: action.payload.storeCount,
        hasPermission: action.payload.hasPermission,
      };

    case "LOGIN_ERROR":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
        hasPermission: false,
      };

    case "LOGOUT":
      return { ...initialState, loading: false };

    case "RESTORE_SESSION":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        hasPermission: action.payload.hasPermission,
      };

    case "RESTORE_FAILED":
      return { ...state, loading: false };

    case "TENANTS_START":
      return { ...state, tenantsLoading: true, tenantsError: null };

    case "TENANTS_SUCCESS":
      return {
        ...state,
        tenantsLoading: false,
        tenantsError: null,
        tenants: action.payload,
      };

    case "TENANTS_ERROR":
      return {
        ...state,
        tenantsLoading: false,
        tenantsError: action.payload,
        tenants: [],
      };

    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const fetchTenants = useCallback(async (token: string) => {
    dispatch({ type: "TENANTS_START" });
    try {
      const tenants = await TenantService.getTenants(token);
      dispatch({ type: "TENANTS_SUCCESS", payload: tenants });
    } catch (error) {
      const message =
        error instanceof TenantError
          ? error.message
          : ERROR_MESSAGES.TENANTS_FETCH_FAILED;
      dispatch({ type: "TENANTS_ERROR", payload: message });
    }
  }, []);

  // Restaurar sesión al montar
  useEffect(() => {
    const restoreSession = async () => {
      const token = TokenStorage.getToken();
      const user = TokenStorage.getUser();

      if (token && user) {
        const isValid = await AuthService.validateToken(token);
        if (isValid) {
          // hasPermission = true si es superusuario (admin del sistema)
          const hasPermission = user.isSuperuser === true;
          dispatch({
            type: "RESTORE_SESSION",
            payload: { user, token, hasPermission },
          });
          // Recargar la lista de negocios si tiene permiso.
          if (hasPermission) {
            fetchTenants(token);
          }
        } else {
          TokenStorage.clear();
          dispatch({ type: "RESTORE_FAILED" });
        }
      } else {
        dispatch({ type: "RESTORE_FAILED" });
      }
    };

    restoreSession();
  }, [fetchTenants]);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      dispatch({ type: "LOGIN_START" });

      try {
        const response = await AuthService.login(credentials);

        // Solo los superusuarios (administradores del sistema) pueden acceder.
        if (!response.is_superuser) {
          dispatch({
            type: "LOGIN_ERROR",
            payload: ERROR_MESSAGES.NO_PERMISSION,
          });
          return;
        }

        const user: AuthUser = {
          userId: response.user_id,
          fullName: response.full_name,
          email: response.email,
          role: response.role,
          tenantId: response.tenant_id,
          tenantName: response.tenant_name,
          storeId: response.store_id,
          storeName: response.store_name,
          storeType: response.store_type,
          isSuperuser: response.is_superuser ?? false,
        };

        TokenStorage.setToken(response.token);
        TokenStorage.setUser(user);

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user,
            token: response.token,
            accessBlocked: response.access_blocked || false,
            accessUntil: response.access_until || null,
            storeCount: response.store_count,
            hasPermission: true,
          },
        });

        // Tras el login, traer la lista de negocios.
        fetchTenants(response.token);
      } catch (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : "Error durante la autenticación";

        dispatch({ type: "LOGIN_ERROR", payload: message });
        throw error;
      }
    },
    [fetchTenants]
  );

  const logout = useCallback(async () => {
    // Cerrar sesión = borrar el token localmente y volver al login.
    // No se notifica al backend.
    TokenStorage.clear();
    dispatch({ type: "LOGOUT" });
  }, []);

  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshTenants: useCallback(async () => {
      if (state.token) {
        await fetchTenants(state.token);
      }
    }, [state.token, fetchTenants]),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
