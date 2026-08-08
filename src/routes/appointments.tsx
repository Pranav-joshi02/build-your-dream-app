import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { appointments } from "@/lib/hospital-data";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — HospitalOS" },
      {
        name: "description",
        content: "Today's outpatient queue with check-in state, department, clinician and appointment type.",
      },
      { property: "og:title", content: "Appointments — HospitalOS" },
      { property: "og:description", content: "Coordinate today's clinic queue and patient check-ins." },
    ],
  }),
  component: AppointmentsPage,
});

const statusStyle: Record<string, string> = {
  "Checked in": "bg-success/15 text-success",
  Waiting: "bg-warning/20 text-warning-foreground",
  "In progress": "bg-primary/12 text-primary",
  Scheduled: "bg-muted text-muted-foreground",
  Cancelled: "bg-critical/12 text-critical",
};

function AppointmentsPage() {
  const counts = appointments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell
      title="Appointments"
      subtitle="Saturday, 8 August · outpatient queue"
      actions={<Button size="sm">New appointment</Button>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {["Checked in", "Waiting", "In progress", "Scheduled", "Cancelled"].map((s) => (
          <div key={s} className="panel p-4">
            <p className="text-xs font-medium text-muted-foreground">{s}</p>
            <p className="stat-value mt-1">{counts[s] ?? 0}</p>
          </div>
        ))}
      </section>

      <div className="panel overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 font-medium">Time</th>
              <th className="py-2 font-medium">Patient</th>
              <th className="py-2 font-medium">Clinician</th>
              <th className="py-2 font-medium">Department</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/50">
                <td className="py-2.5 font-mono">{a.time}</td>
                <td className="py-2.5 font-medium">{a.patient}</td>
                <td className="py-2.5 text-muted-foreground">{a.doctor}</td>
                <td className="py-2.5 text-muted-foreground">{a.dept}</td>
                <td className="py-2.5 text-muted-foreground">{a.type}</td>
                <td className="py-2.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[a.status] ?? "bg-muted"}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <Button variant="outline" size="sm">
                    Check in
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
