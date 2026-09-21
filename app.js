
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
 const src={tambora:"https://commons.wikimedia.org/wiki/Special:FilePath/Tom_drum_8_inch.ogg",maracas:"https://commons.wikimedia.org/wiki/Special:FilePath/Maracas.ogg",guira:"https://commons.wikimedia.org/wiki/Special:FilePath/G%C3%BCira.ogg",guiro:"https://commons.wikimedia.org/wiki/Special:FilePath/Guiro.ogg"},cache={};
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
 let sec=30,score=0,rescues=0,playing=true,drag=false;
 content.innerHTML='<div class="card rescue-card"><div class="game-head"><h2>🐢 Rescate del Caribe</h2><span class="badge">⏱️ <b id="sec">30</b>s</span></div><div class="mission-box"><b>Tu misión</b><span>Guía la tortuga hasta los 3 nidos sin tocar los peligros.</span><small>Arrastra la tortuga con el dedo. Evita rocas, basura y zonas peligrosas.</small></div><div class="rescue-map" id="rescueMap"><div class="sea-label">MAR</div><div class="beach-label">PLAYA</div><span class="hazard h1">🌊</span><span class="hazard h2">🪼</span><span class="hazard h3">🦀</span><span class="hazard h4">🪸</span><span class="nest n1"><b>NIDO 1</b>🪺</span><span class="nest n2"><b>NIDO 2</b>🪺</span><span class="nest n3"><b>NIDO 3</b>🪺</span><span class="turtle" id="turtle">🐢</span><img class="rescue-rock r1" src="assets/rock.svg" alt=""><img class="rescue-rock r2" src="assets/rock.svg" alt=""><img class="rescue-rock r3" src="assets/rock.svg" alt=""></div><div class="rescue-progress"><span>🪺 Nidos: <b id="resc">0</b>/3</span><span>⭐ Puntos: <b id="rp">0</b></span></div></div>';
 const map=$("#rescueMap"),t=$("#turtle");
 function move(x,y){
   const r=map.getBoundingClientRect();
   const px=Math.max(5,Math.min(r.width-5,x-r.left)),py=Math.max(8,Math.min(r.height-8,y-r.top));
   t.style.left=px+"px";t.style.top=py+"px";checkHazards();checkNests();
 }
 function hit(a,b,pad=12){return Math.hypot((a.left+a.width/2)-(b.left+b.width/2),(a.top+a.height/2)-(b.top+b.height/2))<(Math.max(a.width,a.height)+Math.max(b.width,b.height))/2+pad}
 function checkHazards(){
   const tr=t.getBoundingClientRect();
   let danger=false;
   document.querySelectorAll(".hazard,.rescue-rock").forEach(h=>{if(!h.dataset.hit&&hit(tr,h,5))danger=true});
   if(danger){score=Math.max(0,score-15);$( "#rp").textContent=score;t.classList.add("hurt");setTimeout(()=>t.classList.remove("hurt"),220)}
 }
 function checkNests(){
   const tr=t.getBoundingClientRect();
   document.querySelectorAll(".nest").forEach(n=>{if(n.dataset.hit)return;const nr=n.getBoundingClientRect();if(hit(tr,nr,18)){n.dataset.hit=1;n.classList.add("saved");score+=100;rescues++;$("#resc").textContent=rescues;$("#rp").textContent=score;if(rescues===3)finish()}});
 }
 map.addEventListener("pointerdown",e=>{drag=true;map.setPointerCapture(e.pointerId);move(e.clientX,e.clientY)});
 map.addEventListener("pointermove",e=>{if(drag)move(e.clientX,e.clientY)});
 map.addEventListener("pointerup",()=>drag=false);map.addEventListener("pointercancel",()=>drag=false);
 timer=setInterval(()=>{sec--;$("#sec").textContent=sec;if(sec<=0)finish()},1000);
 function finish(){if(!playing)return;playing=false;clearInterval(timer);result("rescate",score,rescues===3?"¡Las tres tortugas están a salvo!":"¡Rescate terminado!")}
}
function pesca(){
 let caught=0,score=0,playing=true,cast=false,fish=[],sp,drag=false;
 content.innerHTML='<div class="card fishing-card"><div class="game-head"><h2>🎣 Pesca Caribeña</h2><span class="badge"><b id="caught">0</b>/8 peces</span></div><p>Primero lanza el hilo. Después mantén el dedo dentro del agua: el cebo y el hilo se moverán exactamente con él. Suelta el dedo cuando el cebo esté junto a un pez.</p><div class="fishing-zone" id="water"><div class="boat">🛶</div><div class="rod">╲</div><div class="line" id="line"></div><div class="bait" id="bait">🪱</div><div class="cast-guide" id="castGuide">Pulsa «Lanzar hilo»</div></div><div class="fish-controls"><button class="primary" id="cast">🎣 Lanzar hilo</button></div><div class="stat-line"><span>⭐ Puntos: <b id="fishScore">0</b></span><span id="fishHint">Primero lanza el hilo.</span></div></div>';
 const water=$("#water"),bait=$("#bait"),line=$("#line"),guide=$("#castGuide");
 function move(clientX,clientY){
   const r=water.getBoundingClientRect();
   const x=Math.max(18,Math.min(r.width-18,clientX-r.left)),y=Math.max(r.height*.22,Math.min(r.height*.9,clientY-r.top));
   bait.style.left=x+"px";bait.style.top=y+"px";
   const rx=r.width*.5,ry=r.height*.10,dx=x-rx,dy=y-ry,len=Math.hypot(dx,dy);
   line.style.width=len+"px";line.style.height="3px";line.style.left=rx+"px";line.style.top=ry+"px";line.style.transform="rotate("+Math.atan2(dy,dx)+"rad)";line.style.transformOrigin="0 50%";
 }
 function nearestFish(){
   const b=bait.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2;
   return fish.find(f=>{const r=f.getBoundingClientRect();return Math.hypot((r.left+r.width/2)-bx,(r.top+r.height/2)-by)<58});
 }
 function catchFish(){
   const target=nearestFish();
   if(target){target.remove();fish=fish.filter(x=>x!==target);caught++;score+=70;$("#caught").textContent=caught;$("#fishScore").textContent=score;$("#fishHint").textContent="🐟 ¡Pez atrapado!";if(caught>=8)finish()}
   else{$("#fishHint").textContent="Acerca más el cebo al pez antes de soltar.";score=Math.max(0,score-5);$("#fishScore").textContent=score}
 }
 water.addEventListener("pointerdown",e=>{if(!cast)return;drag=true;water.setPointerCapture(e.pointerId);move(e.clientX,e.clientY)});
 water.addEventListener("pointermove",e=>{if(drag)move(e.clientX,e.clientY)});
 water.addEventListener("pointerup",e=>{if(drag){move(e.clientX,e.clientY);catchFish()}drag=false});
 water.addEventListener("pointercancel",()=>drag=false);
 $("#cast").onclick=()=>{cast=true;guide.textContent="Mueve el dedo y suelta junto a un pez";guide.classList.remove("hidden");$("#cast").disabled=true;$("#fishHint").textContent="Ahora arrastra el cebo con el dedo."};
 function spawn(){
   if(!playing||!cast)return;
   const f=document.createElement("span");f.className="swim-fish";f.textContent=["🐟","🐠","🐡","🐟"][Math.floor(Math.random()*4)];
   f.style.top=22+Math.random()*62+"%";f.style.animationDuration=3.5+Math.random()*2.5+"s";f.style.animationDirection=Math.random()>.5?"normal":"reverse";water.appendChild(f);fish.push(f);
   setTimeout(()=>{if(f.isConnected){f.remove();fish=fish.filter(x=>x!==f)}},7000)
 }
 let initial=setInterval(()=>{if(cast){clearInterval(initial);for(let i=0;i<5;i++)spawn();sp=setInterval(spawn,1000)}},100);
 function finish(){if(!playing)return;playing=false;clearInterval(sp);clearInterval(initial);result("pesca",score,"¡Pesca completada!")}
}
function eco(){
 let sec=40,score=0,health=50,playing=true,spawnLoop;
 const kinds=[["🧴","♻️","Botella de plástico"],["🥤","♻️","Vaso"],["🍌","🌱","Orgánico"],["🍎","🌱","Orgánico"],["📦","♻️","Cartón"],["🗑️","🗑️","Basura"]];
 content.innerHTML='<div class="card eco-card"><div class="game-head"><h2>🌊 Salva el Ecosistema</h2><span class="badge">⏱️ <b id="ecoSec">40</b>s</span></div><div class="mission-box eco-mission"><b>Clasifica los residuos</b><span>Arrastra cada objeto desde la playa hasta su contenedor.</span><small>No necesitas mover la página: el área de juego bloquea el desplazamiento mientras arrastras.</small></div><div class="eco-sort" id="ecoSort"><div class="eco-title">🏝️ PLAYA DEL CARIBE</div><div id="ecoItems"></div><div class="bins"><button class="bin recycle" data-bin="♻️"><strong>♻️</strong><span>RECICLAJE</span></button><button class="bin organic" data-bin="🌱"><strong>🌱</strong><span>ORGÁNICO</span></button><button class="bin trashbin" data-bin="🗑️"><strong>🗑️</strong><span>BASURA</span></button></div></div><div class="stat-line"><span>🌱 Salud: <b id="health">50</b>/100</span><span>⭐ Puntos: <b id="ecoPts">0</b></span><span>🧹 Residuos: <b id="ecoClean">0</b></span></div><div class="meter"><i id="healthBar" style="width:50%"></i></div></div>';
 const area=$("#ecoSort"),items=$("#ecoItems");let cleaned=0;
 function update(){$("#ecoPts").textContent=score;$("#health").textContent=health;$("#healthBar").style.width=health+"%";$("#ecoClean").textContent=cleaned}
 function spawn(){
   if(!playing)return;
   const k=kinds[Math.floor(Math.random()*kinds.length)],e=document.createElement("button");
   e.className="falling-trash";e.textContent=k[0];e.dataset.type=k[1];e.title=k[2];
   e.style.left=8+Math.random()*84+"%";e.style.top=18+Math.random()*30+"%";items.appendChild(e);
   let dragging=false;
   e.onpointerdown=ev=>{ev.preventDefault();ev.stopPropagation();dragging=true;e.setPointerCapture(ev.pointerId);e.classList.add("dragging")};
   e.onpointermove=ev=>{if(!dragging)return;const r=area.getBoundingClientRect();e.style.left=Math.max(3,Math.min(93,(ev.clientX-r.left)/r.width*100))+"%";e.style.top=Math.max(8,Math.min(68,(ev.clientY-r.top)/r.height*100))+"%"};
   e.onpointerup=ev=>{if(!dragging)return;dragging=false;const el=document.elementFromPoint(ev.clientX,ev.clientY),bin=el&&el.closest(".bin");if(bin&&bin.dataset.bin===e.dataset.type){score+=45;health=Math.min(100,health+5);cleaned++;e.classList.add("correct")}else if(bin){score=Math.max(0,score-20);health=Math.max(0,health-12);e.classList.add("wrong")}update();setTimeout(()=>e.remove(),120)};
   e.onpointercancel=()=>{dragging=false};
 }
 for(let i=0;i<5;i++)spawn();spawnLoop=setInterval(spawn,900);
 timer=setInterval(()=>{sec--;$("#ecoSec").textContent=sec;if(sec<=0){playing=false;clearInterval(timer);clearInterval(spawnLoop);result("eco",score,"¡Ecosistema protegido!")}},1000);
}