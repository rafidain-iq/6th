// script.js - النسخة النهائية المكملة + درجات يومية/تراكمية + تصحيح ذكي

let DATA = {};
if(localStorage.getItem("study-data")){
  DATA = JSON.parse(localStorage.getItem("study-data"));
} else {
  DATA = window.getInitialData();
  saveData();
}

function saveData(){
  localStorage.setItem("study-data", JSON.stringify(DATA));
}

// ======================= واجهة =======================

function getTodayISO(){
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function renderDashboard(dateIso){
  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");

  if(!day){
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    todayDate.textContent = dateIso;
    return;
  }

  todayDate.textContent = dateIso;

  // عرض المهام غير المكتملة
  todayList.innerHTML = day.tasks.map(t => `
    <li>
      <div>
        <b>${t.subject}</b>: ${t.content} 
        <span class="muted">(${t.hours} ساعة)</span>
      </div>
      ${t.done ? '' : `<button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>`}
    </li>
  `).join("");

  // عرض الامتحانات
  examsArea.innerHTML = day.exams.map(ex => `
    <div class="card exam-question">
      <b>${ex.subject}</b> — ${ex.title}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>
  `).join("");
}

function markTaskDone(dateIso, taskId){
  const task = DATA[dateIso].tasks.find(t => t.id === taskId);
  if(task){
    task.done = true;
    saveData();
    renderDashboard(dateIso);
  }
}

// ======================= الامتحانات =======================

function openExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;
  document.getElementById("examTitleShow").textContent = exam.title;
  document.getElementById("examQuestions").innerHTML = exam.questions.map((q,i)=>`
    <div class="exam-question">
      <div><b>س${i+1}:</b> ${q.text}</div>
      <input type="text" id="answer-${i}">
      <div class="muted small" id="correct-${i}" style="display:none;">الإجابة النموذجية: ${q.answer}</div>
    </div>
  `).join("");
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=>submitExam(dateIso,examId);
}

document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

// ======================= التصحيح =======================

function submitExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;

  // تحديد نوع الامتحان: يومي (30) أو تراكمية (100)
  const examDate = new Date(dateIso);
  const dayOfWeek = examDate.getDay(); // 0=Sun, 4=Thu, 5=Fri
  let totalScore = 30;
  let perQuestion = 10;
  if(exam.takrami || dayOfWeek===4 || dayOfWeek===5){ // تراكمية
    totalScore = 100;
    perQuestion = Math.round(100/exam.questions.length);
  }

  let scoreObtained = 0;

  exam.questions.forEach((q,i)=>{
    const userAns = document.getElementById("answer-"+i).value.trim().toLowerCase();
    const correctAns = q.answer.trim().toLowerCase();

    let qScore = 0;
    if(userAns === correctAns) qScore = perQuestion;
    else {
      // تحليل ذكي
      const userWords = userAns.split(/\s+/);
      const correctWords = correctAns.split(/\s+/);
      let matched = 0;
      correctWords.forEach(word=>{
        if(userWords.includes(word)) matched++;
      });
      if(matched === correctWords.length) qScore = perQuestion;
      else if(matched > 0) qScore = Math.round(perQuestion*0.7);
      else if(userAns) qScore = Math.round(perQuestion*0.3);
    }

    scoreObtained += qScore;
    document.getElementById("correct-"+i).style.display = "block";
  });

  if(!DATA.grades) DATA.grades = [];
  DATA.grades.push({
    date: dateIso,
    subject: exam.subject,
    title: exam.title,
    score: scoreObtained
  });

  saveData();
  renderGrades();
  document.getElementById("examResult").textContent = `النتيجة: ${scoreObtained} / ${totalScore}`;
}

// ======================= القائمة الجانبية =======================

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});
overlay.addEventListener("click", ()=>{
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

document.querySelectorAll(".navlink").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");
    sidebar.classList.remove("open");
    overlay.classList.remove("show");

    if(btn.dataset.tab === "grades") renderGrades();
    if(btn.dataset.tab === "reports") renderReports();
    if(btn.dataset.tab === "stats") renderStats();
    if(btn.dataset.tab === "archive") renderArchive();
  });
});

// ======================= أزرار التاريخ =======================

document.getElementById("todayBtn").addEventListener("click", ()=>{
  renderDashboard(getTodayISO());
});

document.getElementById("goDate").addEventListener("click", ()=>{
  const val = document.getElementById("viewDate").value;
  if(val) renderDashboard(val);
});

// ======================= إضافة واجب =======================

document.getElementById("saveTask").addEventListener("click", ()=>{
  const subj = document.getElementById("new_subject").value.trim();
  const cont = document.getElementById("new_content").value.trim();
  const hrs = parseFloat(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
  if(subj && cont && hrs && date){
    if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false, createdAt:getTodayISO()});
    saveData();
    alert("تمت الإضافة بنجاح ✅");
    renderDashboard(date);
  }
});

// ======================= تصدير + إعادة ضبط =======================

document.getElementById("exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([ "window.getInitialData = ()=>" + JSON.stringify(DATA,null,2) ], {type:"application/javascript"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("resetBtn").addEventListener("click", ()=>{
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data");
    location.reload();
  }
});

// ======================= التقارير =======================

function renderReports(){
  const ctx = document.getElementById("reportChart").getContext("2d");
  const subjectHours = {};
  Object.values(DATA).forEach(day=>{
    if(day.tasks) day.tasks.forEach(t=>{
      if(!subjectHours[t.subject]) subjectHours[t.subject] = 0;
      subjectHours[t.subject] += t.hours;
    });
  });
  new Chart(ctx,{
    type:'bar',
    data:{
      labels: Object.keys(subjectHours),
      datasets:[{
        label:'عدد الساعات',
        data: Object.values(subjectHours),
        backgroundColor:['#2d2d2d','#1f78b4','#fdd835','#76c893']
      }]
    },
    options:{responsive:true,plugins:{legend:{display:false}}}
  });
}

// ======================= الإحصائيات =======================

function renderStats(){
  const ctx = document.getElementById("statsChart").getContext("2d");
  const subjectCompleted = {};
  Object.values(DATA).forEach(day=>{
    if(day.tasks) day.tasks.forEach(t=>{
      if(t.done){
        if(!subjectCompleted[t.subject]) subjectCompleted[t.subject]=0;
        subjectCompleted[t.subject]+=t.hours;
      }
    });
  });
  new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:Object.keys(subjectCompleted),
      datasets:[{
        data:Object.values(subjectCompleted),
        backgroundColor:['#2d2d2d','#1f78b4','#fdd835','#76c893']
      }]
    },
    options:{responsive:true,plugins:{legend:{position:'right'}}}
  });
}

// ======================= الأرشيف =======================

function renderArchive(){
  const archiveEl = document.getElementById("archiveContent");
  let html = '';
  Object.keys(DATA).sort().forEach(date=>{
    if(DATA[date].tasks){
      const doneTasks = DATA[date].tasks.filter(t=>t.done);
      if(doneTasks.length>0){
        html += `<h4>${date}</h4><ul>`;
        doneTasks.forEach(t=>{
          html += `<li><b>${t.subject}</b>: ${t.content} (${t.hours} س)</li>`;
        });
        html += `</ul>`;
      }
    }
  });
  archiveEl.innerHTML = html || 'لا توجد مهام مكتملة حتى الآن';
}

// ======================= الدرجات =======================

function renderGrades(){
  const gradesEl = document.getElementById("gradesContent");
  if(!DATA.grades || DATA.grades.length===0){
    gradesEl.innerHTML = 'لا توجد بيانات درجات حالياً.';
    return;
  }
  gradesEl.innerHTML = `<table border="1" cellspacing="0" cellpadding="4" style="width:100%;border-collapse:collapse;">
    <tr><th>التاريخ</th><th>المادة</th><th>الامتحان</th><th>الدرجة</th></tr>
    ${DATA.grades.map(g=>`<tr>
      <td>${g.date}</td>
      <td>${g.subject}</td>
      <td>${g.title}</td>
      <td>${g.score}</td>
    </tr>`).join('')}
  </table>`;
}

// تحميل الصفحة أول مرة
renderDashboard(getTodayISO());
