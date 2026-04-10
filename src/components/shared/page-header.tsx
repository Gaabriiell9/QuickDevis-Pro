import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-slate-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-500">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
