/* Standalone data layer: replaces the SignalR/REST backend. METARs from aviationweather.gov, controllers from the vNAS feed, edits kept in localStorage. */
(function(){
const C=()=>window.IDS_CONFIG,H={},S={};
const LS=()=>{try{return JSON.parse(localStorage.getItem("ids_local")||"{}")}catch(e){return{}}};
const emit=(n,...a)=>(H[n]||[]).forEach(f=>f(...a));
const ap=id=>C().airports.find(a=>a.name===id)||{};
const icao=id=>ap(id).icao||(id.length==3?"K"+id:id);
const ids=()=>[...new Set([...C().airports.map(a=>a.name),...C().views.flatMap(v=>v.facilities)])];
const mk=id=>Object.assign({id,atis:"",atis_time:new Date(),arrival_atis:"",arrival_atis_time:new Date(),departure_runways:"",arrival_runways:"",metar:"",mag_var:ap(id).mag_var||0},LS()[id]||{});
let first=true;
async function poll(){
 const list=ids(),m={};
 const u=C().data.metar_url+"?format=json&ids="+list.map(icao).join(",");
 await Promise.all(list.map(async id=>{try{const t=(await(await fetch("https://metar.vatsim.net/"+icao(id))).text()).trim();if(t&&t[0]!="<"&&t.length<700)m[icao(id)]=t}catch(e){}}));
 if(!Object.keys(m).length&&!window.IDS_NOAWC){try{(await(await fetch(u)).json()).forEach(x=>m[x.icaoId]=x.rawOb)}catch(e){window.IDS_NOAWC=1}}
 let at=[];try{at=(await(await fetch(C().data.vatsim_feed||"https://data.vatsim.net/v3/vatsim-data.json")).json()).atis||[]}catch(e){console.warn("ATIS feed failed",e)}
 const R="([0-9]{1,2}[LRC]?(?:\\s*(?:,|AND)\\s*[0-9]{1,2}[LRC]?)*)",RD=new RegExp("DEP(?:ARTURES?|G|ARTING)?\\s+(?:RWYS?|RUNWAYS?)\\s+"+R),RA=new RegExp("(?:LDG|LANDING|ARRIVALS?|ARRIVING|APCH|APPROACH)[A-Z ]{0,25}?\\s*(?:RWYS?|RUNWAYS?)\\s+"+R),cl=x=>x.replace(/\s*AND\s*/g,", ").replace(/\s+/g," ");
 const out=list.map(id=>{const o=S[id]||mk(id),ic=icao(id),f=s=>at.find(x=>x.callsign===ic+s),c=f("_ATIS"),d=f("_D_ATIS"),ar=f("_A_ATIS"),n=Object.assign({},o,mk(id),{metar:m[icao(id)]||o.metar||""}),L=LS()[id]||{};
  const dl=(d||c)?.atis_code,al=(ar||c)?.atis_code;if(dl){n.atis=dl;if(dl!==o.atis)n.atis_time=new Date()}if(al){n.arrival_atis=al;if(al!==o.arrival_atis)n.arrival_atis_time=new Date()}
  const t=((d||c)?.text_atis||[]).join(" ").toUpperCase(),ta=((ar||c)?.text_atis||[]).join(" ").toUpperCase(),md=RD.exec(t),ma=RA.exec(ta);
  if(md&&!L.departure_runways)n.departure_runways=cl(md[1]);if(ma&&!L.arrival_runways)n.arrival_runways=cl(ma[1]);return n});
 if(first){first=false;out.forEach(o=>S[o.id]=o);emit("airports",out)}
 else out.forEach(o=>{if(JSON.stringify(o)!==JSON.stringify(S[o.id])){S[o.id]=o;emit("airportUpdate",null,o)}});
}
window.IDS_S=S;window.IDS_CONN={on:(n,f)=>(H[n]=H[n]||[]).push(f),onclose(){},onreconnecting(){},onreconnected(){},
 async start(){if(this.s)return;this.s=1;emit("connected");await poll();setInterval(poll,(C().data.poll_seconds||60)*1e3)},
 patch(id,r){const l=LS();l[id]=Object.assign(l[id]||{},r);if("atis"in r)l[id].atis_time=new Date();if("arrival_atis"in r)l[id].arrival_atis_time=new Date();localStorage.setItem("ids_local",JSON.stringify(l));S[id]=Object.assign(S[id]||mk(id),l[id]);emit("airportUpdate",null,S[id])},
 pirep(p){emit("pirepUpdate",p)}};
const w=setInterval(()=>{if(H.airports&&H.connected&&H.airportUpdate){clearInterval(w);window.IDS_CONN.start()}},100);
})();
