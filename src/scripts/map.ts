import L from 'leaflet';
import { createMap, loadParcels, attachSearch, legendControl, SECTION_COLORS, SECTION_LABEL, DEED_FILE, base, poiIcon } from './map-common';
import pois from '../data/pois.json';

const el = document.getElementById('map');
if (el) {
  const map = createMap(el);
  const showPois = el.dataset.pois === 'true';
  loadParcels().then((fc) => {
    const layer = L.geoJSON(fc, {
      style: (f) => {
        const s = (f?.properties as any).sec as string | null;
        return { color: '#445', weight: 0.6, fillColor: s ? SECTION_COLORS[s] : '#ddd', fillOpacity: s ? 0.55 : 0.25 };
      },
      onEachFeature: (f, l) => {
        const p = f.properties as any;
        const deed = DEED_FILE(p.sec);
        l.bindPopup(`<h4>${p.a}</h4>${SECTION_LABEL(p.sec)}${p.lot ? ` · ${p.lot}` : ''}<br>${deed ? `<a href="${base()}/docs/deeds/${deed}">Deed restrictions for ${SECTION_LABEL(p.sec)} (PDF)</a>` : 'Not covered by Knollwood Village deed restrictions.'}<br><a href="${base()}/build/">ACC process</a> · <a href="https://public.hcad.org/records/Real.asp?search=acct&acct=${p.acct}" rel="noopener" target="_blank">HCAD record</a>`);
        l.on('mouseover', () => (l as L.Path).setStyle({ weight: 2, color: '#212a40' }));
        l.on('mouseout', () => layer.resetStyle(l as L.Path));
      },
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [10, 10] });
    attachSearch(map, layer, fc.features);
    const items = Object.keys(SECTION_COLORS).map((s) => `<div><span class="sw" style="background:${SECTION_COLORS[s]}"></span>${SECTION_LABEL(s)}</div>`).join('');
    legendControl(`<h5>Deed sections</h5>${items}`, 'bottomleft').addTo(map);
    if (showPois) {
      pois.forEach((p) => L.marker([p.lat, p.lng], { icon: poiIcon(p.type) }).addTo(map).bindPopup(`<h4>${p.name}</h4>${p.desc}${p.address ? `<br><span style="color:#6c7280">${p.address}</span>` : ''}`));
    }
  });
}
