# TaskFlow — Sistema de Gestión de Tareas

**TaskFlow** es una aplicación web fullstack para la gestión de proyectos y equipos de trabajo. Permite crear proyectos, asignar tareas a los miembros del equipo, hacer seguimiento del progreso, registrar movimientos financieros por proyecto, y comunicarse en tiempo real a través de un chat grupal. Está diseñada con dos roles diferenciados — administrador y usuario — cada uno con acceso y capacidades distintas.

Construida con **Next.js 16**, **Prisma 7**, **PostgreSQL (Supabase)** y **shadcn/ui**.

---

## ¿Qué puede hacer cada rol?

### ADMIN
- Crear, asignar, aprobar y rechazar tareas en cualquier proyecto
- Ver todas las tareas del sistema con filtros por estado y proyecto
- Crear nuevos proyectos
- Registrar movimientos de entrada/salida en cualquier proyecto y ver la gráfica de saldo
- Gestionar usuarios: ver todos los usuarios, cambiar roles, activar o desactivar cuentas
- Ver el historial completo de todas las tareas
- Participar en el chat de cualquier proyecto
- Recibir notificaciones cuando un usuario solicita completar una tarea

### USER
- Ver y gestionar sus propias tareas: marcar como completadas y solicitar aprobación al admin
- Ver el historial de sus tareas con filtros por estado y proyecto
- Acceder a todos los proyectos y ver sus detalles
- Registrar movimientos de entrada/salida en proyectos y ver la gráfica de saldo
- Participar en el chat de cualquier proyecto
- Recibir notificaciones cuando le asignan una tarea, o cuando el admin aprueba o rechaza una

---

## Flujo principal de una tarea

```
ADMIN crea la tarea y la asigna a un usuario
        ↓
Usuario recibe notificación → la tarea aparece en "Mis Tareas" como "En progreso"
        ↓
Usuario termina el trabajo → hace clic en "Marcar completada" → estado: "Esperando aprobación"
        ↓
ADMIN recibe notificación → revisa la tarea → Aprueba o Rechaza
        ↓
Usuario recibe notificación con el resultado → tarea queda como "Completada" o vuelve a "En progreso"
```

---

## Integrantes

**Camilo Céspedes**

## Demo

🔗 [camilo-cespedes-gestion-tareas.vercel.app](https://camilo-cespedes-gestion-tareas.vercel.app)

> El despliegue se hizo desde un repositorio personal; el código es idéntico al del repositorio de la clase.

---

## Capturas

### Login
![Login](docs/screenshots/login.png)

### Tareas — vista ADMIN
![Tareas Admin](docs/screenshots/tareas-admin.png)

### Nueva tarea — modal
![Nueva Tarea](docs/screenshots/nueva-tarea.png)

### Proyectos
![Proyectos](docs/screenshots/proyectos.png)

### Usuarios
![Usuarios](docs/screenshots/usuarios.png)

### Historial de Tareas
![Historial](docs/screenshots/historial.png)

### Mis Tareas — vista USER
![Mis Tareas](docs/screenshots/mis-tareas.png)

### Chat — vista ADMIN
![Chat Admin](docs/screenshots/chat-admin.png)

### Chat — vista USER
![Chat Usuario](docs/screenshots/chat-usuario.png)

### Notificaciones
![Notificaciones](docs/screenshots/notificaciones.png)

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
- **Tareas (ADMIN)** — crear, asignar, aprobar y rechazar tareas; tabla con filtros por estado y prioridad
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
JWT_SECRET="tu-secreto-aqui"

# 4. Crear las tablas en la base de datos (usar puerto 5432 — Session Pooler)
DATABASE_URL="postgresql://usuario:contraseña@host:5432/postgres" npx prisma db push

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
    tasks/              # CRUD + acciones (assign, approve, reject, request_completion)
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
- **Task** — estado, prioridad, asignado, aprobado por y fechas
- **Notification** — tipo (`TASK_ASSIGNED`, `COMPLETION_REQUESTED`, `TASK_APPROVED`, `TASK_REJECTED`)
- **ChatMessage** — mensaje de texto ligado a un proyecto y un autor

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Supabase (Transaction Pooler, puerto 6543) |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |

---

## Notas técnicas

- **`proxy.ts`** en lugar de `middleware.ts`: Next.js 16 renombró el archivo de middleware.
- **Puerto 5432 para migraciones**: el Transaction Pooler (6543) no soporta DDL; usar el Session Pooler (5432) solo para `prisma db push`.
- **Polling en lugar de WebSockets**: notificaciones cada 20 s, chat cada 3 s — suficiente para un proyecto académico sin infraestructura de sockets.
- **Soft delete en usuarios**: los usuarios se marcan como `deleted: true` en lugar de eliminarse físicamente para preservar la integridad referencial.
