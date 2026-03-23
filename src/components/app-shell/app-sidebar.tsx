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
  Layout,
  FolderOpen,
  BarChart2,
  Users2,
  User,
  Settings,
  RefreshCcw,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navSections = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, color: "text-blue-400" },
    ],
  },
  {
    title: "Commercial",
    items: [
      { href: "/clients", label: "Clients", icon: Users, color: "text-blue-400" },
      { href: "/quotes", label: "Devis", icon: FileText, color: "text-blue-400" },
      { href: "/invoices", label: "Factures", icon: Receipt, color: "text-blue-400" },
      { href: "/credit-notes", label: "Avoirs", icon: RefreshCcw, color: "text-blue-400" },
      { href: "/payments", label: "Paiements", icon: CreditCard, color: "text-blue-400" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/products", label: "Produits & Services", icon: Package, color: "text-violet-400" },
      { href: "/templates", label: "Templates", icon: Layout, color: "text-violet-400" },
      { href: "/documents", label: "Documents", icon: FolderOpen, color: "text-violet-400" },
    ],
  },
  {
    title: "Analyse",
    items: [
      { href: "/analytics", label: "Analytiques", icon: BarChart2, color: "text-emerald-400" },
      { href: "/team", label: "Équipe", icon: Users2, color: "text-emerald-400" },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/profile", label: "Profil", icon: User, color: "text-slate-400" },
      { href: "/settings", label: "Paramètres", icon: Settings, color: "text-slate-400" },
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
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex h-full flex-col bg-[#111827]">
      {/* Logo header */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-[#1f2d3d]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-bold shadow-lg shrink-0">
          QD
        </div>
        <div>
          <p className="text-sm font-semibold text-white">QuickDevis Pro</p>
          <p className="text-xs text-gray-400">v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-gray-300 hover:bg-[#1f2d3d] hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : item.color
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-[#1f2d3d] p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1f2d3d] transition-colors">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name ?? "Utilisateur"}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
