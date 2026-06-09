'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ChartHistogramIcon, ArrowUpIcon, ArrowDownIcon } from '@hugeicons/core-free-icons';

type Project = { id: string; name: string; initialBalance: number };
type Movement = {
  id: string;
  type: 'ENTRADA' | 'SALIDA';
  quantity: number;
  createdAt: string;
  executedBy: { name: string; email: string };
};

type ChartPoint = { date: string; saldo: number };

function buildChartData(movements: Movement[], initialBalance: number): ChartPoint[] {
  const sorted = [...movements].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  let running = initialBalance;
  const byDate: Record<string, number> = {};
  for (const m of sorted) {
    const d = new Date(m.createdAt).toLocaleDateString('es-CO');
    running += m.type === 'ENTRADA' ? m.quantity : -m.quantity;
    byDate[d] = running;
  }
  return Object.entries(byDate).map(([date, saldo]) => ({ date, saldo }));
}

export default function TransactionsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []));
  }, []);

  const fetchMovements = useCallback(async (projectId: string) => {
    setLoadingMov(true);
    const res = await fetch(`/api/movements?projectId=${projectId}`);
    const data = await res.json();
    setMovements(data.movements || []);
    setLoadingMov(false);
  }, []);

  function handleSelectProject(id: string) {
    const p = projects.find((p) => p.id === id) || null;
    setSelectedProject(p);
    if (p) fetchMovements(p.id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    setSaving(true);
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject.id, type, quantity: Number(quantity) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al crear movimiento');
      } else {
        toast.success('Movimiento registrado exitosamente');
        setOpen(false);
        setQuantity('1');
        fetchMovements(selectedProject.id);
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  const totalEntradas = movements.filter((m) => m.type === 'ENTRADA').reduce((s, m) => s + m.quantity, 0);
  const totalSalidas  = movements.filter((m) => m.type === 'SALIDA').reduce((s, m) => s + m.quantity, 0);
  const saldoActual   = selectedProject ? selectedProject.initialBalance + totalEntradas - totalSalidas : 0;
  const chartData = selectedProject ? buildChartData(movements, selectedProject.initialBalance) : [];

  return (
    <div className='container mx-auto py-8 px-6 max-w-6xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} className='size-5 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Transacciones</h1>
            <p className='text-sm text-muted-foreground'>Movimientos por proyecto</p>
          </div>
        </div>
        {selectedProject && (
          <Button onClick={() => setOpen(true)} className='gap-2'>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className='size-4' />
            Agregar movimiento
          </Button>
        )}
      </div>

      {/* Selector de proyecto */}
      <div className='mb-6'>
        <Label className='mb-2 block text-sm font-medium'>Selecciona un proyecto</Label>
        <Select onValueChange={handleSelectProject}>
          <SelectTrigger className='max-w-sm bg-card'>
            <SelectValue placeholder='Elige un proyecto para ver sus movimientos' />
          </SelectTrigger>
          <SelectContent>
            {projects.length === 0 ? (
              <SelectItem value='none' disabled>No hay proyectos disponibles</SelectItem>
            ) : (
              projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          {/* Stats cards */}
          <div className='grid grid-cols-3 gap-4 mb-6'>
            <div className='rounded-xl border bg-card p-4 shadow-sm'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>Saldo actual</p>
              <p className='text-2xl font-bold text-foreground'>{saldoActual}</p>
            </div>
            <div className='rounded-xl border bg-emerald-50 border-emerald-100 p-4 shadow-sm'>
              <p className='text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1'>Total entradas</p>
              <p className='text-2xl font-bold text-emerald-700'>+{totalEntradas}</p>
            </div>
            <div className='rounded-xl border bg-red-50 border-red-100 p-4 shadow-sm'>
              <p className='text-xs font-medium text-red-500 uppercase tracking-wide mb-1'>Total salidas</p>
              <p className='text-2xl font-bold text-red-600'>-{totalSalidas}</p>
            </div>
          </div>

          {/* Tabla de movimientos */}
          <div className='rounded-xl border bg-card shadow-sm overflow-hidden mb-6'>
            <div className='px-5 py-4 border-b border-border/60'>
              <h2 className='text-sm font-semibold'>Historial de movimientos</h2>
            </div>
            {loadingMov ? (
              <div className='text-center py-12 text-muted-foreground text-sm'>Cargando movimientos...</div>
            ) : movements.length === 0 ? (
              <div className='text-center py-12 text-muted-foreground text-sm'>
                No hay movimientos registrados para este proyecto.
              </div>
            ) : (
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border/40 bg-muted/30'>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>ID</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Fecha</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Tipo</th>
                    <th className='text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Cantidad</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Responsable</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/30'>
                  {movements.map((m) => (
                    <tr key={m.id} className='hover:bg-muted/20 transition-colors'>
                      <td className='px-5 py-3.5 font-mono text-xs text-muted-foreground'>{m.id.slice(0, 8)}...</td>
                      <td className='px-5 py-3.5 text-sm'>{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                      <td className='px-5 py-3.5'>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          m.type === 'ENTRADA'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-red-50 text-red-600 ring-1 ring-red-100'
                        }`}>
                          <HugeiconsIcon
                            icon={m.type === 'ENTRADA' ? ArrowUpIcon : ArrowDownIcon}
                            strokeWidth={2.5}
                            className='size-3'
                          />
                          {m.type}
                        </span>
                      </td>
                      <td className='px-5 py-3.5 text-right font-semibold tabular-nums'>{m.quantity}</td>
                      <td className='px-5 py-3.5 text-sm text-muted-foreground'>{m.executedBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Gráfica */}
          {chartData.length > 0 && (
            <div className='rounded-xl border bg-card shadow-sm p-6'>
              <h3 className='text-sm font-semibold mb-5'>
                Evolución de saldo — <span className='text-primary'>{selectedProject.name}</span>
              </h3>
              <ResponsiveContainer width='100%' height={280}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id='gradSaldo' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
                      <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='date' tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type='monotone' dataKey='saldo' stroke='#10b981' strokeWidth={2.5} fill='url(#gradSaldo)' dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Dialog agregar movimiento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Nuevo movimiento</DialogTitle>
            <p className='text-sm text-muted-foreground pt-1'>
              Proyecto: <span className='font-medium text-foreground'>{selectedProject?.name}</span>
            </p>
          </DialogHeader>
          <form onSubmit={handleCreate} className='flex flex-col gap-4 pt-2'>
            <div className='flex flex-col gap-2'>
              <Label>Tipo de movimiento</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'ENTRADA' | 'SALIDA')}>
                <SelectTrigger className='bg-card'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ENTRADA'>↑ Entrada</SelectItem>
                  <SelectItem value='SALIDA'>↓ Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='qty'>Cantidad</Label>
              <Input
                id='qty'
                type='number'
                min='1'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className='bg-card'
              />
            </div>
            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type='submit' disabled={saving}>
                {saving ? 'Registrando...' : 'Crear movimiento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
