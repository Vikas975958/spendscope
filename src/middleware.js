import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isLoggedIn = Boolean(token);

  const publicRoutes = ["/sign-in", "/signup", "/landing", "/"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );


  // 1. Authenticated users
  if (isLoggedIn) {
    // Redirect away from public auth pages or root to /dashboard
    if (isPublicRoute || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow all private routes (e.g., /dashboard, /categories)
    return NextResponse.next();
  }

  // 2. Unauthenticated users
  if (!isLoggedIn) {
    if (pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/?modal=signin", request.url));
    }

    if (pathname === "/signup") {
      return NextResponse.redirect(new URL("/?modal=signup", request.url));
    }

    if (pathname === "/landing") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/") {
      return NextResponse.next();
    }

    // Redirect unauthenticated access to home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
