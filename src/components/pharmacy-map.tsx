import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function PharmacyMap() {
  return (
    <MapContainer center={[21.1458, 79.0882]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[21.1458, 79.0882]}>
        <Popup>
          Central Pharmacy (Sitabuldi) <br /> Stock Level: Normal
        </Popup>
      </Marker>
      <Marker position={[21.1702, 79.0588]}>
        <Popup>
          North Branch Pharmacy (Sadar) <br /> Stock Level: Critical
        </Popup>
      </Marker>
      <Marker position={[21.1245, 79.1100]}>
        <Popup>
          South Branch Pharmacy (Dhantoli) <br /> Stock Level: Normal
        </Popup>
      </Marker>
    </MapContainer>
  );
}
