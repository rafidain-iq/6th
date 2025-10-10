// === تحميل بيانات اليوم من data.js ===
const data = window.getInitialData();

// === المراجع العامة ===
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const todayList = document.getElementById("todayList");
const examsArea = document.getElementById("examsArea");
const todayDateEl = document.getElementById("todayDate");

// === القائمة الجانبية ===
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// === التاريخ الحالي ===
function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// === عرض الواجبات ===
function renderTodayTasks() {
  const key = getTodayKey();
  const todayData = data[key];
  todayDateEl.textContent = `(اليوم ${key})`;
  todayList.innerHTML = "";

  if (!todayData || !todayData.tasks || todayData.tasks.length === 0) {
    todayList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
    return;
  }

  todayData.tasks.forEach((task, index) => {
    if (task.done) return; // إخفاء المهام المنجزة
    const li = document.createElement("li");
    li.innerHTML = `
      <div>${task.subject} — ${task.title}</div>
      <button class="btn small" onclick="markTaskDone('${key}', ${index})">✔️</button>
    `;
    todayList.appendChild(li);
  });
}

// === عند إنجاز مهمة ===
function markTaskDone(day, index) {
  data[day].tasks[index].done = true;

  // نقل إلى الأرشيف
  let archive = JSON.parse(localStorage.getItem("archive")) || [];
  archive.push({
    subject: data[day].tasks[index].subject,
    title: data[day].tasks[index].title,
    date: day,
  });
  localStorage.setItem("archive", JSON.stringify(archive));

  // تحديث التخزين
  localStorage.setItem("tasksData", JSON.stringify(data));
  renderTodayTasks();
}

// === عرض الامتحانات ===
function renderExams() {
  const key = getTodayKey();
  const todayData = data[key];
  examsArea.innerHTML = "";

  if (!todayData || !todayData.exams || todayData.exams.length === 0) {
    examsArea.innerHTML = "<div>لا توجد امتحانات اليوم.</div>";
    return;
  }

  todayData.exams.forEach((exam, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${exam.subject}</h4>
      <p>${exam.title}</p>
      <button class="btn" onclick="startExam('${key}', ${i})">بدء الامتحان</button>
    `;
    examsArea.appendChild(div);
  });
}

// === نافذة الامتحان ===
const examModal = document.getElementById("examModal");
const examTitleShow = document.getElementById("examTitleShow");
const examQuestions = document.getElementById("examQuestions");
const submitExamBtn = document.getElementById("submitExamBtn");
const examResult = document.getElementById("examResult");
const closeExam = document.getElementById("closeExam");

let currentExam = null;

function startExam(day, index) {
  currentExam = data[day].exams[index];
  examTitleShow.textContent = currentExam.title;
  examQuestions.innerHTML = "";
  examResult.innerHTML = "";

  currentExam.questions.forEach((q, i) => {
    examQuestions.innerHTML += `
      <div class="card">
        <b>س${i + 1}:</b> ${q.q}
        <input id="ans_${i}" class="ansInput" placeholder="اكتب إجابتك هنا">
      </div>`;
  });

  examModal.classList.remove("section-hidden");
  examModal.scrollTop = 0;
}

closeExam.onclick = () => {
  examModal.classList.add("section-hidden");
};

submitExamBtn.onclick = () => {
  let score = 0;
  currentExam.questions.forEach((q, i) => {
    const ans = document.getElementById(`ans_${i}`).value.trim();
    if (ans && q.a && ans.includes(q.a.substring(0, 3))) score += 10;
  });
  examResult.innerHTML = `<h4>نتيجتك: ${score} من ${currentExam.questions.length * 10}</h4>`;
  saveGrade(currentExam.subject, score);
};

// === حفظ الدرجات ===
function saveGrade(subject, score) {
  let grades = JSON.parse(localStorage.getItem("grades")) || [];
  grades.push({ subject, score, date: new Date().toLocaleDateString("ar-EG") });
  localStorage.setItem("grades", JSON.stringify(grades));
  renderGrades();
}

// === عرض الدرجات (جدول) ===
function renderGrades() {
  let grades = JSON.parse(localStorage.getItem("grades")) || [];
  const container = document.getElementById("gradesContent");
  if (grades.length === 0) {
    container.innerHTML = "لا توجد درجات حالياً.";
    return;
  }

  let table = `<table class="table">
    <tr><th>المادة</th><th>الدرجة</th><th>التاريخ</th></tr>`;
  grades.forEach(g => {
    table += `<tr><td>${g.subject}</td><td>${g.score}</td><td>${g.date}</td></tr>`;
  });
  table += `</table>`;
  container.innerHTML = table;
}

// === الأرشيف (جدول) ===
function renderArchive() {
  let archive = JSON.parse(localStorage.getItem("archive")) || [];
  const container = document.getElementById("archiveContent");
  if (archive.length === 0) {
    container.innerHTML = "لا توجد مهام مؤرشفة.";
    return;
  }

  let table = `<table class="table">
    <tr><th>المادة</th><th>الوصف</th><th>التاريخ</th></tr>`;
  archive.forEach(a => {
    table += `<tr><td>${a.subject}</td><td>${a.title}</td><td>${a.date}</td></tr>`;
  });
  table += `</table>`;
  container.innerHTML = table;
}

// === التقارير ===
function renderReports() {
  const ctx1 = document.getElementById("reportChart");
  document.getElementById("reportsContent").innerHTML = "";
  document.getElementById("reportsContent").appendChild(ctx1);

  const grades = JSON.parse(localStorage.getItem("grades")) || [];
  const subjects = [...new Set(grades.map(g => g.subject))];
  const averages = subjects.map(s => {
    const sub = grades.filter(g => g.subject === s);
    return sub.reduce((a, b) => a + b.score, 0) / sub.length;
  });

  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{ label: "المعدل", data: averages }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// === التنقل بين الأقسام ===
document.querySelectorAll(".navlink").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("main > section").forEach(s => s.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");

    if (btn.dataset.tab === "grades") renderGrades();
    if (btn.dataset.tab === "archive") renderArchive();
    if (btn.dataset.tab === "reports") renderReports();

    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
});

// === بدء التشغيل ===
window.onload = () => {
  renderTodayTasks();
  renderExams();
};
