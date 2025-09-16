let DATA = {};
if(localStorage.getItem("study-data")){
  DATA = JSON.parse(localStorage.getItem("study-data"));
} else {
  DATA = window.getInitialData();
  DATA.archive = []; // إضافة أرشيف فارغ عند التحميل الأول
  saveData();
}

function saveData(){ localStorage.setItem("study-data", JSON.stringify(DATA)); }
function getTodayISO(){ const d = new Date(); return d.toISOString().split("T")[0]; }

// ========== Dashboard ==========
function renderDashboard(dateIso){
  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");

  todayDate.textContent = dateIso;
  if(!day){ todayList.innerHTML="<li>لا توجد بيانات لهذا اليوم</li>"; examsArea.innerHTML=""; return; }

  todayList.innerHTML = day.tasks.filter(t=>!t.done).map(t=>`
    <li>
      <div><b>${t.subject}</b>: ${t.content} <span class="muted">(${t.hours} ساعة)</span></div>
      <button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>
    </li>
  `).join("");

  examsArea.innerHTML = day.exams.map(ex=>`
    <div class="card exam-question">
      <b>${ex.subject}</b> — ${ex.title}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>
  `).join("");
}

// ========== المهام ==========
function markTaskDone(dateIso, taskId){
  const task = DATA[dateIso].tasks.find(t=>t.id===taskId);
  if(task){
    task.done = true;
    DATA.archive.push({...task, date: dateIso});
    saveData();
    renderDashboard(dateIso);
    renderReports();
    renderStats();
    renderArchive();
  }
}

// ========== الامتحانات ==========
function openExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e=>e.id===examId); if(!exam) return;
  document.getElementById("examTitleShow").textContent = exam.title;
  document.getElementById("examQuestions").innerHTML = exam.questions.map((q,i)=>`
    <div class="exam-question"><div><b>س${i+1}:</b> ${q.text}</div>
    <input type="text" id="answer-${i}"></div>
  `).join("");
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=>submitExam(dateIso,examId);
}

document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

function submitExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e=>e.id===examId); if(!exam) return;
  let correct=0;
  exam.questions.forEach((q,i)=>{
    const val=document.getElementById("answer-"+i).value.trim();
    if(val===q.answer) correct++;
  });
  document.getElementById("examResult").textContent = `النتيجة: ${correct} / ${exam.questions.length}`;
  saveData();
}

// ========== الأرشيف ==========
function renderArchive(){
  const archiveContent = document.getElementById("archiveContent");
  if(!DATA.archive.length){ archiveContent.innerHTML="لا توجد عناصر في الأرشيف."; return; }
  archiveContent.innerHTML = DATA.archive.map(a=>`
    <div class="card">
      <b>${a.subject}</b> — ${a.content} <span class="muted">(${a.hours} ساعة | ${a.date})</span>
    </div>
  `).join("");
}

// ========== التقارير ==========
function renderReports(){
  const reportsContent = document.getElementById("reportsContent");
  const report = {};
  (DATA.archive || []).forEach(item=>{
    if(!item.subject) return;
    if(!report[item.subject]) report[item.subject]=0;
    report[item.subject]+=parseFloat(item.hours||0);
  });
  reportsContent.innerHTML = `<canvas id="reportChart"></canvas>`;
  const ctx = document.getElementById("reportChart").getContext('2d');
  new Chart(ctx,{
    type:'doughnut',
    data:{
      labels: Object.keys(report),
      datasets:[{
        data: Object.values(report),
        backgroundColor: ['#1E90FF','#2ECC71','#FFCE56','#FF6F61','#6A5ACD','#FFB347']
      }]
    },
    options:{responsive:true, plugins:{legend:{position:'right'},title:{display:true,text:'عدد الساعات المكتملة لكل مادة'}}}
  });
}

// ========== الإحصائيات ==========
function renderStats(){
  const statsContent = document.getElementById("statsContent");
  const days = Object.keys(DATA).filter(d=>d!=="archive");
  const labels = []; const tasksCompleted=[]; const tasksTotal=[];
  days.forEach(day=>{
    labels.push(day);
    const tasks = DATA[day].tasks || [];
    tasksTotal.push(tasks.length);
    tasksCompleted.push(tasks.filter(t=>t.done).length);
  });
  statsContent.innerHTML=`<canvas id="statsChart"></canvas>`;
  const ctx = document.getElementById("statsChart").getContext('2d');
  new Chart(ctx,{
    type:'bar',
    data:{
      labels:labels,
      datasets:[
        {label:'مهام مكتملة',data:tasksCompleted,backgroundColor:'#2ECC71'},
        {label:'مهام غير مكتملة',data:tasksTotal.map((t,i)=>t-tasksCompleted[i]),backgroundColor:'#1E90FF'}
      ]
    },
    options:{responsive:true, plugins:{legend:{position:'top'},title:{display:true,text:'إحصائيات المهام اليومية'}}}
  });
}

// ========== القائمة الجانبية والتنقل ==========
const menuBtn=document.getElementById("menuBtn"), sidebar=document.getElementById("sidebar"), overlay=document.getElementById("overlay");
menuBtn.addEventListener("click",()=>{sidebar.classList.add("open"); overlay.classList.add("show");});
overlay.addEventListener("click",()=>{sidebar.classList.remove("open"); overlay.classList.remove("show");});

document.querySelectorAll(".navlink").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");
    sidebar.classList.remove("open"); overlay.classList.remove("show");
    if(btn.dataset.tab==='reports') renderReports();
    if(btn.dataset.tab==='stats') renderStats();
    if(btn.dataset.tab==='archive') renderArchive();
  });
});

// زر اليوم
document.getElementById("todayBtn").addEventListener("click",()=>renderDashboard(getTodayISO()));
document.getElementById("goDate").addEventListener("click",()=>{
  const val=document.getElementById("viewDate").value; if(val) renderDashboard(val);
});

// إضافة واجب جديد
document.getElementById("saveTask").addEventListener("click",()=>{
  const subj=document.getElementById("new_subject").value.trim();
  const cont=document.getElementById("new_content").value.trim();
  const hrs=parseFloat(document.getElementById("new_hours").value);
  const date=document.getElementById("new_date").value;
  if(subj && cont && !isNaN(hrs) && date){
    if(!DATA[date]) DATA[date]={tasks:[], exams:[]};
    const id="t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false, createdAt:getTodayISO()});
    saveData(); alert("تمت الإضافة بنجاح ✅");
    renderDashboard(date);
  }
});

// تصدير data.js
document.getElementById("exportBtn").addEventListener("click",()=>{
  const blob=new Blob(["window.getInitialData = ()=>"+JSON.stringify(DATA,null,2)],{type:"application/javascript"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="data.js"; a.click(); URL.revokeObjectURL(url);
});

// إعادة الضبط
document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data"); location.reload();
  }
});

// التحميل الأولي
renderDashboard(getTodayISO());
renderReports();
renderStats();
renderArchive();
