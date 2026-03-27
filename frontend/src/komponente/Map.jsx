import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const [stops, setStops] = useState([]);

  useEffect(() => {
    async function fetchStops() {
      try {
        const response = await fetch("http://localhost:5000/gtfs/stops");
        const data = await response.json();
        setStops(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchStops();
  }, []);


  return (
    <MapContainer
      center={[45.815, 15.978]}
      zoom={15}
      style={{ height: "70vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {stops.map((stop) => (
        <Marker
          key={stop.stop_id}
          position={[
            parseFloat(stop.stop_lat),
            parseFloat(stop.stop_lon),
          ]}
        >
          <Popup>{stop.stop_name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;