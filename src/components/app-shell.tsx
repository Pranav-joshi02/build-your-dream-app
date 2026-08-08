import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Ambulance,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Pill,
  Siren,
  Stethoscope,
  Users,
  Search,
  Bell,
  Mic,
} from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hospital } from "@/lib/hospital-data";

const nav = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctors", label: "Doctors & Staff", icon: Stethoscope },
  { to: "/pharmacy", label: "Pharmacy", icon: Pill },
  { to: "/emergency", label: "Emergency", icon: Siren },
  { to: "/ambulances", label: "Ambulances", icon: Ambulance },
  { to: "/reports", label: "Reports & Handoffs", icon: FileText },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 z-30 flex shrink-0 flex-col gap-1 bg-sidebar px-3 py-4 text-sidebar-foreground lg:h-screen lg:w-64">
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">HospitalOS</p>
            <p className="text-[11px] text-sidebar-foreground/60">{hospital.branch}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden rounded-lg border border-sidebar-border p-3 lg:block">
          <p className="text-xs font-semibold">Emergency hotline</p>
          <p className="font-mono text-sm text-sidebar-primary">+1 555 0198 · ext 2</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, MRN, beds…" className="w-64 pl-9" />
          </div>
          <Button variant="outline" size="icon" aria-label="Voice assistant" onClick={() => window.dispatchEvent(new Event('start-speech-recognition'))}>
            <Mic className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          {actions}
        </header>

        <main className="flex-1 space-y-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function StatusDot({ tone }: { tone: string }) {
  const map: Record<string, string> = {
    critical: "bg-critical",
    warning: "bg-warning",
    stable: "bg-success",
    info: "bg-primary",
  };
  return <span className={`inline-block size-2 rounded-full ${map[tone] ?? "bg-muted-foreground"}`} />;
}

export function ToneBadge({ tone, children }: { tone: string; children: ReactNode }) {
  const map: Record<string, string> = {
    critical: "bg-critical/12 text-critical",
    warning: "bg-warning/20 text-warning-foreground",
    stable: "bg-success/15 text-success",
    info: "bg-primary/12 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        map[tone] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
