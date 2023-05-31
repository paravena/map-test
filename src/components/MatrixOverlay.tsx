import './Markers.css';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import {
  calculateNumberOfRowsAndColumnsByZoomLevel,
  generateRectangles,
  Rectangle,
} from './utilities';

function createOverlay(map: google.maps.Map, rec: Rectangle) {
  const overlay = new google.maps.OverlayView();
  // Create a custom overlay with centered text
  overlay.draw = function () {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(rec.sw);
    const ne = overlayProjection.fromLatLngToDivPixel(rec.ne);
    // @ts-ignore
    const div = (this.div = document.createElement('div'));
    if (ne && sw) {
      div.style.position = 'absolute';
      div.style.width = ne.x - sw.x + 'px';
      div.style.height = sw.y - ne.y + 'px';
      div.style.left = sw.x + 'px';
      div.style.top = ne.y + 'px';
    }
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // Adjust background color and opacity as needed
    div.style.color = 'black'; // Adjust text color as needed
    div.style.fontFamily = 'Arial, sans-serif'; // Adjust font family as needed
    div.style.fontSize = '16px'; // Adjust font size as needed
    div.style.fontWeight = 'bold'; // Adjust font weight as needed
    div.style.pointerEvents = 'none'; // Make sure the overlay doesn't interfere with map interactions
    div.style.border = 'solid 1px red';
    // Specify the text content
    div.textContent = 'Centered Text';
    this.getPanes()?.markerLayer.appendChild(div);
  };
  overlay.onRemove = function () {
    // @ts-ignore
    // const div = this.div;
    // if (div) {
    //   (div.parentNode as HTMLElement).removeChild(div);
    // }
  };

  overlay.setMap(map);
  return overlay;
}
const MatrixOverlay = () => {
  return (
    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}>
      <MatrixMap />
    </Wrapper>
  );
};

const mapOptions: google.maps.MapOptions = {
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 6,
  disableDefaultUI: true,
  maxZoom: 9,
  minZoom: 0,
};

const MatrixMap = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const overlays = useRef<google.maps.OverlayView[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const idleMapListener = useCallback(async () => {
    if (!map) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const ne = bounds?.getNorthEast();
    const sw = bounds?.getSouthWest();

    await Promise.all(
      overlays.current.map(overlay => {
        // overlay?.onRemove();
        return overlay?.setMap(null);
      }),
    );

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
      overlays.current = newRectangles.map(rec => createOverlay(map, rec));
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

export default MatrixOverlay;
