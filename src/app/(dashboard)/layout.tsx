"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppTopbar } from "@/components/app-shell/app-topbar";
import { useCurrentOrganization } from "@/hooks/use-current-organization";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: org } = useCurrentOrganization();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col">
        <AppSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          onMenuClick={() => setSidebarOpen(true)}
          orgName={org?.name}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
