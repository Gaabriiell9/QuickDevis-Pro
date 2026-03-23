"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut, User, Settings, Bell, ChevronRight, Home, Search } from "lucide-react";
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
  team: "Équipe",
  profile: "Profil",
  settings: "Paramètres",
  new: "Nouveau",
  edit: "Modifier",
  company: "Société",
};

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) || str.length > 20;
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
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Build breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = isUUID(seg) ? "Détail" : (ROUTE_LABELS[seg] ?? seg);
    return { href, label };
  });

  return (
    <>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    <header className="flex h-16 items-center justify-between border-b bg-white shadow-sm px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              {i === breadcrumb.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {orgName && (
          <span className="text-sm font-medium text-muted-foreground sm:hidden truncate">
            {orgName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <Search className="size-3.5" />
          <span>Rechercher...</span>
          <kbd className="text-xs bg-background border rounded px-1 ml-1">⌘K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(true)}>
          <Search className="size-4" />
        </Button>

        {/* Notification bell (demo) */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
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
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
