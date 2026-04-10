"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Package,
  Palette,
  FolderOpen,
  BarChart3,
  Users2,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePlan, type Plan } from "@/hooks/use-plan";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navSections = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, locked: undefined as Plan | undefined },
    ],
  },
  {
    title: "Commercial",
    items: [
      { href: "/clients",      label: "Clients",            icon: Users,       locked: undefined as Plan | undefined },
      { href: "/quotes",       label: "Devis",              icon: FileText,    locked: undefined as Plan | undefined },
      { href: "/invoices",     label: "Factures",           icon: Receipt,     locked: undefined as Plan | undefined },
      { href: "/credit-notes", label: "Avoirs",             icon: CreditCard,  locked: undefined as Plan | undefined },
      { href: "/payments",     label: "Paiements",          icon: Wallet,      locked: undefined as Plan | undefined },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/products",   label: "Produits & Services", icon: Package,    locked: undefined as Plan | undefined },
      { href: "/templates",  label: "Templates",           icon: Palette,    locked: undefined as Plan | undefined },
      { href: "/documents",  label: "Documents",           icon: FolderOpen, locked: undefined as Plan | undefined },
    ],
  },
  {
    title: "Analyse",
    items: [
      { href: "/analytics", label: "Analytiques", icon: BarChart3, locked: "PRO" as Plan },
      { href: "/team",      label: "Equipe",       icon: Users2,   locked: "BUSINESS" as Plan },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/settings", label: "Parametres", icon: Settings, locked: undefined as Plan | undefined },
    ],
  },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { hasAccess } = usePlan();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex h-full w-[240px] flex-col bg-slate-900">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold shrink-0">
          QD
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold text-white truncate">QuickDevis</span>
          <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-600/40">
            Pro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const locked = item.locked && !hasAccess(item.locked);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {locked && (
                        <span className="ml-auto shrink-0 rounded-full bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                          {item.locked === "BUSINESS" ? "Premium" : "Pro"}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name ?? "Utilisateur"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded shrink-0"
            title="Deconnexion"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
