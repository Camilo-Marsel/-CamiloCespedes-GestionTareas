# TaskFlow — Sistema de Gestión de Tareas

Sistema web fullstack para gestionar proyectos, tareas, equipos y comunicación interna. Construido con **Next.js 16**, **Prisma 7**, **PostgreSQL (Supabase)** y **shadcn/ui**.

## Integrantes

**Camilo Céspedes**

## Demo

🔗 [camilo-cespedes-gestion-tareas.vercel.app](https://camilo-cespedes-gestion-tareas.vercel.app)

> El despliegue se hizo desde un repositorio personal; el código es idéntico al del repositorio de la clase.

---

## Credenciales de acceso

| Rol   | Correo                        | Contraseña |
|-------|-------------------------------|------------|
| ADMIN | admin@gestiontareas.com       | Admin123!  |
| USER  | usuario@gestiontareas.com     | User123!   |
| USER  | ana@gestiontareas.com         | User123!   |
| USER  | carlos@gestiontareas.com      | User123!   |
| USER  | laura@gestiontareas.com       | User123!   |

---

## Funcionalidades

### Gestión de tareas
- **Tareas (ADMIN)** — crear, asignar, aprobar y rechazar tareas; vista kanban con filtros por estado y prioridad
- **Mis Tareas (USER)** — ver las tareas propias; solicitar completado cuando se termina el trabajo
- **Estados de tarea** — `PENDING → IN_PROGRESS → COMPLETION_REQUESTED → COMPLETED`
- **Prioridades** — `LOW`, `MEDIUM`, `HIGH` con indicadores visuales de color

### Notificaciones en tiempo real (polling)
- Campana de notificaciones en el sidebar con badge de no leídas
- **Usuarios** reciben notificación al ser asignados a una tarea, al ser aprobados o rechazados
- **Admins** reciben notificación cuando un usuario solicita completar una tarea
- Marcar individualmente o todas como leídas; actualización automática cada 20 s

### Chat grupal por proyecto
- Canal de mensajes por proyecto, accesible para todos los roles
- Mensajes propios a la derecha (verde), ajenos a la izquierda (blanco)
- Actualización automática cada 3 s (sin WebSockets)
- Selector de proyecto integrado en la cabecera del chat

### Historial de tareas
- Tabla completa de todas las tareas (admin: globales, usuario: solo las propias)
- Filtros por estado y por proyecto; indicador de fecha de completado
- Prioridad visualizada con punto de color por fila

### Proyectos
- Listado y creación de proyectos con descripción (creación solo para ADMIN)
- Detalle por proyecto: saldo inicial y participantes

### Usuarios (ADMIN)
- Panel de gestión: activar/desactivar, cambiar rol, ver correo y fecha de registro

### Autenticación y seguridad
- Login con email/contraseña, JWT firmado almacenado en cookie HttpOnly
- `proxy.ts` protege todas las rutas; redirige según rol si el acceso no está permitido

### Diseño
- Tema **Fresh Tasks**: paleta esmeralda/verde `oklch(0.53 0.17 162)`, sidebar blanco
- Página de login con panel decorativo que describe el sistema
- Totalmente responsivo

---

## Capturas

> Las capturas se toman desde el despliegue en Vercel con los datos sembrados por el script `seed.ts`.

| Pantalla | Ruta |
|---|---|
| Login | `/login` |
| Tareas (ADMIN) | `/tasks` |
| Mis Tareas (USER) | `/my-tasks` |
| Historial | `/historial` |
| Proyectos | `/projects` |
| Chat | `/chat` |
| Usuarios | `/users` |
| Campana de notificaciones | Clic en el ícono del sidebar |

---

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

---

## Cómo ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/202601-Ingenieria-Web/CamiloCespedes-GestionTareas.git
cd CamiloCespedes-GestionTareas

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env en la raíz
DATABASE_URL="postgresql://usuario:contraseña@host:6543/postgres?pgbouncer=true"
DATABASE_URL_SCHEMA="postgresql://usuario:contraseña@host:5432/postgres"
JWT_SECRET="tu-secreto-aqui"

# 4. Crear las tablas en la base de datos (usar puerto 5432 — Session Pooler)
DATABASE_URL="$DATABASE_URL_SCHEMA" npx prisma db push

# 5. Cargar datos de prueba (5 usuarios, 3 proyectos, 24 tareas, 12 mensajes de chat)
npx tsx prisma/seed.ts

# 6. Iniciar el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Estructura del proyecto

```
app/
  (auth)/login/         # Página de login
  (main)/
    tasks/              # Gestión de tareas — ADMIN
    my-tasks/           # Mis tareas — USER
    historial/          # Historial de tareas con filtros
    projects/           # Gestión de proyectos
    chat/               # Chat grupal por proyecto
    users/              # Gestión de usuarios — ADMIN
  api/
    auth/               # login, logout, me
    tasks/              # CRUD tareas + acciones (assign, approve, reject, request_completion)
    projects/           # CRUD proyectos
    users/              # GET y PUT usuarios
    notifications/      # GET notificaciones, PUT marcar leídas
    chat/               # GET mensajes, POST mensaje
components/
  app-sidebar.tsx       # Sidebar con navegación condicional por rol
  notification-bell.tsx # Campana de notificaciones con polling
  nav-user.tsx          # Perfil de usuario y cerrar sesión
lib/
  auth.ts               # Helpers JWT: createSession, verifySession, getSession
  prisma.ts             # Instancia global del cliente Prisma
  notifications.ts      # Helpers para crear notificaciones a usuarios y admins
prisma/
  schema.prisma         # Modelos: User, Project, Task, Notification, ChatMessage
  seed.ts               # Script de datos iniciales
proxy.ts                # Protección de rutas (equivale a middleware en Next.js 16)
```

---

## Modelo de datos

```
User ──── crea ──→ Project ──── tiene ──→ Task ──── genera ──→ Notification
 │                                          │
 └──── assignee ──────────────────────────→ ┘
 │
 └──── autor ──→ ChatMessage ←── pertenece a ── Project
```

- **User** — rol `ADMIN` o `USER`, puede estar deshabilitado o eliminado (soft delete)
- **Project** — agrupa tareas y mensajes de chat
- **Task** — tiene estado, prioridad, asignado, aprobado por y fechas
- **Notification** — tipo (`TASK_ASSIGNED`, `COMPLETION_REQUESTED`, `TASK_APPROVED`, `TASK_REJECTED`), leída o no
- **ChatMessage** — mensaje de texto ligado a un proyecto y un autor

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Supabase (Transaction Pooler, puerto 6543) para la app |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |

---

## Notas técnicas

- **`proxy.ts`** en lugar de `middleware.ts`: Next.js 16 renombró el archivo de middleware.
- **Puerto 5432 para migraciones**: el Transaction Pooler (6543) no soporta comandos DDL; usar el Session Pooler (5432) solo para `prisma db push`.
- **Polling en lugar de WebSockets**: notificaciones cada 20 s, chat cada 3 s — suficiente para un proyecto académico sin infraestructura de sockets.
- **Soft delete en usuarios**: los usuarios se marcan como `deleted: true` en lugar de eliminarse físicamente para preservar la integridad referencial.
