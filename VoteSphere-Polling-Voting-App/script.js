const seed = [
  {id:"tech", question:"Which technology should developers learn next?", options:[["Artificial Intelligence",42],["Cyber Security",28],["Cloud Computing",18],["Web3",12]]},
  {id:"weekend", question:"What is your ideal weekend activity?", options:[["Travel & Explore",36],["Gaming",27],["Movies & Chill",22],["Sports",15]]},
  {id:"design", question:"Which UI style do you prefer?", options:[["Dark & Neon",51],["Minimal Light",24],["Glassmorphism",17],["Retro",8]]}
];

const key="votesphere_data_v1";
let polls=JSON.parse(localStorage.getItem(key)||"null")||seed.map(p=>({...p,options:p.options.map(([name,pct])=>({name,votes:Math.round(pct)}))}));
const voted=JSON.parse(localStorage.getItem("votesphere_voted")||"[]");

const $=s=>document.querySelector(s);
const grid=$("#pollGrid");

function save(){localStorage.setItem(key,JSON.stringify(polls));localStorage.setItem("votesphere_voted",JSON.stringify(voted))}
function totalVotes(){return polls.reduce((a,p)=>a+p.options.reduce((x,o)=>x+o.votes,0),0)}
function render(){
  grid.innerHTML="";
  polls.forEach(p=>{
    const total=p.options.reduce((a,o)=>a+o.votes,0)||1;
    const isVoted=voted.includes(p.id);
    const card=document.createElement("article"); card.className="poll-card";
    card.innerHTML=`<div class="poll-top"><span class="live">● LIVE</span><span>${total} votes</span></div>
      <h3>${escapeHTML(p.question)}</h3>
      <div>${p.options.map((o,i)=>{
        const pct=Math.round(o.votes/total*100);
        return `<div class="option" data-id="${p.id}" data-index="${i}">
          <div class="option-row"><span>${escapeHTML(o.name)}</span><span>${pct}%</span></div>
          <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>`}).join("")}</div>
      <button class="vote-btn ${isVoted?"voted":""}" ${isVoted?"disabled":""} data-vote="${p.id}">${isVoted?"✓ Vote Recorded":"Cast Your Vote →"}</button>`;
    grid.appendChild(card);
  });
  $("#statPolls").textContent=polls.length;
  $("#liveCount").textContent=polls.length;
  $("#statVotes").textContent=totalVotes().toLocaleString();
  $("#statMine").textContent=voted.length;
}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

grid.addEventListener("click",e=>{
  const btn=e.target.closest("[data-vote]"); if(!btn)return;
  if(voted.includes(btn.dataset.vote))return;
  const poll=polls.find(p=>p.id===btn.dataset.vote);
  const card=btn.closest(".poll-card");
  const selected=card.querySelector(".option.selected");
  if(!selected){showError(btn,"Select an option first.");return}
  poll.options[+selected.dataset.index].votes++;
  voted.push(poll.id); save(); render();
});
grid.addEventListener("click",e=>{
  const op=e.target.closest(".option"); if(!op)return;
  op.closest(".poll-card").querySelectorAll(".option").forEach(x=>x.classList.remove("selected"));
  op.classList.add("selected");
  op.style.transform="scale(1.02)"; setTimeout(()=>op.style.transform="",180);
});
function showError(btn,msg){const old=btn.textContent;btn.textContent=msg;setTimeout(()=>btn.textContent=old,1300)}

const modal=$("#modal");
$("#createBtn").onclick=()=>{modal.classList.remove("hidden");$("#questionInput").focus()};
$("#closeModal").onclick=()=>modal.classList.add("hidden");
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
$("#addOption").onclick=()=>{
  const n=document.querySelectorAll(".option-input").length+1;
  if(n<=6){const i=document.createElement("input");i.className="option-input";i.placeholder=`Option ${n}`;$("#optionInputs").appendChild(i)}
};
$("#savePoll").onclick=()=>{
  const q=$("#questionInput").value.trim();
  const opts=[...document.querySelectorAll(".option-input")].map(i=>i.value.trim()).filter(Boolean);
  $("#error").textContent="";
  if(!q||opts.length<2){$("#error").textContent="Enter a question and at least 2 options.";return}
  polls.unshift({id:"p"+Date.now(),question:q,options:opts.map(name=>({name,votes:0}))});
  save();render();modal.classList.add("hidden");
  $("#questionInput").value="";$("#optionInputs").innerHTML='<input class="option-input" placeholder="Option 1"><input class="option-input" placeholder="Option 2">';
  $("#pollSection").scrollIntoView({behavior:"smooth"});
};
$("#resetBtn").onclick=()=>{
  if(confirm("Reset all demo polls and votes?")){
    localStorage.removeItem(key);localStorage.removeItem("votesphere_voted");location.reload();
  }
};
$("#scrollBtn").onclick=()=>$("#pollSection").scrollIntoView({behavior:"smooth"});
$("#themeBtn").onclick=()=>document.body.classList.toggle("light");

render();
