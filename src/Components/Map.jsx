import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// fix the default Leaflet icon bug in React - otherwise it feels like a watermark on top of the map
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// now updates the TEMPORARY pin state instead of fetching immediately
function MapEvents({ setTempMarker }) {
  useMapEvents({
    click(e) {
      setTempMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 11, { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function Map({ lat, lon, onLocationSelect, onClose }) {
  const initialPosition = [lat || 51.505, lon || -0.09];
  
  // state to track where the user clicks before confirming, cause otherwise it fetches with no animation of where the user chose
  const [tempMarker, setTempMarker] = useState(initialPosition);

  return (
    <div className="mapOverlay">
      <div className="mapContainerBox">
        
        <div className="mapHeader">
          <div className="mapTip">📍 Drop a pin, then confirm below</div>
          <button className="mapCloseBtn" onClick={onClose}>×</button>
        </div>
        
        <div className="mapWrapper" style={{ position: "relative" }}>
          <MapContainer center={initialPosition} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* marker  follows the tempMarker state */}
            <Marker position={tempMarker} />
            <MapEvents setTempMarker={setTempMarker} />
            <RecenterMap lat={initialPosition[0]} lon={initialPosition[1]} />
          </MapContainer>

          {/* new confirm button floating at the bottom of the map */}
          <div className="mapConfirmArea">
            <button 
              className="actionButton confirmPinBtn" 
              onClick={() => onLocationSelect(tempMarker[0], tempMarker[1])}
            >
              Confirm Location
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}