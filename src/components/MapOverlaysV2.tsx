import './global.css';
import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, OverlayView, LoadScript } from '@react-google-maps/api';
import { generateRectangles, Rectangle } from './utilities';
const MapOverlaysV2 = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  useEffect(() => {
    if (map) {
      const bounds = map.getBounds();
      const ne = bounds?.getNorthEast();
      const sw = bounds?.getSouthWest();
      if (ne && sw) {
        // const newRectangles = generateRectangles(
        //   2,
        //   2,
        //   85.0511287798,
        //   180,
        //   -85.0511287798,
        //   -180,
        // );
        const newRectangles = generateRectangles(
          2,
          2,
          ne.lat(),
          ne.lng(),
          sw.lat(),
          sw.lng(),
        );
        console.log('RECTANGLES', newRectangles);
        setRectangles(newRectangles);
      }
    }
  }, [map]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={['drawing', 'visualization', 'geometry', 'places']}
    >
      <GoogleMap
        zoom={3}
        center={{ lat: 0, lng: 0 }} // Replace with your initial center
        mapContainerClassName="map-container"
        onLoad={onLoad}
      >
        {rectangles.map((rec, index) => (
          <OverlayView
            key={`overlay-${index}`}
            mapPaneName={OverlayView.OVERLAY_LAYER}
            bounds={new google.maps.LatLngBounds(rec.ne, rec.sw)}
          >
            <div
              style={{
                border: '1px solid #000',
                position: 'absolute',
                zIndex: 10,
                width: '100%',
                height: '100%',
                backgroundColor: 'red',
              }}
            >
              HELLO
            </div>
          </OverlayView>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapOverlaysV2;
