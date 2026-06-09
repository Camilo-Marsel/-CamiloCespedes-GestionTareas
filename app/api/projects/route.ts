import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { deleted: false },
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener proyectos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { name, initialBalance } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

  try {
    const project = await prisma.project.create({
      data: {
        name,
        initialBalance: initialBalance ?? 0,
        createdById: session.id,
      },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear proyecto' }, { status: 500 });
  }
}
