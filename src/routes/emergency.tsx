import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ambulances, emergencies } from "@/lib/hospital-data";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Command — HospitalOS" },
      {
        name: "description",
        content: "Live emergency cases, trauma bay assignment, responding units and escalation timers.",
      },
      { property: "og:title", content: "Emergency Command — HospitalOS" },
      { property: "og:description", content: "Coordinate patients, ambulances, bays and emergency teams in one view." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  return (
    <AppShell
      title="Emergency Command"
      subtitle={`${emergencies.length} active cases · ${ambulances.filter((a) => a.state === "Available").length} units free`}
      actions={
        <Button size="sm" variant="destructive">
          Declare incident
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {emergencies.map((e) => (
            <div
              key={e.code}
              className={`panel p-4 ${e.severity === "critical" ? "border-critical/40" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusDot tone={e.severity} />
                    <p className="font-semibold">{e.type}</p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {e.code} · {e.patients} patient(s) · opened {e.since} ago
                  </p>
                </div>
                <ToneBadge tone={e.severity}>{e.severity}</ToneBadge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Responding unit</p>
                  <p className="text-sm font-semibold">{e.unit}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Bay</p>
                  <p className="text-sm font-semibold">{e.bay}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Elapsed</p>
                  <p className="font-mono text-sm font-semibold">{e.since}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  Assign bay
                </Button>
                <Button size="sm" variant="outline">
                  Page team
                </Button>
                <Button size="sm" variant="outline">
                  Close case
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="panel h-fit p-4">
          <h2 className="text-sm font-semibold">Fleet status</h2>
          <ul className="mt-3 space-y-3">
            {ambulances.map((a) => (
              <li key={a.unit} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">
                    {a.unit} · <span className="text-muted-foreground">{a.crew}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.state} — {a.destination}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{a.eta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
