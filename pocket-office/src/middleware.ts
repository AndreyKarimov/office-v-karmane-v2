import { auth } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/tasks", "/new-task", "/team", "/audit", "/billing"];
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/login", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|$).*)"],
  runtime: "nodejs",
};
