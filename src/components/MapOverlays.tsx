import './Markers.css';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { generateRectangles, Rectangle } from './utilities';
import { CounterOverlay } from './CouterOverlay';

const MIN_ZOOM = 3;
const MAX_ZOOM = 8;

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
  zoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  scrollwheel: false,
  isFractionalZoomEnabled: true,
  // disableDefaultUI: true,
};

const MatrixMap = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const initNE = useRef<google.maps.LatLng>();
  const initSW = useRef<google.maps.LatLng>();
  const overlays = useRef<CounterOverlay[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const idleMapListener = useCallback(async () => {
    if (!map) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    let ne = bounds?.getNorthEast();
    let sw = bounds?.getSouthWest();

    // This fixes a weird problem
    if (!initNE.current && !initSW.current && zoom === MIN_ZOOM) {
      initNE.current = ne;
      initSW.current = sw;
    } else if (zoom === MIN_ZOOM) {
      ne = initNE.current;
      sw = initSW.current;
    }

    await Promise.all(overlays.current.map(overlay => overlay?.setMap(null)));

    if (zoom && ne && sw) {
      console.log(`Zoom ${zoom}, ne ${ne} sw ${sw}`);
      const newRectangles = generateRectangles(
        2,
        8,
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
