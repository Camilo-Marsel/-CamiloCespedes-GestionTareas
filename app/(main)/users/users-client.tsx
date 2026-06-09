'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, Edit01Icon } from '@hugeicons/core-free-icons';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  enabled: boolean;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  function openEdit(user: User) {
    setEditUser(user);
    setNewRole(user.role);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editUser.id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al actualizar usuario');
      } else {
        toast.success('Rol actualizado exitosamente');
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const regularUsers = users.filter((u) => u.role === 'USER').length;

  return (
    <div className='container mx-auto py-8 px-6 max-w-6xl'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className='size-5 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Usuarios</h1>
          <p className='text-sm text-muted-foreground'>
            {admins} administrador{admins !== 1 ? 'es' : ''} · {regularUsers} usuario{regularUsers !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className='text-center py-20 text-sm text-muted-foreground'>Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className='text-center py-20 text-sm text-muted-foreground'>No hay usuarios registrados.</div>
      ) : (
        <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-border/60'>
            <h2 className='text-sm font-semibold'>Todos los usuarios</h2>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border/40 bg-muted/30'>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>ID</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Correo</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Nombre</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Rol</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Registro</th>
                <th className='text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Acciones</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {users.map((u) => (
                <tr key={u.id} className='hover:bg-muted/20 transition-colors'>
                  <td className='px-5 py-3.5 font-mono text-xs text-muted-foreground'>{u.id.slice(0, 8)}...</td>
                  <td className='px-5 py-3.5 text-sm'>{u.email}</td>
                  <td className='px-5 py-3.5 font-medium'>{u.name}</td>
                  <td className='px-5 py-3.5'>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      u.role === 'ADMIN'
                        ? 'bg-violet-50 text-violet-700 ring-violet-100'
                        : 'bg-primary/8 text-primary ring-primary/15'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className='px-5 py-3.5 text-muted-foreground'>{new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
                  <td className='px-5 py-3.5'>
                    <Button variant='outline' size='sm' onClick={() => openEdit(u)} className='gap-1.5 h-7 text-xs'>
                      <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className='size-3' />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className='flex flex-col gap-4 pt-2'>
            <div className='rounded-lg bg-muted/40 px-3 py-2.5 text-sm'>
              <span className='text-muted-foreground'>Usuario: </span>
              <span className='font-medium'>{editUser?.email}</span>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Rol asignado</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'ADMIN' | 'USER')}>
                <SelectTrigger className='bg-card'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN'>ADMIN — Acceso completo</SelectItem>
                  <SelectItem value='USER'>USER — Acceso limitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setEditUser(null)}>Cancelar</Button>
              <Button type='submit' disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
