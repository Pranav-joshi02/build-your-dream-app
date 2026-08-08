import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { handoffs, reports } from "@/lib/hospital-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Handoffs — HospitalOS" },
      {
        name: "description",
        content: "Diagnostic report queue and AI-generated shift handoff summaries awaiting clinician review.",
      },
      { property: "og:title", content: "Reports & Handoffs — HospitalOS" },
      { property: "og:description", content: "Review lab results and structured shift-to-shift handoff summaries." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell
      title="Reports & Handoffs"
      subtitle="Diagnostics queue and AI shift summaries"
      actions={<Button size="sm">Generate handoff</Button>}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel overflow-x-auto p-4">
          <h2 className="text-sm font-semibold">Diagnostic reports</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Report</th>
                <th className="py-2 font-medium">Patient</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/50">
                  <td className="py-2.5 font-mono text-xs">{r.id}</td>
                  <td className="py-2.5 font-medium">{r.patient}</td>
                  <td className="py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="py-2.5">
                    <ToneBadge tone={r.flag}>
                      <StatusDot tone={r.flag} />
                      {r.status}
                    </ToneBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          {handoffs.map((h) => (
            <div key={h.patient} className="panel p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">{h.patient}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {h.from} → {h.to}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{h.summary}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm">Approve &amp; send</Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
