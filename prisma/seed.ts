import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const ago = (d: number) => new Date(Date.now() - d * 86400000);

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Usuarios ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestiontareas.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@gestiontareas.com', password: await hash('Admin123!'), role: 'ADMIN' },
  });

  const [demo, ana, carlos, laura] = await Promise.all([
    prisma.user.upsert({ where: { email: 'usuario@gestiontareas.com' }, update: {}, create: { name: 'Usuario Demo', email: 'usuario@gestiontareas.com', password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'ana@gestiontareas.com'     }, update: {}, create: { name: 'Ana Gomez',    email: 'ana@gestiontareas.com',     password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'carlos@gestiontareas.com'  }, update: {}, create: { name: 'Carlos Ruiz',  email: 'carlos@gestiontareas.com',  password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'laura@gestiontareas.com'   }, update: {}, create: { name: 'Laura Perez',  email: 'laura@gestiontareas.com',   password: await hash('User123!'), role: 'USER' } }),
  ]);

  // ── Proyectos ─────────────────────────────────────────────
  const [p1, p2, p3] = await Promise.all([
    prisma.project.upsert({ where: { id: 'seed-p1' }, update: {}, create: { id: 'seed-p1', name: 'App Web Corporativa',  description: 'Portal web institucional para cliente externo',           initialBalance: 0, createdById: admin.id } }),
    prisma.project.upsert({ where: { id: 'seed-p2' }, update: {}, create: { id: 'seed-p2', name: 'Sistema de Inventario', description: 'Gestion de stock e integracion con proveedores externos', initialBalance: 0, createdById: admin.id } }),
    prisma.project.upsert({ where: { id: 'seed-p3' }, update: {}, create: { id: 'seed-p3', name: 'Rediseno de Marca',     description: 'Identidad visual y guia de estilos corporativos',         initialBalance: 0, createdById: admin.id } }),
  ]);

  await prisma.chatMessage.deleteMany({ where: { projectId: { in: [p1.id, p2.id, p3.id] } } });
  await prisma.task.deleteMany({ where: { projectId: { in: [p1.id, p2.id, p3.id] } } });

  type TD = {
    title: string; description?: string; projectId: string;
    assigneeId: string; createdById: string;
    priority: 'LOW'|'MEDIUM'|'HIGH';
    status: 'PENDING'|'IN_PROGRESS'|'COMPLETION_REQUESTED'|'COMPLETED';
    dueDate?: Date; createdAt: Date; approvedById?: string; approvedAt?: Date;
  };

  const tasks: TD[] = [
    // App Web Corporativa
    { title: 'Diseniar mockups de pantallas',      description: 'Wireframes y prototipos en Figma',            projectId: p1.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(52), approvedById: admin.id, approvedAt: ago(46) },
    { title: 'Configurar entorno de desarrollo',   description: 'Docker, CI/CD y variables de entorno',        projectId: p1.id, assigneeId: ana.id,    createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(48), approvedById: admin.id, approvedAt: ago(43) },
    { title: 'Implementar autenticacion JWT',      description: 'Login, registro y cookies HttpOnly',          projectId: p1.id, assigneeId: laura.id,  createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(43), approvedById: admin.id, approvedAt: ago(37) },
    { title: 'Crear API REST de productos',        description: 'CRUD con validacion y paginacion',            projectId: p1.id, assigneeId: demo.id,   createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(38), approvedById: admin.id, approvedAt: ago(31) },
    { title: 'Desarrollar dashboard admin',        description: 'Panel con metricas, tablas y graficas',       projectId: p1.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(33), approvedById: admin.id, approvedAt: ago(25) },
    { title: 'Optimizacion de rendimiento',        description: 'Lazy loading y cache de queries',             projectId: p1.id, assigneeId: ana.id,    createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(26), approvedById: admin.id, approvedAt: ago(18) },
    { title: 'Pruebas end-to-end',                 description: 'Playwright cubriendo flujos criticos',        projectId: p1.id, assigneeId: laura.id,  createdById: admin.id, priority: 'MEDIUM', status: 'IN_PROGRESS',          dueDate: ago(-8),  createdAt: ago(14) },
    { title: 'Documentacion tecnica de la API',    description: 'OpenAPI/Swagger y guia de integracion',       projectId: p1.id, assigneeId: demo.id,   createdById: admin.id, priority: 'LOW',    status: 'IN_PROGRESS',          dueDate: ago(-5),  createdAt: ago(10) },
    { title: 'Deploy a produccion',                description: 'Dominio, SSL y env de produccion',            projectId: p1.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'PENDING',              dueDate: ago(-3),  createdAt: ago(5)  },
    // Sistema de Inventario
    { title: 'Analisis de requisitos',             description: 'Reuniones y documentacion funcional',         projectId: p2.id, assigneeId: ana.id,    createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(60), approvedById: admin.id, approvedAt: ago(54) },
    { title: 'Diseno del esquema de BD',           description: 'Entidades, relaciones y normalizacion',       projectId: p2.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(55), approvedById: admin.id, approvedAt: ago(49) },
    { title: 'Modulo de ingreso de mercancia',     description: 'Formulario y actualizacion de stock',         projectId: p2.id, assigneeId: laura.id,  createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(46), approvedById: admin.id, approvedAt: ago(40) },
    { title: 'Modulo de salida y despacho',        description: 'Trazabilidad y registro de responsable',      projectId: p2.id, assigneeId: demo.id,   createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(40), approvedById: admin.id, approvedAt: ago(33) },
    { title: 'Reportes y exportacion CSV',         description: 'Reportes con filtros por fecha',              projectId: p2.id, assigneeId: ana.id,    createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETION_REQUESTED', createdAt: ago(15) },
    { title: 'Integracion API proveedores',        description: 'Servicio REST externo para precios',          projectId: p2.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'IN_PROGRESS',          dueDate: ago(-7),  createdAt: ago(12) },
    { title: 'Testing y bugs criticos',            description: 'Ciclo QA con casos documentados',             projectId: p2.id, assigneeId: laura.id,  createdById: admin.id, priority: 'HIGH',   status: 'PENDING',              dueDate: ago(-2),  createdAt: ago(4)  },
    { title: 'Capacitacion usuarios finales',      description: 'Manual y sesion con el cliente',              projectId: p2.id, assigneeId: demo.id,   createdById: admin.id, priority: 'LOW',    status: 'PENDING',              dueDate: ago(-1),  createdAt: ago(2)  },
    // Rediseno de Marca
    { title: 'Investigacion de identidad',         description: 'Benchmarking y tendencias de diseno',         projectId: p3.id, assigneeId: laura.id,  createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(65), approvedById: admin.id, approvedAt: ago(60) },
    { title: 'Propuesta paleta de colores',        description: '3 opciones con justificacion de marca',       projectId: p3.id, assigneeId: demo.id,   createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(58), approvedById: admin.id, approvedAt: ago(51) },
    { title: 'Diseno del logotipo principal',      description: 'Variantes positivo, negativo, monocromo',     projectId: p3.id, assigneeId: ana.id,    createdById: admin.id, priority: 'HIGH',   status: 'COMPLETED',            createdAt: ago(50), approvedById: admin.id, approvedAt: ago(44) },
    { title: 'Tipografia y sistema de iconos',     description: 'Seleccion y licenciamiento de fuentes',       projectId: p3.id, assigneeId: carlos.id, createdById: admin.id, priority: 'MEDIUM', status: 'COMPLETED',            createdAt: ago(44), approvedById: admin.id, approvedAt: ago(38) },
    { title: 'Guia de estilo corporativo',         description: 'Brand book con normas de uso de marca',       projectId: p3.id, assigneeId: carlos.id, createdById: admin.id, priority: 'HIGH',   status: 'COMPLETION_REQUESTED', createdAt: ago(20) },
    { title: 'Materiales digitales',               description: 'Plantillas para redes y presentaciones',      projectId: p3.id, assigneeId: laura.id,  createdById: admin.id, priority: 'HIGH',   status: 'IN_PROGRESS',          dueDate: ago(-6),  createdAt: ago(8)  },
    { title: 'Presentacion ejecutiva al cliente',  description: 'Deck con todas las piezas del rediseno',      projectId: p3.id, assigneeId: demo.id,   createdById: admin.id, priority: 'HIGH',   status: 'PENDING',              dueDate: ago(-1),  createdAt: ago(3)  },
  ];

  for (const t of tasks) await prisma.task.create({ data: t });

  const chat = [
    { projectId: p1.id, authorId: admin.id,  content: 'Buenos dias equipo, el deploy esta programado para el viernes.',  createdAt: ago(3) },
    { projectId: p1.id, authorId: carlos.id, content: 'Entendido, termino los mockups de perfil maniana.',               createdAt: ago(3) },
    { projectId: p1.id, authorId: ana.id,    content: 'El entorno de staging ya esta actualizado con la ultima version.', createdAt: ago(2) },
    { projectId: p1.id, authorId: laura.id,  content: 'Los tests e2e del flujo de autenticacion pasaron al 100%!',        createdAt: ago(2) },
    { projectId: p1.id, authorId: demo.id,   content: 'Consulta: el endpoint de productos puede tener paginacion cursor?', createdAt: ago(1) },
    { projectId: p1.id, authorId: admin.id,  content: 'Si, usa cursor-based pagination. Te paso el doc de API ahora.',    createdAt: ago(1) },
    { projectId: p2.id, authorId: admin.id,  content: 'El cliente aprobo el modulo de salidas. Falta el de reportes.',   createdAt: ago(4) },
    { projectId: p2.id, authorId: ana.id,    content: 'El reporte CSV exporta bien. Envie solicitud de completado.',      createdAt: ago(2) },
    { projectId: p2.id, authorId: carlos.id, content: 'La API del proveedor tiene rate limit 100/min, uso cola interna.', createdAt: ago(1) },
    { projectId: p3.id, authorId: laura.id,  content: 'Comparto la propuesta de tipografia en la reunion de maniana.',    createdAt: ago(5) },
    { projectId: p3.id, authorId: carlos.id, content: 'El brand book ya tiene 48 paginas. Lo subo al drive hoy.',         createdAt: ago(2) },
    { projectId: p3.id, authorId: admin.id,  content: 'Excelente trabajo equipo, el cliente esta muy satisfecho.',        createdAt: ago(1) },
  ];

  for (const m of chat) await prisma.chatMessage.create({ data: m });

  console.log(`Seed OK | Tareas: ${tasks.length} | Chat: ${chat.length}`);
  console.log('  ADMIN: admin@gestiontareas.com / Admin123!');
  ['usuario','ana','carlos','laura'].forEach(u => console.log(`  USER:  ${u}@gestiontareas.com / User123!`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
