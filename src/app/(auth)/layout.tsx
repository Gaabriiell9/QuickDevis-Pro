import { APP_NAME } from "@/config/app";
import { AuthAnimatedWrapper } from "@/components/shared/auth-animated-wrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background animate-in">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative w-full max-w-md px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion de devis et factures
          </p>
        </div>
        <AuthAnimatedWrapper>{children}</AuthAnimatedWrapper>
      </div>
    </div>
  );
}
