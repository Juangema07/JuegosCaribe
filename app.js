
const $=s=>document.querySelector(s),menu=$("#menu"),game=$("#game"),content=$("#gameContent"),stamps=$("#stamps"),total=$("#totalScore"),progress=$("#progress");
const games=["ritmo","cocina","rescate","pesca","eco"],icons={ritmo:"🥁",cocina:"🍲",rescate:"🐢",pesca:"🎣",eco:"🌊"};
let state=JSON.parse(localStorage.getItem("rutaCaribe")||'{"score":0,"done":[]}'),timer;

function save(){localStorage.setItem("rutaCaribe",JSON.stringify(state));total.textContent=state.score;progress.textContent=state.done.length+"/5";stamps.innerHTML='<div class="stamp-row">'+games.map(g=>'<span class="stamp '+(state.done.includes(g)?"done":"")+'">'+(state.done.includes(g)?icons[g]:"○")+"</span>").join("")+"</div>"}
function complete(g,p){if(!state.done.includes(g))state.done.push(g);state.score+=p;save()}
function open(g){clearInterval(timer);menu.classList.add("hidden");game.classList.remove("hidden");({ritmo,cocina,rescate,pesca,eco}[g])()}
$("#back").onclick=()=>{clearInterval(timer);game.classList.add("hidden");menu.classList.remove("hidden");save()};
document.querySelectorAll("[data-game]").forEach(b=>b.onclick=()=>open(b.dataset.game));save();

function result(g,p,t){complete(g,p);content.innerHTML='<div class="card" style="text-align:center"><div class="dish">'+icons[g]+'</div><h2>'+t+'</h2><p class="score-big">+'+p+' puntos</p><p>Marcador total: <b>'+state.score+'</b></p><button class="primary" onclick="open(\''+g+'\')">Jugar otra vez</button> <button class="back" onclick="document.querySelector(\'#back\').click()">Menú</button></div>'}

function ritmo(){
 let round=0,score=0,combo=0,pattern=[],input=[],playing=false;
 const ins=["tambora","maracas","guira","guiro"],labels=["Tambora","Maracas","Güira","Güiro"],faces=["🥁","🪇","〰️","〰️"];
 const src={tambora:"https://commons.wikimedia.org/wiki/Special:FilePath/Handpercs.ogg",maracas:"https://commons.wikimedia.org/wiki/Special:FilePath/Maracas.ogg",guira:"https://commons.wikimedia.org/wiki/Special:FilePath/G%C3%BCira.ogg",guiro:"https://commons.wikimedia.org/wiki/Special:FilePath/Guiro.ogg"},cache={};
 const sound=n=>{cache[n]??=new Audio(src[n]);cache[n].currentTime=0;cache[n].volume=.9;cache[n].play().catch(()=>{})};
 function make(){pattern=Array.from({length:round<2?3:round<4?4:5},()=>Math.floor(Math.random()*4));input=[]}
 function render(){content.innerHTML='<div class="card rhythm-card"><div class="game-head"><h2>🥁 El Ritmo del Caribe</h2><span class="badge">Ronda '+(round+1)+'/5</span></div><p>Escucha el ritmo. Durante la reproducción no aparecen los instrumentos; después usa los de abajo para repetirlo.</p><div class="listen-box" id="listenBox"><div class="listen-wave">〰︎ 〰︎ 〰︎</div><b id="listenText">Pulsa ESCUCHAR RITMO</b><small>Solo escucha y memoriza.</small></div><div class="rhythm-pad">'+ins.map((x,i)=>'<button class="rhythm-btn" data-v="'+i+'" disabled><span>'+faces[i]+'</span><small>'+labels[i]+'</small></button>').join("")+'</div><div class="action-row"><button class="primary big-action" id="startRhythm">🔊 ESCUCHAR RITMO</button></div><div class="feedback" id="fb">Primero escucha.</div></div>';document.querySelectorAll(".rhythm-btn").forEach(b=>b.onclick=()=>tap(+b.dataset.v));$("#startRhythm").onclick=show}
 async function show(){if(playing)return;playing=true;$("#startRhythm").disabled=true;const box=$("#listenBox");document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);$("#listenText").textContent="Escucha…";box.classList.add("listening");for(const n of pattern){await new Promise(r=>setTimeout(r,100));box.classList.add("beat");sound(ins[n]);await new Promise(r=>setTimeout(r,540));box.classList.remove("beat")}box.classList.remove("listening");$("#listenText").textContent="Ahora repítelo";$("#fb").textContent="¡Tu turno!";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=false);playing=false}
 function tap(v){if(playing)return;if(v!==pattern[input.length]){combo=0;$("#fb").textContent="❌ No era ese. Escucha otra vez.";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{input=[];show()},600);return}input.push(v);sound(ins[v]);const b=document.querySelector('[data-v="'+v+'"]');b.classList.add("active");setTimeout(()=>b.classList.remove("active"),160);if(input.length===pattern.length){combo++;const p=70+combo*25;score+=p;$("#fb").textContent="🔥 ¡Correcto! +"+p;document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{round++;if(round>=5)result("ritmo",score,"¡Ritmo completado!");else{make();render()}},650)}}
 make();render();
}

const dishes=[
 {name:"Arroz de coco",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arroz_con_coco.JPG"},
 {name:"Arepa de huevo",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arepa_de_huevo.jpg"},
 {name:"Carimañolas",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Carima%C3%B1olas_empanadas_arepas_de_huevo.jpg"},
 {name:"Fritanga barranquillera",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Fritanga_barranquillera.jpg"}];
function cocina(){
 let round=0,score=0,step=0,pos=5,dir=1,loop;
 function play(){const d=dishes[round%dishes.length];step=0;content.innerHTML='<div class="card kitchen-card"><div class="game-head"><h2>🍲 La Cocina Caribe</h2><span class="badge">Plato '+(round+1)+'/5</span></div><img class="dish-photo" src="'+d.img+'" alt="'+d.name+'"><h3>'+d.name+'</h3><p>Completa tres pasos y pulsa cuando el indicador esté en la zona verde.</p><div class="cook-step" id="cookStep">1 · Preparar</div><div class="heat-bar"><i id="heatNeedle"></i><b></b></div><button class="primary big-action" id="cookHit">🔥 COCINAR</button><div class="feedback" id="cookFb"></div><small class="credit">Foto: Wikimedia Commons</small></div>';clearInterval(loop);pos=5;dir=1;loop=setInterval(()=>{pos+=dir*3.2;if(pos>=95||pos<=5)dir*=-1;$("#heatNeedle").style.left=pos+"%"},55);$("#cookHit").onclick=hit}
 function hit(){const d=Math.abs(pos-50);score+=d<9?80:d<20?50:15;step++;$("#cookFb").textContent=d<9?"⭐ ¡Perfecto!":d<20?"👍 Buen punto":"⚠️ Fuera de punto";if(step<3)$("#cookStep").textContent=["2 · Cocinar","3 · Servir"][step];else{clearInterval(loop);setTimeout(()=>{round++;round<5?play():result("cocina",score,"¡Cocina completada!")},500)}}
 play();
}

function rescate(){
 let sec=30,score=0,rescues=0,playing=true,drag=false;
 content.innerHTML='<div class="card"><div class="game-head"><h2>🐢 Rescate del Caribe</h2><span class="badge">⏱️ <b id="sec">30</b>s</span></div><p>Arrastra la tortuga suavemente hasta los tres nidos. Ya no hay botones bruscos.</p><div class="rescue-map" id="rescueMap"><span class="nest n1">🪺</span><span class="nest n2">🪺</span><span class="nest n3">🪺</span><span class="turtle" id="turtle">🐢</span></div><div class="stat-line"><span>🪺 Rescates: <b id="resc">0</b></span><span>⭐ Puntos: <b id="rp">0</b></span></div></div>';
 const map=$("#rescueMap"),t=$("#turtle");
 function move(x,y){const r=map.getBoundingClientRect();t.style.left=Math.max(4,Math.min(94,(x-r.left)/r.width*100))+"%";t.style.top=Math.max(6,Math.min(90,(y-r.top)/r.height*100))+"%";check()}
 function check(){document.querySelectorAll(".nest").forEach(n=>{if(n.dataset.hit)return;const a=n.getBoundingClientRect(),b=t.getBoundingClientRect();if(Math.abs(a.left-b.left)<45&&Math.abs(a.top-b.top)<45){n.dataset.hit=1;n.style.opacity=.3;score+=70;rescues++;$("#resc").textContent=rescues;$("#rp").textContent=score;if(rescues===3)finish()}})}
 map.addEventListener("pointerdown",e=>{drag=true;map.setPointerCapture(e.pointerId);move(e.clientX,e.clientY)});map.addEventListener("pointermove",e=>drag&&move(e.clientX,e.clientY));map.addEventListener("pointerup",()=>drag=false);map.addEventListener("pointercancel",()=>drag=false);
 for(let i=0;i<4;i++){const o=document.createElement("span");o.className="rescue-rock";o.textContent="🪨";o.style.left=12+Math.random()*75+"%";o.style.top=15+Math.random()*65+"%";map.appendChild(o)}
 timer=setInterval(()=>{sec--;$("#sec").textContent=sec;if(sec<=0)finish()},1000);
 function finish(){if(!playing)return;playing=false;clearInterval(timer);result("rescate",score,"¡Rescate terminado!")}
}

function pesca(){
 let caught=0,score=0,playing=true,cast=false,fish=[];
 content.innerHTML='<div class="card"><div class="game-head"><h2>🎣 Pesca Caribeña</h2><span class="badge"><b id="caught">0</b>/8 peces</span></div><p>Lanza el hilo, mueve el cebo y tira cuando un pez pase por encima.</p><div class="fishing-zone" id="water"><div class="boat">🛶</div><div class="rod">╲</div><div class="line" id="line"></div><div class="bait" id="bait">🪱</div></div><div class="fish-controls"><button class="primary" id="cast">🎣 Lanzar hilo</button><button class="primary" id="reel" disabled>⬆️ Tirar del hilo</button></div><div class="stat-line"><span>⭐ Puntos: <b id="fishScore">0</b></span><span>🪱 Cebo móvil</span></div></div>';
 const water=$("#water"),bait=$("#bait"),line=$("#line");
 function move(e){const r=water.getBoundingClientRect(),x=Math.max(8,Math.min(88,(e.clientX-r.left)/r.width*100)),y=Math.max(35,Math.min(88,(e.clientY-r.top)/r.height*100));bait.style.left=x+"%";bait.style.top=y+"%";line.style.height=Math.max(25,y-7)+"%"}
 water.addEventListener("pointerdown",e=>{if(cast)move(e)});water.addEventListener("pointermove",e=>{if(cast)move(e)});
 $("#cast").onclick=()=>{cast=true;$("#cast").disabled=true;$("#reel").disabled=false};
 $("#reel").onclick=()=>{const b=bait.getBoundingClientRect(),target=fish.find(f=>{const r=f.getBoundingClientRect();return Math.abs(r.left-b.left)<55&&Math.abs(r.top-b.top)<48});if(target){target.remove();fish=fish.filter(x=>x!==target);caught++;score+=70;$("#caught").textContent=caught;$("#fishScore").textContent=score;if(caught>=8)finish()}else{score=Math.max(0,score-10);$("#fishScore").textContent=score}};
 function spawn(){if(!playing)return;const f=document.createElement("span");f.className="swim-fish";f.textContent=["🐟","🐠","🐡","🐟"][Math.floor(Math.random()*4)];f.style.top=25+Math.random()*50+"%";f.style.animationDuration=3+Math.random()*3+"s";water.appendChild(f);fish.push(f);setTimeout(()=>{if(f.isConnected){f.remove();fish=fish.filter(x=>x!==f)}},7000)}
 for(let i=0;i<5;i++)spawn();const sp=setInterval(spawn,1200);
 function finish(){if(!playing)return;playing=false;clearInterval(sp);result("pesca",score,"¡Pesca completada!")}
}

function eco(){
 let sec=35,score=0,health=50,playing=true,spawnLoop;
 const kinds=[["🧴","♻️"],["🥤","♻️"],["🍌","🌱"],["📦","♻️"],["🗑️","🗑️"]];
 content.innerHTML='<div class="card"><div class="game-head"><h2>🌊 Salva el Ecosistema</h2><span class="badge">⏱️ <b id="ecoSec">35</b>s</span></div><p>Arrastra cada residuo al contenedor correcto.</p><div class="eco-sort" id="ecoSort"><div id="ecoItems"></div><div class="bins"><button class="bin recycle" data-bin="♻️">♻️ Reciclaje</button><button class="bin organic" data-bin="🌱">🌱 Orgánico</button><button class="bin trashbin" data-bin="🗑️">🗑️ Basura</button></div></div><div class="stat-line"><span>🌱 Salud: <b id="health">50</b>/100</span><span>⭐ Puntos: <b id="ecoPts">0</b></span></div><div class="meter"><i id="healthBar" style="width:50%"></i></div></div>';
 const area=$("#ecoSort"),items=$("#ecoItems");
 function update(){$("#ecoPts").textContent=score;$("#health").textContent=health;$("#healthBar").style.width=health+"%"}
 function spawn(){const k=kinds[Math.floor(Math.random()*kinds.length)],e=document.createElement("button");e.className="falling-trash";e.textContent=k[0];e.dataset.type=k[1];e.style.left=10+Math.random()*78+"%";e.style.top="5%";items.appendChild(e);let drag=false,moveFn,upFn;e.onpointerdown=ev=>{ev.preventDefault();drag=true;e.setPointerCapture(ev.pointerId);moveFn=x=>{const r=area.getBoundingClientRect();e.style.left=Math.max(2,Math.min(92,(x.clientX-r.left)/r.width*100))+"%";e.style.top=Math.max(2,Math.min(68,(x.clientY-r.top)/r.height*100))+"%"};upFn=x=>{drag=false;const bin=document.elementFromPoint(x.clientX,x.clientY)?.closest(".bin");if(bin){if(bin.dataset.bin===e.dataset.type){score+=45;health=Math.min(100,health+4)}else{score=Math.max(0,score-20);health=Math.max(0,health-10)}update()}e.remove();document.removeEventListener("pointermove",moveFn);document.removeEventListener("pointerup",upFn)};document.addEventListener("pointermove",moveFn);document.addEventListener("pointerup",upFn)}}
 for(let i=0;i<5;i++)spawn();spawnLoop=setInterval(spawn,900);timer=setInterval(()=>{sec--;$("#ecoSec").textContent=sec;if(sec<=0){playing=false;clearInterval(timer);clearInterval(spawnLoop);result("eco",score,"¡Costa clasificada!")}},1000);
}