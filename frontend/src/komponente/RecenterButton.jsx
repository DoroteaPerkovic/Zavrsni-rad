import React from "react";
import { useMap } from "react-leaflet";

function RecenterButton() {
  const map = useMap();

  const handleRecenter = () => {
    const zagrebCoords = [45.815, 15.978];
    map.setView(zagrebCoords, 15, {
      animate: true,
    });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px", pointerEvents: "auto" }}>
      <button 
        onClick={handleRecenter}
        style={{
          padding: "8px 12px",
          backgroundColor: "white",
          border: "2px solid rgba(37, 37, 37, 0)",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 1000 
        }}
      >
        Centriraj na Zagreb
      </button>
    </div>
  );
}
export default RecenterButton;