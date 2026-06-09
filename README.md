# TaskFlow — Sistema de Gestión de Tareas

Aplicación web fullstack de administración para gestionar proyectos, movimientos de inventario y usuarios con roles diferenciados.

**Proyecto evaluativo — Ingeniería Web · Juan Pablo Arango**

## Integrantes

| Nombre | GitHub |
|---|---|
| Camilo Céspedes | [@Camilo-Marsel](https://github.com/Camilo-Marsel) |

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| ADMIN | admin@gestiontareas.com | Admin123! |
| USER | usuario@gestiontareas.com | User123! |

## Tecnologías

- **Frontend:** Next.js 16, React 19, TailwindCSS 4, shadcn/ui
- **Backend:** Next.js API Routes (Route Handlers)
- **Base de datos:** PostgreSQL en Supabase via Prisma ORM
- **Autenticación:** JWT con cookies HttpOnly (bcryptjs + jose)
- **Gráficas:** Recharts
- **Deploy:** Vercel

## Funcionalidades

- Autenticación con email y contraseña
- Roles diferenciados: `ADMIN` y `USER`
- **Proyectos (Maestros):** listado, creación con saldo inicial (solo ADMIN)
- **Transacciones:** movimientos de entrada/salida por proyecto, gráfica de evolución de saldo
- **Usuarios:** gestión de roles (solo ADMIN)
- Sidebar con navegación condicional según rol
- Diseño responsivo con tema Fresh Tasks (esmeralda)

## Estructura del proyecto

```
app/
  (auth)/login/        # Página de login
  (main)/
    transactions/      # Gestión de movimientos
    projects/          # Gestión de proyectos (Maestros)
    users/             # Gestión de usuarios (solo ADMIN)
  api/
    auth/              # login, logout, me
    projects/          # CRUD proyectos
    movements/         # CRUD movimientos
    users/             # GET y PUT usuarios
components/
  app-sidebar.tsx      # Sidebar con nav condicional por rol
  nav-user.tsx         # Perfil + logout
lib/
  auth.ts              # JWT helpers (createSession, verifySession, getSession)
  prisma.ts            # Instancia global de Prisma
prisma/
  schema.prisma        # Modelos: User, Project, Movement
  seed.ts              # Datos iniciales (admin + usuario demo)
proxy.ts               # Protección de rutas (reemplaza middleware en Next.js 16)
```

## Cómo ejecutar localmente

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/202601-Ingenieria-Web/CamiloCespedes-GestionTareas.git
cd CamiloCespedes-GestionTareas
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:5432/postgres"
JWT_SECRET="tu-secreto-aqui"
```

### 3. Crear las tablas en la base de datos

```bash
npx prisma db push
```

### 4. Cargar datos iniciales

```bash
npx tsx prisma/seed.ts
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de entorno requeridas en Vercel

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Supabase (Transaction Pooler, puerto 6543) |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |

## Decisiones de diseño

- **JWT en cookies HttpOnly** en lugar de localStorage para mayor seguridad contra XSS.
- **`prisma db push`** en lugar de `migrate dev` porque el Transaction Pooler de Supabase (puerto 6543) no soporta migraciones DDL interactivas; se usa el Session Pooler (puerto 5432) solo para operaciones de esquema.
- **`proxy.ts`** en lugar de `middleware.ts`: Next.js 16 renombró el archivo de middleware a proxy.
- El saldo de un proyecto se calcula dinámicamente en el cliente sumando entradas y restando salidas sobre el saldo inicial, evitando desnormalización en la BD.
