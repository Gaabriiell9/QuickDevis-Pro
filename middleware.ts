import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]
const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/quotes", "/invoices", "/payments", "/products", "/templates", "/documents", "/analytics", "/team", "/profile", "/settings", "/credit-notes"]
const ONBOARDING_ROUTES = ["/onboarding", "/welcome"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const onboardingCompleted = token?.onboardingCompleted as boolean | undefined
  const isOnboardingRoute = ONBOARDING_ROUTES.some(r => pathname.startsWith(r))

  // Bloquer l'accès à /onboarding et /welcome pour les non-connectés
  if (!isAuthenticated && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Rediriger les utilisateurs avec onboarding terminé hors des routes d'onboarding
  if (isAuthenticated && onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Bug 2 fix : onboarding incomplet → laisser accéder aux pages auth librement
  // (ex : retour arrière depuis /onboarding vers /login)
  if (isAuthenticated && !onboardingCompleted && isAuthRoute) {
    return NextResponse.next()
  }

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

  // Bug 1 fix : session incomplète sur route protégée → renvoyer vers /login
  // callbackUrl=/onboarding pour que le login page y redirige après connexion
  // (évite la boucle : /dashboard → /login → /dashboard → …)
  if (isAuthenticated && !onboardingCompleted && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login?callbackUrl=%2Fonboarding", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
