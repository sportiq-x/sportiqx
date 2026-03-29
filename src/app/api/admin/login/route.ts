import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminSessionToken, getAdminSessionCookieName } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const member = await prisma.sportiqxPanel.findUnique({
      where: { email },
      select: {
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!member || !member.isActive || member.role !== "ADMIN") {
      return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, member.passwordHash);
    if (!isValid) {
      return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
    }

    const token = createAdminSessionToken(member.email);
    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Admin session secret is missing." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set({
      name: getAdminSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Login failed." }, { status: 500 });
  }
}
