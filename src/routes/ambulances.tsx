import { createFileRoute } from "@tanstack/react-router";
import { Ambulance as AmbulanceIcon } from "lucide-react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ambulances } from "@/lib/hospital-data";

export const Route = createFileRoute("/ambulances")({
  head: () => ({
    meta: [
      { title: "Ambulance Fleet — HospitalOS" },
      {
        name: "description",
        content: "Ambulance fleet tracking with crew assignment, current state, destination and estimated arrival.",
      },
      { property: "og:title", content: "Ambulance Fleet — HospitalOS" },
      { property: "og:description", content: "Track every ambulance unit, crew and ETA in real time." },
    ],
  }),
  component: AmbulancesPage,
});

function AmbulancesPage() {
  return (
    <AppShell
      title="Ambulance Fleet"
      subtitle={`${ambulances.length} units · ${ambulances.filter((a) => a.state === "Available").length} available`}
      actions={<Button size="sm">Dispatch unit</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ambulances.map((a) => (
          <div key={a.unit} className="panel p-4">
            <div className="flex items-center justify-between">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <AmbulanceIcon className="size-5" />
              </div>
              <ToneBadge tone={a.severity}>
                <StatusDot tone={a.severity} />
                {a.state}
              </ToneBadge>
            </div>
            <p className="mt-3 font-mono text-lg font-bold">{a.unit}</p>
            <p className="text-xs text-muted-foreground">{a.crew}</p>
            <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium">{a.destination}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">ETA</span>
                <span className="font-mono font-medium">{a.eta}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="panel p-4">
        <h2 className="text-sm font-semibold">Dispatch log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex gap-3 border-b border-border pb-2">
            <span className="font-mono text-xs text-muted-foreground">07:42</span>
            <span>AMB-01 dispatched to Kingsway &amp; 3rd — multi-vehicle collision.</span>
          </li>
          <li className="flex gap-3 border-b border-border pb-2">
            <span className="font-mono text-xs text-muted-foreground">07:31</span>
            <span>AMB-04 transporting cardiac arrest patient to Resus 2.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted-foreground">07:05</span>
            <span>AMB-09 out of service for decontamination at North Branch.</span>
          </li>
        </ul>
      </div>
    </AppShell>
  );
}
