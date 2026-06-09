# TaskFlow — Sistema de Gestión de Tareas

Sistema web de administración para gestionar proyectos, movimientos de inventario y usuarios con roles diferenciados. Construido con **Next.js 16**, **Prisma 7**, **PostgreSQL (Supabase)** y **shadcn/ui**.

## Integrantes

**Camilo Céspedes**

## Demo

🔗 [camilo-cespedes-gestion-tareas.vercel.app](https://camilo-cespedes-gestion-tareas.vercel.app)

> El despliegue se hizo desde un repositorio personal, el código es el mismo que el del repositorio de la clase.

## Credenciales de acceso

| Rol   | Correo                        | Contraseña |
|-------|-------------------------------|------------|
| ADMIN | admin@gestiontareas.com       | Admin123!  |
| USER  | usuario@gestiontareas.com     | User123!   |

## Funcionalidades

- **Autenticación** — inicio de sesión con email y contraseña, sesión segura mediante JWT en cookies HttpOnly
- **Roles** — `ADMIN` con acceso completo, `USER` con acceso a transacciones y proyectos
- **Proyectos (Maestros)** — listado y creación de proyectos con saldo inicial (creación solo para ADMIN)
- **Transacciones (Movimientos)** — registro de entradas y salidas por proyecto, tabla de historial con responsable y fecha
- **Gráfica de saldo** — evolución diaria del saldo acumulado por proyecto con área chart
- **Usuarios** — gestión de roles desde un panel exclusivo para ADMIN
- **Sidebar dinámico** — navegación condicional según el rol del usuario autenticado
- **Diseño responsivo** — funciona en escritorio y móvil

## Aporte creativo

Se diseñó un tema visual propio llamado **Fresh Tasks**: paleta esmeralda/verde, sidebar blanco con logo propio, stat cards con métricas rápidas (saldo actual, total entradas, total salidas), badges con íconos de flecha para distinguir entradas y salidas, y una página de login con panel decorativo que describe las funcionalidades del sistema.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Base de datos | PostgreSQL — Supabase |
| ORM | Prisma 7 |
| UI | shadcn/ui + Radix UI + Tailwind CSS 4 |
| Iconos | @hugeicons/react |
| Gráficas | Recharts |
| Autenticación | bcryptjs + JWT (jose) + cookies HttpOnly |
| Deploy | Vercel |

## Cómo ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/202601-Ingenieria-Web/CamiloCespedes-GestionTareas.git
cd CamiloCespedes-GestionTareas

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env en la raíz
DATABASE_URL="postgresql://usuario:contraseña@host:5432/postgres"
JWT_SECRET="tu-secreto-aqui"

# 4. Crear las tablas en la base de datos
npx prisma db push

# 5. Cargar usuarios de prueba
npx tsx prisma/seed.ts

# 6. Iniciar el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del proyecto

```
app/
  (auth)/login/        # Página de login
  (main)/
    transactions/      # Gestión de movimientos (transacciones)
    projects/          # Gestión de proyectos (maestros)
    users/             # Gestión de usuarios — solo ADMIN
  api/
    auth/              # login, logout, me
    projects/          # CRUD proyectos
    movements/         # CRUD movimientos
    users/             # GET y PUT usuarios
components/
  app-sidebar.tsx      # Sidebar con navegación condicional por rol
  nav-user.tsx         # Perfil de usuario y botón de cerrar sesión
lib/
  auth.ts              # Helpers JWT: createSession, verifySession, getSession
  prisma.ts            # Instancia global del cliente Prisma
prisma/
  schema.prisma        # Modelos: User, Project, Movement
  seed.ts              # Script para crear usuarios iniciales
proxy.ts               # Protección de rutas (equivale a middleware en Next.js 16)
```

## Modelo de datos

```
User ──────┬── crea ──→ Project ──── tiene ──→ Movement
           │                                      │
           └──────────── ejecuta ─────────────────┘
```

- **User** — usuarios del sistema con rol `ADMIN` o `USER`
- **Project** (Maestro) — agrupa movimientos, tiene un saldo inicial
- **Movement** (Transacción) — entrada o salida registrada por un usuario en un proyecto

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Supabase (Transaction Pooler, puerto 6543) |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |

## Notas técnicas

- **`proxy.ts`** en lugar de `middleware.ts`: Next.js 16 renombró el archivo de middleware.
- **`prisma db push`** en lugar de `migrate dev`: el Transaction Pooler de Supabase (puerto 6543) no soporta migraciones DDL; se usa el Session Pooler (puerto 5432) solo para cambios de esquema.
- El saldo actual de un proyecto se calcula en el cliente sumando entradas y restando salidas sobre el saldo inicial, sin desnormalizar la base de datos.
