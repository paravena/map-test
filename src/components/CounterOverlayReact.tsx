import React, { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Rectangle } from './utilities';

interface CounterOverlayProps {
  map: google.maps.Map;
  rec: Rectangle;
  index: number;
}

const CounterOverlay: React.FC<CounterOverlayProps> = ({ map, rec, index }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, we might want a global state for highlighting,
    // but for this demo, we'll just toggle local state.
    setIsHighlighted(!isHighlighted);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bounds = new google.maps.LatLngBounds(rec.sw, rec.ne);
    map.fitBounds(bounds);
    const currentZoom = map.getZoom();
    if (currentZoom !== undefined) {
      map.setZoom(currentZoom + 1);
    }
  };

  return (
    <OverlayView
      bounds={new google.maps.LatLngBounds(rec.sw, rec.ne)}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className={`map-overlay-item ${isHighlighted ? 'highlighted' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}
      >
        <span className="overlay-text">Area {index + 1}</span>
      </div>
    </OverlayView>
  );
};

export default CounterOverlay;
