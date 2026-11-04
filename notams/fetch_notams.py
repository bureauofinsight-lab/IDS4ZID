"""Fetches NOTAMs for the airports in notams/airports.txt from the public FAA NOTAM Search website (no account or key)
and writes notams/index.json. This is an unofficial use of the website's search endpoint and may stop working or be blocked.
Set NOTAM_MOCK=path to a JSON file to test without the network."""
import urllib.request, urllib.parse, json, os, datetime, re, time
D = os.path.dirname(__file__)
mock = os.environ.get("NOTAM_MOCK")
ids = [l.split("#")[0].strip().upper() for l in open(os.path.join(D, "airports.txt"))]
ids = [i for i in ids if i]
try: old = json.load(open(os.path.join(D, "index.json"))).get("airports", {})
except Exception: old = {}

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
URL = "https://notams.aim.faa.gov/notamSearch/search"

def dt(s):
    s = (s or "").strip()
    if not s: return ""
    if s.upper().startswith("PERM"): return "PERM"
    m = re.match(r"(\d\d)/(\d\d)/(\d{4})\s+(\d\d)(\d\d)", s)
    return f"{m[3]}-{m[1]}-{m[2]}T{m[4]}:{m[5]}:00Z" if m else s

def get(loc, offset):
    if mock: return json.load(open(mock))
    form = {"searchType": "0", "designatorsForLocation": loc, "designatorForAccountable": "", "formatType": "DOMESTIC",
            "notamsOnly": "false", "radius": "10", "sortColumns": "5 false", "sortDirection": "true", "offset": str(offset),
            "freeFormText": "", "flightPathText": "", "flightPathBuffer": "4", "flightPathIncludeNavaids": "true",
            "flightPathIncludeArtcc": "false", "flightPathIncludeTfr": "true", "flightPathIncludeRegulatory": "false",
            "flightPathResultsType": "All NOTAMs", "archiveDate": "", "archiveDuration": "", "reportType": "Raw NOTAMs"}
    req = urllib.request.Request(URL, data=urllib.parse.urlencode(form).encode(), headers={
        "User-Agent": UA, "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://notams.aim.faa.gov", "Referer": "https://notams.aim.faa.gov/notamSearch/nsapp.html"})
    for t in range(3):
        try: return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as e:
            if t == 2: raise
            time.sleep(3)

def fetch(i):
    loc = "K" + i if re.fullmatch(r"[A-Z]{3}", i) else i
    out, seen, off = [], set(), 0
    for _ in range(20):
        j = get(loc, off); lst = j.get("notamList") or []
        for n in lst:
            nid = n.get("notamNumber") or n.get("icaoId")
            if not nid or n.get("cancelledOrExpired") is True or (nid, n.get("startDate")) in seen: continue
            seen.add((nid, n.get("startDate")))
            out.append({"id": nid, "type": "", "cls": n.get("source", ""), "issued": dt(n.get("issueDate")),
                        "start": dt(n.get("startDate")), "end": dt(n.get("endDate")),
                        "text": n.get("traditionalMessage") or n.get("icaoMessage") or "", "simple": "",
                        "loc": n.get("facilityDesignator") or loc})
        off += len(lst)
        if mock or not lst or off >= int(j.get("totalNotamCount") or 0): break
        time.sleep(1)
    return out

res, bad = {}, 0
for i in ids:
    time.sleep(0 if mock else 1.5)
    try: res[i] = fetch(i)
    except Exception as e:
        print("failed", i, e); bad += 1; res[i] = old.get(i, [])
json.dump({"generated": datetime.datetime.now(datetime.timezone.utc).isoformat(), "airports": res},
          open(os.path.join(D, "index.json"), "w"), separators=(",", ":"))
print("airports", len(res), "notams", sum(len(v) for v in res.values()), "failed", bad)
if bad == len(ids): raise SystemExit(1)
