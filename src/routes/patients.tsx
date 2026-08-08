import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState } from "react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { patients, vitals } from "@/lib/hospital-data";
import { BodyDiagram } from "@/components/body-diagram";
import { DischargeForm } from "@/components/forms/discharge-form";
import { CheckupForm } from "@/components/forms/checkup-form";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — HospitalOS" },
      {
        name: "description",
        content: "Admitted patient roster with ward, treating clinician, condition and live vitals monitoring.",
      },
      { property: "og:title", content: "Patients — HospitalOS" },
      { property: "og:description", content: "Search the patient roster and review timelines, vitals and care teams." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT-10243");
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleEmailReport = async () => {
    // Mock Brevo Integration
    console.log(`Sending email via Brevo to ${selectedPatient.name}...`);
    alert(`Report and prescription emailed to ${selectedPatient.name} via Brevo!`);
  };

  return (
    <AppShell
      title="Patients"
      subtitle={`${patients.length} admitted patients across 7 wards`}
      actions={<Button size="sm">Admit patient</Button>}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="panel overflow-x-auto p-4 xl:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Patient</th>
                <th className="py-2 font-medium">Age/Sex</th>
                <th className="py-2 font-medium">Ward</th>
                <th className="py-2 font-medium">Clinician</th>
                <th className="py-2 font-medium">Condition</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr 
                  key={p.id} 
                  className={`border-t border-border hover:bg-muted/50 cursor-pointer ${selectedPatientId === p.id ? "bg-muted/80" : ""}`}
                  onClick={() => setSelectedPatientId(p.id)}
                >
                  <td className="py-2.5">
                    <p className="font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.id} · adm {p.admitted}</p>
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {p.age} · {p.sex}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{p.ward}</td>
                  <td className="py-2.5 text-muted-foreground">{p.doctor}</td>
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

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Focus patient</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEmailReport}>Email Report (Brevo)</Button>
                <DischargeForm patient={selectedPatient} />
                <CheckupForm patient={selectedPatient} />
              </div>
            </div>
            <h2 className="mt-1 text-lg font-bold">{selectedPatient.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedPatient.age}{selectedPatient.sex} · {selectedPatient.ward} · {selectedPatient.condition}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { k: "HR", v: "86" },
                { k: "SpO₂", v: "97%" },
                { k: "Temp", v: "37.2" },
              ].map((m) => (
                <div key={m.k} className="rounded-lg bg-muted/60 p-2">
                  <dt className="text-[11px] text-muted-foreground">{m.k}</dt>
                  <dd className="font-mono text-base font-semibold">{m.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ left: -22, right: 6, top: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="hr" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spo2" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="text-sm font-semibold">Affected Areas</h2>
            <BodyDiagram condition={selectedPatient.condition} />
          </div>

          <div className="panel p-4">
            <h2 className="text-sm font-semibold">AI patient summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Admitted Aug 6 with fever and hypotension. Blood cultures growing gram-negative rods. Lactate
              trending down 4.8 → 2.1 over 24h. Currently weaning norepinephrine. No documented allergies.
              Renal function stable; recheck creatinine at 06:00.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Regenerate summary
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
