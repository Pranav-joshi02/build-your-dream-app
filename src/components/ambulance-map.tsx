import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ambulances } from "@/lib/hospital-data";

export default function AmbulanceMap() {
  return (
    <MapContainer center={[21.1458, 79.0882]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {ambulances.map((a, i) => (
        <Marker key={a.unit} position={[21.1458 + (i * 0.015 - 0.02), 79.0882 + (i * 0.02 - 0.03)]}>
          <Popup>
            <strong>{a.unit}</strong><br />
            Status: {a.state}<br />
            Destination: {a.destination}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
