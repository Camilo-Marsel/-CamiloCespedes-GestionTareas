'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

  // Compute current balance per project based on movements is handled in transactions
  // Here we show the initial balance
  const getBalance = (project: Project) => project.initialBalance;

  return (
    <div className='container mx-auto py-10 px-6'>
      <div className='flex flex-row justify-between items-start mb-8'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Proyectos</h2>
          <p className='text-muted-foreground mt-1'>Gestiona los proyectos del sistema.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)}>+ Agregar proyecto</Button>
        )}
      </div>

      {loading ? (
        <div className='text-center py-20 text-muted-foreground'>Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>No hay proyectos registrados.</div>
      ) : (
        <div className='rounded-md border overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='text-left px-4 py-3 font-medium'>ID</th>
                <th className='text-left px-4 py-3 font-medium'>Nombre</th>
                <th className='text-right px-4 py-3 font-medium'>Saldo inicial</th>
                <th className='text-left px-4 py-3 font-medium'>Creado por</th>
                <th className='text-left px-4 py-3 font-medium'>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{p.id.slice(0, 8)}...</td>
                  <td className='px-4 py-3 font-medium'>{p.name}</td>
                  <td className='px-4 py-3 text-right font-mono'>{getBalance(p)}</td>
                  <td className='px-4 py-3'>{p.createdBy.name}</td>
                  <td className='px-4 py-3 text-muted-foreground'>
                    {new Date(p.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar proyecto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='proj-name'>Nombre del proyecto</Label>
              <Input
                id='proj-name'
                placeholder='Nombre del proyecto'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Cancelar
              </Button>
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
