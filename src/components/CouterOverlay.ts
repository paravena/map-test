import { Rectangle } from './utilities';

export interface CounterOverlay extends google.maps.OverlayView {}

/**
 * Extends an object's prototype by another's.
 *
 * @param type1 The Type to be extended.
 * @param type2 The Type to extend with.
 * @ignore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extend(type1: any, type2: any): void {
  // eslint-disable-next-line prefer-const
  for (let property in type2.prototype) {
    type1.prototype[property] = type2.prototype[property];
  }
}

export class CounterOverlay {
  private div: HTMLDivElement | null;
  constructor(
    private map: google.maps.Map,
    private rec: Rectangle,
    private index: number,
  ) {
    extend(CounterOverlay, google.maps.OverlayView);
    this.div = document.createElement('div');
  }

  onAdd() {
    if (this.div) {
      this.div.style.position = 'absolute';
      const panes = this.getPanes()!;
      panes.overlayMouseTarget.appendChild(this.div);
      this.div.addEventListener('click', event => {
        const overlays =
          panes.overlayMouseTarget.querySelectorAll<HTMLDivElement>('.overlay');
        overlays.forEach(
          overlay => (overlay.style.border = 'solid 1px rgba(255, 0, 0, 0.5)'),
        );
        (event.target as HTMLDivElement).style.border = '5px solid yellow';
      });
      this.div.addEventListener('dblclick', event => {
        const bounds = new google.maps.LatLngBounds(this.rec.sw, this.rec.ne);
        const position = bounds.getCenter();
        this.map.fitBounds(bounds);
        this.map.panTo(position);
        this.map.setZoom(8);
      });
    }
  }
  draw() {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(this.rec.sw);
    const ne = overlayProjection.fromLatLngToDivPixel(this.rec.ne);

    if (ne && sw && this.div) {
      this.div.id = `overlay-${this.index}`;
      this.div.className = 'overlay';
      this.div.style.position = 'absolute';
      this.div.style.width = ne.x - sw.x + 'px';
      this.div.style.height = sw.y - ne.y + 'px';
      this.div.style.left = sw.x + 'px';
      this.div.style.top = ne.y + 'px';
      this.div.style.zIndex = '100';
      this.div.style.display = 'flex';
      this.div.style.justifyContent = 'center';
      this.div.style.alignItems = 'center';
      this.div.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      this.div.style.color = 'black';
      this.div.style.fontFamily = 'Arial, sans-serif';
      this.div.style.fontSize = '24px';
      this.div.style.fontWeight = 'bold';
      this.div.style.pointerEvents = 'none';
      this.div.style.border = 'solid 1px rgba(255, 0, 0, 0.5)';
      this.div.style.pointerEvents = 'auto';
      this.div.innerText = 'Centered Text';
    }
  }

  onRemove() {
    if (this.div) {
      (this.div.parentNode as HTMLElement).removeChild(this.div);
      this.div = null;
    }
  }
}
