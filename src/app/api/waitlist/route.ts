import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("Valid email is required"),
  phone: z.string().trim().min(7, "Valid phone number is required"),
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
    console.error("Waitlist submission failed", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
