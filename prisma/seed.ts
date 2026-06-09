import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestiontareas.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@gestiontareas.com', password: await hash('Admin123!'), role: 'ADMIN' },
  });

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'usuario@gestiontareas.com' }, update: {}, create: { name: 'Usuario Demo', email: 'usuario@gestiontareas.com', password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'ana@gestiontareas.com' }, update: {}, create: { name: 'Ana Gómez', email: 'ana@gestiontareas.com', password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'carlos@gestiontareas.com' }, update: {}, create: { name: 'Carlos Ruiz', email: 'carlos@gestiontareas.com', password: await hash('User123!'), role: 'USER' } }),
    prisma.user.upsert({ where: { email: 'laura@gestiontareas.com' }, update: {}, create: { name: 'Laura Pérez', email: 'laura@gestiontareas.com', password: await hash('User123!'), role: 'USER' } }),
  ]);

  console.log('Seed completado:');
  console.log('  ADMIN:', admin.email, '/ Admin123!');
  users.forEach(u => console.log('  USER: ', u.email, '/ User123!'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
