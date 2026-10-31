# Sistema de Autenticación - POS Admin Tenants

## 🔐 Propósito

Este frontend es **EXCLUSIVAMENTE para administradores del sistema** que no tienen tenant asignado. Los usuarios con tenant_id (propietarios de tiendas) serán bloqueados al intentar acceder.

## Estructura (SDD - Service/Domain/Data)

### Capa de Dominio (`app/domain/`)
Define los tipos y entidades del negocio:
- `auth.types.ts` - Interfaces de autenticación, usuario y errores

### Capa de Datos (`app/data/`)
Gestiona la persistencia local:
- `storage.ts` - Almacenamiento de token y usuario en localStorage

### Capa de Servicios (`app/services/`)
Comunica con las APIs externas:
- `auth.service.ts` - Métodos para login, validación de token y logout

### Contexto y Estado (`app/contexts/`)
Gestión centralizada del estado:
- `auth.context.tsx` - Provider con lógica de autenticación y restauración de sesión

### Componentes (`app/components/`)
UI y componentes reutilizables:
- `login-form.tsx` - Formulario de login
- `protected-route.tsx` - Componente para rutas protegidas

### Hooks (`app/hooks/`)
Lógica reutilizable:
- `usePermissions.ts` - Hook para verificar permisos

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales (usuario/contraseña)
2. Se envía POST a `http://localhost:8000/api/api-token-auth/`
3. Si es exitoso:
   - **Si tiene `tenant_id` !== null**: Se muestra error en el formulario → "No tienes acceso..."
   - **Si tiene `tenant_id` === null**: Se guarda token y usuario → Se redirige al dashboard
4. Token se almacena en localStorage para restaurar sesión

### Validación de Permisos
- **Con tenant_id**: ❌ Error mostrado en el formulario de login
- **Sin tenant_id (null)**: ✅ Acceso permitido al dashboard

### Restauración de Sesión
- Al montar la app, se intenta restaurar sesión desde localStorage
- Se valida el token con el servidor
- Si es válido, se restaura el usuario y se muestra el dashboard

## Rutas

- `/` - Home (redirige a login si no autenticado, a dashboard si autenticado)
- `/login` - Formulario de login
- `/dashboard` - Dashboard protegido (requiere autenticación)
- `/unauthorized` - Página para usuarios sin rol requerido

## Uso en Componentes

### Proteger una ruta
```tsx
import { ProtectedRoute } from "@/app/components/protected-route";

export default function MiPagina() {
  return (
    <ProtectedRoute>
      {/* Contenido aquí */}
    </ProtectedRoute>
  );
}
```

### Acceder al usuario actual
```tsx
import { useAuth } from "@/app/contexts/auth.context";

export default function MiComponente() {
  const { state, logout } = useAuth();

  return <div>{state.user?.fullName}</div>;
}
```

### Verificar permisos
```tsx
import { usePermissions } from "@/app/hooks/usePermissions";

export default function MiComponente() {
  const { isReady, user } = usePermissions({
    requiredRole: "owner"
  });

  if (!isReady) return <div>Cargando...</div>;

  return <div>{user?.fullName}</div>;
}
```

## Estructura de la Respuesta de Login

```json
{
  "user_id": 1,
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "first_name": "David",
  "last_name": "Pérez",
  "full_name": "David Pérez",
  "email": "david@ejemplo.com",
  "tenant_id": 3,           // ← Requerido para acceso
  "tenant_name": "Mi Negocio",
  "tenant_short_name": "MN",
  "store_id": 5,
  "store_name": "Sucursal Centro",
  "store_type": "store",
  "store_type_display": "Tienda",
  "store_printer": "...",
  "role": "owner",
  "store_count": 4,         // Solo si role == "owner"
  "access_blocked": true,   // Solo si suscripción venció
  "access_until": "2026-08-01T00:00:00"
}
```

**Nota**: Si `tenant_id` **NO es null**, se rechaza el acceso y se muestra error en el formulario: "No tienes acceso. Este frontend es solo para administradores del sistema."

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

Credenciales de prueba:
- Usuario: `usuario`
- Contraseña: `contraseña`
