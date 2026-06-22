const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fact = n => n <= 1 ? 1 : Array.from({length:n},(_,i)=>i+1).reduce((a,b)=>a*b,1);
const nPr = (n,r) => r<0 || r>n ? 0 : Array.from({length:r},(_,i)=>n-i).reduce((a,b)=>a*b,1);
const sleep = ms => new Promise(r=>setTimeout(r,ms));

$$('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  $$('.panel').forEach(p=>p.classList.remove('active')); $('#'+btn.dataset.tab).classList.add('active');
}));

const tourPlaces = [
  {id:'a', name:'a 해변'}, {id:'b', name:'b 오름'}, {id:'c', name:'c 폭포'}, {id:'d', name:'d 박물관'}
];
let tourSelected = [];
function renderPlaces(){
  const box = $('#places'); box.innerHTML='';
  tourPlaces.forEach(p=>{
    const b=document.createElement('button'); b.className='place'+(tourSelected.includes(p.id)?' used':'');
    b.innerHTML=`📍<br>${p.name}`; b.disabled=tourSelected.includes(p.id)||tourSelected.length>=2;
    b.onclick=()=>{ tourSelected.push(p.id); updateTour(); };
    box.appendChild(b);
  });
}
function updateTour(){
  renderPlaces();
  $('#slot0').textContent = tourSelected[0] ? tourPlaces.find(p=>p.id===tourSelected[0]).name : '?';
  $('#slot1').textContent = tourSelected[1] ? tourPlaces.find(p=>p.id===tourSelected[1]).name : '?';
  if(tourSelected.length===0) $('#tourThinking').innerHTML='<b>생각 시작!</b> 오전에 갈 곳은 4가지입니다.';
  if(tourSelected.length===1) $('#tourThinking').innerHTML=`<b>1단계 완료!</b> 오전에 ${$('#slot0').textContent}을 골랐으므로, 오후에는 그곳을 제외한 <b>3가지</b>만 남습니다.`;
  if(tourSelected.length===2) $('#tourThinking').innerHTML=`<b>2단계 완료!</b> 오전과 오후의 순서가 정해졌습니다. 전체 가능한 일정은 4 × 3 = <b>12가지</b>입니다.`;
  renderTourTree();
}
function renderTourTree(){
  const tree=$('#tourTree'); tree.innerHTML='';
  tourPlaces.forEach(first=>{
    const row=document.createElement('div'); row.className='branch'; row.innerHTML=`<span>${first.id}</span><div class="line"></div>`;
    tourPlaces.filter(p=>p.id!==first.id).forEach(second=>{
      const s=document.createElement('span'); s.textContent=first.id+second.id; row.appendChild(s);
    });
    tree.appendChild(row);
  });
}
$('#tourReset').onclick=()=>{tourSelected=[]; updateTour();};
updateTour();

function syncRanges(){
  const n=+$('#nRange').value; const rRange=$('#rRange');
  rRange.max=n; if(+rRange.value>n) rRange.value=n;
  $('#nVal').textContent=n; $('#rVal').textContent=rRange.value;
  renderSeats(false);
}
$('#nRange').oninput=syncRanges; $('#rRange').oninput=syncRanges;
function renderSeats(activeIndex=-1){
  const n=+$('#nRange').value, r=+$('#rRange').value;
  const stage=$('#seatStage'); stage.innerHTML='<div class="seat-row"></div>'; const row=stage.querySelector('.seat-row');
  for(let i=0;i<r;i++){
    const count=n-i; const seat=document.createElement('div'); seat.className='seat '+(activeIndex===i?'active':'');
    seat.innerHTML=`<div class="seat-title">${i+1}째 자리</div><div class="choice-count">${count}</div><div class="mini-balls">${Array.from({length:count},(_,j)=>`<span class="ball">${j+1}</span>`).join('')}</div>`;
    row.appendChild(seat);
  }
  const terms=Array.from({length:r},(_,i)=>n-i);
  $('#equationBuilder').innerHTML=`${n}P${r} = ${terms.join(' × ')} = ${nPr(n,r)}`;
}
$('#animateFormula').onclick=async()=>{
  const n=+$('#nRange').value, r=+$('#rRange').value; $('#equationBuilder').innerHTML=`${n}P${r} = `;
  for(let i=0;i<r;i++){ renderSeats(i); $('#equationBuilder').innerHTML += `<span class="term">${n-i}</span>${i<r-1?' × ':''}`; await sleep(650); }
  $('#equationBuilder').innerHTML += ` <span class="term">= ${nPr(n,r)}</span>`; renderSeats(false);
};
syncRanges();

function permutations(arr, r){
  if(r===0) return [[]];
  const out=[];
  arr.forEach((x,i)=>{
    const rest=arr.slice(0,i).concat(arr.slice(i+1));
    permutations(rest,r-1).forEach(p=>out.push([x,...p]));
  });
  return out;
}
$('#generatePerms').onclick=()=>{
  const items=$('#itemsInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  let r=+$('#genR').value; if(r>items.length) r=items.length; if(r<1) r=1; $('#genR').value=r;
  const all=permutations(items,r); const limit=$('#limitView').checked?120:all.length;
  $('#genSummary').innerHTML=`서로 다른 ${items.length}개에서 ${r}개를 순서대로 택합니다. <b>${items.length}P${r} = ${nPr(items.length,r)}가지</b>` + (all.length>limit?` · 화면에는 처음 ${limit}개만 표시합니다.`:'');
  const groups=$('#permGroups'); groups.innerHTML='';
  items.forEach(first=>{
    const list=all.filter(p=>p[0]===first).slice(0,limit);
    if(!list.length) return;
    const card=document.createElement('div'); card.className='perm-group';
    card.innerHTML=`<h3>${first}로 시작하는 경우</h3><p>${items.length-1}P${r-1} = ${nPr(items.length-1,r-1)}가지</p>`;
    list.slice(0,30).forEach(p=>{ const chip=document.createElement('span'); chip.className='perm-chip'; chip.textContent=p.join(''); card.appendChild(chip); });
    if(list.length>30) card.innerHTML += `<p class="hint">… ${list.length-30}개 더 있음</p>`;
    groups.appendChild(card);
  });
};

function renderFactorial(){
  const n=+$('#factN').value; $('#factNVal').textContent=n;
  const people=Array.from({length:n},(_,i)=>String.fromCharCode(65+i));
  $('#lineStage').innerHTML=`<div class="line-people">${people.map(x=>`<span class="person">${x}</span>`).join('')}</div>`;
  $('#factFormula').textContent=`${n}! = ${Array.from({length:n},(_,i)=>n-i).join(' × ')} = ${fact(n)}`;
  $('#album').innerHTML='';
}
$('#factN').oninput=renderFactorial;
$('#shuffleLine').onclick=()=>{
  const n=+$('#factN').value; const arr=Array.from({length:n},(_,i)=>String.fromCharCode(65+i)).sort(()=>Math.random()-.5);
  $('#lineStage').innerHTML=`<div class="line-people">${arr.map(x=>`<span class="person">${x}</span>`).join('')}</div>`;
};
$('#showAlbum').onclick=()=>{
  const n=+$('#factN').value; const arr=Array.from({length:n},(_,i)=>String.fromCharCode(65+i)); const all=permutations(arr,n);
  $('#album').innerHTML=all.slice(0,5040).map(p=>`<div class="album-card">${p.join(' - ')}</div>`).join('');
};
renderFactorial();

function renderMission(kind='near'){
  const stage=$('#sledStage'), steps=$('#missionSteps');
  if(kind==='near'){
    stage.innerHTML=`<div class="sled"><div class="sled-seat"><span class="block">A B</span></div><div class="sled-seat">C</div><div class="sled-seat">D</div></div>`;
    steps.innerHTML=['A와 B를 하나의 블록으로 묶습니다. AB 또는 BA가 가능하므로 내부 순서는 2!입니다.','[AB], C, D 세 덩어리를 일렬로 앉히는 경우는 3!입니다.','따라서 전체 경우의 수는 3! × 2! = 12입니다.'].map(s=>`<div class="mission-step">${s}</div>`).join('');
  } else {
    stage.innerHTML=`<div class="sled"><div class="sled-seat edge">C/D</div><div class="sled-seat">A/B</div><div class="sled-seat">A/B</div><div class="sled-seat edge">D/C</div></div>`;
    steps.innerHTML=['양 끝 두 자리에 C와 D를 배치합니다. 왼쪽/오른쪽을 바꿀 수 있으므로 2!입니다.','가운데 두 자리에 A와 B를 배치합니다. 순서를 바꿀 수 있으므로 2!입니다.','따라서 전체 경우의 수는 2! × 2! = 4입니다.'].map(s=>`<div class="mission-step">${s}</div>`).join('');
  }
}
$$('.mission-card').forEach(b=>b.onclick=()=>{ $$('.mission-card').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderMission(b.dataset.mission); });
renderMission();

const quizzes=[
  {q:'서로 다른 그림 6점 중 4점을 택하여 벽에 나란히 전시하는 경우의 수는?', a:360, h:'전시 위치 4칸이 있고, 첫째 6가지 → 둘째 5가지 → 셋째 4가지 → 넷째 3가지입니다.'},
  {q:'서로 다른 문자 A, B, C, D 중 3개를 택하여 일렬로 나열하는 경우의 수는?', a:24, h:'4P3 = 4 × 3 × 2입니다.'},
  {q:'7P1의 값은?', a:7, h:'한 자리만 고르므로 7가지입니다.'},
  {q:'5P5의 값은?', a:120, h:'모두 줄 세우는 경우이므로 5!입니다.'},
  {q:'A, B, C, D 네 명 중 C와 D가 양 끝에 앉는 경우의 수는?', a:4, h:'양 끝 C,D는 2!, 가운데 A,B도 2!입니다.'}
];
let quiz;
function newQuiz(){ quiz=quizzes[Math.floor(Math.random()*quizzes.length)]; $('#quizQuestion').textContent=quiz.q; $('#quizAnswer').value=''; $('#quizFeedback').className='feedback'; $('#quizFeedback').textContent=''; }
$('#newQuiz').onclick=newQuiz; $('#showHint').onclick=()=>{$('#quizFeedback').className='feedback'; $('#quizFeedback').textContent='힌트: '+quiz.h;};
$('#checkQuiz').onclick=()=>{ const val=+$('#quizAnswer').value; if(val===quiz.a){$('#quizFeedback').className='feedback good'; $('#quizFeedback').innerHTML=`정답입니다! 답은 <b>${quiz.a}</b>입니다.`;} else {$('#quizFeedback').className='feedback bad'; $('#quizFeedback').innerHTML=`조금만 더 생각해 봐요. ${quiz.h}`;} };
newQuiz();
