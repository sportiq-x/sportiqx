import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-session";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getAdminSessionCookieName()}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  const payload = verifyAdminSessionToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const member = await prisma.sportiqxPanel.findUnique({
    where: { email: payload.email },
    select: { role: true, isActive: true },
  });

  if (!member || !member.isActive || member.role !== "ADMIN") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
