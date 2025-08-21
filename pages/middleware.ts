// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/student', '/admin', '/rrhh'],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const roleCookie = req.cookies.get('elabs_auth')?.value || '';

  if (!roleCookie) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith('/student') && roleCookie !== 'student') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  if (url.pathname.startsWith('/admin') && roleCookie !== 'admin') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  if (url.pathname.startsWith('/rrhh') && roleCookie !== 'rrhh') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
