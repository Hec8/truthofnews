import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // NOTE: l'auth Firebase de ce projet est gérée côté client.
  // Le contrôle d'accès /admin est assuré dans le layout admin.
  // Ne pas rediriger ici pour éviter les boucles / faux négatifs sans cookie serveur.
  void request;
  return NextResponse.next();
}
