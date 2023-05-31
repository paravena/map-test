export type Rectangle = {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
};
export function calculateNumberOfRowsAndColumnsByZoomLevel(zoom: number) {
  if (zoom >= 0 && zoom < 2) {
    return [3, 4];
  } else if (zoom >= 2 && zoom < 4) {
    return [2, 4];
  } else if (zoom >= 4 && zoom < 7) {
    return [2, 2];
  }
  return [1, 1];
}

export function generateRectangles(
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
