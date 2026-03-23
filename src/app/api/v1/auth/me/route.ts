import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: token.id as string } });
      if (!user?.password) return NextResponse.json({ error: "Impossible de changer le mot de passe" }, { status: 400 });
      const valid = await verifyPassword(data.currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: token.id as string },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.newPassword && { password: await hashPassword(data.newPassword) }),
      },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
