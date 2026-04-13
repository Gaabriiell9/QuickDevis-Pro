import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getOrgId } from "@/lib/auth/guards";
import { sendInviteEmail } from "@/lib/email/mailer";
import { APP_URL } from "@/config/app";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json([]);

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === "production" });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });

  // Vérifier que l'invitant est OWNER ou ADMIN
  const inviterMember = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId: token.id as string },
    include: { user: { select: { name: true } } },
  });
  if (!inviterMember || !["OWNER", "ADMIN"].includes(inviterMember.role)) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  // Vérifier que l'organisation est en plan BUSINESS
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true, name: true } });
  if (!org || org.plan !== "BUSINESS") {
    return NextResponse.json({ error: "La gestion d'équipe nécessite le plan Premium" }, { status: 403 });
  }

  const body = await req.json();
  const { email, role = "MEMBER" } = body as { email: string; role?: string };

  if (!email || !["ADMIN", "MEMBER"].includes(role)) {
    return NextResponse.json({ error: "Email et rôle requis (ADMIN ou MEMBER)" }, { status: 400 });
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // Vérifier qu'il n'est pas déjà membre
    const alreadyMember = await prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId: existingUser.id },
    });
    if (alreadyMember) {
      return NextResponse.json({ error: "Cet utilisateur est déjà membre de l'organisation" }, { status: 409 });
    }
    // Ajouter directement
    const member = await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: existingUser.id, role: role as "ADMIN" | "MEMBER", joinedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return NextResponse.json({ member, invited: false });
  }

  // Utilisateur inexistant → créer un token d'invitation et envoyer un email
  const inviteToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  await prisma.verificationToken.create({
    data: { identifier: `invite:${orgId}:${role}:${email}`, token: inviteToken, expires },
  });

  const registerUrl = `${APP_URL}/register?invite=${inviteToken}&email=${encodeURIComponent(email)}`;
  const inviterName = inviterMember.user?.name ?? "Un administrateur";

  try {
    await sendInviteEmail(email, org.name, inviterName, registerUrl);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[team/invite] email error:", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  return NextResponse.json({ invited: true, email });
}
