import { getSession } from '@/lib/auth';
import ProjectsClient from './projects-client';

export default async function ProjectsPage() {
  const session = await getSession();
  return <ProjectsClient isAdmin={session?.role === 'ADMIN'} />;
}
