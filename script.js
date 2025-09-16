let DATA = {};
if(localStorage.getItem("study-data")){
  DATA = JSON.parse(localStorage.getItem("study-data"));
} else {
  DATA = window.getInitialData();
  if(!DATA.archive) DATA.archive = [];
  saveData();
}

function saveData(){
  localStorage.setItem("study-data", JSON.stringify(DATA));
}

// ========== واجهة ==========

// تحميل اليوم الحالي بالتوقيت المحلي
function getTodayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

// رسم الصفحة الرئيسية
function renderDashboard(dateIso){
  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");

  todayDate.textContent = dateIso;

  if(!day){
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    return;
  }

  // عرض المهام غير المكتملة
  todayList.innerHTML = day.tasks.filter(t => !t.done).map(t => `
    <li>
      <div>
        <b>${t.subject}</b>: ${t.content} 
        <span class="muted">(${t.hours} ساعة)</span>
      </div>
      <button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>
    </li>
  `).join("") || "<li>لا توجد مهام غير مكتملة اليوم</li>";

  // عرض الامتحانات
  examsArea.innerHTML = day.exams.map(ex => `
    <div class="card exam-question">
      <b>${ex.subject}</b> — ${ex.title}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>
  `).join("");
}

// وضع علامة صح على الواجب ونقله للأرشيف
function markTaskDone(dateIso, taskId){
  const day = DATA[dateIso];
  if(!day) return;

  const taskIndex = day.tasks.findIndex(t => t.id === taskId);
  if(taskIndex === -1) return;

  const task = day.tasks[taskIndex];
  task.done = true;

  if(!DATA.archive) DATA.archive = [];
  DATA.archive.push({ ...task, date: dateIso });

  saveData();
  renderDashboard(dateIso);
}

// فتح الامتحان
function openExam(dateIso, examId){
  const exam = DATA[dateIso]?.exams.find(e => e.id === examId);
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

// تسليم الامتحان ونقله للأرشيف
function submitExam(dateIso, examId){
  const exam = DATA[dateIso]?.exams.find(e => e.id === examId);
  if(!exam) return;

  let correct = 0;
  exam.questions.forEach((q,i)=>{
    const val = document.getElementById("answer-"+i).value.trim();
    if(val === q.answer) correct++;
  });

  document.getElementById("examResult").textContent = `النتيجة: ${correct} / ${exam.questions.length}`;

  if(!DATA.archive) DATA.archive = [];
  DATA.archive.push({ ...exam, date: dateIso, score: correct });

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

    // تحديث المحتوى حسب الصفحة
    if(btn.dataset.tab === "archive") renderArchive();
    if(btn.dataset.tab === "reports") renderReports();
    if(btn.dataset.tab === "grades") renderGrades();

    sidebar.classList.remove("open");
    overlay.classList.remove("show");
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
    if(!DATA[date]) DATA[date] = { tasks: [], exams: [] };
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false, createdAt:getTodayISO()});
    saveData();
    renderDashboard(date);
    alert("تمت الإضافة بنجاح ✅");
    document.getElementById("new_subject").value = "";
    document.getElementById("new_content").value = "";
    document.getElementById("new_hours").value = 1;
    document.getElementById("new_date").value = "";
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


// ================== أرشيف ==================
function renderArchive(){
  const archiveContent = document.getElementById("archiveContent");
  if(!DATA.archive || DATA.archive.length === 0){
    archiveContent.innerHTML = "<p>لا يوجد مهام أو امتحانات مكتملة حتى الآن.</p>";
    return;
  }

  archiveContent.innerHTML = DATA.archive.map(item=>`
    <div class="card">
      <b>${item.subject}</b> — ${item.content || item.title} 
      <span class="muted">(تاريخ: ${item.date || 'غير محدد'})</span>
      ${item.score !== undefined ? ` — النتيجة: ${item.score} / ${item.questions.length}` : ''}
    </div>
  `).join("");
}

// ================== التقارير ==================
function renderReports(){
  const reportsContent = document.getElementById("reportsContent");
  const report = {};

  (DATA.archive || []).forEach(item=>{
    if(!item.subject) return;
    if(!report[item.subject]) report[item.subject] = { tasks:0, hours:0 };
    if(item.content){
      report[item.subject].tasks++;
      report[item.subject].hours += parseFloat(item.hours || 0);
    }
  });

  reportsContent.innerHTML = Object.keys(report).map(subj=>`
    <div class="card">
      <b>${subj}</b> — عدد المهام المكتملة: ${report[subj].tasks}, مجموع الساعات: ${report[subj].hours}
    </div>
  `).join("") || "<p>لا توجد بيانات حتى الآن.</p>";
}

// ================== الدرجات ==================
function renderGrades(){
  const gradesContent = document.getElementById("gradesContent");
  const exams = (DATA.archive || []).filter(a=>a.questions);
  if(exams.length === 0){
    gradesContent.innerHTML = "<p>لا توجد درجات بعد.</p>";
    return;
  }
  gradesContent.innerHTML = exams.map(ex=>`
    <div class="card">
      <b>${ex.subject}</b> — ${ex.title} : ${ex.score} / ${ex.questions.length}
      <span class="muted">(تاريخ: ${ex.date})</span>
    </div>
  `).join("");
}
