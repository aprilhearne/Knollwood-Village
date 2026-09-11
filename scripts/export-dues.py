#!/usr/bin/env python3
"""Export per-address dues status from the treasurer's master workbook to public/data/dues/YYYY.json.

Usage: python3 scripts/export-dues.py "/path/to/KVCC.Master.2026.xlsx" 2026
Reads the `PNP.Master` sheet (columns: address, #, Street, Civic, Security, Sec +, Tot Cont, ...).
Writes status only: full (civic + security paid), partial (one of them), none. Never names or amounts.
"""
import json, re, sys, os
try:
    import openpyxl
except ImportError:
    sys.exit('pip install openpyxl')
if len(sys.argv) < 3:
    sys.exit(__doc__)
path, year = sys.argv[1], int(sys.argv[2])
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def norm(a):
    a = a.upper().replace('.', '').strip(); a = re.sub(r'\s+', ' ', a)
    a = re.sub(r'\b(ST|DR|CT|LN|BLVD|RD|PL)\b', '', a).strip()
    return re.sub(r'\s+', ' ', a)
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb['PNP.Master']
rows = list(ws.iter_rows(values_only=True))
hdr = next(i for i, r in enumerate(rows) if r and r[0] == 'concatenation')
status = {}
for r in rows[hdr + 1:]:
    if not r or not r[0] or not isinstance(r[1], (int, float)):
        continue
    try:
        civic, sec, extra = float(r[3] or 0), float(r[4] or 0), float(r[5] or 0)
    except (TypeError, ValueError):
        continue
    st = 'full' if civic > 0 and sec > 0 else 'partial' if (civic > 0 or sec > 0) else 'none'
    status[norm(str(r[0]))] = {'s': st, 'x': extra > 0}
out = {'year': year, 'asOf': None, 'homes': len(status), 'paid': sum(1 for v in status.values() if v['s'] == 'full'), 'partial': sum(1 for v in status.values() if v['s'] == 'partial'), 'status': status}
os.makedirs(f'{root}/public/data/dues', exist_ok=True)
json.dump(out, open(f'{root}/public/data/dues/{year}.json', 'w'), separators=(',', ':'))
idx_path = f'{root}/public/data/dues/index.json'
idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {'years': [], 'summary': {}}
idx['years'] = sorted(set(idx['years'] + [year]), reverse=True)
idx['summary'][str(year)] = {'homes': out['homes'], 'paid': out['paid'], 'partial': out['partial']}
json.dump(idx, open(idx_path, 'w'), indent=1)
print(f'{year}: {out["paid"]} of {out["homes"]} paid, {out["partial"]} partial')
