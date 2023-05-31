import './Markers.css';
import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { createRoot, Root } from 'react-dom/client';

function calculateNumberOfRowsAndColumnsByZoomLevel(zoom: number) {
  if (zoom >= 0 && zoom < 2) {
    return [3, 4];
  } else if (zoom >= 2 && zoom < 4) {
    return [2, 4];
  } else if (zoom >= 4 && zoom < 7) {
    return [2, 2];
  }
  return [1, 1];
}

type Rectangle = {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
};

function generateRectangles(
  rows: number,
  columns: number,
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number,
): Rectangle[] {
  const latDiff = Math.abs(neLat - swLat);
  const lngDiff = Math.abs(neLng - swLng);
  const rectWidth = latDiff / rows;
  const rectHeight = lngDiff / columns;

  const rectangles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const rectNE = {
        lat: neLat - row * rectWidth,
        lng: neLng - col * rectHeight,
      };
      const rectSW = {
        lat: rectNE.lat - rectWidth,
        lng: rectNE.lng - rectHeight,
      };

      rectangles.push({
        ne: rectNE,
        sw: rectSW,
      });
    }
  }

  return rectangles;
}

function createMarker(
  map: google.maps.Map,
  rectangle: google.maps.Rectangle,
  index: number,
) {
  const bounds = rectangle.getBounds();
  const center = bounds?.getNorthEast();
  console.log({ lat: center?.lat() || 0, lng: center?.lng() || 0 });
  return new google.maps.Marker({
    position: { lat: center?.lat() || 0, lng: center?.lng() || 0 },
    map: map,
    label: {
      text: `${index} Marker`,
      color: 'black',
      fontSize: '24px',
      fontWeight: 'bold',
    },
  });
}

function createRectangle(map: google.maps.Map, rec: Rectangle) {
  return new google.maps.Rectangle({
    bounds: new google.maps.LatLngBounds(rec.ne, rec.sw),
    map: map,
    strokeColor: 'red',
    strokeOpacity: 1,
    strokeWeight: 0.5,
    fillOpacity: 0.1,
  });
}
const Matrix = () => {
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
  mapId: process.env.REACT_APP_GOOGLE_MAPS_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 6,
  disableDefaultUI: true,
  maxZoom: 9,
  minZoom: 0,
};

const MatrixMap = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const rectangles = useRef<google.maps.Rectangle[]>([]);
  const markers = useRef<google.maps.Marker[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  const idleMapListener = useCallback(async () => {
    if (!map) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const ne = bounds?.getNorthEast();
    const sw = bounds?.getSouthWest();

    await Promise.all(rectangles.current.map(rec => rec.setMap(null)));
    // await Promise.all(markers.current.map(marker => marker.setMap(null)));

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
      rectangles.current = newRectangles.map(rec => createRectangle(map, rec));

      // markers.current = rectangles.current.map((rec, i) =>
      //   createMarker(map, rec, i),
      // );
      console.log('NUMBER OF MARKERS', markers.current.length);
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
      {map && <Markers map={map} rectangles={rectangles.current} />}
    </>
  );
};

type MarkersProps = {
  map: google.maps.Map;
  rectangles: google.maps.Rectangle[];
};

const Markers = ({ map, rectangles }: MarkersProps) => {
  return (
    <>
      {rectangles.map((rec, index) => (
        <Marker
          key={`marker-${index}`}
          map={map}
          position={rec.getBounds()?.getNorthEast()}
        >
          <div className={`marker`}>
            <h2>{`marker-${index}`}</h2>
          </div>
        </Marker>
      ))}
    </>
  );
};

type MarkerProps = {
  map: google.maps.Map;
  position?: google.maps.LatLng;
  children: ReactNode;
};
const Marker = ({ map, position, children }: MarkerProps) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerView>();
  const rootRef = useRef<Root>();

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement('div');
      rootRef.current = createRoot(container);
      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container,
      });
    }
  }, []);

  useEffect(() => {
    if (!rootRef.current || !markerRef.current) return;
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
  }, [map, position, children]);
  return <></>;
};

export default Matrix;
