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
import {
  calculateNumberOfRowsAndColumnsByZoomLevel,
  generateRectangles,
  Rectangle,
} from './utilities';

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
      // console.log('NUMBER OF MARKERS', markers.current.length);
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
      {map && (
        <div className="markers">
          {rectangles.current.map((rec, index) => (
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
        </div>
      )}
    </>
  );
};

type MarkersProps = {
  map: google.maps.Map;
  rectangles: google.maps.Rectangle[];
};

// const Markers = ({ map, rectangles }: MarkersProps) => {
//   useEffect(() => {
//     console.log('MARKERS mounted');
//   }, [rectangles]);
//   return (
//     <div className="markers">
//       {rectangles.map((rec, index) => (
//         <Marker
//           key={`marker-${index}`}
//           map={map}
//           position={rec.getBounds()?.getNorthEast()}
//         >
//           <div className={`marker`}>
//             <h2>{`marker-${index}`}</h2>
//           </div>
//         </Marker>
//       ))}
//     </div>
//   );
// };

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
