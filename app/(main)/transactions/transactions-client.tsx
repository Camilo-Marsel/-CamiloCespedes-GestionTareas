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

  const chartData = selectedProject
    ? buildChartData(movements, selectedProject.initialBalance)
    : [];

  return (
    <div className='container mx-auto py-10 px-6'>
      <div className='flex flex-row justify-between items-start mb-8'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Transacciones</h2>
          <p className='text-muted-foreground mt-1'>Visualiza y registra movimientos por proyecto.</p>
        </div>
        {selectedProject && (
          <Button onClick={() => setOpen(true)}>+ Agregar movimiento</Button>
        )}
      </div>

      {/* Selector de proyecto */}
      <div className='mb-6 max-w-xs'>
        <Label className='mb-2 block'>Proyecto</Label>
        <Select onValueChange={handleSelectProject}>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona un proyecto' />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          {/* Tabla de movimientos */}
          <div className='rounded-md border overflow-hidden mb-8'>
            {loadingMov ? (
              <div className='text-center py-10 text-muted-foreground'>Cargando movimientos...</div>
            ) : movements.length === 0 ? (
              <div className='text-center py-10 text-muted-foreground'>
                No hay movimientos para este proyecto.
              </div>
            ) : (
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='text-left px-4 py-3 font-medium'>ID</th>
                    <th className='text-left px-4 py-3 font-medium'>Fecha</th>
                    <th className='text-left px-4 py-3 font-medium'>Tipo</th>
                    <th className='text-right px-4 py-3 font-medium'>Cantidad</th>
                    <th className='text-left px-4 py-3 font-medium'>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                        {m.id.slice(0, 8)}...
                      </td>
                      <td className='px-4 py-3'>
                        {new Date(m.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.type === 'ENTRADA'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-right font-mono'>{m.quantity}</td>
                      <td className='px-4 py-3'>{m.executedBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Gráfica */}
          {chartData.length > 0 && (
            <div className='rounded-md border p-6'>
              <h3 className='text-lg font-semibold mb-4'>
                Evolución de saldo — {selectedProject.name}
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='colorSaldo' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#22c55e' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='saldo'
                    stroke='#22c55e'
                    strokeWidth={2}
                    fill='url(#colorSaldo)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Dialog agregar movimiento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Agregar movimiento — {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Tipo de movimiento</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'ENTRADA' | 'SALIDA')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ENTRADA'>Entrada</SelectItem>
                  <SelectItem value='SALIDA'>Salida</SelectItem>
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
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Cancelar
              </Button>
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
