import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

function isUniqueConstraintError(error: unknown): error is {
  code: string;
  meta?: { target?: string[] | string };
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  phone: z
    .string()
    .trim()
    .regex(/^\+91[6-9]\d{9}$/, "Phone must start with +91 and include a 10-digit mobile number"),
  location: z.string().trim().min(2, "Location is required"),
  sports: z.string().trim().optional(),
  features: z.string().trim().optional(),
  feedback: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please fill all required fields correctly.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await prisma.waitlistEntry.findMany({
      where: {
        OR: [{ email: parsed.data.email }, { phone: parsed.data.phone }],
      },
      select: {
        email: true,
        phone: true,
      },
    });

    const fieldErrors: { email?: string; phone?: string } = {};
    if (existing.some((entry) => entry.email === parsed.data.email)) {
      fieldErrors.email = "This email is already registered on the waitlist.";
    }
    if (existing.some((entry) => entry.phone === parsed.data.phone)) {
      fieldErrors.phone = "This phone number is already registered on the waitlist.";
    }

    if (fieldErrors.email || fieldErrors.phone) {
      return NextResponse.json(
        {
          ok: false,
          message: "Email or phone number is already registered.",
          fieldErrors,
        },
        { status: 409 },
      );
    }

    await prisma.waitlistEntry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        location: parsed.data.location,
        sports: parsed.data.sports || null,
        features: parsed.data.features || null,
        feedback: parsed.data.feedback || null,
      },
    });

    return NextResponse.json({ ok: true, message: "Joined waitlist successfully." });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const targetMeta = error.meta?.target;
      const target = Array.isArray(targetMeta)
        ? targetMeta
        : typeof targetMeta === "string"
          ? [targetMeta]
          : [];

      const fieldErrors: { email?: string; phone?: string } = {};
      if (target.includes("email")) {
        fieldErrors.email = "This email is already registered on the waitlist.";
      }
      if (target.includes("phone")) {
        fieldErrors.phone = "This phone number is already registered on the waitlist.";
      }

      if (fieldErrors.email || fieldErrors.phone) {
        return NextResponse.json(
          {
            ok: false,
            message: "Email or phone number is already registered.",
            fieldErrors,
          },
          { status: 409 },
        );
      }

      if (target.includes("email")) {
        return NextResponse.json(
          {
            ok: false,
            field: "email",
            message: "This email is already registered on the waitlist.",
          },
          { status: 409 },
        );
      }

      if (target.includes("phone")) {
        return NextResponse.json(
          {
            ok: false,
            field: "phone",
            message: "This phone number is already registered on the waitlist.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { ok: false, message: "This email or phone number is already registered." },
        { status: 409 },
      );
    }

    console.error("Waitlist submission failed", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
