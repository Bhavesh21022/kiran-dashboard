"use client";
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, useMap } from "react-leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Marker icon fix
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Ye component map ko programmatic tareeqe se zoom karne ke liye hai
function ZoomController({ myLocation, trigger }: { myLocation: any, trigger: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (trigger > 0 && myLocation) {
      map.flyTo([myLocation.lat, myLocation.lng], 13, { animate: true, duration: 1.5 });
    }
  }, [trigger, myLocation, map]);

  return null;
}

export default function MapView({ readings, onSelectLocation, myLocation, zoomTrigger }: any) {
  // Default map load hote time center India
  const center = [20.5937, 78.9629]; 

  return (
    <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative z-0">
      <MapContainer center={center as any} zoom={5} className="h-full w-full">
        
        {/* Ye zoom event catch karega */}
        <ZoomController myLocation={myLocation} trigger={zoomTrigger} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="🌍 Normal (Street)">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="🛰️ Satellite View">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="🌙 Dark Mode">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Live Location Marker (Blue Icon) */}
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={customIcon}>
            <Popup className="font-bold text-blue-600">📍 Your Exact Location</Popup>
          </Marker>
        )}

        {/* Database ke Danger Cities (Red/Orange Dots) */}
        {readings && readings.length > 0 && readings.map((city: any) => (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={9}
            pathOptions={{
              color: city.category === "Extreme" ? "#ef4444" : "#f97316", // Red for Extreme, Orange for High
              fillColor: city.category === "Extreme" ? "#ef4444" : "#f97316",
              fillOpacity: 0.9,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelectLocation(city.id),
            }}
          >
            <Popup className="font-bold text-black text-center">
               <span className="text-lg">{city.name}</span> <br/>
               Risk: {city.category} <br/>
               Temp: {city.tempC}°C
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}