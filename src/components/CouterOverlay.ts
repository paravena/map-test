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
  private readonly div: HTMLDivElement;
  constructor(private map: google.maps.Map, private rec: Rectangle) {
    extend(CounterOverlay, google.maps.OverlayView);
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
    this.div.style.fontSize = '24px';
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
