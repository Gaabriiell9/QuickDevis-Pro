import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]
const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/quotes", "/invoices", "/payments", "/products", "/templates", "/documents", "/analytics", "/team", "/profile", "/settings", "/credit-notes"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))

  // Redirige les connectés hors des pages auth (SAUF /onboarding)
  if (isAuthenticated && isAuthRoute && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirige les non-connectés vers login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirige vers onboarding si pas encore complété (SAUF si déjà sur /onboarding)
  if (isAuthenticated && isProtectedRoute) {
    const onboardingDone = token?.onboardingCompleted as boolean | undefined
    if (!onboardingDone && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
