
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
 let round=0,score=0;
 function play(){
  content.innerHTML='<div class="card"><div class="game-head"><h2>🥁 El Ritmo del Caribe</h2><span class="badge">Ronda '+(round+1)+'/5</span></div><p>Espera el momento exacto y golpea el tambor cuando la nota esté dentro de la zona central.</p><div class="timing"><div class="target"></div><span class="note" id="note">🥁</span></div><div class="action-row"><button class="primary big-action" id="hit">🥁 ¡GOLPEAR!</button></div><div class="feedback" id="fb"></div></div>';
  let x=Math.random()*10,d=1;
  timer=setInterval(()=>{x+=d*3;if(x>94||x<0)d=-d;$("#note").style.left=x+"%"},25);
  $("#hit").onclick=()=>{clearInterval(timer);const dist=Math.abs(x-47.5);const pts=dist<7?120:dist<15?75:25;score+=pts;$("#fb").textContent=pts===120?"¡PERFECTO! 🔥":pts===75?"¡Buen golpe! 👏":"¡Sigue el ritmo! 🎵";setTimeout(()=>{round++;round<5?play():result("ritmo",score,"¡Ritmo completado!")},450)}
 } play()
}

const recipes=[["Arroz de coco",["🥥","🍚","💧","🧂"]],["Arepa de huevo",["🌽","🥚","🫗","🧂"]],["Sancocho costeño",["🥔","🍌","🌽","🍗"]],["Carimañola",["🥔","🥩","🧅","🧂"]],["Enyucado",["🥔","🥥","🧀","🍬"]]];
function cocina(){
 let round=0,score=0;
 function play(){
  const rec=recipes[Math.floor(Math.random()*recipes.length)],pool=[...rec[1],"🍎","🍓","🍪","🥕"].sort(()=>Math.random()-.5),picked=[];
  content.innerHTML='<div class="card"><div class="game-head"><h2>🍲 La Cocina Caribe</h2><span class="badge">Plato '+(round+1)+'/5</span></div><div class="dish">👨‍🍳</div><h3>'+rec[0]+'</h3><p>Arma el plato tocando los 4 ingredientes correctos.</p><div class="cook-grid">'+pool.map((x,i)=>'<button class="ingredient" data-i="'+i+'">'+x+'</button>').join("")+'</div><div class="action-row"><button class="primary big-action" id="serve">🍲 ¡SERVIR!</button></div><div class="feedback" id="fb"></div></div>';
  document.querySelectorAll(".ingredient").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;b.classList.toggle("selected");picked.includes(i)?picked.splice(picked.indexOf(i),1):picked.push(i)});
  $("#serve").onclick=()=>{const good=picked.length===4&&rec[1].every(x=>picked.some(i=>pool[i]===x));score+=good?120:30;$("#fb").textContent=good?"¡Plato listo! 👨‍🍳🔥":"Hay ingredientes que no corresponden.";setTimeout(()=>{round++;round<5?play():result("cocina",score,"¡Cocina completada!")},500)}
 } play()
}

function rescate(){
 let sec=30,score=0,left=45,rescues=0,playing=true;
 content.innerHTML='<div class="card"><div class="game-head"><h2>🐢 Rescate del Caribe</h2><span class="badge">⏱️ <b id="sec">30</b>s</span></div><p>Mueve la tortuga por la playa. Recoge ❤️ y evita 🪨.</p><div class="arena" id="arena"><span class="player" id="player">🐢</span></div><div class="action-row"><button class="primary big-action" id="left">◀ Mover</button><button class="primary big-action" id="right">Mover ▶</button></div><div class="stat-line"><span>❤️ Rescates: <b id="resc">0</b></span><span>⭐ Puntos: <b id="rp">0</b></span></div></div>';
 function move(n){left=Math.max(3,Math.min(88,left+n));$("#player").style.left=left+"%"}
 $("#left").onclick=()=>move(-8);$("#right").onclick=()=>move(8);
 const spawn=setInterval(()=>{if(!playing)return;const e=document.createElement("span"),good=Math.random()<.68;e.className=good?"coin":"obstacle";e.textContent=good?"❤️":"🪨";e.style.left=Math.random()*88+"%";e.style.top="2%";$("#arena").appendChild(e);const fall=setInterval(()=>{let y=parseFloat(e.style.top);e.style.top=y+1.5+"%";if(y>84){clearInterval(fall);e.remove()}if(y>65&&Math.abs(left-parseFloat(e.style.left))<10){clearInterval(fall);if(good){score+=50;rescues++;$("#resc").textContent=rescues;$("#rp").textContent=score;e.remove()}else finish()}},55)},420);
 timer=setInterval(()=>{sec--;$("#sec").textContent=sec;if(sec<=0)finish()},1000);
 function finish(){if(!playing)return;playing=false;clearInterval(spawn);clearInterval(timer);result("rescate",score,"¡Rescate terminado!")}
}

function pesca(){
 let caught=0,score=0,playing=true;
 content.innerHTML='<div class="card"><div class="game-head"><h2>🎣 Pesca Caribeña</h2><span class="badge"><b id="caught">0</b>/8 capturas</span></div><p>Toca los animales marinos para pescarlos. Evita la basura.</p><div class="fish-zone" id="water"></div><p>⭐ Puntos: <b id="fishScore">0</b></p></div>';
 const spawn=setInterval(()=>{if(!playing)return;const e=document.createElement("span"),bad=Math.random()<.22;e.className=bad?"trash":"fish";e.textContent=bad?"🗑️":["🐟","🐠","🦀","🐡","🐙"][Math.floor(Math.random()*5)];e.style.left=Math.random()*88+"%";e.style.top=Math.random()*82+"%";$("#water").appendChild(e);e.onclick=()=>{if(bad)score=Math.max(0,score-40);else{score+=50;caught++;$("#caught").textContent=caught}$("#fishScore").textContent=score;e.remove();if(caught>=8)finish()};setTimeout(()=>e.remove(),1500)},350);
 function finish(){if(!playing)return;playing=false;clearInterval(spawn);result("pesca",score,"¡Pesca completada!")}
}

function eco(){
 let sec=35,score=0,health=50,playing=true;
 content.innerHTML='<div class="card"><div class="game-head"><h2>🌊 Salva el Ecosistema</h2><span class="badge">⏱️ <b id="ecoSec">35</b>s</span></div><p>Limpia la costa: toca la basura para retirarla. ¡Los animales no se tocan!</p><div class="eco-board" id="ecoBoard" style="position:relative;height:320px;border-radius:22px;background:linear-gradient(#91ddeb 0 57%,#d9c184 57%);overflow:hidden"></div><div class="stat-line"><span>🌱 Salud: <b id="health">50</b>/100</span><span>⭐ Puntos: <b id="ecoPts">0</b></span></div><div class="meter"><i id="healthBar" style="width:50%;background:#159a83"></i></div></div>';
 const board=$("#ecoBoard");
 function spawn(){const e=document.createElement("button");e.className="eco-item";e.textContent=["🗑️","🧴","🥤","🛍️","🪣","🧃"][Math.floor(Math.random()*6)];e.style.left=Math.random()*88+"%";e.style.top=60+Math.random()*27+"%";e.onclick=()=>{if(!playing)return;score+=40;health=Math.min(100,health+6);$("#ecoPts").textContent=score;$("#health").textContent=health;$("#healthBar").style.width=health+"%";e.remove();spawn()};board.appendChild(e)}
 for(let i=0;i<7;i++)spawn();
 timer=setInterval(()=>{sec--;$("#ecoSec").textContent=sec;if(sec<=0){playing=false;clearInterval(timer);result("eco",score,"¡Costa limpiada! 🌱")}},1000);
}
