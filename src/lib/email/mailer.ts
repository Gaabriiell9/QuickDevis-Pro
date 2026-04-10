import { resend } from "./resend";

const FROM = process.env.EMAIL_FROM ?? "QuickDevis Pro <noreply@quickdevis.fr>";

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Réinitialisation de votre mot de passe — QuickDevis Pro",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #4338CA; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">QuickDevis Pro</h1>
        </div>
        <div style="border: 1px solid #E2E8F0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">Réinitialisation du mot de passe</h2>
          <p style="color: #64748B;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous dans les 24 heures :</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4338CA; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #94A3B8; font-size: 13px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Lien valable 24h — QuickDevis Pro
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendQuoteEmail(
  to: string,
  quoteRef: string,
  orgName: string,
  message: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Devis ${quoteRef} — ${orgName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #4338CA; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">${orgName}</h1>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Devis ${quoteRef}</p>
        </div>
        <div style="border: 1px solid #E2E8F0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; white-space: pre-line;">${message}</p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Envoyé via QuickDevis Pro
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendInviteEmail(
  to: string,
  orgName: string,
  inviterName: string,
  registerUrl: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Vous avez été invité à rejoindre ${orgName} sur QuickDevis Pro`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #4338CA; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">QuickDevis Pro</h1>
        </div>
        <div style="border: 1px solid #E2E8F0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">Vous avez été invité !</h2>
          <p style="color: #64748B;">
            <strong>${inviterName}</strong> vous invite à rejoindre l'organisation
            <strong>${orgName}</strong> sur QuickDevis Pro.
          </p>
          <a href="${registerUrl}" style="display: inline-block; background: #4338CA; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Créer mon compte
          </a>
          <p style="color: #94A3B8; font-size: 13px;">
            Si vous avez déjà un compte, connectez-vous et demandez à votre administrateur de vous ajouter manuellement.
          </p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Invitation envoyée via QuickDevis Pro — Si vous n'attendiez pas cet email, ignorez-le.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(
  to: string,
  invoiceRef: string,
  orgName: string,
  message: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Facture ${invoiceRef} — ${orgName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #0F172A; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">${orgName}</h1>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Facture ${invoiceRef}</p>
        </div>
        <div style="border: 1px solid #E2E8F0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; white-space: pre-line;">${message}</p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Envoyé via QuickDevis Pro
          </p>
        </div>
      </div>
    `,
  });
}
