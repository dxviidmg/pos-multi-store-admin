# POS Multi-Store Admin - Sistema de Gestión de Tenants

**Frontend administrativo para la gestión de tenants (negocios) en un sistema POS multi-tienda.**

> ⚠️ **IMPORTANTE**: Este frontend es exclusivamente para **administradores del sistema SIN tenant asignado**. Los usuarios con `tenant_id` será bloqueados al intentar acceder.

## 🚀 Características

- ✅ Autenticación basada en JWT (Token)
- ✅ Validación de permisos (requiere `tenant_id === null`)
- ✅ Restauración automática de sesión desde localStorage
- ✅ Componentes protegidos por ruta
- ✅ Manejo de errores robusto
- ✅ Arquitectura SDD (Service/Domain/Data)
- ✅ TypeScript + Next.js 16 + React 19
- ✅ Tailwind CSS para estilos

## 📋 Requisitos

- Node.js 18+
- npm/yarn/pnpm
- Backend ejecutándose en `http://localhost:8000`

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd pos-multi-store-admin

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local si es necesario
```

## 🏃 Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
app/
├── components/           # Componentes UI reutilizables
├── constants/           # Configuración y constantes
├── contexts/            # Context API para estado global
├── data/                # Data Layer - Persistencia local
├── domain/              # Domain Layer - Tipos y entidades
├── hooks/               # Custom hooks
├── services/            # Service Layer - APIs externas
├── utils/               # Utilidades generales
├── dashboard/           # Rutas (dashboard)
├── login/               # Rutas (login)
├── no-permission/       # Rutas (acceso denegado)
└── layout.tsx           # Root layout
```

Para más detalles, ver [STRUCTURE.md](./STRUCTURE.md).

## 🔐 Flujo de Autenticación

### 1. Login
1. Usuario ingresa `usuario`/`contraseña`
2. Se envía `POST` a `http://localhost:8000/api/api-token-auth/`
3. Si `tenant_id !== null`: ❌ **Acceso bloqueado** → Página "Acceso denegado"
4. Si `tenant_id === null`: ✅ **Acceso permitido** → Guardar token → Dashboard

### 2. Validación de Sesión
- Al recargar, se intenta restaurar sesión desde localStorage
- Si el token es válido, se muestra el dashboard
- Si no es válido, se limpia el almacenamiento y redirige a login

### 3. Rutas Protegidas
- `/dashboard` - Requiere autenticación + `tenant_id === null`
- `/` - Home (redirige a dashboard si autenticado)
- `/login` - Formulario de login
- `/no-permission` - Página de acceso denegado (si tiene tenant_id)

## 📚 Documentación

- [AUTH.md](./AUTH.md) - Documentación detallada de autenticación
- [STRUCTURE.md](./STRUCTURE.md) - Estructura del proyecto y diagrama de flujos

## 🧪 Credenciales de Prueba

```
Usuario: usuario
Contraseña: contraseña
```

**Respuestas esperadas:**

### ✅ Acceso Permitido (sin tenant)
```json
{
  "user_id": 1,
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "full_name": "Admin User",
  "email": "admin@ejemplo.com",
  "tenant_id": null,
  "role": "admin"
}
```

### ❌ Acceso Bloqueado (con tenant)
```json
{
  "user_id": 2,
  "token": "cc3e5ac21c503fd38cf46714c653620e7f89c1bd",
  "full_name": "Store Owner",
  "email": "owner@ejemplo.com",
  "tenant_id": 3,
  "tenant_name": "Mi Negocio",
  "role": "owner"
}
```

## 🔧 Configuración de Variables de Entorno

Crear archivo `.env.local`:

```env
# URL base del API backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Build para Producción

```bash
npm run build
npm run start
```

## 🐛 Troubleshooting

### Error: "No se pudo conectar con el servidor"
- Verificar que el backend esté ejecutándose en `http://localhost:8000`
- Verificar que `NEXT_PUBLIC_API_URL` sea correcto

### Token inválido al recargar
- Limpiar localStorage: `localStorage.clear()`
- Hacer login de nuevo

### Usuario atrapado en página de "Acceso denegado"
- Verificar que `tenant_id` sea `null` en la respuesta del login
- Contactar al administrador del sistema

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📝 License

MIT

## 👤 Autor

David Pérez

## 🤝 Support

Para reportar bugs o sugerencias, crear un issue en el repositorio.
