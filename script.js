// ----------------------
// تحميل وتخزين البيانات
// ----------------------
let DATA = localStorage.getItem("study-data") ? JSON.parse(localStorage.getItem("study-data")) : window.getInitialData();
let GRADES = localStorage.getItem("study-grades") ? JSON.parse(localStorage.getItem("study-grades")) : [];

function saveData() {
  localStorage.setItem("study-data", JSON.stringify(DATA));
}
function saveGrades() {
  localStorage.setItem("study-grades", JSON.stringify(GRADES));
}

// ----------------------
// اليوم الحالي
// ----------------------
function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

// ----------------------
// عرض الواجبات والامتحانات
// ----------------------
function renderDashboard(dateIso) {
  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  document.getElementById("todayDate").textContent = dateIso;

  if (!day) {
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    return;
  }

  // عرض المهام
  todayList.innerHTML = day.tasks.map((t, idx) => `
    <li style="opacity:${t.done ? 0.5 : 1}">
      <div><b>${t.subject}</b> — ${t.content} (${t.hours} س)</div>
      <button class="btn small completeBtn" data-date="${dateIso}" data-idx="${idx}">
        ${t.done ? "✓ مكتمل" : "إكمال"}
      </button>
    </li>
  `).join("");

  // تفعيل أزرار الإكمال
  document.querySelectorAll(".completeBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const d = e.target.dataset.date;
      const i = e.target.dataset.idx;
      DATA[d].tasks[i].done = !DATA[d].tasks[i].done;
      saveData();
      renderDashboard(d);
    });
  });

  // عرض الامتحانات
  examsArea.innerHTML = (day.exams || []).map((ex, idx) => `
    <div class="card exam-question">
      <b>${ex.subject}</b> — ${ex.title}
      <div><button class="btn small" onclick="openExam('${dateIso}',${idx})">بدء الامتحان</button></div>
    </div>
  `).join("");
}

// ----------------------
// فتح الامتحان
// ----------------------
let currentExam = null;
function openExam(dateIso, examIdx) {
  currentExam = { dateIso, examIdx };
  const exam = DATA[dateIso].exams[examIdx];
  document.getElementById("examTitleShow").textContent = exam.title;

  document.getElementById("examQuestions").innerHTML = exam.questions.map((q,i)=>`
    <div class="exam-question">
      <div><b>س${i+1}:</b> ${q.text}</div>
      <input type="text" id="answer-${i}" placeholder="إجابتك هنا">
    </div>
  `).join("");

  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = submitExam;
}

// ----------------------
// إغلاق الامتحان
// ----------------------
document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

// ----------------------
// تسليم الامتحان مع تصحيح من 100
// ----------------------
function submitExam() {
  if (!currentExam) return;
  const { dateIso, examIdx } = currentExam;
  const exam = DATA[dateIso].exams[examIdx];

  let correctCount = 0;
  let answersHTML = "<h4>الأجوبة النموذجية:</h4><ul>";

  exam.questions.forEach((q,i)=>{
    const userAns = document.getElementById("answer-"+i).value.trim();
    const correctAns = q.answer.trim();
    if(userAns === correctAns) correctCount++;
    answersHTML += `<li>س${i+1}: <b>${correctAns}</b> — إجابتك: ${userAns || '<em>فارغ</em>'}</li>`;
  });
  answersHTML += "</ul>";

  const score = Math.round((correctCount / exam.questions.length) * 100);
  document.getElementById("examResult").innerHTML = `<div><b>نتيجتك: ${score} / 100</b></div>` + answersHTML;

  // حفظ الدرجة
  GRADES.push({ date: dateIso, title: exam.title, score });
  saveGrades();
  renderGrades();
}

// ----------------------
// عرض سجل الدرجات
// ----------------------
function renderGrades() {
  const gEl = document.getElementById("gradesContent");
  if(GRADES.length === 0){
    gEl.innerHTML = "لا توجد درجات مسجلة";
    return;
  }
  let table = `<table border="1" style="width:100%;border-collapse:collapse">
    <tr><th>التاريخ</th><th>الامتحان</th><th>الدرجة</th></tr>`;
  GRADES.forEach(g=>{
    table += `<tr><td>${g.date}</td><td>${g.title}</td><td>${g.score}/100</td></tr>`;
  });
  table += "</table>";
  gEl.innerHTML = table;
}

// ----------------------
// القائمة الجانبية
// ----------------------
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
document.getElementById("menuBtn").addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});
overlay.addEventListener("click", ()=>{
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// ----------------------
// التنقل بين الصفحات
// ----------------------
document.querySelectorAll(".navlink").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    if(btn.dataset.tab === "grades") renderGrades();
  });
});

// ----------------------
// أزرار التاريخ
// ----------------------
const todayISO = getTodayISO();
document.getElementById("viewDate").value = todayISO;
document.getElementById("todayBtn").addEventListener("click", ()=>renderDashboard(getTodayISO()));
document.getElementById("goDate").addEventListener("click", ()=>{
  const val = document.getElementById("viewDate").value;
  if(val) renderDashboard(val);
});

// ----------------------
// إضافة واجب جديد
// ----------------------
document.getElementById("saveTask").addEventListener("click", ()=>{
  const subj = document.getElementById("new_subject").value.trim();
  const cont = document.getElementById("new_content").value.trim();
  const hrs = parseFloat(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
  if(subj && cont && hrs && date){
    if(!DATA[date]) DATA[date] = { tasks: [], exams: [] };
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false});
    saveData();
    alert("تمت الإضافة بنجاح ✅");
    renderDashboard(date);
  }
});

// ----------------------
// تصدير وإعادة ضبط
// ----------------------
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
    localStorage.removeItem("study-grades");
    location.reload();
  }
});

// ----------------------
// تحميل أول مرة
// ----------------------
renderDashboard(todayISO);
