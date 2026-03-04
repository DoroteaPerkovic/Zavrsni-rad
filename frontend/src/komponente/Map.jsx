import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
//import "leaflet-defaulticon-compatibility"; // popravlja default marker

function Map(){
  return (
    <MapContainer
      center={[45.815, 15.978]} // početna pozicija (Zagreb)
      zoom={13}                  // početni zoom
      style={{ height: "70vh", width: "100%" }} // veličina karte
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap tile
        attribution="&copy; OpenStreetMap contributors"           // kredit autorima karte
      />
    </MapContainer>
  );
};

export default Map;