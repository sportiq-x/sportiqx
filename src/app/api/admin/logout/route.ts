import { NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/admin-session";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/admin/login";

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
