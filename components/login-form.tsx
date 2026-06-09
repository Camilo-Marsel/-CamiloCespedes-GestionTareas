'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
      } else {
        router.push('/transactions');
        router.refresh();
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Iniciar sesión</h1>
          <p className='text-sm text-balance text-muted-foreground'>
            Ingresa tu correo y contraseña para acceder
          </p>
        </div>
        {error && (
          <div className='rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive text-center'>
            {error}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor='email'>Correo electrónico</FieldLabel>
          <Input
            id='email'
            type='email'
            placeholder='correo@ejemplo.com'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-background'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
          <Input
            id='password'
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='bg-background'
          />
        </Field>
        <Field>
          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
