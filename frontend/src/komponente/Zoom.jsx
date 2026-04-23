import { useMap } from "react-leaflet";
import { useEffect } from "react";

function ZoomHandler({ onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    };

    map.on("zoomend", handleZoom);

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

export default ZoomHandler;