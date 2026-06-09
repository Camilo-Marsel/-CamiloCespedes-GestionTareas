import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const include = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const mine = searchParams.get('mine') === 'true';

  const where = mine
    ? { assigneeId: session.id }
    : projectId
    ? { projectId }
    : {};

  const tasks = await prisma.task.findMany({
    where,
    include,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo el ADMIN puede crear tareas' }, { status: 403 });
  }

  const { title, description, projectId, assigneeId, priority, dueDate } = await request.json();
  if (!title || !projectId) {
    return NextResponse.json({ error: 'Título y proyecto son requeridos' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      projectId,
      assigneeId: assigneeId || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: session.id,
      status: assigneeId ? 'IN_PROGRESS' : 'PENDING',
    },
    include,
  });

  return NextResponse.json({ task }, { status: 201 });
}
