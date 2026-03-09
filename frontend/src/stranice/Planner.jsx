import React from "react";
import Map from "../komponente/Map.jsx";
import { useNavigate } from "react-router-dom";
import Logout from "../komponente/Logout.jsx";

function Planner() {
  return (
    <div>
      <Logout/>
      <div id="map">
        <Map />
      </div>
    </div>
  );
}

export default Planner;
