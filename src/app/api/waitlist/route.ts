import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resendReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

async function sendWaitlistConfirmationEmail(name: string, email: string) {
  if (!resend || !resendFromEmail || !resendReplyToEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Missing RESEND_API_KEY/RESEND_FROM_EMAIL/RESEND_REPLY_TO_EMAIL; skipping confirmation email.",
      );
    }
    return false;
  }

  const firstName = name.trim().split(/\s+/)[0] || "there";

  await resend.emails.send({
    from: resendFromEmail,
    to: email,
    replyTo: resendReplyToEmail,
    subject: "You are in! SportIQX Early Access confirmed",
    html: `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>Welcome to SportIQX Early Access</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background-color: #F0F0F0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
          a { text-decoration: none; }

          @media only screen and (max-width: 600px) {
            .email-wrapper { width: 100% !important; }
            .content-cell { padding: 32px 24px !important; }
            .hero-title { font-size: 36px !important; }
            .reward-table { width: 100% !important; }
            .mobile-pad { padding-left: 24px !important; padding-right: 24px !important; }
            .mobile-badge-cell { display: block !important; width: 100% !important; text-align: left !important; padding-top: 12px !important; }
            .reward-icon-cell { width: 44px !important; vertical-align: top !important; }
            .reward-text-cell { display: block !important; width: 100% !important; padding-left: 10px !important; padding-right: 0 !important; }
            .reward-tag-cell { display: block !important; width: 100% !important; text-align: left !important; padding-left: 54px !important; padding-top: 10px !important; }
            .coins-box { margin-bottom: 28px !important; }
            .cta-btn { display: block !important; width: 100% !important; text-align: center !important; padding: 14px 18px !important; }
            .footer-logo-row { text-align: left !important; padding-bottom: 14px !important; }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background-color:#F0F0F0;">
      <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:#F0F0F0; line-height:1px;">
        You're in. 300 coins + 1 month Pro are yours on launch day. Welcome to SportIQX Early Access.
        &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F0F0;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <table class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0"
                   style="max-width:600px; width:100%; border-radius:20px; overflow:hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.08);">
              <tr>
                <td style="background-color:#E65100; padding: 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:#BF360C; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="mobile-pad" style="padding: 28px 40px 24px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td>
                              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #FFFFFF; text-transform: uppercase;">
                                SPORT<span style="color: #FFD180;">IQX</span>
                              </span>
                            </td>
                            <td class="mobile-badge-cell" align="right">
                              <span style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #E65100; background-color: #FFD180; padding: 5px 12px; border-radius: 100px; text-transform: uppercase;">
                                EARLY ACCESS
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td class="mobile-pad" style="padding: 8px 40px 48px 40px; text-align: center;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px auto;">
                          <tr>
                            <td align="center" valign="middle">
                              <span style="display:inline-block; width:72px; height:72px; line-height:72px; border-radius:50%; background-color:rgba(255,255,255,0.2); color:#ffffff; font-size:34px; font-family:Arial, sans-serif; text-align:center;">✓</span>
                            </td>
                          </tr>
                        </table>

                        <h1 class="hero-title" style="font-family: Georgia, 'Times New Roman', serif;
                            font-size: 44px; font-weight: bold; color: #FFFFFF;
                            letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; line-height: 1.1;">
                          You're In.
                        </h1>
                        <p style="font-family: Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.85);
                            line-height: 1.6; max-width: 380px; margin: 0 auto;">
                          Welcome to SportIQX Early Access. Your rewards are locked in.
                          We will notify you the moment we launch.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="content-cell" style="background-color: #FFFFFF; padding: 48px 40px;">
                  <p style="font-family: Arial, sans-serif; font-size: 22px; font-weight: bold;
                      color: #1A1A1A; margin-bottom: 8px;">
                    Hey ${firstName}, 👋
                  </p>
                  <p style="font-family: Arial, sans-serif; font-size: 15px; color: #777777;
                      line-height: 1.7; margin-bottom: 36px;">
                    You just secured your spot among the first people to experience SportIQX.
                    Here is exactly what you get on launch day.
                  </p>

                  <p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold;
                      letter-spacing: 3px; text-transform: uppercase; color: #BBBBBB; margin-bottom: 16px;">
                    YOUR EARLY ACCESS REWARDS
                  </p>

                  <table class="reward-table" width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="margin-bottom: 12px; border-radius: 12px; overflow: hidden;
                                border: 1px solid #FFE0CC;">
                    <tr>
                      <td style="background-color: #FFF8F5; padding: 18px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td class="reward-icon-cell" style="width: 48px; vertical-align: middle;">
                              <table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:40px; height:40px; border-radius:50%; background-color:#FFEDE0;"><span style="font-size:18px; line-height:1;">🪙</span></td></tr></table>
                            </td>
                            <td class="reward-text-cell" style="padding-left: 14px; vertical-align: middle;">
                              <span style="font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #E65100;">300 coins&nbsp;</span>
                              <span style="font-family: Arial, sans-serif; font-size: 15px; color: #333333;">credited to your account on launch day</span>
                            </td>
                            <td class="reward-tag-cell" align="right" style="vertical-align: middle; padding-left: 12px;">
                              <span style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;
                                  color: #E65100; background-color: #FFE0CC; padding: 4px 10px; border-radius: 100px; white-space: nowrap;">
                                ALL USERS
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table class="reward-table" width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="margin-bottom: 12px; border-radius: 12px; overflow: hidden;
                                border: 1px solid #FFE0CC;">
                    <tr>
                      <td style="background-color: #FFF8F5; padding: 18px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td class="reward-icon-cell" style="width: 48px; vertical-align: middle;">
                              <table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:40px; height:40px; border-radius:50%; background-color:#FFEDE0;"><span style="font-size:18px; line-height:1;">⚡</span></td></tr></table>
                            </td>
                            <td class="reward-text-cell" style="padding-left: 14px; vertical-align: middle;">
                              <span style="font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #E65100;">1 month Pro&nbsp;</span>
                              <span style="font-family: Arial, sans-serif; font-size: 15px; color: #333333;">subscription, completely free</span>
                            </td>
                            <td class="reward-tag-cell" align="right" style="vertical-align: middle; padding-left: 12px;">
                              <span style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;
                                  color: #E65100; background-color: #FFE0CC; padding: 4px 10px; border-radius: 100px; white-space: nowrap;">
                                GIFT
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table class="reward-table" width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="margin-bottom: 36px; border-radius: 12px; overflow: hidden;
                                border: 1px solid #FFE0CC;">
                    <tr>
                      <td style="background-color: #FFF8F5; padding: 18px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td class="reward-icon-cell" style="width: 48px; vertical-align: middle;">
                              <table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:40px; height:40px; border-radius:50%; background-color:#FFEDE0;"><span style="font-size:18px; line-height:1;">🔥</span></td></tr></table>
                            </td>
                            <td class="reward-text-cell" style="padding-left: 14px; vertical-align: middle;">
                              <span style="font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #E65100;">2x coins&nbsp;</span>
                              <span style="font-family: Arial, sans-serif; font-size: 15px; color: #333333;">on every booking you make as a Pro user</span>
                            </td>
                            <td class="reward-tag-cell" align="right" style="vertical-align: middle; padding-left: 12px;">
                              <span style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;
                                  color: #FFFFFF; background-color: #E65100; padding: 4px 10px; border-radius: 100px; white-space: nowrap;">
                                PRO ONLY
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table class="coins-box" width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="margin-bottom: 40px; border-radius: 12px; overflow: hidden;
                                background-color: #F5F5F5; border-left: 4px solid #E65100;">
                    <tr>
                      <td style="padding: 20px 24px;">
                        <p style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;
                            letter-spacing: 2px; text-transform: uppercase; color: #E65100;
                            margin-bottom: 8px;">
                          HOW COINS WORK
                        </p>
                        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555555;
                            line-height: 1.7; margin: 0;">
                          1 coin = Re. 1 in booking value. Pay Rs. 500 for a slot as a Pro user,
                          earn 1,000 coins back. Use coins to pay for your next booking.
                          Coins expire after 12 months.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;"><tr><td style="height: 1px; background-color: #F0F0F0; font-size: 0; line-height: 0;">&nbsp;</td></tr></table>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
                    <tr>
                      <td align="center">
                        <a class="cta-btn" href="https://sportiqx.xyz"
                          style="display: inline-block; background-color: #E65100; color: #FFFFFF;
                                font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;
                                letter-spacing: 0.5px; padding: 16px 48px; border-radius: 10px;
                                text-decoration: none;">
                          Visit sportiqx
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-family: Arial, sans-serif; font-size: 15px; color: #444444;
                      line-height: 1.7; margin-bottom: 4px;">See you on the field,</p>
                  <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px;
                      font-weight: bold; color: #E65100; letter-spacing: 1px;">Team SportIQX</p>
                </td>
              </tr>

              <tr>
                <td class="mobile-pad" style="background-color: #E65100; padding: 32px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="footer-logo-row" align="right" style="padding-bottom: 10px;">
                        <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; letter-spacing: 3px; color: rgba(255,209,128,0.55); text-transform: uppercase;">
                          SPORT<span style="color: rgba(255,255,255,0.72);">IQX</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #FFFFFF; margin-bottom: 16px; font-style: italic;">
                          "Book your play. खेलो बिना रुके."
                        </p>

                        <p style="font-family: Arial, sans-serif; font-size: 13px; color: rgba(255,255,255,0.82); margin-bottom: 16px;">
                          <a href="https://sportiqx.xyz" style="color: #FFD180; text-decoration: none;">Website</a>
                          &nbsp;&nbsp;·&nbsp;&nbsp;
                          <a href="https://instagram.com/sportiqx" style="color: #FFD180; text-decoration: none;">Instagram</a>
                        </p>

                        <p style="font-family: Arial, sans-serif; font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0;">
                          You received this email because you signed up for SportIQX Early Access.
                          <br />
                          <a href="#" style="color: rgba(255,255,255,0.92); text-decoration: underline;">Unsubscribe</a>
                          &nbsp;·&nbsp;
                          SportIQX, India
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="background-color: #BF360C; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `,
  });

  return true;
}

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

    try {
      await sendWaitlistConfirmationEmail(parsed.data.name, parsed.data.email);
    } catch (emailError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Confirmation email failed", emailError);
      }
    }

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

    if (process.env.NODE_ENV !== "production") {
      console.error("Waitlist submission failed", error);
    }
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
