(function(){
'use strict';

// The board is a fill puzzle: queen conchs *place* tiles. Five jobs max, ever.
var DATA=window.ISLAND_LEVELS||[];
var PAL={X:'#41404e',A:'#24a6a9',Y:'#f1c852',P:'#ec75b3',C:'#f18e79',W:'#fff9e8',B:'#5294bd',O:'#f3ab61',G:'#61aa73',R:'#e55f64',L:'#977db8',S:'#dcb588',D:'#575267',H:'#f7df81',N:'#2a537b',T:'#217985',V:'#88c6c4'};
var LABEL={X:'slate',A:'aquamarine',Y:'gold',P:'pink',C:'coral',W:'white',B:'blue',O:'orange',G:'green',R:'red',L:'purple',S:'sand',D:'dark slate',H:'yellow',N:'navy',T:'deep sea',V:'sky'};
var SVG_NS='http://www.w3.org/2000/svg';
var $=function(id){return document.getElementById(id)};
var state={level:1,unlocked:1,speed:1,slots:[null,null,null,null,null],pending:[[],[],[]],grid:[],cells:{},available:{},reserved:new Set(),placed:0,total:0,ended:false,paused:false,stackCount:3,token:0,timers:new Set(),hintTimer:0};
var slots=[].slice.call(document.querySelectorAll('.slot'));
var cols=[];
var workerLayer=$('workers');
var overlay=$('dialogBackdrop');
var conchSVG='<svg viewBox="0 0 62 55" aria-hidden="true"><ellipse cx="30" cy="48" rx="28" ry="5" fill="#84614b" opacity=".2"/><path d="M4 38Q8 27 23 31Q38 32 52 27Q60 29 60 39Q57 48 42 49L12 47Q4 45 4 38Z" fill="#f8d2a1" stroke="#725263" stroke-width="2.2"/><path d="M18 32L12 16L21 20L28 4L35 18L44 12L44 29" fill="#f5a76d" stroke="#754654" stroke-width="2" stroke-linejoin="round"/><path d="M16 33Q17 12 33 12Q48 12 49 31Q42 42 23 42Z" fill="#ffc28e" stroke="#81536e" stroke-width="2.8"/><path d="M18 30Q21 14 34 15Q46 19 45 31Q41 39 28 37Q22 35 23 29Q24 23 31 24Q37 27 33 31" fill="none" stroke="#e47798" stroke-width="4.3" stroke-linecap="round"/><path d="M14 34Q21 43 41 41Q54 41 53 34" fill="none" stroke="#e783ab" stroke-width="4"/><path d="M51 32Q55 27 55 15M44 31Q43 22 45 15" fill="none" stroke="#795468" stroke-width="2"/><circle cx="55" cy="13" r="3.5" fill="#f5d4a2" stroke="#5b465b" stroke-width="1.4"/><circle cx="45" cy="13" r="3.5" fill="#f5d4a2" stroke="#5b465b" stroke-width="1.4"/><circle cx="56" cy="12" r="1.3" fill="#343345"/><circle cx="46" cy="12" r="1.3" fill="#343345"/><rect class="cargo" x="1" y="25" width="10" height="10" rx="2"/><path d="M53 41Q44 50 35 47" fill="none" stroke="#a86d86" stroke-width="2"/></svg>';

function schedule(fn,ms){var gen=state.token,id=setTimeout(function(){state.timers.delete(id);if(gen!==state.token||state.ended)return;fn()},ms);state.timers.add(id);return id}
function cancelAll(){state.token++;state.timers.forEach(clearTimeout);state.timers.clear();state.reserved.clear();clearTimeout(state.hintTimer)}
function save(){try{localStorage.setItem('conchCrawlUnlocked',String(state.unlocked))}catch(_){}}
function load(){try{var v=parseInt(localStorage.getItem('conchCrawlUnlocked'),10);return Number.isFinite(v)?Math.min(DATA.length,Math.max(1,v)):1}catch(_){return 1}}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,function(v){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]})}
function chapter(n){return n<=5?'FOUNDATIONS':n<=11?'ISLAND ICONS':n<=18?'LANDMARKS':n<=24?'ISLAND LIFE':'BAHAMAS AFTER DARK'}
function gridKey(x,y){return x+','+y}
function setHint(text,temporary){$('hint').textContent=text;if(temporary){clearTimeout(state.hintTimer);state.hintTimer=setTimeout(function(){if(!state.ended)$('hint').textContent='Your conchs are carrying colours to the picture.'},2000)}}
function announce(msg){var t=$('toast');t.textContent=msg;t.classList.add('visible');clearTimeout(announce._timer);announce._timer=setTimeout(function(){t.classList.remove('visible')},1450)}
function makeRect(x,y,c,cls){var r=document.createElementNS(SVG_NS,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width','.95');r.setAttribute('height','.95');r.setAttribute('rx','.08');r.setAttribute('class',cls);if(c)r.setAttribute('fill',PAL[c]);return r}
function renderBoard(){
 var d=DATA[state.level-1], svg=$('board'),frag=document.createDocumentFragment();
 var w=d.art[0].length,h=d.art.length;
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('aria-label',d.name+' pixel picture');
 svg.replaceChildren();state.cells={};state.available={};state.grid=d.art.map(function(row){return row.split('')});state.placed=0;state.total=0;
 // Pale shadows show the complete silhouette. Conchs progressively replace these with coloured blocks.
 for(var y=0;y<h;y++)for(var x=0;x<w;x++){
  var color=state.grid[y][x];if(color==='.')continue;
  var key=gridKey(x,y),node=makeRect(x,y,null,'cell-base');node.style.fill=PAL[color];
  node.dataset.colour=color;state.cells[key]=node;frag.appendChild(node);
  if(!state.available[color])state.available[color]=[];
  state.available[color].push({x:x,y:y,key:key});state.total++;
 }
 svg.appendChild(frag);
 $('artTitle').textContent=d.name;$('artCaption').textContent=d.caption;
 $('chapterLabel').textContent='· '+chapter(state.level);
 $('levelLabel').textContent='LEVEL '+state.level;
 progress();
}
function progress(){var percent=Math.floor(state.placed/Math.max(1,state.total)*100);$('progressFill').style.width=percent+'%';$('progressText').textContent=percent+'% complete';$('remainingText').textContent=(state.total-state.placed)+' tiles left'}
// A colour is reachable only when at least one of its cells touches the open
// edge of the picture (including cells that were already placed).
// Work then continues inward through adjacent cells of that SAME colour.
function isExposed(p){
 if(!state.cells[p.key])return false;
 return !state.cells[gridKey(p.x+1,p.y)]||!state.cells[gridKey(p.x-1,p.y)]||!state.cells[gridKey(p.x,p.y+1)]||!state.cells[gridKey(p.x,p.y-1)];
}
function reachable(color){
 var cells=state.available[color]||[],seen=new Set(),queue=[],out=[];
 for(var i=0;i<cells.length;i++){
  var p=cells[i];if(!isExposed(p)||seen.has(p.key))continue;
  seen.add(p.key);queue.push(p);
 }
 for(var at=0;at<queue.length;at++){
  var t=queue[at];out.push(t);
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(delta){
   var x=t.x+delta[0],y=t.y+delta[1],key=gridKey(x,y);
   if(seen.has(key)||!state.cells[key]||!state.grid[y]||state.grid[y][x]!==color)return;
   seen.add(key);queue.push({x:x,y:y,key:key});
  });
 }
 return out;
}
// Generate an ordered, finite stock of numbered cards for ALL remaining pixels.
// The solver lays down tiles virtually from the outer edge inward, so every
// preplanned card has a valid sequence and can never paint through a covering tile.
function virtualReachable(color,remaining){
 var cells=state.available[color]||[],seen=new Set(),queue=[],out=[];
 for(var i=0;i<cells.length;i++){
  var p=cells[i];if(!remaining.has(p.key))continue;
  if(remaining.has(gridKey(p.x+1,p.y))&&remaining.has(gridKey(p.x-1,p.y))&&remaining.has(gridKey(p.x,p.y+1))&&remaining.has(gridKey(p.x,p.y-1)))continue;
  seen.add(p.key);queue.push(p);
 }
 for(var at=0;at<queue.length;at++){
  var t=queue[at];out.push(t);
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(delta){
   var x=t.x+delta[0],y=t.y+delta[1],key=gridKey(x,y);
   if(seen.has(key)||!remaining.has(key)||!state.grid[y]||state.grid[y][x]!==color)return;
   seen.add(key);queue.push({x:x,y:y,key:key});
  });
 }
 return out;
}
function configureSupply(){
 // Advanced levels use four stacks, matching the later stages in the reference.
 var supply=$('supplyColumns');
 state.stackCount=state.level>=12?4:3;
 supply.style.setProperty('--stack-count',state.stackCount);
 supply.replaceChildren();cols=[];
 for(var i=0;i<state.stackCount;i++){
  var column=document.createElement('div');column.className='supply-column';
  column.setAttribute('aria-label','Colour stack '+(i+1));
  column.addEventListener('scroll',drawPairLinks,{passive:true});
  supply.appendChild(column);cols.push(column);
 }
 var links=document.createElement('div');links.id='pairLinks';links.className='pair-links';
 links.setAttribute('aria-hidden','true');supply.appendChild(links);
}
function buildDeck(){
 var remaining=new Set(Object.keys(state.cells)),colors=Object.keys(state.available).sort();
 var targetSize=state.level<=18?10:20,last=-1,serial=0;
 state.pending=Array.from({length:state.stackCount},function(){return []});
 var cards=[];
 while(remaining.size){
  var chosen=null,path=null,colorIndex=-1;
  // Alternate between colours whenever possible; retain deterministic order.
  for(var t=1;t<=colors.length;t++){
   var ix=(last+t)%colors.length,c=colors[ix],candidate=virtualReachable(c,remaining);
   if(candidate.length){chosen=c;path=candidate;colorIndex=ix;break}
  }
  if(!path||!path.length)throw Error('Unreachable coloured tiles in level '+state.level);
  var plan=path.slice(0,targetSize);
  plan.forEach(function(tile){remaining.delete(tile.key)});
  // Each of the three stacks has its own head card, with all future cards below.
  var card={id:serial,c:chosen,ammo:plan.length,plan:plan};
  state.pending[serial%state.stackCount].push(card);cards.push(card);serial++;last=colorIndex;
 }
 // Linked double blocks show up from Level 8. Both cards advance together,
 // but their conchs finish and release their own slots independently.
 if(state.level>=8){
  var interval=state.level>=16?8:9;
  for(var at=0;at+1<cards.length;at+=interval){
   if(at%state.stackCount===state.stackCount-1)continue;
   var a=cards[at],b=cards[at+1],pairId='pair-'+at;
   a.pairId=pairId;a.pairSide='left';a.pairWith=b.id;
   b.pairId=pairId;b.pairSide='right';b.pairWith=a.id;
  }
 }
}

function cardNode(card,active){var b=document.createElement('button');b.type='button';b.className='ammo-card'+(active?'':' preview');b.style.background='linear-gradient(160deg,#ffffff5a 0%,transparent 38%,#15132d30 100%),'+PAL[card.c];b.dataset.color=card.c;b.dataset.cardId=card.id;
 if(card.pairId){b.classList.add('paired');b.dataset.pairId=card.pairId;b.dataset.pairSide=card.pairSide}
 b.textContent=card.ammo;var small=document.createElement('small');small.textContent=LABEL[card.c];b.appendChild(small);b.setAttribute('aria-label',card.ammo+' '+LABEL[card.c]+' conch tiles'+(active?'':' coming next'));if(card.pairId){var mark=document.createElement('span');mark.className='pair-mark';mark.textContent='↔';
 mark.setAttribute('aria-hidden','true');b.appendChild(mark)}
 if(!active)b.disabled=true;return b}
function availableChoice(column){
 var card=state.pending[column]&&state.pending[column][0];if(!card)return null;
 var pair=[{column:column,card:card}];
 if(card.pairId){
  var other=column+(card.pairSide==='left'?1:-1);
  var partner=state.pending[other]&&state.pending[other][0];
  if(!partner||partner.pairId!==card.pairId)return null;
  pair.push({column:other,card:partner});
 }
 return pair;
}
function isChoiceReady(column){
 var pair=availableChoice(column);if(!pair)return false;
 if(state.slots.filter(function(s){return s===null}).length<pair.length)return false;
 return pair.some(function(entry){return !!(entry.card.plan[0]&&isExposed(entry.card.plan[0]))});
}
function drawPairLinks(){
 var layer=$('pairLinks');if(!layer)return;
 layer.replaceChildren();
 var region=$('supplyColumns').getBoundingClientRect();
 var seen=new Set();
 cols.forEach(function(col){
  col.querySelectorAll('.ammo-card[data-pair-side="left"]').forEach(function(left){
   var id=left.dataset.pairId;if(seen.has(id))return;seen.add(id);
   var right=$('supplyColumns').querySelector('.ammo-card[data-pair-id="'+id+'"][data-pair-side="right"]');
   if(!right)return;
   var a=left.getBoundingClientRect(),b=right.getBoundingClientRect();
   var y=(a.top+a.bottom+b.top+b.bottom)/4;
   if(y<region.top+3||y>region.bottom-3)return;
   var line=document.createElement('div');line.className='pair-link';
   var x1=a.right-region.left-2,x2=b.left-region.left+2;
   line.style.left=x1+'px';line.style.top=(y-region.top-4)+'px';
   line.style.width=Math.max(6,x2-x1)+'px';layer.appendChild(line);
  });
 });
}
function renderSupply(){
 // Keep the COMPLETE numbered queue visible. Preview cards do not disappear
 // because their picture colour is still covered or a conch is working.
 cols.forEach(function(box,i){
  var scroll=box.scrollTop;box.replaceChildren();
  var col=state.pending[i];
  col.forEach(function(card,j){
   var top=j===0,ready=top&&isChoiceReady(i);
   var btn=cardNode(card,top);
   if(top){
    btn.disabled=!ready||state.paused||state.ended;
    if(!ready){btn.classList.add('buried');btn.title='Clear the covering tiles or wait for two available slots'}
    btn.setAttribute('aria-label',card.ammo+' '+LABEL[card.c]+' tiles'+(card.pairId?' in a linked two-color pair':'')+', '+(ready?'ready to select':'not yet selectable'));
    btn.addEventListener('click',function(){choose(i)});
   }
   box.appendChild(btn);
  });
  if(!col.length){var empty=document.createElement('div');empty.className='empty-supply';empty.textContent='DONE';box.appendChild(empty)}
  box.scrollTop=Math.min(scroll,Math.max(0,box.scrollHeight-box.clientHeight));
 });
 drawPairLinks();
}

function renderSlots(){var count=0;slots.forEach(function(node,i){node.replaceChildren();var job=state.slots[i];node.className='slot'+(job?' active':'');node.style.removeProperty('--slot-col');if(!job){node.setAttribute('aria-label','Empty conch position '+(i+1));return}count++;node.style.setProperty('--slot-col',PAL[job.c]);var icon=document.createElement('span');icon.className='slot-icon';icon.textContent='🐚';var n=document.createElement('span');n.className='slot-number';n.textContent=job.ammo;node.append(icon,n);node.setAttribute('aria-label','Conch '+(i+1)+': '+job.ammo+' '+LABEL[job.c]+' tiles remaining')});$('slotStatus').textContent=count+' / 5'}
function createWorker(index,job){var e=document.createElement('div');e.className='worker';e.style.setProperty('--cargo',PAL[job.c]);e.innerHTML=conchSVG;e.dataset.slot=index;workerLayer.appendChild(e);job.worker=e;var from=slotCenter(index);e.style.left=from.x+'px';e.style.top=from.y+'px';return e}
function slotCenter(i){var a=slots[i].getBoundingClientRect(),g=$('game').getBoundingClientRect();return {x:a.left-g.left+a.width*.5,y:a.top-g.top+a.height*.5}}
function cellCenter(t){var a=$('board').getBoundingClientRect(),g=$('game').getBoundingClientRect(),v=$('board').viewBox.baseVal;var sc=Math.min(a.width/v.width,a.height/v.height);return {x:a.left-g.left+a.width*.5+((t.x+.5)-v.width/2)*sc,y:a.top-g.top+a.height*.5+((t.y+.5)-v.height/2)*sc}}
function moveWorker(e,p,duration){e.style.transitionDuration=duration+'ms';e.style.left=p.x+'px';e.style.top=p.y+'px'}
function choose(column){
 if(state.ended||state.paused)return;
 var pair=availableChoice(column);if(!pair)return;
 var available=state.slots.map(function(s,i){return s===null?i:-1}).filter(function(i){return i!==-1});
 if(available.length<pair.length){announce(pair.length===2?'Linked pair needs TWO free conch slots.':'All five conchs are already working.');return}
 if(!pair.some(function(entry){return entry.card.plan[0]&&isExposed(entry.card.plan[0])})){
  announce('Clear the covering tiles first.');return;
 }
 // Take both cards atomically, then start two workers in two separate slots.
 pair.sort(function(a,b){return a.card.id-b.card.id});
 pair.forEach(function(entry,order){
  state.pending[entry.column].shift();
  var card=entry.card,ix=available[order];
  var job={c:card.c,ammo:card.ammo,id:card.id,worker:null,last:null,slot:ix,plan:card.plan.slice(),pairId:card.pairId||null};
  state.slots[ix]=job;createWorker(ix,job);
  cols[entry.column].scrollTop=0;
  schedule(function(){deliver(job)},65+order*50);
 });
 renderSlots();renderSupply();
 if(pair.length===2)announce('Double choice! Two queen conchs are on their way.');
 if(state.slots.every(Boolean))setHint('All five conchs are working. Wait for a job to finish.',true);
}

function findTarget(job){
 // A job follows its pre-validated outside-in route. Interior colours
 // cannot be selected until the outline bordering them has been placed.
 while(job.plan.length){
  var p=job.plan.shift();if(!state.cells[p.key]||state.reserved.has(p.key))continue;
  if(!isExposed(p)){job.plan.unshift(p);return null}
  state.reserved.add(p.key);return p;
 }
 return null;
}

function paint(job,target){
 if(!state.reserved.has(target.key))return;
 state.reserved.delete(target.key);
 var cell=state.cells[target.key];if(!cell)return;
 cell.setAttribute('class','cell-placed place-shine');cell.setAttribute('fill',PAL[job.c]);cell.removeAttribute('style');
 delete state.cells[target.key];state.placed++;job.ammo--;job.last=target;
 renderSlots();progress();renderSupply();
}

function deliver(job){
 if(state.ended||state.slots[job.slot]!==job)return;
 if(state.paused){schedule(function(){deliver(job)},85);return}
 if(job.ammo===0){goHome(job);return}
 var target=findTarget(job);
 if(!target){
  // Wait for previously assigned neighbouring tiles to become exposed.
  schedule(function(){deliver(job)},95);return
 }
 var duration=Math.max(60,360/state.speed);
 moveWorker(job.worker,cellCenter(target),duration);
 schedule(function(){
  paint(job,target);
  if(state.placed===state.total){win();return}
  schedule(function(){deliver(job)},Math.max(25,76/state.speed));
 },duration+14)
}
function goHome(job){var duration=Math.max(65,270/state.speed);moveWorker(job.worker,slotCenter(job.slot),duration);schedule(function(){
 if(job.worker)job.worker.remove();if(state.slots[job.slot]===job)state.slots[job.slot]=null;
 renderSlots();renderSupply();
 if(!state.slots.some(Boolean))setHint('Choose another colour to keep building.',false);
},duration+16)}
function win(){if(state.ended)return;state.ended=true;state.paused=false;state.reserved.clear();
 if(state.level>=state.unlocked){state.unlocked=Math.min(DATA.length,state.level+1);save()}
 scheduleUntracked(function(){openDialog('win')},420)}
function scheduleUntracked(fn,delay){setTimeout(fn,delay)}
function reset(level){
 cancelAll();state.ended=false;state.paused=false;state.slots=[null,null,null,null,null];state.level=Math.max(1,Math.min(DATA.length,level));workerLayer.replaceChildren();overlay.hidden=true;
 renderBoard();configureSupply();buildDeck();renderSlots();renderSupply();setHint('Top blocks only. Scroll to see what’s next.',false)
}
function action(label,fn,secondary){var b=document.createElement('button');b.textContent=label;if(secondary)b.className='secondary';b.addEventListener('click',fn);$('dialogActions').appendChild(b);return b}
function closeDialog(){overlay.hidden=true;state.paused=false;renderSupply()}
function openDialog(type){state.paused=true;renderSupply();overlay.hidden=false;var actions=$('dialogActions');actions.replaceChildren();$('dialogIcon').textContent=type==='win'?'🏝️':type==='levels'?'🗺️':'🐚';
 if(type==='win'){
  $('dialogTitle').textContent='Island Complete!';$('dialogBody').textContent='Your queen conchs finished '+DATA[state.level-1].name+' — all '+state.total+' tiles placed.';
  if(state.level<DATA.length)action('Play Level '+(state.level+1),function(){reset(state.level+1)});
  else action('Start the island collection again',function(){reset(1)});
  action('Replay this level',function(){reset(state.level)},true);
 } else if(type==='levels'){
  $('dialogTitle').textContent='Choose an island';$('dialogBody').textContent='Unlocked levels are saved on this device.';
  var sel=document.createElement('select');sel.setAttribute('aria-label','Select unlocked level');for(var n=1;n<=state.unlocked;n++){var o=document.createElement('option');o.value=n;o.textContent='Level '+n+' · '+DATA[n-1].name;if(n===state.level)o.selected=true;sel.appendChild(o)}actions.appendChild(sel);
  action('Play selected level',function(){reset(Number(sel.value))});action('Back',closeDialog,true);
 } else {
  $('dialogTitle').textContent='How to play';$('dialogBody').textContent='See the full upcoming colour queues by scrolling the three stacks. Only the top card of each stack can be chosen. If two cards have a link, selecting either starts TWO conchs and uses TWO active slots. Buried pixels must be uncovered first. Tap a top numbered colour to send a queen conch. It crawls to the picture and places one tile at a time. You can run only FIVE conchs at once. A conch keeps its slot until its number reaches zero. Speed up their crawl with the ▶▶ button. Complete every tile to win.';
  action('Continue playing',closeDialog);
  action('Choose a level',function(){openDialog('levels')},true);
  action('Restart level',function(){reset(state.level)},true);
 }
}
$('settingsButton').addEventListener('click',function(){if(!state.ended)openDialog('settings')});
$('restartButton').addEventListener('click',function(){reset(state.level)});
$('speedButton').addEventListener('click',function(){state.speed=state.speed===3?1:state.speed+1;$('speedText').textContent=state.speed+'×';$('speedButton').setAttribute('aria-label','Conch speed '+state.speed+' times');announce('Queen conchs: '+state.speed+'× speed')});
window.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!overlay.hidden&& !state.ended){closeDialog();return}if(state.paused||state.ended)return;if(/^[1234]$/.test(ev.key))choose(Number(ev.key)-1);if(ev.key==='r')reset(state.level)});
window.addEventListener('resize',function(){drawPairLinks();state.slots.forEach(function(job){if(!job||!job.worker)return;job.worker.style.transitionDuration='0ms';if(job.last)moveWorker(job.worker,cellCenter(job.last),0);else moveWorker(job.worker,slotCenter(job.slot),0)})});
// Small deterministic testing interface, does not affect normal gameplay.
window.__conchTest={state:function(){return {level:state.level,placed:state.placed,total:state.total,slots:state.slots.map(function(j){return j&&{c:j.c,ammo:j.ammo,id:j.id}}),columns:state.pending.map(function(col){return col.length}),speed:state.speed,ended:state.ended,paused:state.paused,unlocked:state.unlocked,stackCount:state.stackCount,reserved:state.reserved.size,offers:state.pending.map(function(col,i){return col[0]&&{c:col[0].c,ammo:col[0].ammo,pairId:col[0].pairId||null,ready:isChoiceReady(i)}}),queue:state.pending.map(function(col){return col.map(function(card){return {c:card.c,ammo:card.ammo,id:card.id,pairId:card.pairId||null}})})}},choose:choose,setLevel:function(n){reset(n)},speed:function(n){state.speed=Math.max(1,Math.min(3,n));$('speedText').textContent=state.speed+'×'},tileCount:function(){return Object.keys(state.cells).length},exposed:function(c){return reachable(c).length},isExposed:function(x,y){return isExposed({x:x,y:y,key:gridKey(x,y)})},advanceFull:function(){state.slots.forEach(function(j){if(j&&j.worker)j.worker.remove()});state.slots=[null,null,null,null,null];state.placed=state.total;progress();win()},data:function(){return DATA}};
if(!DATA.length){$('artTitle').textContent='No levels found';$('hint').textContent='The levels.js file did not load.';return}
state.unlocked=load();reset(1);
})();
