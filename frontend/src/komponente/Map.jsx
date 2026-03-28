import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pin_blue from "../assets/pin_blue.png";
import pin_yellow from "../assets/pin_yellow.png";
import RecenterButton from "./RecenterButton";
import MarkerClusterGroup from "react-leaflet-cluster";
import SearchHandler from "./Search";

const tramIcon = new L.Icon({
  iconUrl: pin_blue,
  iconSize: [25, 40],
  iconAnchor: [5, 40],
});

const busIcon = new L.Icon({
  iconUrl: pin_yellow,
  iconSize: [25, 40],
  iconAnchor: [5, 40],
});

function Map() {
  const [tramStops, setTramStops] = useState([]);
  const [busStops, setBusStops] = useState([]);

  const [showTram, setShowTram] = useState(true);
  const [showBus, setShowBus] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);  

  useEffect(() => {
    async function fetchTramStops() {
      try {
        const response = await fetch("http://localhost:5000/gtfs/stops/tram");
        const data = await response.json();
        setTramStops(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTramStops();
  }, []);

  useEffect(() => {
    async function fetchBusStops() {
      try {
        const response = await fetch("http://localhost:5000/gtfs/stops/bus");
        const data = await response.json();
        setBusStops(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchBusStops();
  }, []);

  useEffect(() => {
  if (searchTerm.length > 1) {
    const allStops = [...tramStops, ...busStops];
    const filtered = allStops.filter(stop =>
      stop.stop_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 10)); 
  } else {
    setSearchResults([]);
  }
}, [searchTerm, tramStops, busStops]);

  return (
    <div>
      <div>
        <div>
          <input
            type="text"
            placeholder="Pretraži stanicu (npr. Črnomerec)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchResults.length > 0 && (
            <ul>
              {searchResults.map((stop) => (
                <li 
                  key={stop.stop_id} 
                  onClick={() => {
                    setSelectedStop(stop);
                    setSearchTerm(""); 
                  }}
                  
                >
                  {stop.stop_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <MapContainer
        center={[45.815, 15.978]}
        zoom={15}
        style={{ height: "70vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <SearchHandler selectedStop={selectedStop} />
        <RecenterButton />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {showTram && tramStops.map((stop) => (
            <Marker
              key={"tram-" + stop.stop_id}
              position={[parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)]}
              icon={tramIcon}
            >
              <Popup>{stop.stop_name}</Popup>
            </Marker>
          ))}
          {showBus && busStops.map((stop) => (
            <Marker
              key={"bus-" + stop.stop_id}
              position={[parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)]}
              icon={busIcon}
            >
              <Popup>{stop.stop_name}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setShowTram((prev) => !prev)}>Tramvajske stanice</button>
        <button style={{ marginLeft: "10px" }} onClick={() => setShowBus((prev) => !prev)}>Stanice za bus</button>
      </div>
    </div>
  );
}

export default Map;
