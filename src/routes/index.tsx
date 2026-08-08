import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import {
  admissionsTrend,
  aiInsights,
  departmentLoad,
  emergencies,
  hospital,
  kpis,
  patients,
} from "@/lib/hospital-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — HospitalOS" },
      {
        name: "description",
        content:
          "Real-time hospital command center: occupancy, admissions, department load, emergencies and AI operational insights.",
      },
      { property: "og:title", content: "Command Center — HospitalOS" },
      {
        property: "og:description",
        content: "Unified hospital operations dashboard with clinical, pharmacy and emergency coordination.",
      },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const occupancy = Math.round((hospital.beds.occupied / hospital.beds.total) * 100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppShell title="Command Center" subtitle={`${hospital.name} · live operational overview`}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <StatusDot tone={k.tone} />
              {k.label}
            </div>
            <p className="stat-value mt-2">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel p-4 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Admissions vs discharges</h2>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="mt-4 h-64">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={admissionsTrend} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="adm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="var(--color-chart-1)"
                    fill="url(#adm)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="discharges"
                    stroke="var(--color-chart-2)"
                    fill="url(#dis)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="panel space-y-4 p-4">
          <h2 className="text-sm font-semibold">Capacity</h2>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>All beds</span>
              <span className="font-mono">
                {hospital.beds.occupied}/{hospital.beds.total}
              </span>
            </div>
            <Progress value={occupancy} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ICU beds</span>
              <span className="font-mono">
                {hospital.beds.icuOccupied}/{hospital.beds.icu}
              </span>
            </div>
            <Progress
              value={Math.round((hospital.beds.icuOccupied / hospital.beds.icu) * 100)}
              className="mt-2"
            />
          </div>
          <div className="h-40">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentLoad} layout="vertical" margin={{ left: 12, right: 8 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={78} tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="load" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel p-4 xl:col-span-2">
          <h2 className="text-sm font-semibold">Patients needing attention</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 font-medium">Patient</th>
                  <th className="py-2 font-medium">Ward</th>
                  <th className="py-2 font-medium">Condition</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{p.ward}</td>
                    <td className="py-2.5 text-muted-foreground">{p.condition}</td>
                    <td className="py-2.5">
                      <ToneBadge tone={p.status}>
                        <StatusDot tone={p.status} />
                        {p.status}
                      </ToneBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">AI operations digest</h2>
            </div>
            <ul className="mt-3 space-y-3">
              {aiInsights.map((i) => (
                <li key={i.title} className="rounded-lg bg-muted/60 p-3">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={i.tone} />
                    <p className="text-sm font-semibold">{i.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{i.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-4">
            <h2 className="text-sm font-semibold">Live emergencies</h2>
            <ul className="mt-3 space-y-2.5">
              {emergencies.slice(0, 3).map((e) => (
                <li key={e.code} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{e.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.bay} · {e.unit} · {e.since} ago
                    </p>
                  </div>
                  <ToneBadge tone={e.severity}>{e.severity}</ToneBadge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
