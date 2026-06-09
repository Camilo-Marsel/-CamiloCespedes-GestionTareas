'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Folder01Icon } from '@hugeicons/core-free-icons';

type Project = {
  id: string;
  name: string;
  initialBalance: number;
  createdAt: string;
  createdBy: { name: string; email: string };
};

export default function ProjectsClient({ isAdmin }: { isAdmin: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [saving, setSaving] = useState(false);

  async function fetchProjects() {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, initialBalance: Number(initialBalance) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al crear proyecto');
      } else {
        toast.success('Proyecto creado exitosamente');
        setOpen(false);
        setName('');
        setInitialBalance('0');
        fetchProjects();
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='container mx-auto py-8 px-6 max-w-6xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} className='size-5 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Proyectos</h1>
            <p className='text-sm text-muted-foreground'>{projects.length} proyecto{projects.length !== 1 ? 's' : ''} registrado{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)} className='gap-2'>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className='size-4' />
            Nuevo proyecto
          </Button>
        )}
      </div>

      {loading ? (
        <div className='text-center py-20 text-sm text-muted-foreground'>Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 gap-3'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'>
            <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.5} className='size-7 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground'>No hay proyectos registrados aún.</p>
          {isAdmin && (
            <Button onClick={() => setOpen(true)} variant='outline' size='sm'>Crear el primero</Button>
          )}
        </div>
      ) : (
        <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-border/60'>
            <h2 className='text-sm font-semibold'>Todos los proyectos</h2>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border/40 bg-muted/30'>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>ID</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Nombre</th>
                <th className='text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Saldo inicial</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Creado por</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Fecha</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {projects.map((p) => (
                <tr key={p.id} className='hover:bg-muted/20 transition-colors'>
                  <td className='px-5 py-3.5 font-mono text-xs text-muted-foreground'>{p.id.slice(0, 8)}...</td>
                  <td className='px-5 py-3.5 font-semibold'>{p.name}</td>
                  <td className='px-5 py-3.5 text-right font-semibold tabular-nums text-primary'>{p.initialBalance}</td>
                  <td className='px-5 py-3.5 text-muted-foreground'>{p.createdBy.name}</td>
                  <td className='px-5 py-3.5 text-muted-foreground'>{new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className='flex flex-col gap-4 pt-2'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='proj-name'>Nombre del proyecto</Label>
              <Input
                id='proj-name'
                placeholder='Ej: Proyecto Alpha'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='bg-card'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='proj-balance'>Saldo inicial</Label>
              <Input
                id='proj-balance'
                type='number'
                min='0'
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className='bg-card'
              />
            </div>
            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type='submit' disabled={saving}>
                {saving ? 'Creando...' : 'Crear proyecto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
