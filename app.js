
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
 const src={tambora:"https://commons.wikimedia.org/wiki/Special:FilePath/Bass_drum.ogg",maracas:"https://commons.wikimedia.org/wiki/Special:FilePath/Maracas.ogg",guira:"https://commons.wikimedia.org/wiki/Special:FilePath/G%C3%BCira.ogg",guiro:"https://commons.wikimedia.org/wiki/Special:FilePath/Guiro.ogg"},cache={};
 const sound=n=>{cache[n]??=new Audio(src[n]);const a=cache[n];a.pause();a.currentTime=0;a.volume=.9;clearTimeout(a._shortTimer);a._shortTimer=setTimeout(()=>{a.pause();a.currentTime=0},6000);return a.play().catch(()=>{})};
 function make(){pattern=Array.from({length:round<2?3:round<4?4:5},()=>Math.floor(Math.random()*4));input=[]}
 function render(){
  content.innerHTML='<div class="card rhythm-card"><div class="game-head"><div><span class="game-kicker">RETO DE OÍDO</span><h2>🥁 El Ritmo del Caribe</h2></div><span class="badge">Ronda '+(round+1)+' / 5</span></div><div class="howto"><strong>1. Aprende los sonidos</strong><span>Escucha cada instrumento. Cada sonido dura menos de 1,2 segundos.</span><strong>2. Escucha el patrón</strong><span>No aparecen instrumentos mientras suena. Memorízalo.</span><strong>3. Repite</strong><span>Usa los botones de abajo en el mismo orden.</span></div><div class="listen-box" id="listenBox"><div class="sound-orb"><span>♪</span></div><b id="listenText">Listo para escuchar</b><small id="listenSub">Pulsa el botón cuando estés preparado.</small></div><div class="audio-section"><div class="subhead"><h3>🎧 Prueba los instrumentos</h3><span>Clips cortos</span></div><div class="instrument-list">'+ins.map((x,i)=>'<button class="instrument-audio" data-v="'+i+'"><span>'+faces[i]+'</span><b>'+labels[i]+'</b><small>▶ Oír clip</small></button>').join("")+'</div></div><div class="repeat-section"><div class="subhead"><h3>Tu turno</h3><span>Memoria sonora</span></div><div class="rhythm-pad">'+ins.map((x,i)=>'<button class="rhythm-btn" data-v="'+i+'" disabled><span>'+faces[i]+'</span><small>'+labels[i]+'</small></button>').join("")+'</div></div><div class="action-row"><button class="primary big-action" id="startRhythm">🔊 ESCUCHAR PATRÓN</button></div><div class="feedback" id="fb">Aún no has escuchado el patrón.</div></div>';
  document.querySelectorAll(".rhythm-btn").forEach(b=>b.onclick=()=>tap(+b.dataset.v));
  document.querySelectorAll(".instrument-audio").forEach(b=>b.onclick=()=>sound(ins[+b.dataset.v]));
  $("#startRhythm").onclick=show;
 }
 async function show(){
  if(playing)return;playing=true;$("#startRhythm").disabled=true;document.querySelectorAll(".instrument-audio").forEach(b=>b.disabled=true);
  const box=$("#listenBox");document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);$("#listenText").textContent="Escucha el patrón…";$("#listenSub").textContent="No mires los instrumentos: solo escucha.";box.classList.add("listening");
  for(const n of pattern){await new Promise(r=>setTimeout(r,120));box.classList.add("beat");const audio=cache[ins[n]]??=new Audio(src[ins[n]]);audio.pause();audio.currentTime=0;audio.volume=.9;await audio.play().catch(()=>{});await new Promise(resolve=>{const done=()=>{audio.removeEventListener("ended",done);resolve()};audio.addEventListener("ended",done,{once:true});setTimeout(done,6000)});box.classList.remove("beat");await new Promise(r=>setTimeout(r,120))}
  box.classList.remove("listening");$("#listenText").textContent="Ahora repítelo";$("#listenSub").textContent="Usa los cuatro instrumentos de abajo.";$("#fb").textContent="¡Tu turno!";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=false);playing=false;
 }
 function tap(v){
  if(playing)return;
  if(v!==pattern[input.length]){combo=0;$("#fb").textContent="❌ Orden incorrecto. Vuelve a escuchar.";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{input=[];show()},700);return}
  input.push(v);sound(ins[v]);const b=document.querySelector('.rhythm-btn[data-v="'+v+'"]');b.classList.add("active");setTimeout(()=>b.classList.remove("active"),180);
  if(input.length===pattern.length){combo++;const p=70+combo*25;score+=p;$("#fb").textContent="✓ ¡Patrón correcto! +"+p;document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{round++;if(round>=5)result("ritmo",score,"¡Ritmo completado!");else{make();render()}},700)}
 }
 make();render();
}

const ingredientImages={
 arroz:"https://commons.wikimedia.org/wiki/Special:FilePath/Dry_Rice.jpg",
 coco:"https://commons.wikimedia.org/wiki/Special:FilePath/Coconut.jpg",
 huevo:"https://commons.wikimedia.org/wiki/Special:FilePath/Image_of_eggs.jpg",
 harina:"https://commons.wikimedia.org/wiki/Special:FilePath/Arepa_ingredients.png",
 yuca:"https://commons.wikimedia.org/wiki/Special:FilePath/A_cassava.jpg",
 carne:"https://commons.wikimedia.org/wiki/Special:FilePath/Beef.jpg",
 aceite:"https://commons.wikimedia.org/wiki/Special:FilePath/Cooking_oil.jpg",
 sal:"https://commons.wikimedia.org/wiki/Special:FilePath/Common-salt.jpg",
 cebolla:"https://commons.wikimedia.org/wiki/Special:FilePath/Onion_Garlic_in_Coconut_Oil.JPG"
};
const dishes=[
 {name:"Arroz de coco",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arroz_con_coco.JPG",need:["arroz","coco","sal"]},
 {name:"Arepa de huevo",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arepa_de_huevo.jpg",need:["harina","huevo","aceite","sal"]},
 {name:"Carimañolas",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Carima%C3%B1olas_empanadas_arepas_de_huevo.jpg",need:["yuca","carne","aceite","sal"]},
 {name:"Fritanga barranquillera",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Fritanga_barranquillera.jpg",need:["carne","yuca","aceite","sal"]}
];
const ingredientNames={arroz:"Arroz",coco:"Coco",huevo:"Huevo",harina:"Harina de maíz",yuca:"Yuca",carne:"Carne",aceite:"Aceite",sal:"Sal",cebolla:"Cebolla y ajo"};
function cocina(){
 let round=0,score=0;
 function play(){
  const d=dishes[round%dishes.length], pool=[...new Set([...d.need,"cebolla","coco","huevo","harina","arroz"])].sort(()=>Math.random()-.5);
  let selected=new Set();
  content.innerHTML='<div class="card kitchen-card"><div class="game-head"><h2>🍲 La Cocina Caribe</h2><span class="badge">Plato '+(round+1)+'/5</span></div><img class="dish-photo" src="'+d.img+'" alt="'+d.name+'"><div class="recipe-panel"><div><h3>'+d.name+'</h3><p>Selecciona únicamente los ingredientes de la lista.</p></div><div class="needed-list"><b>Necesitas:</b>'+d.need.map(x=>'<span class="need" data-need="'+x+'">'+ingredientNames[x]+'</span>').join("")+'</div></div><div class="ingredient-grid">'+pool.map(x=>'<button class="ingredient-card" data-ing="'+x+'"><img src="'+ingredientImages[x]+'" alt="'+ingredientNames[x]+'"><b>'+ingredientNames[x]+'</b></button>').join("")+'</div><div class="action-row"><button class="primary big-action" id="serveDish">🍽️ PREPARAR PLATO</button></div><div class="feedback" id="cookFb">0/'+d.need.length+' seleccionados</div><small class="credit">Fotos de platos e ingredientes: Wikimedia Commons.</small></div>';
  document.querySelectorAll(".ingredient-card").forEach(b=>b.onclick=()=>{const x=b.dataset.ing;if(selected.has(x)){selected.delete(x);b.classList.remove("selected")}else{selected.add(x);b.classList.add("selected")}$("#cookFb").textContent=selected.size+"/"+d.need.length+" seleccionados"});
  $("#serveDish").onclick=()=>{const good=d.need.length===selected.size&&d.need.every(x=>selected.has(x));if(good){score+=100;$("#cookFb").textContent="⭐ ¡Ingredientes correctos!";setTimeout(()=>{round++;round<5?play():result("cocina",score,"¡Cocina completada!")},600)}else{$("#cookFb").textContent="❌ Revisa la lista: faltan o sobran ingredientes."}};
 }
 play();
}

function rescate(){
 let sec=40,score=0,rescues=0,playing=true,keys={},moveLoop,timerId;
 content.innerHTML='<div class="card rescue-card"><div class="game-head"><h2>🐢 Rescate del Caribe</h2><span class="badge">⏱️ <b id="sec">40</b>s</span></div><div class="mission-box"><b>Tu misión</b><span>Guía la tortuga hasta los 3 nidos marcados en la playa.</span><small>Muévela con las flechas o los botones. Las rocas bloquean el camino.</small></div><div class="rescue-map" id="rescueMap"><div class="sea-label">MAR</div><div class="beach-label">PLAYA</div><span class="nest n1"><b>NIDO 1</b>🪺</span><span class="nest n2"><b>NIDO 2</b>🪺</span><span class="nest n3"><b>NIDO 3</b>🪺</span><span class="turtle" id="turtle">🐢</span><span class="rescue-rock r1">🪨</span><span class="rescue-rock r2">🪨</span><span class="rescue-rock r3">🪨</span><span class="rescue-rock r4">🪨</span></div><div class="rescue-controls"><button data-dir="up">▲</button><div><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div></div><div class="rescue-progress"><span>🪺 Nidos: <b id="resc">0</b>/3</span><span>⭐ Puntos: <b id="rp">0</b></span></div></div>';
 const map=$("#rescueMap"),t=$("#turtle");let x=15,y=82;
 const obstacles=[{x:28,y:28},{x:55,y:38},{x:78,y:58},{x:48,y:72}],nests=[{x:12,y:18},{x:82,y:30},{x:45,y:82}];
 document.querySelectorAll(".nest").forEach((n,i)=>{n.style.left=nests[i].x+"%";n.style.top=nests[i].y+"%"});
 document.querySelectorAll(".rescue-rock").forEach((r,i)=>{r.style.left=obstacles[i].x+"%";r.style.top=obstacles[i].y+"%"});
 function draw(){t.style.left=x+"%";t.style.top=y+"%";checkNests()}
 function blocked(nx,ny){return obstacles.some(o=>Math.hypot(nx-o.x,ny-o.y)<8)}
 function step(dir){if(!playing)return;let nx=x,ny=y,s=1.7;if(dir==="up")ny-=s;if(dir==="down")ny+=s;if(dir==="left")nx-=s;if(dir==="right")nx+=s;nx=Math.max(6,Math.min(94,nx));ny=Math.max(10,Math.min(90,ny));if(!blocked(nx,ny)){x=nx;y=ny;draw()}}
 function checkNests(){document.querySelectorAll(".nest").forEach(n=>{if(n.dataset.hit)return;const a=n.getBoundingClientRect(),b=t.getBoundingClientRect();if(Math.hypot((a.left+a.width/2)-(b.left+b.width/2),(a.top+a.height/2)-(b.top+b.height/2))<48){n.dataset.hit="1";n.classList.add("saved");score+=100;rescues++;$("#resc").textContent=rescues;$("#rp").textContent=score;if(rescues===3)finish()}})}
 function bindHold(btn){const dir=btn.dataset.dir;let held=null;const stop=()=>{if(held){clearInterval(held);held=null}};btn.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();btn.setPointerCapture(e.pointerId);step(dir);held=setInterval(()=>step(dir),90)});["pointerup","pointercancel","pointerleave"].forEach(ev=>btn.addEventListener(ev,stop))}
 document.querySelectorAll(".rescue-controls button").forEach(bindHold);
 const down=e=>{const d={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key];if(d){e.preventDefault();keys[d]=true}},up=e=>{delete keys[e.key]};window.addEventListener("keydown",down);window.addEventListener("keyup",up);
 moveLoop=setInterval(()=>Object.keys(keys).forEach(step),70);draw();timerId=setInterval(()=>{sec--;$("#sec").textContent=sec;if(sec<=0)finish()},1000);
 function finish(){if(!playing)return;playing=false;clearInterval(timerId);clearInterval(moveLoop);window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);result("rescate",score,rescues===3?"¡Las tres tortugas están a salvo!":"¡Rescate terminado!")}
}

function pesca(){
 let caught=0,score=0,playing=true,cast=false,fish=[],drag=false,spawnLoop;
 content.innerHTML='<div class="card fishing-card"><div class="game-head"><h2>🎣 Pesca Caribeña</h2><span class="badge"><b id="caught">0</b>/8 peces</span></div><div class="fishing-instructions"><b id="fishHint">1. Pulsa LANZAR.</b><span>2. Arrastra el cebo por el agua.</span><span>3. Suelta el dedo encima de un pez.</span></div><div class="fishing-zone" id="water"><div class="boat">🛶</div><div class="rod">╲</div><div class="line" id="line"></div><div class="bait" id="bait">🪱</div><div class="cast-guide" id="castGuide">Pulsa LANZAR para comenzar</div></div><div class="fish-controls"><button class="primary big-action" id="cast">🎣 LANZAR EL HILO</button></div><div class="stat-line"><span>⭐ Puntos: <b id="fishScore">0</b></span><span>🐟 Atrapa: <b id="fishCount">0</b>/8</span></div></div>';
 const water=$("#water"),bait=$("#bait"),line=$("#line"),guide=$("#castGuide"),castBtn=$("#cast");
 function pos(x,y){const r=water.getBoundingClientRect();return{x:Math.max(25,Math.min(r.width-25,x-r.left)),y:Math.max(r.height*.2,Math.min(r.height*.86,y-r.top))}}
 function move(x,y){const p=pos(x,y),r=water.getBoundingClientRect(),rx=r.width*.5,ry=r.height*.1,dx=p.x-rx,dy=p.y-ry,len=Math.max(6,Math.hypot(dx,dy));bait.style.left=p.x+"px";bait.style.top=p.y+"px";line.style.left=rx+"px";line.style.top=ry+"px";line.style.width=len+"px";line.style.height="3px";line.style.transform="rotate("+Math.atan2(dy,dx)+"rad)";line.classList.add("visible")}
 function spawn(){if(!playing||!cast)return;const f=document.createElement("span");f.className="swim-fish";f.textContent=["🐟","🐠","🐡","🐟"][Math.floor(Math.random()*4)];const behavior=Math.floor(Math.random()*4),speed=[7.5,4.2,10.5,6][behavior],startRight=Math.random()>.5;f.style.top=(24+Math.random()*54)+"%";f.style.left=(startRight?"108%":"-8%");f.dataset.dir=startRight?"left":"right";water.appendChild(f);fish.push(f);let last=performance.now(),phase=Math.random()*Math.PI*2,baseTop=parseFloat(f.style.top);function animate(now){if(!f.isConnected)return;const dt=Math.min(40,now-last);last=now;let delta=(f.dataset.dir==="right"?1:-1)*(dt/(speed*10));if(behavior===1&&Math.random()<.018)delta=0;if(behavior===2)delta*=1.8;if(behavior===3){phase+=dt*.007;f.style.top=baseTop+Math.sin(phase)*3+"%"}const next=(parseFloat(f.style.left)||0)+delta;f.style.left=next+"%";if(next>112||next<-12){f.remove();fish=fish.filter(x=>x!==f);return}requestAnimationFrame(animate)}requestAnimationFrame(animate)}
 function nearestFish(){const b=bait.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2;let best=null,dist=Infinity;fish.forEach(f=>{const r=f.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-bx,r.top+r.height/2-by);if(d<dist){dist=d;best=f}});return dist<72?best:null}
 function catchFish(){const target=nearestFish();if(target){target.remove();fish=fish.filter(x=>x!==target);caught++;score+=70;$("#caught").textContent=caught;$("#fishCount").textContent=caught;$("#fishScore").textContent=score;$("#fishHint").textContent="🐟 ¡Atrapado! Busca otro pez.";if(caught>=8)finish()}else{$("#fishHint").textContent="Acerca el cebo al pez y suelta cuando estén juntos."}}
 water.addEventListener("pointerdown",e=>{if(!cast||e.target.closest(".swim-fish"))return;e.preventDefault();e.stopPropagation();drag=true;water.setPointerCapture(e.pointerId);move(e.clientX,e.clientY);guide.classList.add("hidden")});
 water.addEventListener("pointermove",e=>{if(drag){e.preventDefault();move(e.clientX,e.clientY)}});
 water.addEventListener("pointerup",e=>{if(!drag)return;e.preventDefault();move(e.clientX,e.clientY);catchFish();drag=false});water.addEventListener("pointercancel",()=>drag=false);
 castBtn.onclick=()=>{cast=true;castBtn.disabled=true;guide.classList.add("hidden");$("#fishHint").textContent="Arrastra el cebo: los peces tienen velocidades y movimientos diferentes.";move(water.clientWidth/2,water.clientHeight*.55);for(let i=0;i<4;i++)spawn();spawnLoop=setInterval(spawn,1000)};
 function finish(){if(!playing)return;playing=false;clearInterval(spawnLoop);result("pesca",score,"¡Pesca completada!")}
}

function eco(){
 let sec=40,score=0,health=50,playing=true,spawnLoop;
 const kinds=[["🧴","♻️","Plástico"],["🥤","♻️","Lata/vaso"],["🍌","🌱","Orgánico"],["🍎","🌱","Orgánico"],["📦","♻️","Cartón"],["🗑️","🗑️","Basura"]];
 content.innerHTML='<div class="card eco-card"><div class="game-head"><h2>🌊 Salva el Ecosistema</h2><span class="badge">⏱️ <b id="ecoSec">40</b>s</span></div><div class="mission-box eco-mission"><b>¿Qué debes hacer?</b><span>La playa está llena de residuos.</span><small>Arrastra cada objeto al contenedor que corresponde.</small></div><div class="eco-sort" id="ecoSort"><div class="eco-title">🏝️ PLAYA DEL CARIBE</div><div id="ecoItems"></div><div class="bins"><button class="bin recycle" data-bin="♻️"><strong>♻️</strong><span>RECICLAJE</span></button><button class="bin organic" data-bin="🌱"><strong>🌱</strong><span>ORGÁNICO</span></button><button class="bin trashbin" data-bin="🗑️"><strong>🗑️</strong><span>BASURA</span></button></div></div><div class="stat-line"><span>🌱 Salud: <b id="health">50</b>/100</span><span>⭐ Puntos: <b id="ecoPts">0</b></span><span>🧹 Residuos: <b id="ecoClean">0</b></span></div><div class="meter"><i id="healthBar" style="width:50%"></i></div></div>';
 const area=$("#ecoSort"),items=$("#ecoItems");let cleaned=0;
 function update(){$("#ecoPts").textContent=score;$("#health").textContent=health;$("#healthBar").style.width=health+"%";$("#ecoClean").textContent=cleaned}
 function spawn(){
  if(!playing)return;
  const k=kinds[Math.floor(Math.random()*kinds.length)],e=document.createElement("button");
  e.className="falling-trash";e.textContent=k[0];e.dataset.type=k[1];e.title=k[2];
  e.style.left=8+Math.random()*84+"%";e.style.top=10+Math.random()*48+"%";items.appendChild(e);
  e.addEventListener("pointerdown",ev=>{
   ev.preventDefault();ev.stopPropagation();e.setPointerCapture(ev.pointerId);e.classList.add("dragging");document.body.classList.add("dragging-eco");
   const move=mv=>{mv.preventDefault();mv.stopPropagation();const r=area.getBoundingClientRect();e.style.left=Math.max(2,Math.min(92,(mv.clientX-r.left)/r.width*100))+"%";e.style.top=Math.max(4,Math.min(58,(mv.clientY-r.top)/r.height*100))+"%"};
   const up=upEv=>{upEv.preventDefault();upEv.stopPropagation();const bin=document.elementFromPoint(upEv.clientX,upEv.clientY)?.closest(".bin");if(bin){if(bin.dataset.bin===e.dataset.type){score+=45;health=Math.min(100,health+5);cleaned++}else{score=Math.max(0,score-20);health=Math.max(0,health-12)}update()}e.remove();document.removeEventListener("pointermove",move,true);document.removeEventListener("pointerup",up,true);document.body.classList.remove("dragging-eco")};
   document.addEventListener("pointermove",move,true);document.addEventListener("pointerup",up,true);
  },{passive:false});
 }
 for(let i=0;i<5;i++)spawn();spawnLoop=setInterval(spawn,850);timer=setInterval(()=>{sec--;$("#ecoSec").textContent=sec;if(sec<=0){playing=false;clearInterval(timer);clearInterval(spawnLoop);result("eco",score,"¡Ecosistema protegido!")}},1000);
}
function ritmo(){
 let round=0,score=0,combo=0,pattern=[],input=[],playing=false;
 const ins=["tambora","maracas","guira","guiro"],labels=["Tambora","Maracas","Güira","Güiro"],faces=["🥁","🪇","〰️","〰️"];
 const src={tambora:"https://commons.wikimedia.org/wiki/Special:FilePath/Handpercs.ogg",maracas:"https://commons.wikimedia.org/wiki/Special:FilePath/Maracas.ogg",guira:"https://commons.wikimedia.org/wiki/Special:FilePath/G%C3%BCira.ogg",guiro:"https://commons.wikimedia.org/wiki/Special:FilePath/Guiro.ogg"},cache={};
 const sound=n=>{cache[n]??=new Audio(src[n]);const a=cache[n];a.pause();a.currentTime=0;a.volume=.9;a.play().catch(()=>{});clearTimeout(a._shortTimer);a._shortTimer=setTimeout(()=>{a.pause();a.currentTime=0},1150)};
 function make(){pattern=Array.from({length:round<2?3:round<4?4:5},()=>Math.floor(Math.random()*4));input=[]}
 function render(){
  content.innerHTML='<div class="card rhythm-card"><div class="game-head"><div><span class="game-kicker">RETO DE OÍDO</span><h2>🥁 El Ritmo del Caribe</h2></div><span class="badge">Ronda '+(round+1)+' / 5</span></div><div class="howto"><strong>1. Aprende los sonidos</strong><span>Escucha cada instrumento. Cada sonido dura menos de 1,2 segundos.</span><strong>2. Escucha el patrón</strong><span>No aparecen instrumentos mientras suena. Memorízalo.</span><strong>3. Repite</strong><span>Usa los botones de abajo en el mismo orden.</span></div><div class="listen-box" id="listenBox"><div class="sound-orb"><span>♪</span></div><b id="listenText">Listo para escuchar</b><small id="listenSub">Pulsa el botón cuando estés preparado.</small></div><div class="audio-section"><div class="subhead"><h3>🎧 Prueba los instrumentos</h3><span>Clips cortos</span></div><div class="instrument-list">'+ins.map((x,i)=>'<button class="instrument-audio" data-v="'+i+'"><span>'+faces[i]+'</span><b>'+labels[i]+'</b><small>▶ Oír clip</small></button>').join("")+'</div></div><div class="repeat-section"><div class="subhead"><h3>Tu turno</h3><span>Memoria sonora</span></div><div class="rhythm-pad">'+ins.map((x,i)=>'<button class="rhythm-btn" data-v="'+i+'" disabled><span>'+faces[i]+'</span><small>'+labels[i]+'</small></button>').join("")+'</div></div><div class="action-row"><button class="primary big-action" id="startRhythm">🔊 ESCUCHAR PATRÓN</button></div><div class="feedback" id="fb">Aún no has escuchado el patrón.</div></div>';
  document.querySelectorAll(".rhythm-btn").forEach(b=>b.onclick=()=>tap(+b.dataset.v));
  document.querySelectorAll(".instrument-audio").forEach(b=>b.onclick=()=>sound(ins[+b.dataset.v]));
  $("#startRhythm").onclick=show;
 }
 async function show(){
  if(playing)return;playing=true;$("#startRhythm").disabled=true;document.querySelectorAll(".instrument-audio").forEach(b=>b.disabled=true);
  const box=$("#listenBox");document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);$("#listenText").textContent="Escucha el patrón…";$("#listenSub").textContent="No mires los instrumentos: solo escucha.";box.classList.add("listening");
  for(const n of pattern){await new Promise(r=>setTimeout(r,120));box.classList.add("beat");sound(ins[n]);await new Promise(r=>setTimeout(r,650));box.classList.remove("beat")}
  box.classList.remove("listening");$("#listenText").textContent="Ahora repítelo";$("#listenSub").textContent="Usa los cuatro instrumentos de abajo.";$("#fb").textContent="¡Tu turno!";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=false);playing=false;
 }
 function tap(v){
  if(playing)return;
  if(v!==pattern[input.length]){combo=0;$("#fb").textContent="❌ Orden incorrecto. Vuelve a escuchar.";document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{input=[];show()},700);return}
  input.push(v);sound(ins[v]);const b=document.querySelector('.rhythm-btn[data-v="'+v+'"]');b.classList.add("active");setTimeout(()=>b.classList.remove("active"),180);
  if(input.length===pattern.length){combo++;const p=70+combo*25;score+=p;$("#fb").textContent="✓ ¡Patrón correcto! +"+p;document.querySelectorAll(".rhythm-btn").forEach(b=>b.disabled=true);setTimeout(()=>{round++;if(round>=5)result("ritmo",score,"¡Ritmo completado!");else{make();render()}},700)}
 }
 make();render();
}

const ingredientImages={
 arroz:"https://commons.wikimedia.org/wiki/Special:FilePath/Dry_Rice.jpg",
 coco:"https://commons.wikimedia.org/wiki/Special:FilePath/Coconut.jpg",
 huevo:"https://commons.wikimedia.org/wiki/Special:FilePath/Image_of_eggs.jpg",
 harina:"https://commons.wikimedia.org/wiki/Special:FilePath/Arepa_ingredients.png",
 yuca:"https://commons.wikimedia.org/wiki/Special:FilePath/A_cassava.jpg",
 carne:"https://commons.wikimedia.org/wiki/Special:FilePath/Beef.jpg",
 aceite:"https://commons.wikimedia.org/wiki/Special:FilePath/Cooking_oil.jpg",
 sal:"https://commons.wikimedia.org/wiki/Special:FilePath/Common-salt.jpg",
 cebolla:"https://commons.wikimedia.org/wiki/Special:FilePath/Onion_Garlic_in_Coconut_Oil.JPG"
};
const dishes=[
 {name:"Arroz de coco",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arroz_con_coco.JPG",need:["arroz","coco","sal"]},
 {name:"Arepa de huevo",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Arepa_de_huevo.jpg",need:["harina","huevo","aceite","sal"]},
 {name:"Carimañolas",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Carima%C3%B1olas_empanadas_arepas_de_huevo.jpg",need:["yuca","carne","aceite","sal"]},
 {name:"Fritanga barranquillera",img:"https://commons.wikimedia.org/wiki/Special:FilePath/Fritanga_barranquillera.jpg",need:["carne","yuca","aceite","sal"]}
];
const ingredientNames={arroz:"Arroz",coco:"Coco",huevo:"Huevo",harina:"Harina de maíz",yuca:"Yuca",carne:"Carne",aceite:"Aceite",sal:"Sal",cebolla:"Cebolla y ajo"};
function cocina(){
 let round=0,score=0;
 function play(){
  const d=dishes[round%dishes.length], pool=[...new Set([...d.need,"cebolla","coco","huevo","harina","arroz"])].sort(()=>Math.random()-.5);
  let selected=new Set();
  content.innerHTML='<div class="card kitchen-card"><div class="game-head"><h2>🍲 La Cocina Caribe</h2><span class="badge">Plato '+(round+1)+'/5</span></div><img class="dish-photo" src="'+d.img+'" alt="'+d.name+'"><div class="recipe-panel"><div><h3>'+d.name+'</h3><p>Selecciona únicamente los ingredientes de la lista.</p></div><div class="needed-list"><b>Necesitas:</b>'+d.need.map(x=>'<span class="need" data-need="'+x+'">'+ingredientNames[x]+'</span>').join("")+'</div></div><div class="ingredient-grid">'+pool.map(x=>'<button class="ingredient-card" data-ing="'+x+'"><img src="'+ingredientImages[x]+'" alt="'+ingredientNames[x]+'"><b>'+ingredientNames[x]+'</b></button>').join("")+'</div><div class="action-row"><button class="primary big-action" id="serveDish">🍽️ PREPARAR PLATO</button></div><div class="feedback" id="cookFb">0/'+d.need.length+' seleccionados</div><small class="credit">Fotos de platos e ingredientes: Wikimedia Commons.</small></div>';
  document.querySelectorAll(".ingredient-card").forEach(b=>b.onclick=()=>{const x=b.dataset.ing;if(selected.has(x)){selected.delete(x);b.classList.remove("selected")}else{selected.add(x);b.classList.add("selected")}$("#cookFb").textContent=selected.size+"/"+d.need.length+" seleccionados"});
  $("#serveDish").onclick=()=>{const good=d.need.length===selected.size&&d.need.every(x=>selected.has(x));if(good){score+=100;$("#cookFb").textContent="⭐ ¡Ingredientes correctos!";setTimeout(()=>{round++;round<5?play():result("cocina",score,"¡Cocina completada!")},600)}else{$("#cookFb").textContent="❌ Revisa la lista: faltan o sobran ingredientes."}};
 }
 play();
}

function rescate(){
 let sec=40,score=0,rescues=0,playing=true,keys={},moveLoop;
 content.innerHTML='<div class="card rescue-card"><div class="game-head"><h2>🐢 Rescate del Caribe</h2><span class="badge">⏱️ <b id="sec">40</b>s</span></div><div class="mission-box"><b>Tu misión</b><span>Guía la tortuga hasta los 3 nidos marcados en la playa.</span><small>Usa las flechas o mantén pulsados los botones para moverla. Evita las rocas.</small></div><div class="rescue-map" id="rescueMap"><div class="sea-label">MAR</div><div class="beach-label">PLAYA</div><span class="nest n1"><b>NIDO 1</b>🪺</span><span class="nest n2"><b>NIDO 2</b>🪺</span><span class="nest n3"><b>NIDO 3</b>🪺</span><span class="turtle" id="turtle">🐢</span><span class="rescue-rock r1">🪨</span><span class="rescue-rock r2">🪨</span><span class="rescue-rock r3">🪨</span><span class="rescue-rock r4">🪨</span></div><div class="rescue-controls"><button data-dir="up">▲</button><div><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div></div><div class="rescue-progress"><span>🪺 Nidos: <b id="resc">0</b>/3</span><span>⭐ Puntos: <b id="rp">0</b></span></div></div>';
 const map=$("#rescueMap"),t=$("#turtle");
 let x=18,y=72;
 const obstacles=[
  {x:30,y:30},{x:58,y:42},{x:78,y:67},{x:45,y:76}
 ];
 obstacles.forEach((o,i)=>{const r=document.querySelector(".r"+(i+1));r.style.left=o.x+"%";r.style.top=o.y+"%"});
 function draw(){t.style.left=x+"%";t.style.top=y+"%";checkObstacle();checkNests()}
 function blocked(nx,ny){return obstacles.some(o=>Math.hypot(nx-o.x,ny-o.y)<8)}
 function step(dir){
  if(!playing)return;
  let nx=x,ny=y,s=1.8;
  if(dir==="up")ny-=s;if(dir==="down")ny+=s;if(dir==="left")nx-=s;if(dir==="right")nx+=s;
  nx=Math.max(6,Math.min(94,nx));ny=Math.max(12,Math.min(88,ny));
  if(!blocked(nx,ny)){x=nx;y=ny;draw()}
 }
 function checkObstacle(){if(obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<7)){x=Math.max(6,x-2);y=Math.max(12,y-2)}}
 function checkNests(){
  document.querySelectorAll(".nest").forEach(n=>{if(n.dataset.hit)return;const a=n.getBoundingClientRect(),b=t.getBoundingClientRect();if(Math.abs(a.left-b.left)<42&&Math.abs(a.top-b.top)<42){n.dataset.hit=1;n.classList.add("saved");score+=100;rescues++;$("#resc").textContent=rescues;$("#rp").textContent=score;if(rescues===3)finish()}})
 }
 function bindHold(btn){
  const dir=btn.dataset.dir;let held;
  const stop=()=>{clearInterval(held);held=null};
  btn.addEventListener("pointerdown",e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);step(dir);held=setInterval(()=>step(dir),90)});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>btn.addEventListener(ev,stop));
 }
 document.querySelectorAll(".rescue-controls button").forEach(bindHold);
 window.addEventListener("keydown",e=>{const d={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key];if(d){e.preventDefault();keys[d]=true}});
 window.addEventListener("keyup",e=>{delete keys[e.key]});
 moveLoop=setInterval(()=>{Object.keys(keys).forEach(step)},70);
 draw();
 timer=setInterval(()=>{sec--;$("#sec").textContent=sec;if(sec<=0)finish()},1000);
 function finish(){if(!playing)return;playing=false;clearInterval(timer);clearInterval(moveLoop);result("rescate",score,rescues===3?"¡Las tres tortugas están a salvo!":"¡Rescate terminado!")}
}

function pesca(){
 let caught=0,score=0,playing=true,cast=false,fish=[],drag=false,spawnLoop;
 content.innerHTML='<div class="card fishing-card"><div class="game-head"><h2>🎣 Pesca Caribeña</h2><span class="badge"><b id="caught">0</b>/8 peces</span></div><div class="fishing-instructions"><b id="fishHint">1. Pulsa LANZAR.</b><span>2. Arrastra el cebo por el agua.</span><span>3. Suelta el dedo encima de un pez.</span></div><div class="fishing-zone" id="water"><div class="boat">🛶</div><div class="rod">╲</div><div class="line" id="line"></div><div class="bait" id="bait">🪱</div><div class="cast-guide" id="castGuide">Pulsa LANZAR para comenzar</div></div><div class="fish-controls"><button class="primary big-action" id="cast">🎣 LANZAR EL HILO</button></div><div class="stat-line"><span>⭐ Puntos: <b id="fishScore">0</b></span><span>🐟 Atrapa: <b id="fishCount">0</b>/8</span></div></div>';
 const water=$("#water"),bait=$("#bait"),line=$("#line"),guide=$("#castGuide"),castBtn=$("#cast");
 function pos(x,y){const r=water.getBoundingClientRect();return{x:Math.max(25,Math.min(r.width-25,x-r.left)),y:Math.max(r.height*.2,Math.min(r.height*.86,y-r.top))}}
 function move(x,y){const p=pos(x,y),r=water.getBoundingClientRect(),rx=r.width*.5,ry=r.height*.1;bait.style.left=p.x+"px";bait.style.top=p.y+"px";const dx=p.x-rx,dy=p.y-ry,len=Math.hypot(dx,dy);line.style.width=len+"px";line.style.left=rx+"px";line.style.top=ry+"px";line.style.transform="rotate("+Math.atan2(dy,dx)+"rad)"}
 function spawn(){
  if(!playing||!cast)return;
  const f=document.createElement("span");f.className="swim-fish";f.textContent=["🐟","🐠","🐡","🐟"][Math.floor(Math.random()*4)];
  const behavior=Math.floor(Math.random()*4),speed=behavior===0?7.5:behavior===1?4.2:behavior===2?10.5:6;
  f.style.top=(25+Math.random()*52)+"%";f.style.left=(Math.random()>.5?"-8%":"108%");f.dataset.dir=f.style.left==="108%"?"left":"right";f.dataset.behavior=behavior;f.dataset.speed=speed;
  water.appendChild(f);fish.push(f);
  let start=performance.now(),last=start,phase=Math.random()*Math.PI*2,paused=false,pauseUntil=0;
  function animate(now){
   if(!f.isConnected)return;
   const dt=Math.min(40,now-last);last=now;
   if(behavior===1&&now>pauseUntil&&Math.random()<.004){paused=true;pauseUntil=now+350+Math.random()*700}
   if(now>=pauseUntil)paused=false;
   if(!paused){
    const current=parseFloat(f.style.left)||0;
    let delta=(f.dataset.dir==="right"?1:-1)*(dt/(speed*10));
    if(behavior===2)delta*=1.7;
    let next=current+delta;
    if(behavior===3){phase+=dt*.006;f.style.top=(parseFloat(f.dataset.baseTop)||parseFloat(f.style.top))+Math.sin(phase)*0.12+"%"}
    f.style.left=next+"%";
    if(next>112||next<-12){f.remove();fish=fish.filter(x=>x!==f);return}
   }
   requestAnimationFrame(animate)
  }
  f.dataset.baseTop=parseFloat(f.style.top);requestAnimationFrame(animate);
 }
 function nearestFish(){const b=bait.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2;let best=null,dist=Infinity;fish.forEach(f=>{const r=f.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-bx,r.top+r.height/2-by);if(d<dist){dist=d;best=f}});return dist<72?best:null}
 function catchFish(){const target=nearestFish();if(target){target.remove();fish=fish.filter(x=>x!==target);caught++;score+=70;$("#caught").textContent=caught;$("#fishCount").textContent=caught;$("#fishScore").textContent=score;$("#fishHint").textContent="🐟 ¡Atrapado! Lanza y busca otro.";if(caught>=8)finish()}else{score=Math.max(0,score-5);$("#fishScore").textContent=score;$("#fishHint").textContent="Acerca el cebo al pez y suelta cuando estén juntos."}}
 water.addEventListener("pointerdown",e=>{if(!cast||e.target.closest(".swim-fish"))return;drag=true;water.setPointerCapture(e.pointerId);move(e.clientX,e.clientY);guide.classList.add("hidden")});
 water.addEventListener("pointermove",e=>{if(drag)move(e.clientX,e.clientY)});
 water.addEventListener("pointerup",e=>{if(!drag)return;move(e.clientX,e.clientY);catchFish();drag=false});
 water.addEventListener("pointercancel",()=>drag=false);
 castBtn.onclick=()=>{cast=true;castBtn.disabled=true;guide.classList.add("hidden");$("#fishHint").textContent="Arrastra el cebo con el dedo. Los peces ahora tienen velocidades y movimientos distintos.";move(water.clientWidth/2,water.clientHeight*.55);for(let i=0;i<4;i++)spawn();spawnLoop=setInterval(spawn,1000)};
 function finish(){if(!playing)return;playing=false;clearInterval(spawnLoop);result("pesca",score,"¡Pesca completada!")}
}

function eco(){
 let sec=40,score=0,health=50,playing=true,spawnLoop;
 const kinds=[["🧴","♻️","Plástico"],["🥤","♻️","Lata/vaso"],["🍌","🌱","Orgánico"],["🍎","🌱","Orgánico"],["📦","♻️","Cartón"],["🗑️","🗑️","Basura"]];
 content.innerHTML='<div class="card eco-card"><div class="game-head"><h2>🌊 Salva el Ecosistema</h2><span class="badge">⏱️ <b id="ecoSec">40</b>s</span></div><div class="mission-box eco-mission"><b>¿Qué debes hacer?</b><span>La playa está llena de residuos.</span><small>Arrastra cada objeto al contenedor que corresponde. Los aciertos limpian la playa y recuperan el ecosistema.</small></div><div class="eco-sort" id="ecoSort"><div class="eco-title">🏝️ PLAYA DEL CARIBE</div><div id="ecoItems"></div><div class="bins"><button class="bin recycle" data-bin="♻️"><strong>♻️</strong><span>RECICLAJE</span></button><button class="bin organic" data-bin="🌱"><strong>🌱</strong><span>ORGÁNICO</span></button><button class="bin trashbin" data-bin="🗑️"><strong>🗑️</strong><span>BASURA</span></button></div></div><div class="stat-line"><span>🌱 Salud: <b id="health">50</b>/100</span><span>⭐ Puntos: <b id="ecoPts">0</b></span><span>🧹 Residuos: <b id="ecoClean">0</b></span></div><div class="meter"><i id="healthBar" style="width:50%"></i></div></div>';
 const area=$("#ecoSort"),items=$("#ecoItems");
 let cleaned=0;
 function update(){$("#ecoPts").textContent=score;$("#health").textContent=health;$("#healthBar").style.width=health+"%";$("#ecoClean").textContent=cleaned}
 function spawn(){if(!playing)return;const k=kinds[Math.floor(Math.random()*kinds.length)],e=document.createElement("button");e.className="falling-trash";e.textContent=k[0];e.dataset.type=k[1];e.title=k[2];e.style.left=8+Math.random()*84+"%";e.style.top="4%";items.appendChild(e);let moveFn,upFn;
  e.onpointerdown=ev=>{ev.preventDefault();ev.stopPropagation();e.setPointerCapture(ev.pointerId);e.classList.add("dragging");document.body.classList.add("dragging-eco");moveFn=x=>{const r=area.getBoundingClientRect();e.style.left=Math.max(2,Math.min(92,(x.clientX-r.left)/r.width*100))+"%";e.style.top=Math.max(3,Math.min(62,(x.clientY-r.top)/r.height*100))+"%"};upFn=x=>{x.preventDefault();const bin=document.elementFromPoint(x.clientX,x.clientY)?.closest(".bin");if(bin){if(bin.dataset.bin===e.dataset.type){score+=45;health=Math.min(100,health+5);cleaned++}else{score=Math.max(0,score-20);health=Math.max(0,health-12)}update()}e.remove();document.body.classList.remove("dragging-eco");document.removeEventListener("pointermove",moveFn);document.removeEventListener("pointerup",upFn)};document.addEventListener("pointermove",moveFn,{passive:false});document.addEventListener("pointerup",upFn,{passive:false})}
 }
 for(let i=0;i<5;i++)spawn();spawnLoop=setInterval(spawn,850);timer=setInterval(()=>{sec--;$("#ecoSec").textContent=sec;if(sec<=0){playing=false;clearInterval(timer);clearInterval(spawnLoop);result("eco",score,"¡Ecosistema protegido!")}},1000);
}