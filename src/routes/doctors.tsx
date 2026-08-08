import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { doctors } from "@/lib/hospital-data";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors & Staff — HospitalOS" },
      {
        name: "description",
        content: "Clinician roster with live availability, patient load, next slot and department assignment.",
      },
      { property: "og:title", content: "Doctors & Staff — HospitalOS" },
      { property: "og:description", content: "Track clinician availability and workload across departments." },
    ],
  }),
  component: DoctorsPage,
});

const availStyle: Record<string, string> = {
  Available: "bg-success/15 text-success",
  "In surgery": "bg-warning/20 text-warning-foreground",
  "Off shift": "bg-muted text-muted-foreground",
};

function DoctorsPage() {
  return (
    <AppShell
      title="Doctors & Staff"
      subtitle={`${doctors.filter((d) => d.availability === "Available").length} clinicians available now`}
      actions={<Button size="sm">Add clinician</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((d) => (
          <div key={d.name} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.dept}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${availStyle[d.availability] ?? "bg-muted"}`}
              >
                {d.availability}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-[11px] text-muted-foreground">Patients</dt>
                <dd className="font-mono text-base font-semibold">{d.patients}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-[11px] text-muted-foreground">Next</dt>
                <dd className="font-mono text-base font-semibold">{d.next}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-[11px] text-muted-foreground">Rating</dt>
                <dd className="flex items-center justify-center gap-1 font-mono text-base font-semibold">
                  <Star className="size-3.5 fill-warning text-warning" />
                  {d.rating}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Schedule
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Handoff
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
