"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppTopbar } from "@/components/app-shell/app-topbar";
import { useCurrentOrganization } from "@/hooks/use-current-organization";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: org } = useCurrentOrganization();
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated") return;
    const pendingPlan = sessionStorage.getItem("pendingPlan");
    if (!pendingPlan) return;
    sessionStorage.removeItem("pendingPlan");
    fetch("/api/v1/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ plan: pendingPlan, returnUrl: window.location.href }),
    }).then((res) => res.json()).then((data) => { if (data.url) window.location.href = data.url; }).catch(() => {});
  }, [status]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] transform transition-transform duration-200 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <aside className="hidden lg:flex lg:w-[240px] lg:flex-col">
        <AppSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} orgName={org?.name} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, ease: "easeOut" }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
