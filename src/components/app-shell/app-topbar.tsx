"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut, User, Settings, Bell, ChevronRight, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { CommandSearch } from "@/components/shared/command-search";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  clients: "Clients",
  quotes: "Devis",
  invoices: "Factures",
  "credit-notes": "Avoirs",
  payments: "Paiements",
  products: "Produits & Services",
  templates: "Templates",
  documents: "Documents",
  analytics: "Analytiques",
  team: "Equipe",
  profile: "Profil",
  settings: "Parametres",
  new: "Nouveau",
  edit: "Modifier",
  company: "Societe",
  billing: "Facturation",
};

function isId(str: string) {
  return str.length > 20 || /^[0-9a-f]{8}-/.test(str);
}

interface AppTopbarProps {
  onMenuClick: () => void;
  orgName?: string;
}

export function AppTopbar({ onMenuClick, orgName }: AppTopbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: isId(seg) ? "Detail" : (ROUTE_LABELS[seg] ?? seg),
  }));

  return (
    <>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 gap-4 shrink-0">
        {/* Left: mobile menu + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 h-8 w-8"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />}
                {i === breadcrumb.length - 1 ? (
                  <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-slate-400 hover:text-slate-700 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {orgName && (
            <span className="text-sm font-medium text-slate-500 sm:hidden truncate">
              {orgName}
            </span>
          )}
        </div>

        {/* Center: search */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4 text-slate-500" />
          </Button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Parametres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
