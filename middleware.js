import { NextResponse } from 'next/server';
import { verifyToken } from './app/lib/auth';
// import { verifyToken } from '@/lib/auth';

export async function middleware(req) {
  const token = req.cookies.get('session')?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up');

  const session = token ? await verifyToken(token) : null;

  if (!session && !isAuthPage && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};