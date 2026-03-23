import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, email, password } = body ?? {};

  if (!token || !email || !password) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: email.toLowerCase(),
      token,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { password: hashed },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email.toLowerCase(),
        token,
      },
    },
  });

  return NextResponse.json({ success: true });
}
