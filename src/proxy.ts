import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/api/constants";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

// Gate rapide côté UX (évite d'afficher une page protégée avant redirection).
// Ne remplace pas une vraie vérification : chaque appel à civic_api revalide
// le token, et (dashboard)/layout.tsx redirige si le token s'avère invalide
// ou expiré — cf. la mise en garde de Next.js sur le fait de ne pas se fier
// uniquement au proxy pour l'authentification.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(TOKEN_COOKIE);

  if (!hasToken && !PUBLIC_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasToken && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
