'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, TaskDone01Icon, Clock01Icon, FolderOpenIcon } from '@hugeicons/core-free-icons';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETION_REQUESTED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  project: { id: string; name: string };
  createdBy: { id: string; name: string };
  approvedAt?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Task['status'], string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETION_REQUESTED: 'Esperando aprobación',
  COMPLETED: 'Completada',
};
const STATUS_COLOR: Record<Task['status'], string> = {
  PENDING: 'bg-gray-100 text-gray-600 ring-gray-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-100',
  COMPLETION_REQUESTED: 'bg-amber-50 text-amber-700 ring-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};
const PRIORITY_DOT: Record<Task['priority'], string> = {
  LOW: 'bg-gray-300', MEDIUM: 'bg-amber-400', HIGH: 'bg-red-500',
};
const PRIORITY_LABEL: Record<Task['priority'], string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta',
};

export default function MyTasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  async function fetchTasks() {
    const res = await fetch('/api/tasks?mine=true');
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, []);

  async function requestCompletion(task: Task) {
    setRequesting(task.id);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_completion' }),
    });
    setRequesting(null);
    if (!res.ok) { toast.error('Error al enviar la solicitud'); return; }
    toast.success('Solicitud enviada, esperando aprobación del administrador');
    fetchTasks();
  }

  const active = tasks.filter(t => t.status !== 'COMPLETED');
  const completed = tasks.filter(t => t.status === 'COMPLETED');

  if (loading) return <div className='flex items-center justify-center h-64 text-sm text-muted-foreground'>Cargando tareas...</div>;

  return (
    <div className='container mx-auto py-8 px-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
          <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={2} className='size-5 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Mis tareas</h1>
          <p className='text-sm text-muted-foreground'>
            {active.length} activa{active.length !== 1 ? 's' : ''} · {completed.length} completada{completed.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 gap-3'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-muted'>
            <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={1.5} className='size-8 text-muted-foreground' />
          </div>
          <p className='font-medium'>No tienes tareas asignadas</p>
          <p className='text-sm text-muted-foreground'>El administrador te asignará tareas próximamente.</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {/* Activas primero */}
          {active.map(task => (
            <div key={task.id} className='rounded-xl border bg-card shadow-sm p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                    <h3 className='font-semibold truncate'>{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>{task.description}</p>
                  )}
                  <div className='flex items-center gap-3 flex-wrap'>
                    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                      <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} className='size-3' />
                      {task.project.name}
                    </span>
                    {task.dueDate && (
                      <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                        <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className='size-3' />
                        Vence {new Date(task.dueDate).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    <span className='text-xs text-muted-foreground'>Prioridad {PRIORITY_LABEL[task.priority]}</span>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-2 shrink-0'>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLOR[task.status]}`}>
                    {STATUS_LABEL[task.status]}
                  </span>
                  {task.status === 'IN_PROGRESS' && (
                    <Button
                      size='sm'
                      className='h-8 gap-1.5 text-xs'
                      onClick={() => requestCompletion(task)}
                      disabled={requesting === task.id}
                    >
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className='size-3.5' />
                      {requesting === task.id ? 'Enviando...' : 'Marcar completada'}
                    </Button>
                  )}
                  {task.status === 'COMPLETION_REQUESTED' && (
                    <p className='text-xs text-amber-600 font-medium'>Esperando aprobación</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Completadas al final */}
          {completed.length > 0 && (
            <>
              <div className='flex items-center gap-3 mt-4 mb-2'>
                <div className='h-px flex-1 bg-border' />
                <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Completadas</span>
                <div className='h-px flex-1 bg-border' />
              </div>
              {completed.map(task => (
                <div key={task.id} className='rounded-xl border bg-card/60 p-4 opacity-70'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className='size-4 text-primary shrink-0' />
                        <h3 className='font-medium line-through text-muted-foreground truncate'>{task.title}</h3>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1 ml-6'>{task.project.name}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLOR[task.status]} shrink-0`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
