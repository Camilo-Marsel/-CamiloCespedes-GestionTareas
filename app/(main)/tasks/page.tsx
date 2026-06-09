import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TasksAdminClient from './tasks-admin-client';

export default async function TasksPage() {
  const session = await getSession();
  if (session?.role !== 'ADMIN') redirect('/my-tasks');
  return <TasksAdminClient />;
}
