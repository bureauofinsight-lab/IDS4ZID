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
 for(const f of [u,"https://api.allorigins.win/raw?url="+encodeURIComponent(u)]){try{const r=await fetch(f);(await r.json()).forEach(x=>m[x.icaoId]=x.rawOb);break}catch(e){console.warn("METAR source failed",f.slice(0,40))}}
 if(!Object.keys(m).length)for(const id of list){try{m[icao(id)]=(await(await fetch("https://metar.vatsim.net/"+icao(id))).text()).trim()}catch(e){}}
 let on=[];try{on=(await(await fetch(C().data.vnas_feed)).json()).controllers||[]}catch(e){console.warn("vNAS feed failed",e)}
 const out=list.map(id=>{const o=S[id]||mk(id),a=on.find(c=>(c.vatsimData?.callsign||"").startsWith(id+"_")&&/ATIS/.test(c.vatsimData.callsign));
  const n=Object.assign({},o,mk(id),{metar:m[icao(id)]||o.metar||""});if(a&&!LS()[id]?.atis)n.atis=a.atis?.letter||a.vatsimData?.atisLetter||n.atis;return n});
 if(first){first=false;out.forEach(o=>S[o.id]=o);emit("airports",out)}
 else out.forEach(o=>{if(JSON.stringify(o)!==JSON.stringify(S[o.id])){S[o.id]=o;emit("airportUpdate",null,o)}});
}
window.IDS_CONN={on:(n,f)=>(H[n]=H[n]||[]).push(f),onclose(){},onreconnecting(){},onreconnected(){},
 async start(){if(this.s)return;this.s=1;emit("connected");await poll();setInterval(poll,(C().data.poll_seconds||60)*1e3)},
 patch(id,r){const l=LS();l[id]=Object.assign(l[id]||{},r);if("atis"in r)l[id].atis_time=new Date();if("arrival_atis"in r)l[id].arrival_atis_time=new Date();localStorage.setItem("ids_local",JSON.stringify(l));S[id]=Object.assign(S[id]||mk(id),l[id]);emit("airportUpdate",null,S[id])},
 pirep(p){emit("pirepUpdate",p)}};
const w=setInterval(()=>{if(H.airports&&H.connected&&H.airportUpdate){clearInterval(w);window.IDS_CONN.start()}},100);
})();
