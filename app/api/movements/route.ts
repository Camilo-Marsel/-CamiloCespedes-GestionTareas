import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  try {
    const movements = await prisma.movement.findMany({
      where: projectId ? { projectId } : {},
      include: { executedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ movements });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { projectId, type, quantity } = await request.json();
  if (!projectId || !type || !quantity) {
    return NextResponse.json({ error: 'Campos requeridos: projectId, type, quantity' }, { status: 400 });
  }

  try {
    const movement = await prisma.movement.create({
      data: {
        projectId,
        type,
        quantity: Number(quantity),
        executedById: session.id,
      },
      include: { executedBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ movement }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}
