import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestiontareas.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@gestiontareas.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'usuario@gestiontareas.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'usuario@gestiontareas.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Seed completado:');
  console.log('  ADMIN:', admin.email, '/ Admin123!');
  console.log('  USER: ', user.email, '/ User123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
