# Quick Start - POS Admin Tenants

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalación

```bash
cd pos-multi-store-admin
npm install
```

### 2. Variables de Entorno

```bash
cp .env.example .env.local
```

Contenido de `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Asegurar que Backend está Corriendo

```bash
# En otra terminal
# El backend debe estar en http://localhost:8000
```

### 4. Ejecutar Frontend

```bash
npm run dev
```

Visita: **http://localhost:3000**

### 5. Credenciales de Prueba

```
Usuario: usuario
Contraseña: contraseña
```

## 🎯 Pruebas Rápidas

### ✅ Test 1: Login sin tenant (Acceso permitido)

```json
// Este usuario debería funcionar (tenant_id: null)
{
  "user_id": 1,
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "full_name": "Admin User",
  "email": "admin@ejemplo.com",
  "tenant_id": null,
  "role": "admin"
}

Resultado esperado:
✅ Se guarda en localStorage
✅ Se redirige a /dashboard
✅ Se muestra el dashboard
```

### ❌ Test 2: Login con tenant (Acceso denegado)

```json
// Este usuario debería fallar (tenant_id: 3)
{
  "user_id": 2,
  "token": "cc3e5ac21c503fd38cf46714c653620e7f89c1bd",
  "full_name": "Store Owner",
  "email": "owner@ejemplo.com",
  "tenant_id": 3,
  "tenant_name": "Mi Negocio",
  "role": "owner"
}

Resultado esperado:
❌ NO se guarda en localStorage
❌ Se muestra error en formulario de login
❌ No se redirige a /dashboard
```

### 🔄 Test 3: Restauración de Sesión

1. Login exitoso (tenant_id: null)
2. Ir a /dashboard
3. Recargar página (F5)
4. Resultado esperado:
   - ✅ Se mantiene en /dashboard
   - ✅ Se restaura sesión desde localStorage
   - ✅ No pide login de nuevo

## 📁 Archivos Clave

```
app/
├── components/login-form.tsx       ← Formulario con aviso de error
├── contexts/auth.context.tsx       ← Lógica de login
├── services/auth.service.ts        ← API calls
├── domain/auth.types.ts            ← Tipos
├── data/storage.ts                 ← localStorage
├── constants/index.ts              ← Configuración
└── dashboard/page.tsx              ← Dashboard protegido
```

## 🔍 Debugging

### Ver en Browser DevTools

1. Abre DevTools (F12)
2. Storage → LocalStorage → localhost:3000

Deberías ver:
```
auth_token: "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
auth_user: {"userId":1,"fullName":"Admin User",...}
```

### Ver Errores

1. Abre DevTools (F12)
2. Console tab
3. Si hay error, verás logs claros

### Test con cURL

```bash
curl -X POST http://localhost:8000/api/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario","password":"contraseña"}'
```

## 🚀 Próximos Pasos

1. **Crear página de tenants**:
   ```bash
   mkdir -p app/tenants
   touch app/tenants/page.tsx
   ```

2. **Agregar rutas protegidas**:
   ```tsx
   import { ProtectedRoute } from "@/app/components/protected-route";

   export default function TenantsPage() {
     return (
       <ProtectedRoute>
         {/* Tu contenido aquí */}
       </ProtectedRoute>
     );
   }
   ```

3. **Usar hook de permisos**:
   ```tsx
   import { useAuth } from "@/app/contexts/auth.context";

   const { state } = useAuth();
   console.log(state.user?.fullName);
   ```

## 📚 Documentación Completa

- [AUTH.md](./AUTH.md) - Detalles de autenticación
- [STRUCTURE.md](./STRUCTURE.md) - Estructura del proyecto
- [EXAMPLES.md](./EXAMPLES.md) - Ejemplos de uso
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Lo que se implementó

## ⚙️ Build para Producción

```bash
npm run build
npm run start
```

## 🐳 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t pos-admin .
docker run -p 3000:8000 pos-admin
```

## ✅ Checklist de Verificación

- [ ] Backend corriendo en localhost:8000
- [ ] npm install completado
- [ ] .env.local configurado
- [ ] npm run dev ejecutándose
- [ ] http://localhost:3000 accesible
- [ ] Login con tenant_id=null funciona
- [ ] Login con tenant_id!=null muestra error
- [ ] Recargar página mantiene sesión
- [ ] Logout limpia localStorage

## 🆘 Problemas Comunes

**Error: "No se pudo conectar con el servidor"**
- ✅ Verificar que backend está en localhost:8000
- ✅ Verificar NEXT_PUBLIC_API_URL en .env.local

**Error: "Token inválido"**
- ✅ Limpiar localStorage: `localStorage.clear()`
- ✅ Hacer login de nuevo

**Cambios no se reflejan**
- ✅ Recargar página (Ctrl+R o Cmd+R)
- ✅ Limpiar cache: Ctrl+Shift+R

**Error de permisos al login**
- ✅ Verificar que tenant_id es null en respuesta del servidor
- ✅ Ver en DevTools → Network → POST /api-token-auth/

## 📞 Soporte

Para preguntas o bugs:
1. Revisar documentación en [AUTH.md](./AUTH.md)
2. Revisar ejemplos en [EXAMPLES.md](./EXAMPLES.md)
3. Revisar implementación en [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

**Creado con ❤️ usando Next.js 16 + React 19 + TypeScript**
