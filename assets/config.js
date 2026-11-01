/* ZID IDS defaults. Edit via the gear (⚙) config window, or change here. Saved edits live in localStorage 'ids_config'. */
(function(){
const hrs=(o,c)=>({continuous:false,schedule:[{start:{month:1,day:1},end:{month:12,day:31},open:o,close:c,local:true}]});
const def={
 ids_api_base_url:"",ids_base_url:"",
 data:{vnas_feed:"https://live.env.vnas.vatsim.net/data-feed/controllers.json",metar_url:"https://aviationweather.gov/api/data/metar",poll_seconds:60,logo:"assets/logo.png"},
 subdivision:{name:"Indianapolis ARTCC",id:"ZID",update_flash_duration:16},
 timezone:{name:"America/Indiana/Indianapolis",offset:-5,offset_dst:-4},
 colors:{navbar:{facility:"#002766",ids:"#ffb612",clock_background:"#000000",clock_foreground:"#ffb612"},
  sia:{flash_background_class:"bg-blue-950",closed_background:"#ff00001a",identifier:"text-neutral-300",atis:"text-yellow-400",arrival_atis:"text-blue-400",arrival_runways:"text-white",departure_runways:"text-white",wind_foreground:"text-yellow-400",altimeter_foreground:"text-blue-400",metar:"text-white"},
  buttons:{SIA:{background:"bg-slate-800",hover:"bg-gray-700",foreground:"text-white"},WX:{background:"bg-blue-800",hover:"bg-blue-700",foreground:"text-white"},SOP:{background:"bg-green-800",hover:"bg-green-700",foreground:"text-white"},PIREPS:{background:"bg-yellow-800",hover:"bg-yellow-700",foreground:"text-white"},CHARTS:{background:"bg-purple-800",hover:"bg-purple-700",foreground:"text-white"},BRIEF:{background:"bg-rose-900",hover:"bg-rose-800",foreground:"text-white"},Login:{background:"bg-slate-800",hover:"bg-gray-700",foreground:"text-white"}}},
 weather:{"PRE-DUTY BRIEF":{videoUrl:"https://www.weather.gov/media/zid/ZIDPDWB.mp4"},
  "SATELLITE (GOES-19 CGL)":{images:[{title:"GeoColor",src:"https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/cgl/GEOCOLOR/1200x1200.jpg"},{title:"Clean IR",src:"https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/cgl/13/1200x1200.jpg"}]}},
 views:[{name:"KIND",default:true,facilities:["IND"],sops:"https://wiki.flyindycenter.com/"}],
 airports:[{name:"IND",icao:"KIND",mag_var:0,hours:{continuous:true}}]};
let c=def;try{const s=JSON.parse(localStorage.getItem("ids_config")||"null");if(s)c=Object.assign({},def,s)}catch(e){}
window.IDS_DEFAULT=def;window.IDS_HRS=hrs;window.IDS_CONFIG=c;
document.title=c.subdivision.id+" IDS";
})();
