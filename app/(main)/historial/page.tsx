import { getSession } from '@/lib/auth';
import HistorialClient from './historial-client';
export default async function HistorialPage() {
  const session = await getSession();
  return <HistorialClient role={session!.role} />;
}
