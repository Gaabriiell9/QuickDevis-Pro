import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendResetPasswordEmail } from "@/lib/email/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body?.email?.toLowerCase?.();

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendResetPasswordEmail(email, resetUrl);
    } catch {
      // Ne pas révéler l'erreur d'envoi
    }
  }

  // Anti-énumération : toujours OK
  return NextResponse.json({ success: true });
}
