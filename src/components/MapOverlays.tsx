import './Markers.css';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import {
  calculateNumberOfRowsAndColumnsByZoomLevel,
  generateRectangles,
  Rectangle,
} from './utilities';
import { CounterOverlay } from './CouterOverlay';

function createOverlay(map: google.maps.Map, rec: Rectangle, index: number) {
  const overlay = new CounterOverlay(map, rec, index);
  overlay.setMap(map);
  return overlay;
}
const MapOverlays = () => {
  return (
    <Wrapper
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={[
        'marker',
        'places',
        'drawing',
        'visualization',
        'localContext',
      ]}
    >
      <MatrixMap />
    </Wrapper>
  );
};

const mapOptions: google.maps.MapOptions = {
  center: { lat: 0, lng: 0 },
  zoom: 3,
  maxZoom: 8,
  minZoom: 3,
  scrollwheel: false,
};

const MatrixMap = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const overlays = useRef<CounterOverlay[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const idleMapListener = useCallback(async () => {
    if (!map) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const ne = bounds?.getNorthEast();
    const sw = bounds?.getSouthWest();

    await Promise.all(overlays.current.map(overlay => overlay?.setMap(null)));

    if (zoom && ne && sw) {
      const [rows, columns] = calculateNumberOfRowsAndColumnsByZoomLevel(zoom);
      const newRectangles = generateRectangles(
        rows,
        columns,
        ne.lat(),
        ne.lng(),
        sw.lat(),
        sw.lng(),
      );
      overlays.current = newRectangles.map((rec, index) =>
        createOverlay(map, rec, index),
      );
    }
  }, [map]);

  useEffect(() => {
    if (ref.current) {
      setMap(new google.maps.Map(ref.current, mapOptions));
    }
  }, []);

  useEffect(() => {
    if (!map) return;
    const listener = google.maps.event.addListener(
      map,
      'idle',
      idleMapListener,
    );
    return () => listener.remove();
  }, [map, idleMapListener]);

  return (
    <>
      <div ref={ref as RefObject<HTMLDivElement>} id="map"></div>
    </>
  );
};

export default MapOverlays;
