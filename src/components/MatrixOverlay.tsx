import './Markers.css';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import {
  calculateNumberOfRowsAndColumnsByZoomLevel,
  generateRectangles,
  Rectangle,
} from './utilities';

class CounterOverlay extends google.maps.OverlayView {
  private readonly div: HTMLDivElement;
  constructor(private map: google.maps.Map, private rec: Rectangle) {
    super();
    this.div = document.createElement('div');
  }

  onAdd() {
    this.div.style.position = 'absolute';
    const panes = this.getPanes()!;
    panes.overlayLayer.appendChild(this.div);
  }
  draw() {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(this.rec.sw);
    const ne = overlayProjection.fromLatLngToDivPixel(this.rec.ne);
    if (ne && sw) {
      this.div.style.position = 'absolute';
      this.div.style.width = ne.x - sw.x + 'px';
      this.div.style.height = sw.y - ne.y + 'px';
      this.div.style.left = sw.x + 'px';
      this.div.style.top = ne.y + 'px';
    }
    this.div.style.display = 'flex';
    this.div.style.justifyContent = 'center';
    this.div.style.alignItems = 'center';
    this.div.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    this.div.style.color = 'black';
    this.div.style.fontFamily = 'Arial, sans-serif';
    this.div.style.fontSize = '16px';
    this.div.style.fontWeight = 'bold';
    this.div.style.pointerEvents = 'none';
    this.div.style.border = 'solid 1px red';
    // Specify the text content
    this.div.textContent = 'Centered Text';
  }

  onRemove() {
    if (this.div) {
      (this.div.parentNode as HTMLElement).removeChild(this.div);
    }
  }
}

function createOverlay(map: google.maps.Map, rec: Rectangle) {
  const overlay = new CounterOverlay(map, rec);
  overlay.setMap(map);
  return overlay;
}
const MatrixOverlay = () => {
  return (
    <Wrapper
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={['marker']}
      version="beta"
    >
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
