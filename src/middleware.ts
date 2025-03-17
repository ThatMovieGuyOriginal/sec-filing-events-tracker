// src/middleware.ts - Next.js middleware for security headers
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://js.stripe.com https://cdnjs.cloudflare.com; frame-src 'self' https://js.stripe.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://api.stripe.com;",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };

  // Apply all security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except API and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
