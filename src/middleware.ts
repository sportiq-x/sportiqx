import { NextRequest, NextResponse } from "next/server";

function isAllowedLocalHost(host: string) {
  const hostWithoutPort = host.split(":")[0]?.toLowerCase() || "";
  const allowlist = (process.env.ADMIN_LOCAL_HOSTS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) {
    return false;
  }

  return allowlist.includes(host.toLowerCase()) || allowlist.includes(hostWithoutPort);
}

async function isAuthorized(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return false;
  }

  try {
    const verifyUrl = new URL("/api/admin/session/verify", request.url);
    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    return verifyResponse.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";
  const isAdminHost = host.startsWith("admin.");
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalHost = isAllowedLocalHost(host);
  const isLoginPath = pathname === "/admin/login";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiPath = pathname.startsWith("/api/admin/");

  if (pathname === "/api/admin/session/verify") {
    return NextResponse.next();
  }

  // Hardening: in production, allow admin paths only on admin subdomain.
  if (isProduction && !isLocalHost && !isAdminHost && (isAdminPath || isAdminApiPath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isAdminHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.rewrite(url);
  }

  if (!isAdminPath && !isAdminHost && !isAdminApiPath) {
    return NextResponse.next();
  }

  if (isAdminApiPath) {
    return NextResponse.next();
  }

  const authorized = await isAuthorized(request);

  if (authorized && isLoginPath) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (authorized) {
    return NextResponse.next();
  }

  if (isLoginPath) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
