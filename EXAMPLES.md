# Ejemplos de Uso

## Ejemplo 1: Crear una nueva página protegida

```tsx
// app/negocios/page.tsx
"use client";

import { useAuth } from "@/app/contexts/auth.context";
import { ProtectedRoute } from "@/app/components/protected-route";

function TenantsContent() {
  const { state } = useAuth();

  return (
    <div className="p-8">
      <h1>Gestión de Tenants</h1>
      <p>Bienvenido, {state.user?.fullName}</p>
      
      {state.user?.role === "owner" && (
        <div>
          <p>Total de sucursales: {state.storeCount}</p>
        </div>
      )}
    </div>
  );
}

export default function TenantsPage() {
  return (
    <ProtectedRoute requireTenant={true}>
      <TenantsContent />
    </ProtectedRoute>
  );
}
```

## Ejemplo 2: Acceder a datos del usuario en componente

```tsx
// app/components/user-profile.tsx
"use client";

import { useAuth } from "@/app/contexts/auth.context";

export function UserProfile() {
  const { state, logout } = useAuth();

  if (!state.isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="font-medium">{state.user?.fullName}</p>
        <p className="text-sm text-gray-600">{state.user?.email}</p>
      </div>
      <button
        onClick={() => logout()}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
```

## Ejemplo 3: Verificar rol en componente

```tsx
// app/components/owner-only.tsx
"use client";

import { useAuth } from "@/app/contexts/auth.context";

interface OwnerOnlyProps {
  children: React.ReactNode;
}

export function OwnerOnly({ children }: OwnerOnlyProps) {
  const { state } = useAuth();

  if (state.user?.role !== "owner") {
    return null; // O mostrar mensaje
  }

  return <>{children}</>;
}
```

## Ejemplo 4: Agregar nuevo endpoint de API

```ts
// app/services/tenant.service.ts
import { API_BASE_URL } from "@/app/constants";

export class TenantService {
  static async getTenants(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tenants");
    }

    return response.json();
  }

  static async createTenant(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create tenant");
    }

    return response.json();
  }
}
```

## Ejemplo 5: Usar el token en componente

```tsx
// app/components/tenant-list.tsx
"use client";

import { useAuth } from "@/app/contexts/auth.context";
import { useEffect, useState } from "react";
import { TenantService } from "@/app/services/tenant.service";

export function TenantList() {
  const { state } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.token) return;

    TenantService.getTenants(state.token)
      .then(setTenants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [state.token]);

  if (loading) {
    return <div>Cargando tenants...</div>;
  }

  return (
    <div>
      {tenants.map((tenant: any) => (
        <div key={tenant.id}>{tenant.name}</div>
      ))}
    </div>
  );
}
```

## Ejemplo 6: Agregar nuevo tipo de error

```ts
// app/domain/auth.types.ts

export class ValidationError extends AuthError {
  constructor(public field: string, message: string) {
    super("VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}
```

## Ejemplo 7: Crear un hook personalizado

```ts
// app/hooks/useUser.ts
"use client";

import { useAuth } from "@/app/contexts/auth.context";

export function useUser() {
  const { state } = useAuth();

  return {
    user: state.user,
    isOwner: state.user?.role === "owner",
    isManager: state.user?.role === "manager",
    isStaff: state.user?.role === "staff",
    isAuthenticated: state.isAuthenticated,
  };
}

// Uso:
// const { isOwner, user } = useUser();
```

## Ejemplo 8: Proteger ruta por rol

```tsx
// app/admin/page.tsx
"use client";

import { ProtectedRoute } from "@/app/components/protected-route";

function AdminContent() {
  return <div>Solo administradores</div>;
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireTenant={true} requiredRole="owner">
      <AdminContent />
    </ProtectedRoute>
  );
}
```

## Ejemplo 9: Interceptar y modificar respuesta de login

```ts
// app/contexts/auth.context.tsx

// En el lugar donde se procesa AuthResponse:
const response = await AuthService.login(credentials);

// Transformar datos si es necesario
const processedUser = {
  ...response,
  // Agregar campos adicionales
  initials: response.first_name?.[0] + response.last_name?.[0],
};
```

## Ejemplo 10: Agregar loading states en componentes

```tsx
// app/components/login-form.tsx

{state.loading && (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2">Autenticando...</span>
  </div>
)}
```

## Testing

Credenciales para desarrollo:
- Usuario: `usuario`
- Contraseña: `contraseña`

Respuestas esperadas según el usuario:

### Usuario sin tenant (✅ Acceso permitido)
```json
{
  "tenant_id": null,
  "user_id": 1,
  "token": "...",
  "role": "admin"
}
```

### Usuario con tenant (❌ Acceso bloqueado)
```json
{
  "tenant_id": 3,
  "user_id": 2,
  "token": "...",
  "role": "owner",
  "tenant_name": "Mi Negocio"
}
```
