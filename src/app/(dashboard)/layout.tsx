"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

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
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
