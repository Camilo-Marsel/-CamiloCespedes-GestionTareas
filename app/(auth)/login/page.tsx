'use client';

import { LoginForm } from '@/components/login-form';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkSquare02Icon,
  TaskDone01Icon,
  CheckListIcon,
  Folder01Icon,
} from '@hugeicons/core-free-icons';

const features = [
  { icon: CheckmarkSquare02Icon, text: 'Gestiona proyectos y tareas en un solo lugar' },
  { icon: TaskDone01Icon,        text: 'Registra movimientos de entrada y salida' },
  { icon: CheckListIcon,         text: 'Visualiza el progreso con gráficas en tiempo real' },
  { icon: Folder01Icon,          text: 'Control de acceso por roles ADMIN y USER' },
];

export default function LoginPage() {
  return (
    <div className='min-h-svh grid lg:grid-cols-2'>
      {/* Panel izquierdo — formulario */}
      <div className='flex flex-col justify-between p-8 md:p-12'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm'>
            <HugeiconsIcon
              icon={CheckmarkSquare02Icon}
              strokeWidth={2}
              className='size-5 text-primary-foreground'
            />
          </div>
          <div className='leading-tight'>
            <p className='text-sm font-bold tracking-tight'>TaskFlow</p>
            <p className='text-[11px] text-muted-foreground'>Gestión de proyectos</p>
          </div>
        </div>

        {/* Formulario centrado */}
        <div className='flex flex-1 items-center justify-center py-12'>
          <div className='w-full max-w-sm'>
            <LoginForm />
          </div>
        </div>

        <p className='text-center text-xs text-muted-foreground'>
          © 2026 TaskFlow — Ingeniería Web
        </p>
      </div>

      {/* Panel derecho — decorativo */}
      <div className='relative hidden lg:flex flex-col justify-center overflow-hidden bg-primary px-12'>
        {/* Círculos decorativos */}
        <div className='absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/5' />
        <div className='absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5' />
        <div className='absolute top-1/2 right-8 h-48 w-48 -translate-y-1/2 rounded-full bg-white/5' />

        <div className='relative z-10 max-w-md'>
          <h2 className='text-3xl font-bold text-primary-foreground leading-tight mb-3'>
            Organiza tu equipo.<br />Cumple tus metas.
          </h2>
          <p className='text-primary-foreground/70 text-sm mb-10'>
            Una plataforma centralizada para gestionar proyectos, registrar movimientos y controlar el flujo de trabajo de tu equipo.
          </p>

          <div className='flex flex-col gap-4'>
            {features.map((f, i) => (
              <div key={i} className='flex items-center gap-4'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15'>
                  <HugeiconsIcon icon={f.icon} strokeWidth={2} className='size-5 text-primary-foreground' />
                </div>
                <p className='text-sm text-primary-foreground/85'>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
