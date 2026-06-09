import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  const user = token ? await verifySession(token) : null;

  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  // Solo ADMIN puede acceder a /users y /tasks
  if ((pathname.startsWith('/users') || pathname.startsWith('/tasks')) && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/my-tasks', request.url));
  }

  // Redirigir a /tasks si ADMIN intenta ir a /my-tasks
  if (pathname.startsWith('/my-tasks') && user.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)'],
};
