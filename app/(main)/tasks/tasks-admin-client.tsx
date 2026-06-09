'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, TaskDone01Icon, CheckmarkCircle01Icon, Cancel01Icon, Edit01Icon } from '@hugeicons/core-free-icons';

type Project = { id: string; name: string };
type User = { id: string; name: string; email: string };
type Task = {
  id: string; title: string; description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETION_REQUESTED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  project: { id: string; name: string };
  assignee?: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string };
  approvedBy?: { id: string; name: string } | null;
  approvedAt?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Task['status'], string> = {
  PENDING: 'Pendiente', IN_PROGRESS: 'En progreso',
  COMPLETION_REQUESTED: 'Solicitud completado', COMPLETED: 'Completada',
};
const STATUS_COLOR: Record<Task['status'], string> = {
  PENDING: 'bg-gray-100 text-gray-600 ring-gray-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-100',
  COMPLETION_REQUESTED: 'bg-amber-50 text-amber-700 ring-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};
const PRIORITY_COLOR: Record<Task['priority'], string> = {
  LOW: 'text-gray-400', MEDIUM: 'text-amber-500', HIGH: 'text-red-500',
};
const PRIORITY_LABEL: Record<Task['priority'], string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta',
};

export default function TasksAdminClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDue, setNewDue] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const url = selectedProjectId && selectedProjectId !== 'all'
      ? `/api/tasks?projectId=${selectedProjectId}`
      : '/api/tasks';
    const res = await fetch(url);
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }, [selectedProjectId]);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([pd, ud]) => {
      setProjects(pd.projects || []);
      setUsers(ud.users || []);
    });
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, projectId: newProject, assigneeId: newAssignee || null, priority: newPriority, dueDate: newDue || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(data.error); return; }
    toast.success('Tarea creada');
    setCreateOpen(false);
    setNewTitle(''); setNewDesc(''); setNewProject(''); setNewAssignee(''); setNewPriority('MEDIUM'); setNewDue('');
    fetchTasks();
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignOpen) return;
    setSaving(true);
    const res = await fetch(`/api/tasks/${assignOpen.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', assigneeId: assigneeId || null }),
    });
    setSaving(false);
    if (!res.ok) { toast.error('Error al asignar'); return; }
    toast.success('Tarea asignada');
    setAssignOpen(null);
    fetchTasks();
  }

  async function handleApprove(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    if (!res.ok) { toast.error('Error al aprobar'); return; }
    toast.success('Tarea aprobada y completada');
    fetchTasks();
  }

  async function handleReject(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });
    if (!res.ok) { toast.error('Error al rechazar'); return; }
    toast.success('Solicitud rechazada, tarea en progreso');
    fetchTasks();
  }

  const pending = tasks.filter(t => t.status === 'COMPLETION_REQUESTED').length;

  return (
    <div className='container mx-auto py-8 px-6 max-w-6xl'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={2} className='size-5 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Tareas</h1>
            <p className='text-sm text-muted-foreground'>
              {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
              {pending > 0 && <span className='ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700'>{pending} esperando aprobación</span>}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className='gap-2'>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className='size-4' />
          Nueva tarea
        </Button>
      </div>

      {/* Filtro por proyecto */}
      <div className='mb-6 max-w-xs'>
        <Label className='mb-2 block text-sm font-medium'>Filtrar por proyecto</Label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className='bg-card'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los proyectos</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className='text-center py-20 text-sm text-muted-foreground'>Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 gap-3'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'>
            <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={1.5} className='size-7 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground'>No hay tareas en este proyecto.</p>
          <Button onClick={() => setCreateOpen(true)} variant='outline' size='sm'>Crear la primera</Button>
        </div>
      ) : (
        <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border/40 bg-muted/30'>
                {['Tarea', 'Proyecto', 'Asignado a', 'Prioridad', 'Estado', 'Vence', 'Acciones'].map(h => (
                  <th key={h} className='text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {tasks.map(task => (
                <tr key={task.id} className='hover:bg-muted/20 transition-colors'>
                  <td className='px-4 py-3'>
                    <p className='font-medium leading-tight'>{task.title}</p>
                    {task.description && <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>{task.description}</p>}
                  </td>
                  <td className='px-4 py-3 text-muted-foreground'>{task.project.name}</td>
                  <td className='px-4 py-3'>
                    {task.assignee
                      ? <span className='font-medium'>{task.assignee.name}</span>
                      : <span className='text-muted-foreground italic text-xs'>Sin asignar</span>}
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`text-xs font-semibold ${PRIORITY_COLOR[task.priority]}`}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLOR[task.status]}`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-muted-foreground text-xs'>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-1'>
                      {task.status === 'COMPLETION_REQUESTED' ? (
                        <>
                          <Button size='sm' className='h-7 gap-1 text-xs' onClick={() => handleApprove(task)}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className='size-3' />
                            Aprobar
                          </Button>
                          <Button size='sm' variant='outline' className='h-7 gap-1 text-xs text-destructive hover:text-destructive' onClick={() => handleReject(task)}>
                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className='size-3' />
                            Rechazar
                          </Button>
                        </>
                      ) : task.status !== 'COMPLETED' && (
                        <Button size='sm' variant='outline' className='h-7 gap-1 text-xs' onClick={() => { setAssignOpen(task); setAssigneeId(task.assignee?.id || ''); }}>
                          <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className='size-3' />
                          Asignar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog crear tarea */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className='flex flex-col gap-3 pt-2'>
            <div className='flex flex-col gap-1.5'>
              <Label>Título</Label>
              <Input placeholder='Ej: Diseñar pantalla de login' value={newTitle} onChange={e => setNewTitle(e.target.value)} required className='bg-card' />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label>Descripción <span className='text-muted-foreground'>(opcional)</span></Label>
              <Input placeholder='Descripción breve...' value={newDesc} onChange={e => setNewDesc(e.target.value)} className='bg-card' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1.5'>
                <Label>Proyecto</Label>
                <Select value={newProject} onValueChange={setNewProject} required>
                  <SelectTrigger className='bg-card'><SelectValue placeholder='Seleccionar' /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label>Prioridad</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger className='bg-card'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Baja</SelectItem>
                    <SelectItem value='MEDIUM'>Media</SelectItem>
                    <SelectItem value='HIGH'>Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1.5'>
                <Label>Asignar a <span className='text-muted-foreground'>(opcional)</span></Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger className='bg-card'><SelectValue placeholder='Sin asignar' /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Sin asignar</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label>Fecha límite <span className='text-muted-foreground'>(opcional)</span></Label>
                <Input type='date' value={newDue} onChange={e => setNewDue(e.target.value)} className='bg-card' />
              </div>
            </div>
            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type='submit' disabled={saving || !newTitle || !newProject}>{saving ? 'Creando...' : 'Crear tarea'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog asignar usuario */}
      <Dialog open={!!assignOpen} onOpenChange={o => !o && setAssignOpen(null)}>
        <DialogContent className='max-w-sm'>
          <DialogHeader><DialogTitle>Asignar tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleAssign} className='flex flex-col gap-4 pt-2'>
            <div className='rounded-lg bg-muted/40 px-3 py-2.5 text-sm'>
              <span className='text-muted-foreground'>Tarea: </span>
              <span className='font-medium'>{assignOpen?.title}</span>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Asignar a</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className='bg-card'><SelectValue placeholder='Sin asignar' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Sin asignar</SelectItem>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} — {u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setAssignOpen(null)}>Cancelar</Button>
              <Button type='submit' disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
