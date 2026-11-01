"""Builds charts/index.json from the FAA d-TPP metafile for the airports in charts/airports.txt.
Run by GitHub Actions (see charts-workflow.yml). Set METAFILE=path to test with a local file."""
import urllib.request, xml.etree.ElementTree as ET, json, datetime, os, io

def cycle(d, back=0):
    base = datetime.date(2026, 1, 22)               # AIRAC 2601 effective date
    k = (d - base).days // 28 - back
    cd = base + datetime.timedelta(28 * k); j = k
    while (base + datetime.timedelta(28 * (j - 1))).year == cd.year: j -= 1
    return f"{cd.year % 100:02d}{k - j + 1:02d}"

want, states = set(), set()
for line in open(os.path.join(os.path.dirname(__file__), "airports.txt")):
    line = line.split("#")[0].strip().upper()
    if line.startswith("STATE:"): states |= {s.strip() for s in line[6:].split(",") if s.strip()}
    elif line: want.add(line)

def fetch(cy):
    url = f"https://aeronav.faa.gov/d-tpp/{cy}/xml_data/d-TPP_Metafile.xml"
    req = urllib.request.Request(url, headers={"User-Agent": "ids-charts-indexer"})
    return urllib.request.urlopen(req, timeout=120).read()

if os.environ.get("METAFILE"):
    data, cy = open(os.environ["METAFILE"], "rb").read(), os.environ.get("CYCLE", "test")
else:
    data = cy = None
    for back in (0, 1):
        cy = cycle(datetime.date.today(), back)
        try: data = fetch(cy); break
        except Exception as e: print("cycle", cy, "failed:", e)
    if data is None: raise SystemExit("Could not download the FAA metafile")

out, st, cur = {}, "", None
for ev, el in ET.iterparse(io.BytesIO(data), events=("start", "end")):
    t = el.tag
    if ev == "start":
        if t == "state_code": st = (el.get("ID") or "").upper()
        elif t == "airport_name":
            a, i = (el.get("apt_ident") or "").upper(), (el.get("icao_ident") or "").upper()
            cur = {"k": a or i, "n": el.get("ID") or "", "i": i, "c": []} if (a in want or i in want or st in states) else None
    else:
        if t == "record" and cur is not None:
            g = lambda n: (el.findtext(n) or "").strip()
            if g("pdf_name") and g("user_action") != "D":
                cur["c"].append({"c": g("chart_code"), "n": g("chart_name"), "f": g("pdf_name")})
            el.clear()
        elif t == "airport_name" and cur is not None:
            out[cur.pop("k")] = cur; cur = None
json.dump({"cycle": cy, "generated": datetime.datetime.utcnow().isoformat() + "Z", "airports": out},
          open(os.path.join(os.path.dirname(__file__), "index.json"), "w"), separators=(",", ":"))
print("cycle", cy, "airports", len(out), "charts", sum(len(v["c"]) for v in out.values()))
