import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const include = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action, assigneeId, priority, dueDate, title, description } = body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

  // USER: solo puede pedir completado en sus tareas
  if (session.role === 'USER') {
    if (action !== 'request_completion') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }
    if (task.assigneeId !== session.id) {
      return NextResponse.json({ error: 'No eres el asignado de esta tarea' }, { status: 403 });
    }
    const updated = await prisma.task.update({
      where: { id },
      data: { status: 'COMPLETION_REQUESTED' },
      include,
    });
    return NextResponse.json({ task: updated });
  }

  // ADMIN: puede hacer todo
  let data: Record<string, unknown> = {};

  if (action === 'approve') {
    data = { status: 'COMPLETED', approvedById: session.id, approvedAt: new Date() };
  } else if (action === 'reject') {
    data = { status: 'IN_PROGRESS' };
  } else if (action === 'assign') {
    data = { assigneeId, status: assigneeId ? 'IN_PROGRESS' : 'PENDING' };
  } else {
    // Edición general
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) {
      data.assigneeId = assigneeId || null;
      data.status = assigneeId ? 'IN_PROGRESS' : 'PENDING';
    }
  }

  const updated = await prisma.task.update({ where: { id }, data, include });
  return NextResponse.json({ task: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo el ADMIN puede eliminar tareas' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
