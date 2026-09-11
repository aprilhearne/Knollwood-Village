import L from 'leaflet';
import { createMap, loadParcels, attachSearch, legendControl, base } from './map-common';

const COLORS = { full: '#3f7a54', partial: '#d0a127', none: '#ffffff', unknown: '#e6e2d8' };
const el = document.getElementById('map');
if (el) {
  const map = createMap(el);
  const sel = document.getElementById('dues-year') as HTMLSelectElement;
  const stats = document.getElementById('dues-stats') as HTMLElement;
  let parcels: GeoJSON.FeatureCollection;
  let layer: L.GeoJSON;
  let status: Record<string, { s: string; x: boolean }> = {};

  const styleFor = (f: GeoJSON.Feature) => {
    const p = f.properties as any;
    const st = p.m ? (status[p.k]?.s ?? 'none') : 'unknown';
    return { color: '#556', weight: 0.6, fillColor: (COLORS as any)[st], fillOpacity: st === 'none' ? 0.15 : st === 'unknown' ? 0.4 : 0.75 };
  };
  const label = (st: string, x: boolean) => st === 'full' ? `Paid${x ? ' + extra security contribution' : ''}` : st === 'partial' ? 'Partial payment recorded' : st === 'none' ? 'No payment recorded yet' : 'Not on the dues roll';

  async function loadYear(y: string) {
    const r = await fetch(`${base()}/data/dues/${y}.json`);
    const d = await r.json();
    status = d.status;
    const pct = Math.round((d.paid / d.homes) * 100);
    stats.innerHTML = `<strong>${d.paid}</strong> of <strong>${d.homes}</strong> homes paid for ${y} (${pct}%)${d.partial ? ` · ${d.partial} partial` : ''}`;
    layer?.setStyle(styleFor as any);
    layer?.eachLayer((l: any) => {
      const p = l.feature.properties; const st = p.m ? (status[p.k]?.s ?? 'none') : 'unknown';
      l.setPopupContent(`<h4>${p.a}</h4><strong>${y}:</strong> ${label(st, status[p.k]?.x)}<br><span style="color:#6c7280">Think this is wrong? Email treasurer@knollwoodvillage.org.</span><br><a href="${base()}/dues/">Pay dues</a>`);
    });
  }

  Promise.all([loadParcels(), fetch(`${base()}/data/dues/index.json`).then((r) => r.json())]).then(([fc, idx]) => {
    parcels = fc;
    idx.years.forEach((y: number) => { const o = document.createElement('option'); o.value = String(y); o.textContent = String(y); sel.appendChild(o); });
    layer = L.geoJSON(parcels, {
      style: styleFor as any,
      onEachFeature: (f, l) => {
        l.bindPopup('');
        l.on('mouseover', () => (l as L.Path).setStyle({ weight: 2, color: '#212a40' }));
        l.on('mouseout', () => (l as L.Path).setStyle(styleFor(f) as any));
      },
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [10, 10] });
    attachSearch(map, layer, parcels.features);
    legendControl(`<h5>Dues status</h5><div><span class="sw" style="background:${COLORS.full}"></span>Paid in full</div><div><span class="sw" style="background:${COLORS.partial}"></span>Partial</div><div><span class="sw" style="background:${COLORS.none}"></span>Not yet recorded</div><div><span class="sw" style="background:${COLORS.unknown}"></span>Not on dues roll</div>`, 'bottomleft').addTo(map);
    sel.addEventListener('change', () => loadYear(sel.value));
    loadYear(sel.value);
  });
}
