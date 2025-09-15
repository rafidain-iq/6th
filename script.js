// script.js - النسخة المعدلة

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
  todayList.innerHTML = day.tasks.filter(t => !t.done).map(t => `
    <li>
      <div>
        <b>${t.subject}</b>: ${t.content} 
        <span class="muted">(${t.hours} ساعة)</span>
      </div>
      <button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>
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
    renderDashboard(dateIso); // إعادة التحديث حتى يختفي
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
    </div>
  `).join("");
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=>submitExam(dateIso,examId);
}

// إغلاق الامتحان
document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

// تسليم الامتحان
function submitExam(dateIso, examId){
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;
  let correct = 0;
  exam.questions.forEach((q,i)=>{
    const val = document.getElementById("answer-"+i).value.trim();
    if(val === q.answer) correct++;
  });
  document.getElementById("examResult").textContent = `النتيجة: ${correct} / ${exam.questions.length}`;
  saveData();
}

// ========== القائمة الجانبية ==========
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", ()=>{
  sidebar.classList.add("open");
  overlay.classList.add("show");
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
  });
});

// زر اليوم
document.getElementById("todayBtn").addEventListener("click", ()=>{
  const todayIso = getTodayISO();
  renderDashboard(todayIso);
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
  const hrs = parseInt(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
  if(subj && cont && hrs && date){
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false, createdAt:getTodayISO()});
    saveData();
    alert("تمت الإضافة بنجاح ✅");
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

// تحميل الصفحة أول مرة
renderDashboard(getTodayISO());
