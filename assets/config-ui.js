/* Config window: gear button bottom-right. Edits are saved to localStorage and the page reloads. */
(function(){
const C=window.IDS_CONFIG,D=window.IDS_DEFAULT,$=(t,s,h)=>{const e=document.createElement(t);if(s)e.style.cssText=s;if(h!=null)e.innerHTML=h;return e};
const fmt=h=>h.continuous?"24/7":(h.schedule&&h.schedule[0]?h.schedule[0].open+"-"+h.schedule[0].close:"24/7");
const T={
Facility:()=>({get:[["Name","subdivision.name"],["ID","subdivision.id"],["Timezone (IANA)","timezone.name"],["UTC offset (standard)","timezone.offset"],["UTC offset (DST)","timezone.offset_dst"],["vNAS feed URL","data.vnas_feed"],["METAR URL","data.metar_url"],["Poll seconds","data.poll_seconds"],["Logo path/URL","data.logo"],["VATSIM data feed (ATIS)","data.vatsim_feed"],["FAA chart cycle (e.g. 2611)","data.charts_cycle"]]}),
Airports:()=>({txt:C.airports.map(a=>[a.name,a.icao||"",fmt(a.hours),a.mag_var||0].join(" | ")).join("\n"),help:"One per line: FAA id | ICAO | hours (24/7 or HH:MM-HH:MM local) | mag variation (+E/-W)"}),
Views:()=>({txt:C.views.map(v=>[v.name,v.facilities.join(","),v.sops||"",v.default?"*":""].join(" | ")).join("\n"),help:"One per line: Name | FAA ids (comma) | SOP link | * for default (optional)"}),
Weather:()=>({txt:JSON.stringify(C.weather,null,1),help:"JSON. Each tab: {videoUrl} or {images:[{title,src}]}"}),
Charts:()=>({txt:(C.charts_manual||[]).map(x=>[x.apt,x.name,x.file].join(" | ")).join("\n"),help:"Optional backup list if the FAA index cannot load. One per line: FAA id | Chart name | PDF file (e.g. IND | ILS RWY 5L | 00697IL5L.PDF)"}),
Checklist:()=>({txt:(C.checklist||[]).join("\n"),help:"Position relief checklist, one item per line. Start a line with ## for a section heading."}),
Colors:()=>({txt:JSON.stringify(C.colors.navbar,null,1),help:"Navbar colors JSON (facility, ids, clock_background, clock_foreground)"})};
const g=(o,p)=>p.split(".").reduce((a,k)=>a[k],o),s=(o,p,v)=>{const k=p.split("."),l=k.pop();k.reduce((a,x)=>a[x],o)[l]=v};
function open(){
 const w=$("div","position:fixed;inset:0;background:#000a;z-index:99999;display:flex;align-items:center;justify-content:center;font:14px sans-serif"),
 b=$("div","background:#171717;color:#eee;width:min(720px,94vw);max-height:90vh;overflow:auto;padding:16px;border-radius:8px;border:1px solid #444"),
 tabs=$("div","display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap"),body=$("div"),cfg=JSON.parse(JSON.stringify(C)),F={};let cur;
 const show=n=>{cur=n;body.innerHTML="";const t=T[n]();
  if(t.get)t.get.forEach(([l,p])=>{const r=$("label","display:block;margin:6px 0",l+"<br>"),i=$("input","width:100%;padding:5px;background:#262626;color:#fff;border:1px solid #555");i.value=g(cfg,p);i.oninput=()=>s(cfg,p,isNaN(i.value)||i.value===""?i.value:+i.value);r.append(i);body.append(r)});
  else{body.append($("div","color:#aaa;margin-bottom:6px",t.help));const a=$("textarea","width:100%;height:260px;padding:6px;background:#262626;color:#fff;border:1px solid #555;font:12px monospace");a.value=F[n]??t.txt;a.oninput=()=>F[n]=a.value;body.append(a)}};
 Object.keys(T).forEach(n=>{const x=$("button","padding:5px 10px;background:#333;color:#fff;border-radius:4px",n);x.onclick=()=>show(n);tabs.append(x)});
 const apply=()=>{try{
  if(F.Airports!=null)cfg.airports=F.Airports.split("\n").filter(l=>l.trim()).map(l=>{const[a,i,h,m]=l.split("|").map(x=>x.trim());const r=/^(\d\d?:\d\d)-(\d\d?:\d\d)$/.exec(h||"");return{name:a.toUpperCase(),icao:(i||"").toUpperCase(),mag_var:+m||0,hours:r?window.IDS_HRS(r[1],r[2]):{continuous:true}}});
  if(F.Views!=null)cfg.views=F.Views.split("\n").filter(l=>l.trim()).map(l=>{const[n,f,o,d]=l.split("|").map(x=>x.trim());return{name:n,facilities:f.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean),sops:o,default:d==="*"}});
  if(F.Charts!=null)cfg.charts_manual=F.Charts.split("\n").filter(l=>l.trim()).map(l=>{const[a,n,f]=l.split("|").map(x=>x.trim());return{apt:a,name:n,file:f}});if(F.Checklist!=null)cfg.checklist=F.Checklist.split("\n").map(x=>x.trim()).filter(Boolean);if(F.Weather!=null)cfg.weather=JSON.parse(F.Weather);if(F.Colors!=null)cfg.colors.navbar=JSON.parse(F.Colors);
  if(!cfg.views.some(v=>v.default)&&cfg.views[0])cfg.views[0].default=true;return true}catch(e){alert("Invalid input: "+e.message)}};
 const bar=$("div","display:flex;gap:8px;margin-top:12px;justify-content:flex-end;flex-wrap:wrap"),btn=(t,f,c)=>{const x=$("button","padding:6px 12px;border-radius:4px;color:#fff;background:"+(c||"#444"),t);x.onclick=f;bar.append(x)};
 btn("Save & reload",()=>{if(apply()){localStorage.setItem("ids_config",JSON.stringify(cfg));location.reload()}},"#15803d");
 btn("Export",()=>{if(apply()){const a=$("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(cfg,null,1)],{type:"application/json"}));a.download="ids-config.json";a.click()}});
 btn("Import",()=>{const i=$("input");i.type="file";i.onchange=async()=>{localStorage.setItem("ids_config",await i.files[0].text());location.reload()};i.click()});
 btn("Reset",()=>{if(confirm("Reset all settings to defaults?")){localStorage.removeItem("ids_config");localStorage.removeItem("ids_local");location.reload()}},"#b91c1c");
 btn("Close",()=>w.remove());
 b.append($("h3","margin:0 0 10px;font-size:16px","⚙ IDS Configuration"),tabs,body,bar);w.append(b);document.body.append(w);show("Facility")}
addEventListener("DOMContentLoaded",()=>{const x=$("button","position:fixed;right:10px;bottom:8px;z-index:9999;background:#262626;color:#ffb612;border:1px solid #555;border-radius:50%;width:34px;height:34px","⚙");x.title="Configuration";x.onclick=open;document.body.append(x)});
setInterval(()=>{const f=document.querySelector(".facility");if(f&&!f.dataset.logo&&C.data.logo){f.dataset.logo=1;const i=$("img","height:38px;display:inline-block;vertical-align:middle;margin-right:8px");i.src=C.data.logo;f.prepend(i)}},500);
})();
