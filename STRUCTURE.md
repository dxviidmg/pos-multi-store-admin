# Estructura del Proyecto

## Organización de Carpetas

```
app/
├── components/           # Componentes UI reutilizables
│   ├── login-form.tsx   # Formulario de login
│   └── protected-route.tsx
├── constants/           # Constantes y configuración
│   └── index.ts
├── contexts/            # Context API - Gestión de estado
│   └── auth.context.tsx # AuthProvider y useAuth
├── data/                # Data Layer - Persistencia
│   └── storage.ts       # TokenStorage
├── domain/              # Domain Layer - Tipos y entidades
│   └── auth.types.ts    # Interfaces de autenticación
├── hooks/               # Custom hooks
│   └── usePermissions.ts
├── services/            # Service Layer - APIs externas
│   └── auth.service.ts  # AuthService
├── utils/               # Utilidades generales
│   └── errors.ts        # Manejo de errores
├── dashboard/           # Rutas
│   └── page.tsx         # Dashboard protegido
├── login/
│   └── page.tsx         # Página de login
├── no-permission/
│   └── page.tsx         # Acceso denegado
├── unauthorized/
│   └── page.tsx         # Sin rol requerido
├── layout.tsx           # Root layout con AuthProvider
├── page.tsx             # Home/Index
├── globals.css          # Estilos globales
└── favicon.ico
```

## Flujo de Datos

```
┌─────────────────────────────────────┐
│      Usuario intenta Login          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   LoginForm recibe credenciales     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  useAuth().login(credentials)       │
│  (AuthProvider/Context)             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ AuthService.login() (envía POST)    │
│ → localhost:8000/api/api-token-auth/│
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   SUCCESS      ERROR
      │             │
      ▼             ▼
 ¿tenant_id? ┌────────────────┐
      │      │ Mostrar error  │
   null?     │ en login form  │
      │      └────────────────┘
  ┌───┴────┐
  │        │
 YES       NO
  │        │
  ▼        ▼
✅        ❌
ACCESO    ACCESO
PERMITIDO DENEGADO
  │         │
  ▼         ▼
GUARDAR   NO_PERMISSION
TOKEN     PAGE
  │
  ▼
DASHBOARD
```

## Estructura de Autenticación (SDD)

### Domain Layer
Define QUÉ son las entidades de negocio:
- `AuthUser` - Usuario autenticado
- `AuthResponse` - Respuesta del servidor
- `AuthState` - Estado global de autenticación
- `AuthError` - Errores personalizados

### Service Layer
Define CÓMO se comunica con APIs externas:
- `AuthService.login()` - POST a endpoint de login
- `AuthService.validateToken()` - Valida token con servidor
- `AuthService.logout()` - Cierra sesión

### Data Layer
Define CÓMO se persisten los datos localmente:
- `TokenStorage.setToken()` - Guarda token en localStorage
- `TokenStorage.getToken()` - Recupera token
- `TokenStorage.clear()` - Limpia almacenamiento

## Estado de Autenticación

```typescript
AuthState {
  isAuthenticated: boolean    // ¿Usuario autenticado?
  user: AuthUser | null       // Datos del usuario
  token: string | null        // JWT token
  loading: boolean            // ¿Cargando?
  error: string | null        // Mensaje de error
  hasPermission: boolean      // ¿tenant_id es null?
  accessBlocked: boolean      // ¿Suscripción vencida?
  accessUntil: string | null  // Fecha de vencimiento
  storeCount?: number         // Total de sucursales (solo owner)
}
```

## Validación de Acceso

1. **Login en formulario** ❌ Bloqueado si: `tenant_id !== null`
2. **Dashboard** ❌ Bloqueado si: No autenticado O `tenant_id !== null`
3. **Cualquier ProtectedRoute** ❌ Bloqueado si: No autenticado O `tenant_id !== null`

## Variables de Entorno

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Rutas Protegidas

```
GET  /                    → Home (redirige a dashboard si autenticado)
GET  /login               → LoginForm
POST /login               → AuthContext.login()
GET  /dashboard           → Dashboard (protegido)
GET  /no-permission       → Acceso denegado (tenant_id !== null)
GET  /unauthorized        → Sin rol (si se requiere rol específico)
```
