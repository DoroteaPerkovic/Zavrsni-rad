import React from "react";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

function SearchHandler({ selectedStop }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStop) {
      map.flyTo([parseFloat(selectedStop.stop_lat), parseFloat(selectedStop.stop_lon)], 17);
    }
  }, [selectedStop, map]);
  return null;
}
export default SearchHandler;