const defaultTasks = [
  {id:1,name:"Complete DBMS Unit 2",category:"Study",priority:"High",date:"",done:false},
  {id:2,name:"Practice JavaScript",category:"Programming",priority:"Medium",date:"",done:true},
  {id:3,name:"Read Software Engineering",category:"Study",priority:"Low",date:"",done:false},
  {id:4,name:"Revise Operating Systems",category:"Revision",priority:"Medium",date:"",done:true}
];
const defaultGoals = [
  {id:1,name:"Complete daily tasks",target:100,progress:70},
  {id:2,name:"Practice coding",target:100,progress:55},
  {id:3,name:"Focus for 2 hours",target:100,progress:80}
];
const schedule = [
  ["09:00 AM","Python Practice","Programming"],
  ["11:00 AM","DBMS Revision","Study"],
  ["03:00 PM","Operating Systems","Revision"],
  ["06:00 PM","Project Work","Project"]
];

let tasks = JSON.parse(localStorage.getItem("ff_tasks") || "null") || defaultTasks;
let goals = JSON.parse(localStorage.getItem("ff_goals") || "null") || defaultGoals;
let sessions = Number(localStorage.getItem("ff_sessions") || 0);
let timerSeconds = 25 * 60, timerId = null;

const $ = id => document.getElementById(id);
const save = () => {
  localStorage.setItem("ff_tasks", JSON.stringify(tasks));
  localStorage.setItem("ff_goals", JSON.stringify(goals));
  localStorage.setItem("ff_sessions", sessions);
};

function completionPercent(){
  return tasks.length ? Math.round(tasks.filter(t=>t.done).length / tasks.length * 100) : 0;
}
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active", s.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.section===id));
  const titles={dashboard:"Good day! 👋",tasks:"Your Tasks",goals:"Your Goals",timer:"Focus Timer",schedule:"Today's Schedule",progress:"Your Progress",achievements:"Your Achievements"};
  $("pageTitle").textContent=titles[id] || "FocusFlow";
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.go)));

function renderDashboard(){
  const total=tasks.length, done=tasks.filter(t=>t.done).length, pending=total-done, pct=completionPercent();
  $("totalTasks").textContent=total; $("completedTasks").textContent=done; $("pendingTasks").textContent=pending;
  $("streak").textContent=Math.min(30, Math.max(1, Math.floor((done+1)/2)));
  $("heroPercent").textContent=pct+"%"; $("goalPercent").textContent=pct+"%";
  $("goalBar").style.width=pct+"%"; $("goalDone").textContent=done; $("goalTotal").textContent=total;
  const list=tasks.slice(0,4);
  $("todayTasks").innerHTML=list.length ? list.map(taskRow).join("") : `<p class="muted">No tasks yet. Add your first task!</p>`;
  bindTaskButtons();
}
function taskRow(t){
  return `<div class="task-item">
    <button class="check ${t.done?"done":""}" data-complete="${t.id}">${t.done?"✓":""}</button>
    <div class="task-info"><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.category||"General")}</small></div>
    <span class="priority ${t.priority.toLowerCase()}">${t.priority}</span>
  </div>`;
}
function renderTasks(){
  const search=$("searchInput").value.toLowerCase(), filter=$("filterSelect").value;
  let list=tasks.filter(t=>{
    const matches=t.name.toLowerCase().includes(search) || (t.category||"").toLowerCase().includes(search);
    const matchesFilter=filter==="all" || (filter==="pending"&&!t.done) || (filter==="completed"&&t.done) || (filter==="high"&&t.priority==="High");
    return matches&&matchesFilter;
  });
  $("allTasks").innerHTML=list.length ? list.map(t=>`
    <article class="task-card ${t.done?"done":""}">
      <span class="priority ${t.priority.toLowerCase()}">${t.priority} priority</span>
      <h4>${escapeHtml(t.name)}</h4><p class="muted">${escapeHtml(t.category||"General")}${t.date?" • "+t.date:""}</p>
      <div class="task-meta">
        <button class="check ${t.done?"done":""}" data-complete="${t.id}">${t.done?"✓":"○"}</button>
        <button class="icon-btn" data-delete="${t.id}" title="Delete">🗑️</button>
      </div>
    </article>`).join("") : `<div class="card"><p class="muted">No matching tasks found.</p></div>`;
  bindTaskButtons();
}
function bindTaskButtons(){
  document.querySelectorAll("[data-complete]").forEach(b=>b.onclick=()=>{const t=tasks.find(x=>x.id===Number(b.dataset.complete));if(t){t.done=!t.done;save();renderAll();}});
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{tasks=tasks.filter(x=>x.id!==Number(b.dataset.delete));save();renderAll();});
}
function renderGoals(){
  $("goalsList").innerHTML=goals.map(g=>`
    <article class="goal-card"><span class="pill" style="background:#eeeaff;color:var(--primary)">Goal</span>
      <h4>${escapeHtml(g.name)}</h4><p class="muted">${g.progress}% completed</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${g.progress}%"></div></div>
      <button class="text-btn" data-goal-complete="${g.id}">+ 10% progress</button>
    </article>`).join("");
  document.querySelectorAll("[data-goal-complete]").forEach(b=>b.onclick=()=>{const g=goals.find(x=>x.id===Number(b.dataset.goalComplete));g.progress=Math.min(100,g.progress+10);save();renderGoals();renderAll();});
}
function renderSchedule(){
  $("scheduleList").innerHTML=schedule.map((x,i)=>`<div class="schedule-item"><span class="schedule-time">${x[0]}</span><span class="schedule-dot"></span><div><strong>${x[1]}</strong><div class="muted">${x[2]}</div></div></div>`).join("");
}
function renderProgress(){
  const pct=completionPercent(), done=tasks.filter(t=>t.done).length;
  $("bigProgress").textContent=pct+"%";$("progressCompleted").textContent=done;$("progressPending").textContent=tasks.length-done;
  $("progressSessions").textContent=sessions;$("progressGoals").textContent=goals.filter(g=>g.progress>=100).length;
}
function renderAchievements(){
  const done=tasks.filter(t=>t.done).length;
  const items=[
    ["🔥","First Step","Complete your first task",done>=1],
    ["⭐","Task Champion","Complete 5 tasks",done>=5],
    ["⏱️","Focus Master","Finish 3 focus sessions",sessions>=3],
    ["🎯","Goal Getter","Complete a goal",goals.some(g=>g.progress>=100)],
    ["🚀","Productivity Pro","Reach 80% task completion",completionPercent()>=80],
    ["🏆","Consistency","Complete 10 tasks",done>=10]
  ];
  $("achievementGrid").innerHTML=items.map(a=>`<article class="achievement ${a[3]?"":"locked"}"><div class="achievement-icon">${a[0]}</div><h4>${a[1]} ${a[3]?"✓":"🔒"}</h4><p>${a[2]}</p></article>`).join("");
}
function renderAll(){renderDashboard();renderTasks();renderGoals();renderProgress();renderAchievements();}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

$("addTaskBtn").onclick=()=>{$("taskDialog").showModal();$("taskDate").value=new Date().toISOString().slice(0,10);};
$("taskForm").onsubmit=e=>{
  e.preventDefault();
  tasks.unshift({id:Date.now(),name:$("taskName").value.trim(),category:$("taskCategory").value.trim()||"General",priority:$("taskPriority").value,date:$("taskDate").value,done:false});
  save();e.target.closest("dialog").close();e.target.reset();renderAll();
};
$("addGoalBtn").onclick=()=>$("goalDialog").showModal();
$("goalForm").onsubmit=e=>{
  e.preventDefault();goals.push({id:Date.now(),name:$("goalName").value.trim(),target:Number($("goalTarget").value)||100,progress:0});
  save();e.target.closest("dialog").close();e.target.reset();renderAll();
};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$("searchInput").oninput=renderTasks;$("filterSelect").onchange=renderTasks;

function updateTimer(){
  const m=String(Math.floor(timerSeconds/60)).padStart(2,"0"),s=String(timerSeconds%60).padStart(2,"0");
  $("timerDisplay").textContent=`${m}:${s}`;
}
$("startTimer").onclick=()=>{
  if(timerId)return;
  $("timerStatus").textContent="Focus mode is running. You can do it! 💪";
  timerId=setInterval(()=>{
    timerSeconds--;
    updateTimer();
    if(timerSeconds<=0){
      clearInterval(timerId);timerId=null;timerSeconds=25*60;sessions++;save();updateTimer();
      $("timerStatus").textContent="🎉 Session complete! Take a short break.";
      renderAll();
    }
  },1000);
};
$("pauseTimer").onclick=()=>{if(timerId){clearInterval(timerId);timerId=null;$("timerStatus").textContent="Paused. Resume when ready.";}}
$("resetTimer").onclick=()=>{clearInterval(timerId);timerId=null;timerSeconds=25*60;updateTimer();$("timerStatus").textContent="Ready when you are.";};

$("themeBtn").onclick=()=>{
  document.body.classList.toggle("dark");
  const dark=document.body.classList.contains("dark");
  $("themeBtn").textContent=dark?"☀️ Light Mode":"🌙 Dark Mode";
  localStorage.setItem("ff_dark",dark);
};
if(localStorage.getItem("ff_dark")==="true"){document.body.classList.add("dark");$("themeBtn").textContent="☀️ Light Mode";}
$("clearBtn").onclick=()=>{
  if(confirm("Reset all FocusFlow demo data?")){
    localStorage.clear();tasks=[...defaultTasks];goals=[...defaultGoals];sessions=0;renderAll();
  }
};
updateTimer();renderAll();
