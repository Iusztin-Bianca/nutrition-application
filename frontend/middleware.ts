import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith('/home') ||
      pathname.startsWith('/complete-profile') ||
      pathname.startsWith('/monitorizare') ||
      pathname.startsWith('/indices')) &&
    !token
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/complete-profile/:path*', '/monitorizare/:path*', '/indices/:path*'],
};
