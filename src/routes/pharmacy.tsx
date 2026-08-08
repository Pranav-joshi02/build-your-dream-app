import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { AppShell, StatusDot, ToneBadge } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { inventory } from "@/lib/hospital-data";
import { TransferForm, RecentTransfers } from "@/components/forms/transfer-form";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { title: "Pharmacy Network — HospitalOS" },
      {
        name: "description",
        content: "Medicine stock levels across central and branch pharmacies with reorder thresholds and alerts.",
      },
      { property: "og:title", content: "Pharmacy Network — HospitalOS" },
      { property: "og:description", content: "Monitor critical medicine inventory across every hospital branch." },
    ],
  }),
  component: PharmacyPage,
});

interface TransferRecord {
  id: string;
  medicine: string;
  from: string;
  to: string;
  quantity: number;
  priority: "urgent" | "normal";
  timestamp: Date;
  smsOk: boolean;
  emailOk: boolean;
}

function PharmacyPage() {
  const criticalItems = inventory.filter((i) => i.status === "critical");
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  const handleTransferComplete = (record: TransferRecord) => {
    setTransfers((prev) => [record, ...prev]);
  };

  return (
    <AppShell
      title="Pharmacy Network"
      subtitle="Central, North branch and South branch inventory"
      actions={<TransferForm onTransferComplete={handleTransferComplete} />}
    >
      {criticalItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-critical/30 bg-critical/8 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-critical" />
          <div>
            <p className="text-sm font-semibold text-critical">
              {criticalItems.length} items below critical threshold
            </p>
            <p className="text-xs text-muted-foreground">
              {criticalItems.map((i) => i.drug).join(" · ")} — transfer or reorder required today.
            </p>
          </div>
        </div>
      )}

      <div className="my-4 h-64 w-full rounded-xl overflow-hidden border z-0 relative">
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[51.505, -0.09]}>
            <Popup>
              Central Pharmacy <br /> Stock Level: Normal
            </Popup>
          </Marker>
          <Marker position={[51.515, -0.1]}>
            <Popup>
              North Branch Pharmacy <br /> Stock Level: Critical
            </Popup>
          </Marker>
          <Marker position={[51.495, -0.08]}>
            <Popup>
              Ambulance A1 <br /> En route to Central
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="panel overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 font-medium">Medicine</th>
              <th className="py-2 font-medium">Central</th>
              <th className="py-2 font-medium">North</th>
              <th className="py-2 font-medium">South</th>
              <th className="py-2 font-medium">Total vs reorder</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => {
              const total = i.main + i.north + i.south;
              const pct = Math.min(100, Math.round((total / (i.reorder * 3)) * 100));
              return (
                <tr key={i.drug} className="border-t border-border hover:bg-muted/50">
                  <td className="py-3 font-medium">{i.drug}</td>
                  <td className="py-3 font-mono text-muted-foreground">{i.main}</td>
                  <td className="py-3 font-mono text-muted-foreground">{i.north}</td>
                  <td className="py-3 font-mono text-muted-foreground">{i.south}</td>
                  <td className="w-56 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {total}/{i.reorder}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <ToneBadge tone={i.status}>
                      <StatusDot tone={i.status} />
                      {i.status}
                    </ToneBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Transfers */}
      <RecentTransfers transfers={transfers} />
    </AppShell>
  );
}
