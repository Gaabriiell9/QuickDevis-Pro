import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
      },
    });

    // Handle invite token — add user to the invited organization
    if (data.inviteToken) {
      try {
        const vToken = await prisma.verificationToken.findFirst({
          where: {
            token: data.inviteToken,
            expires: { gt: new Date() },
            identifier: { startsWith: "invite:" },
          },
        });

        if (vToken) {
          // Parse: "invite:orgId:role:email" (email may contain colons)
          const parts = vToken.identifier.split(":");
          const orgId = parts[1];
          const role = parts[2];
          const invitedEmail = parts.slice(3).join(":");

          if (orgId && role && invitedEmail.toLowerCase() === data.email.toLowerCase()) {
            await prisma.organizationMember.create({
              data: {
                organizationId: orgId,
                userId: user.id,
                role: role as "ADMIN" | "MEMBER",
                joinedAt: new Date(),
              },
            });

            // Delete the used token
            await prisma.verificationToken
              .delete({
                where: {
                  identifier_token: {
                    identifier: vToken.identifier,
                    token: data.inviteToken,
                  },
                },
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        // Non-fatal: user was created, just couldn't process the invite
        if (process.env.NODE_ENV !== "production") console.error("[register] invite token error:", err);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    if (process.env.NODE_ENV !== "production") console.error("[register]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
