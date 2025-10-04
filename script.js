// script.js - النسخة الكاملة المعدلة

// --- تحميل البيانات أو أخذها من localStorage ---
let DATA = loadData();

function loadData() {
  const saved = localStorage.getItem("studyData");
  return saved ? JSON.parse(saved) : window.getInitialData();
}

function saveData(data) {
  localStorage.setItem("studyData", JSON.stringify(data));
}

// --- تحديد اليوم الحالي بدقة ---
function getTodayDate() {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

let currentDate = getTodayDate();
document.getElementById("viewDate").value = currentDate;

// --- العناصر الأساسية ---
const todayList = document.getElementById("todayList");
const examsArea = document.getElementById("examsArea");
const todayDateLabel = document.getElementById("todayDate");

// --- عرض مهام اليوم ---
function renderDay(date) {
  todayDateLabel.textContent = date;
  todayList.innerHTML = "";
  examsArea.innerHTML = "";

  if(DATA[date] && Array.isArray(DATA[date].tasks)) {
    DATA[date].tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.subject}: ${task.content} (${task.hours} س)`;
      li.id = task.id;
      li.classList.add(task.done ? "done" : "");
      todayList.appendChild(li);
    });
  }

  if(DATA[date] && Array.isArray(DATA[date].exams)) {
    DATA[date].exams.forEach(exam => {
      const div = document.createElement("div");
      div.textContent = `${exam.subject} - ${exam.title}`;
      div.classList.add("exam-item");
      div.addEventListener("click", () => openExam(exam));
      examsArea.appendChild(div);
    });
  }
}

// --- فتح الامتحان وعرض الأسئلة ---
function openExam(exam) {
  document.getElementById("examTitleShow").textContent = `${exam.subject} - ${exam.title}`;
  const qContainer = document.getElementById("examQuestions");
  qContainer.innerHTML = "";
  exam.questions.forEach((q, i) => {
    const qDiv = document.createElement("div");
    qDiv.className = "exam-question";
    qDiv.innerHTML = `<label>${i+1}. ${q.text}</label>
      <input type="text" id="${q.id}" placeholder="إجابة الطالب">`;
    qContainer.appendChild(qDiv);
  });
  document.getElementById("examResult").innerHTML = "";
  document.getElementById("examModal").classList.remove("section-hidden");

  document.getElementById("submitExamBtn").onclick = () => submitExam(exam);
}

// --- تصحيح ذكي للامتحانات ---
function submitExam(exam) {
  let total = 0;
  exam.questions.forEach(q => {
    const studentAns = document.getElementById(q.id).value.trim().toLowerCase();
    const correctAns = q.answer.trim().toLowerCase();

    // مقارنة ذكية: السماح بفروقات بسيطة أو اختلافات ترتيبية
    if(correctAns === studentAns) total += 1;
    else if(correctAns.includes(studentAns) || studentAns.includes(correctAns)) total += 1;
    else if(similarity(correctAns, studentAns) > 0.8) total += 1; // دالة تشابه
  });
  document.getElementById("examResult").textContent = `النتيجة: ${total} / ${exam.questions.length}`;
}

// --- دالة قياس التشابه (نسبة) ---
function similarity(a, b) {
  a = a.split(" ");
  b = b.split(" ");
  let matches = a.filter(x => b.includes(x)).length;
  return matches / Math.max(a.length, b.length);
}

// --- إغلاق الامتحان ---
document.getElementById("closeExam").addEventListener("click", () => {
  document.getElementById("examModal").classList.add("section-hidden");
});

// --- إضافة واجب جديد ---
document.getElementById("saveTask").addEventListener("click", () => {
  const subject = document.getElementById("new_subject").value;
  const content = document.getElementById("new_content").value;
  const hours = parseFloat(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
  if(!subject || !content || !hours || !date) return alert("يرجى ملء جميع الحقول");
  if(!DATA[date].tasks) DATA[date].tasks = [];
  const id = `t-${date}-${DATA[date].tasks.length}`;
  DATA[date].tasks.push({subject, content, hours, done:false, id});
  saveData(DATA);
  if(date===currentDate) renderDay(date);
});

// --- إضافة درجة جديدة ---
document.getElementById("saveGrade")?.addEventListener("click", () => {
  const subject = document.getElementById("grade_subject").value;
  const value = Number(document.getElementById("grade_value").value);
  const date = document.getElementById("grade_date").value;
  if(!subject || !value || !date) return alert("يرجى ملء جميع الحقول");
  if(!DATA[date].grades) DATA[date].grades = [];
  DATA[date].grades.push({subject, value, date, id:`g-${date}-${DATA[date].grades.length}`});
  saveData(DATA);
  renderGrades();
});

// --- عرض الدرجات ---
function renderGrades() {
  const gradesDiv = document.getElementById("gradesContent");
  gradesDiv.innerHTML = "";
  Object.keys(DATA).forEach(date => {
    if(DATA[date].grades && DATA[date].grades.length){
      DATA[date].grades.forEach(g => {
        const div = document.createElement("div");
        div.textContent = `${g.date} | ${g.subject}: ${g.value}`;
        gradesDiv.appendChild(div);
      });
    }
  });
}

// --- التعامل مع زر اختيار التاريخ واليوم ---
document.getElementById("goDate").addEventListener("click", () => {
  const date = document.getElementById("viewDate").value;
  if(date) { currentDate = date; renderDay(date); }
});
document.getElementById("todayBtn").addEventListener("click", () => {
  currentDate = getTodayDate();
  document.getElementById("viewDate").value = currentDate;
  renderDay(currentDate);
});

// --- التنقل بين التابات ---
document.querySelectorAll(".navlink").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("main .card").forEach(sec => sec.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");
  });
});

// --- إعادة الحالة الأولية ---
document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem("studyData");
  location.reload();
});

// --- تصدير البيانات ---
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(DATA, null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "data_export.json"; a.click();
  URL.revokeObjectURL(url);
});

// --- التهيئة عند التحميل ---
window.addEventListener("DOMContentLoaded", () => {
  renderDay(currentDate);
  renderGrades();
});
