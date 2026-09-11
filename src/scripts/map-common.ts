import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const SECTION_COLORS: Record<string, string> = {
  '1': '#f2e394', '2': '#7fd38a', '3': '#5fd6e0', '4': '#c9c9c9', '5': '#e07ae0', '6': '#f5e04a',
  '7': '#f2a33a', '8': '#f3b6b6', '9': '#b9b3e6', '10': '#8fd9a8', 'BT2': '#b8e6f5',
};
export const SECTION_LABEL = (s: string | null) => (s === 'BT2' ? 'Braes Terrace II' : s ? `Section ${s}` : 'Outside a KV section');
export const DEED_FILE = (s: string | null) => (s === 'BT2' ? 'Deed-Restrictions-Braes-Terrace-II.pdf' : s ? `Deed-Restrictions-Section-${s}.pdf` : null);

export function base(): string {
  const el = document.getElementById('map');
  return (el?.dataset.base || '/').replace(/\/$/, '');
}

export function createMap(el: HTMLElement) {
  const map = L.map(el, { center: [29.6909, -95.4277], zoom: 15, minZoom: 13, maxZoom: 19, scrollWheelZoom: false });
  const streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · Parcels: HCAD',
    subdomains: 'abcd', maxZoom: 20,
  }).addTo(map);
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics · Parcels: HCAD', maxZoom: 19,
  });
  L.control.layers({ Streets: streets, Satellite: satellite }, {}, { position: 'topright', collapsed: true }).addTo(map);
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());
  return map;
}

export async function loadParcels(): Promise<GeoJSON.FeatureCollection> {
  const r = await fetch(`${base()}/data/parcels.geojson`);
  return r.json();
}

export function normalizeAddress(a: string): string {
  return a.toUpperCase().replace(/\./g, '').replace(/\b(ST|DR|CT|LN|BLVD|RD|PL|STREET|DRIVE|COURT|LANE|BOULEVARD)\b/g, '').replace(/\s+/g, ' ').trim();
}

export function attachSearch(map: L.Map, layer: L.GeoJSON, features: GeoJSON.Feature[]) {
  const input = document.getElementById('addr-search') as HTMLInputElement | null;
  const results = document.getElementById('addr-results') as HTMLElement | null;
  if (!input || !results) return;
  const find = (f: GeoJSON.Feature) => {
    let target: L.Layer | undefined;
    layer.eachLayer((l: any) => { if (l.feature === f) target = l; });
    if (!target) return;
    const b = (target as L.Polygon).getBounds();
    map.fitBounds(b.pad(2.5), { maxZoom: 18 });
    (target as L.Polygon).openPopup();
  };
  const render = (q: string) => {
    const nq = normalizeAddress(q);
    results.innerHTML = '';
    if (nq.length < 2) { results.hidden = true; return; }
    const hits = features.filter((f) => (f.properties as any).k.includes(nq)).slice(0, 8);
    if (!hits.length) { results.innerHTML = '<button type="button" disabled>No matching address in Knollwood Village</button>'; results.hidden = false; return; }
    for (const f of hits) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = (f.properties as any).a;
      b.addEventListener('click', () => { input.value = (f.properties as any).a; results.hidden = true; find(f); });
      results.appendChild(b);
    }
    results.hidden = false;
  };
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); (results.querySelector('button:not([disabled])') as HTMLButtonElement | null)?.click(); } if (e.key === 'Escape') results.hidden = true; });
  document.addEventListener('click', (e) => { if (!results.contains(e.target as Node) && e.target !== input) results.hidden = true; });
}

export function legendControl(html: string, position: L.ControlPosition = 'bottomright') {
  const c = new L.Control({ position });
  c.onAdd = () => { const d = L.DomUtil.create('div', 'map-legend'); d.innerHTML = html; L.DomEvent.disableClickPropagation(d); return d; };
  return c;
}

export function poiIcon(type: string) {
  const glyph = type === 'park' ? '🌳' : type === 'trail' ? '🚴' : type === 'sign' ? '🪧' : '📍';
  return L.divIcon({ className: 'poi-icon', html: `<span>${glyph}</span>`, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -12] });
}
