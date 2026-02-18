import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import '@reach/combobox/styles.css';
import { useMemo, useState } from 'react';
import PlacesAutocomplete from './PlacesAutocomplete';

const Places = () => {
  const center = useMemo(() => ({ lat: 43.45, lng: -80.49 }), []);
  const [selected, setSelected] = useState<{ lat: number; lng: number }>();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries: ['places'],
  });
  if (!isLoaded) return <p>Loading...</p>;
  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>
      <GoogleMap
        zoom={10}
        center={center}
        mapContainerClassName="map-container"
      >
        {selected && <Marker position={selected} />}
      </GoogleMap>
    </>
  );
};

export default Places;
