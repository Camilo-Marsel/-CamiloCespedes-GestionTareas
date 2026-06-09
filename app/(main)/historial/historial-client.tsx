'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ListViewIcon, FolderOpenIcon, Clock01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

type Task = {
  id: string; title: string; status: string; priority: string;
  createdAt: string; approvedAt?: string | null; dueDate?: string | null;
  project: { name: string };
  assignee?: { name: string } | null;
  createdBy: { name: string };
  approvedBy?: { name: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', IN_PROGRESS: 'En progreso',
  COMPLETION_REQUESTED: 'Esp. aprobacion', COMPLETED: 'Completada',
};
const STATUS_CLS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETION_REQUESTED: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
};
const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-gray-300', MEDIUM: 'bg-amber-400', HIGH: 'bg-red-500',
};

export default function HistorialClient({ role }: { role: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');

  useEffect(() => {
    const url = role === 'ADMIN' ? '/api/tasks' : '/api/tasks?mine=true';
    fetch(url).then(r => r.json()).then(d => { setTasks(d.tasks || []); setLoading(false); });
  }, [role]);

  const projects = Array.from(new Set(tasks.map(t => t.project.name)));

  const filtered = tasks.filter(t =>
    (!filterStatus  || t.status === filterStatus) &&
    (!filterProject || t.project.name === filterProject)
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Cargando historial...</div>;

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de Tareas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} de {tasks.length} tareas</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los proyectos</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filterStatus || filterProject) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterProject(''); }}
            className="h-9 px-3 text-xs rounded-lg border text-muted-foreground hover:bg-accent transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="size-10 opacity-20" />
            <p className="text-sm">Sin tareas con estos filtros</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Tarea','Proyecto','Asignado a','Estado','Prioridad','Fecha','Completada'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-48">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} className="size-3" />
                      {t.project.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.assignee?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{t.priority.toLowerCase()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3" />
                      {new Date(t.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.approvedAt ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-3" />
                        {new Date(t.approvedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
