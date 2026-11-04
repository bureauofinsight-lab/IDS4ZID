"""Fetches NOTAMs from the FAA NOTAM API for the airports in notams/airports.txt and writes notams/index.json.
Needs GitHub secrets FAA_NOTAM_CLIENT_ID and FAA_NOTAM_CLIENT_SECRET (free from https://api.faa.gov).
Set NOTAM_MOCK=path to a JSON file to test without the network."""
import urllib.request, urllib.parse, json, os, datetime, re
D = os.path.dirname(__file__)
cid, sec = os.environ.get("FAA_NOTAM_CLIENT_ID", ""), os.environ.get("FAA_NOTAM_CLIENT_SECRET", "")
mock = os.environ.get("NOTAM_MOCK")
if not mock and not (cid and sec): raise SystemExit("Missing FAA_NOTAM_CLIENT_ID / FAA_NOTAM_CLIENT_SECRET repository secrets")
ids = [l.split("#")[0].strip().upper() for l in open(os.path.join(D, "airports.txt"))]
ids = [i for i in ids if i]
try: old = json.load(open(os.path.join(D, "index.json"))).get("airports", {})
except Exception: old = {}

def get(params):
    if mock: return json.load(open(mock))
    url = "https://external-api.faa.gov/notamapi/v1/notams?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"client_id": cid, "client_secret": sec, "User-Agent": "ids-notam-fetch"})
    return json.load(urllib.request.urlopen(req, timeout=60))

def fetch(i):
    key = "icaoLocation" if re.fullmatch(r"[A-Z]{3}", i) is None and len(i) == 4 else None
    params = {"responseFormat": "geoJson", "pageSize": 1000, "pageNum": 1}
    if re.fullmatch(r"[A-Z]{3}", i): params["icaoLocation"] = "K" + i
    else: params["domesticLocation"] = i
    out, seen = [], set()
    while True:
        j = get(params)
        for it in j.get("items", []):
            c = (it.get("properties") or {}).get("coreNOTAMData") or {}
            n = c.get("notam") or {}
            nid = n.get("id") or n.get("number")
            if not nid or nid in seen: continue
            seen.add(nid)
            tr = next((t for t in c.get("notamTranslation") or [] if t.get("simpleText")), {})
            out.append({"id": n.get("number") or nid, "type": n.get("type", ""), "cls": n.get("classification", ""),
                        "issued": n.get("issued", ""), "start": n.get("effectiveStart", ""), "end": n.get("effectiveEnd", ""),
                        "text": n.get("text", ""), "simple": tr.get("simpleText", ""), "loc": n.get("icaoLocation") or n.get("location", "")})
        if mock or params["pageNum"] >= (j.get("totalPages") or 1): break
        params["pageNum"] += 1
    return out

res, bad = {}, 0
for i in ids:
    try: res[i] = fetch(i)
    except Exception as e:
        print("failed", i, e); bad += 1; res[i] = old.get(i, [])
json.dump({"generated": datetime.datetime.now(datetime.timezone.utc).isoformat(), "airports": res},
          open(os.path.join(D, "index.json"), "w"), separators=(",", ":"))
print("airports", len(res), "notams", sum(len(v) for v in res.values()), "failed", bad)
if bad == len(ids): raise SystemExit(1)
