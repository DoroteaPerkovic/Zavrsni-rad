import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
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
  const [algoritam, setAlgoritam] = useState("astar");
  const [startStop, setStartStop] = useState(null);
  const [endStop, setEndStop] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  const fetchRoute = async () => {
    if (!startStop || !endStop) {
      alert("Molimo odaberite polazište i odredište putem markera na karti.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/ruta?start=${startStop.stop_id}&end=${endStop.stop_id}&alg=${algoritam}`,
      );
      const data = await response.json();

      if (data.status === "success") {
        const coords = data.putanja.map((s) => [
          parseFloat(s.lat),
          parseFloat(s.lon),
        ]);
        setRoutePath(coords);
      } else {
        alert("Nema pronađenog puta: " + (data.message || "Nepoznata greška"));
      }
    } catch (err) {
      console.error("Greška pri dohvaćanju rute:", err);
    }
  };

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
      const filtered = allStops.filter((stop) =>
        stop.stop_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setSearchResults(filtered.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, tramStops, busStops]);

  return (
    <div>
      <div
        style={{
          padding: "10px",
          background: "#f0f0f0",
          borderBottom: "1px solid #ccc",
        }}
      >
        <input
          type="text"
          placeholder="Pretraži stanicu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ marginTop: "5px" }}>
          <strong>Početak:</strong>{" "}
          {startStop ? startStop.stop_name : "Odaberi na karti"} |
          <strong> Cilj:</strong>{" "}
          {endStop ? endStop.stop_name : "Odaberi na karti"}

          <select
            value={algoritam}
            onChange={(e) => setAlgoritam(e.target.value)}
            style={{ marginLeft: "15px", padding: "5px" }}
          >
            <option value="astar">A* ()</option>
            <option value="ucs">UCS ()</option>
            <option value="bfs">BFS ()</option>
          </select>
          <button onClick={fetchRoute}>Pronađi rutu</button>
          
          <button
            onClick={() => {
              setRoutePath([]);
              setStartStop(null);
              setEndStop(null);
            }}
          >
            Očisti
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul
            style={{
              position: "absolute",
              zIndex: 1000,
              background: "white",
              width: "200px",
            }}
          >
            {searchResults.map((stop) => (
              <li
                key={stop.stop_id}
                onClick={() => {
                  setSelectedStop(stop);
                  setSearchTerm("");
                }}
                style={{
                  cursor: "pointer",
                  padding: "5px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {stop.stop_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapContainer
        center={[45.815, 15.978]}
        zoom={13}
        style={{ height: "70vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <SearchHandler selectedStop={selectedStop} />
        <RecenterButton />

        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="blue"
            weight={5}
            opacity={0.7}
          />
        )}

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {showTram &&
            tramStops.map((stop) => (
              <Marker
                key={"tram-" + stop.stop_id}
                position={[
                  parseFloat(stop.stop_lat),
                  parseFloat(stop.stop_lon),
                ]}
                icon={tramIcon}
              >
                <Popup>
                  <strong>{stop.stop_name}</strong> <br />
                  <button onClick={() => setStartStop(stop)}>
                    Postavi kao početak
                  </button>
                  <br />
                  <button
                    onClick={() => setEndStop(stop)}
                    style={{ marginTop: "5px" }}
                  >
                    Postavi kao cilj
                  </button>
                </Popup>
              </Marker>
            ))}
          {showBus &&
            busStops.map((stop) => (
              <Marker
                key={"bus-" + stop.stop_id}
                position={[
                  parseFloat(stop.stop_lat),
                  parseFloat(stop.stop_lon),
                ]}
                icon={busIcon}
              >
                <Popup>
                  <strong>{stop.stop_name}</strong> <br />
                  <button onClick={() => setStartStop(stop)}>
                    Postavi kao početak
                  </button>
                  <br />
                  <button
                    onClick={() => setEndStop(stop)}
                    style={{ marginTop: "5px" }}
                  >
                    Postavi kao cilj
                  </button>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setShowTram((prev) => !prev)}>
          Tramvajske stanice
        </button>
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => setShowBus((prev) => !prev)}
        >
          Stanice za bus
        </button>
      </div>
    </div>
  );
}

export default Map;
