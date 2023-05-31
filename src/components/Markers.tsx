import './Markers.css';
import { Wrapper } from '@googlemaps/react-wrapper';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

const Markers = () => {
  return (
    <Wrapper
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={['marker']}
      version="beta"
    >
      <MarkerMap />
    </Wrapper>
  );
};

const mapOptions = {
  mapId: process.env.REACT_APP_GOOGLE_MAPS_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 10,
  disableDefaultUI: true,
};

const weatherData = {
  A: {
    name: 'Toronto',
    position: { lat: 43.66293, lng: -79.39314 },
    climate: 'Raining',
    temp: 26,
    fiveDays: [15, 18, 12, 22, 20],
  },
  B: {
    name: 'Guelph',
    position: { lat: 43.544811, lng: -80.248108 },
    climate: 'Cloudy',
    temp: 20,
    fiveDays: [15, 18, 12, 22, 20],
  },
  C: {
    name: 'Orangeville',
    position: { lat: 43.919239, lng: -80.097412 },
    climate: 'Sunny',
    temp: 20,
    fiveDays: [15, 18, 12, 22, 20],
  },
};

export default Markers;

const MarkerMap = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const newMap = new google.maps.Map(ref.current, mapOptions);
      setMap(newMap);
      const poly = new google.maps.Polygon({
        paths: [
          { lat: 43.544811, lng: -80.248108 }, // cloudy
          { lat: 43.919239, lng: -80.248108 }, // sunny
          { lat: 43.919239, lng: -79.39314 }, // reining
          { lat: 43.544811, lng: -79.39314 },
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        editable: true,
      });
      poly.addListener('click', () => alert('Hello Pablito'));
      poly.setMap(newMap);
    }
  }, []);
  return (
    <>
      <div ref={ref as RefObject<HTMLDivElement>} id="map"></div>
      {map && <Weather map={map} />}
    </>
  );
};

type WeatherProps = {
  map: google.maps.Map;
};
const Weather = ({ map }: WeatherProps) => {
  const [data, setData] = useState(weatherData);
  const [highlight, setHighlight] = useState<string | null>(null);

  return (
    <>
      {Object.entries(data).map(([key, weather]) => (
        <Marker key={key} map={map} position={weather.position}>
          <div
            className={`marker ${weather.climate.toLocaleLowerCase()} ${
              highlight === key ? 'highlight' : ''
            }`}
            onMouseEnter={() => setHighlight(key)}
            onMouseLeave={() => setHighlight(null)}
          >
            <h2>{weather.climate}</h2>
            <div>{weather.temp}c</div>
          </div>
        </Marker>
      ))}
    </>
  );
};

type MarkerProps = {
  map: google.maps.Map;
  position: { lat: number; lng: number };
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
