// script.js - النسخة النهائية المكملة

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

// ========== واجهة ==========

// تحميل اليوم الحالي
function getTodayISO(){
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// رسم الصفحة الرئيسية (dashboard)
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

  // عرض المهام (فقط غير المكتملة)
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

// وضع علامة صح على الواجب
function markTaskDone(dateIso, taskId){
  const task = DATA[dateIso].tasks.find(t => t.id === taskId);
  if(task){
    task.done = true;
    saveData();
    renderDashboard(dateIso); // إعادة التحديث
  }
}

// فتح الامتحان
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

// إغلاق الامتحان
document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

// تسليم الامتحان مع تصحيح من 100 وعرض الإجابة النموذجية
function submitExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;

  let correct = 0;
  const totalQuestions = exam.questions.length;

  exam.questions.forEach((q,i)=>{
    const val = document.getElementById("answer-"+i).value.trim().toLowerCase();
    const answer = q.answer.trim().toLowerCase();

    // التصحيح الأساسي: تطابق جزئي أو كامل
    if(val === answer) correct += 1;
    else if(val && answer.includes(val)) correct += 0.7;  // جزء من الإجابة
    else if(val) correct += 0.3; // كتابة خاطئة أو ناقصة
    // عرض الإجابة النموذجية
    document.getElementById("correct-"+i).style.display = "block";
  });

  const score = Math.round((correct/totalQuestions)*100);
  document.getElementById("examResult").textContent = `النتيجة: ${score} / 100`;
  
  // حفظ الدرجة
  if(!DATA.grades) DATA.grades = [];
  DATA.grades.push({
    date: dateIso,
    subject: exam.subject,
    title: exam.title,
    score: score
  });

  saveData();
  renderGrades();
}

// ========== القائمة الجانبية ==========
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

// التبديل بين الصفحات
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

// زر اليوم
document.getElementById("todayBtn").addEventListener("click", ()=>{
  renderDashboard(getTodayISO());
});

// زر عرض حسب التاريخ
document.getElementById("goDate").addEventListener("click", ()=>{
  const val = document.getElementById("viewDate").value;
  if(val) renderDashboard(val);
});

// إضافة واجب جديد
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

// تصدير data.js
document.getElementById("exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([ "window.getInitialData = ()=>" + JSON.stringify(DATA,null,2) ], {type:"application/javascript"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  a.click();
  URL.revokeObjectURL(url);
});

// إعادة الضبط
document.getElementById("resetBtn").addEventListener("click", ()=>{
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data");
    location.reload();
  }
});

// =================== التقارير ===================
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

// =================== الإحصائيات ===================
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

// =================== الأرشيف ===================
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

// =================== الدرجات ===================
function renderGrades(){
  const gradesEl = document.getElementById("gradesContent");
  if(!DATA.grades || DATA.grades.length===0){
    gradesEl.innerHTML = 'لا توجد بيانات درجات حالياً.';
    return;
  }
  gradesEl.innerHTML = `<table border="1" cellspacing="0" cellpadding="4" style="width:100%;border-collapse:collapse;">
    <tr><th>التاريخ</th><th>المادة</th><th>الامتحان</th><th>الدرجة /100</th></tr>
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
