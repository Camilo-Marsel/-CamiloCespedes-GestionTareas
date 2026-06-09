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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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
        toast.success('Usuario actualizado exitosamente');
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='container mx-auto py-10 px-6'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold tracking-tight'>Usuarios</h2>
        <p className='text-muted-foreground mt-1'>Gestiona los roles de los usuarios del sistema.</p>
      </div>

      {loading ? (
        <div className='text-center py-20 text-muted-foreground'>Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>No hay usuarios registrados.</div>
      ) : (
        <div className='rounded-md border overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='text-left px-4 py-3 font-medium'>ID</th>
                <th className='text-left px-4 py-3 font-medium'>Correo</th>
                <th className='text-left px-4 py-3 font-medium'>Nombre</th>
                <th className='text-left px-4 py-3 font-medium'>Rol</th>
                <th className='text-left px-4 py-3 font-medium'>Fecha de registro</th>
                <th className='text-left px-4 py-3 font-medium'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                    {u.id.slice(0, 8)}...
                  </td>
                  <td className='px-4 py-3'>{u.email}</td>
                  <td className='px-4 py-3'>{u.name}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-muted-foreground'>
                    {new Date(u.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className='px-4 py-3'>
                    <Button variant='outline' size='sm' onClick={() => openEdit(u)}>
                      Editar usuario
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className='flex flex-col gap-4'>
            <p className='text-sm text-muted-foreground'>
              Usuario: <span className='font-medium text-foreground'>{editUser?.email}</span>
            </p>
            <div className='flex flex-col gap-2'>
              <Label>Rol</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'ADMIN' | 'USER')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN'>ADMIN</SelectItem>
                  <SelectItem value='USER'>USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setEditUser(null)}>
                Cancelar
              </Button>
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
