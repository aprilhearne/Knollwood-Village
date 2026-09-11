import L from 'leaflet';
import { createMap, legendControl, base } from './map-common';

const COLORS: Record<string, string> = { 'Knollwood Village': '#4d7c55', 'Woodside': '#c8963e', 'Westridge': '#a9573b', 'Linkwood': '#5b4333' };
const el = document.getElementById('patrol-map');
if (el) {
  const map = createMap(el);
  map.setView([29.687, -95.431], 14);
  fetch(`${base()}/data/patrol-neighborhoods.geojson`).then((r) => r.json()).then((fc: GeoJSON.FeatureCollection) => {
    const layer = L.geoJSON(fc, {
      style: (f) => ({ color: COLORS[(f?.properties as any).name] || '#333', weight: 2.5, fillColor: COLORS[(f?.properties as any).name] || '#999', fillOpacity: 0.35 }),
      onEachFeature: (f, l) => {
        const p = f.properties as any;
        l.bindTooltip(`<strong>${p.name}</strong>`, { permanent: true, direction: 'center', className: 'hood-label' });
        l.bindPopup(`<h4>${p.name}</h4>About ${p.homes} lots. Boundary drawn from subdivision plat records; approximate.`);
      },
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [12, 12] });
    legendControl(Object.entries(COLORS).map(([n, c]) => `<div><span class="sw" style="background:${c}"></span>${n}</div>`).join(''), 'bottomleft').addTo(map);
  });
}
