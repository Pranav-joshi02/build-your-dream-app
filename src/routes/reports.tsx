import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, CheckCircle, FileText, Send } from "lucide-react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { handoffs, reports } from "@/lib/hospital-data";
import { NewReportForm } from "@/components/forms/new-report-form";
import { GenerateHandoffForm } from "@/components/forms/generate-handoff-form";

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
  const [reportList, setReportList] = useState(reports);
  const [handoffList, setHandoffList] = useState(
    handoffs.map((h, i) => ({ ...h, id: i, approved: false }))
  );

  const handleAddReport = (newReport: any) => {
    setReportList(prev => [newReport, ...prev]);
  };

  const handleAddHandoff = (newHandoff: any) => {
    setHandoffList(prev => [
      { ...newHandoff, id: prev.length },
      ...prev
    ]);
  };

  const handleApproveReport = (id: string) => {
    setReportList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "Signed-off", flag: "stable" as any } : r))
    );
  };

  const handleApproveHandoff = (id: number) => {
    setHandoffList(prev =>
      prev.map(h => (h.id === id ? { ...h, approved: true } : h))
    );
  };

  const handleEditHandoff = (id: number) => {
    const handoff = handoffList.find(h => h.id === id);
    if (!handoff) return;
    const newSummary = prompt(`Edit handoff summary for ${handoff.patient}:`, handoff.summary);
    if (newSummary !== null) {
      setHandoffList(prev =>
        prev.map(h => (h.id === id ? { ...h, summary: newSummary } : h))
      );
    }
  };

  return (
    <AppShell
      title="Reports & Handoffs"
      subtitle="Diagnostics queue and AI shift summaries"
      actions={
        <div className="flex items-center gap-2">
          <NewReportForm onAdd={handleAddReport} />
          <GenerateHandoffForm onAdd={handleAddHandoff} />
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Diagnostic Reports Table */}
        <div className="panel overflow-x-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Diagnostic reports ({reportList.filter(r => r.status !== "Signed-off").length} pending)
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Report ID</th>
                <th className="py-2 font-medium">Patient</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportList.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/50">
                  <td className="py-3 font-mono text-xs">{r.id}</td>
                  <td className="py-3 font-medium">{r.patient}</td>
                  <td className="py-3 text-muted-foreground">{r.type}</td>
                  <td className="py-3">
                    <ToneBadge tone={r.flag}>
                      <StatusDot tone={r.flag} />
                      {r.status}
                    </ToneBadge>
                  </td>
                  <td className="py-3 text-right">
                    {r.status !== "Signed-off" ? (
                      <Button 
                        size="xs" 
                        onClick={() => handleApproveReport(r.id)}
                        className="h-7 text-xs bg-success text-success-foreground hover:bg-success/90"
                      >
                        Sign-off
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium flex items-center justify-end gap-1">
                        <CheckCircle className="size-3.5 text-success" /> Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Handoff Summaries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Shift handoff summaries ({handoffList.filter(h => !h.approved).length} pending)
            </h2>
          </div>
          
          {handoffList.length === 0 ? (
            <div className="panel p-6 text-center text-sm text-muted-foreground">
              No shift handoffs generated. Click "Generate Handoff" to start.
            </div>
          ) : (
            handoffList.map((h) => (
              <div 
                key={h.id} 
                className={`panel p-4 border transition-all duration-200 ${h.approved ? "bg-muted/30 border-muted opacity-80" : "border-primary/10"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <h2 className="text-sm font-semibold">{h.patient}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {h.from} &rarr; {h.to}
                    </p>
                  </div>
                  {h.approved && (
                    <ToneBadge tone="stable">
                      <CheckCircle className="size-3.5" /> Approved & Sent
                    </ToneBadge>
                  )}
                </div>
                
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line bg-background/50 p-2.5 rounded-lg border border-border/40">
                  {h.summary}
                </p>
                
                {!h.approved && (
                  <div className="mt-3 flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditHandoff(h.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveHandoff(h.id)}
                      className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="size-3.5" />
                      Approve &amp; Send
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
