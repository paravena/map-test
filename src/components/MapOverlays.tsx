import './Markers.css';
import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { generateRectangles, Rectangle } from './utilities';
import CounterOverlay from './CounterOverlayReact';

const LIBRARIES: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'geometry',
];
const MIN_ZOOM = 2;
const MAX_ZOOM = 18;

const mapOptions: google.maps.MapOptions = {
  center: { lat: 0, lng: 0 },
  zoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  streetViewControl: false,
};

const MapOverlays = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  const handleIdle = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    if (bounds && zoom !== undefined) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const newRects = generateRectangles(
        zoom,
        ne.lat(),
        ne.lng(),
        sw.lat(),
        sw.lng(),
      );
      setRectangles(newRects);
    }
  }, [map]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;
  if (!apiKey) return <div>Missing Google Maps API Key in .env file</div>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={mapOptions}
        onLoad={setMap}
        onIdle={handleIdle}
      >
        {map &&
          rectangles.map((rec, index) => (
            <CounterOverlay
              key={`${rec.ne.lat}-${rec.ne.lng}-${index}`}
              map={map}
              rec={rec}
              index={index}
            />
          ))}
      </GoogleMap>
    </div>
  );
};

export default MapOverlays;
