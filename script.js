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

// === تحميل التاريخ الحالي ===
function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// === تحميل بيانات اليوم من data.js ===
let data = null;
if (typeof window.getInitialData === "function") {
  data = window.getInitialData();
} else {
  console.error("⚠️ لم يتم العثور على الدالة getInitialData من data.js");
  data = {};
}

// === عرض المهام ===
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
    const li = document.createElement("li");
    li.innerHTML = `
      <div>${task.subject} — ${task.content}</div>
      <button class="btn small" onclick="markTaskDone('${key}', ${index})">✔️</button>
    `;
    todayList.appendChild(li);
  });
}

// === عند إكمال مهمة ===
function markTaskDone(day, index) {
  data[day].tasks[index].done = true;

  let archive = JSON.parse(localStorage.getItem("archive")) || [];
  archive.push({
    subject: data[day].tasks[index].subject,
    title: data[day].tasks[index].content,
    date: new Date().toLocaleDateString("ar-EG"),
  });
  localStorage.setItem("archive", JSON.stringify(archive));

  renderTodayTasks();
  renderArchive();
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
        <b>س${i + 1}:</b> ${q.text}
        <input id="ans_${i}" class="ansInput" placeholder="اكتب إجابتك هنا">
      </div>`;
  });

  examModal.classList.remove("section-hidden");
}

closeExam.onclick = () => {
  examModal.classList.add("section-hidden");
};

submitExamBtn.onclick = () => {
  let score = 0;
  let total = currentExam.questions.length * 10;
  let resultsHTML = "";

  currentExam.questions.forEach((q, i) => {
    const ans = document.getElementById(`ans_${i}`).value.trim();
    const correct = q.answer.trim();
    const similarity = compareText(ans, correct);

    if (similarity >= 0.85) score += 10;

    resultsHTML += `
      <div class="card">
        <b>س${i + 1}:</b> <br>
        إجابتك: <span style="color:${similarity >= 0.85 ? 'green' : 'red'}">${ans || 'فارغ'}</span><br>
        الإجابة النموذجية: <b>${correct}</b>
      </div>`;
  });

  const percent = ((score / total) * 100).toFixed(1);
  examResult.innerHTML = `<h4>نتيجتك: ${score}/${total} (${percent}%)</h4>${resultsHTML}`;

  saveGrade(currentExam.subject, score);
};

// === مقارنة نصوص بسيطة لتصحيح قريب من الصحيح ===
function compareText(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  let same = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) same++;
  }
  return same / len;
}

// === حفظ الدرجات ===
function saveGrade(subject, score) {
  let grades = JSON.parse(localStorage.getItem("grades")) || [];
  grades.push({
    subject,
    score,
    date: new Date().toLocaleDateString("ar-EG"),
  });
  localStorage.setItem("grades", JSON.stringify(grades));
  renderGrades();
}

// === عرض الدرجات ===
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
    const color = g.score < 50 ? "red" : "green";
    table += `<tr><td>${g.subject}</td><td style="color:${color}">${g.score}</td><td>${g.date}</td></tr>`;
  });
  table += `</table>`;
  container.innerHTML = table;
}

// === الأرشيف ===
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
  const container = document.getElementById("reportsContent");
  container.innerHTML = `
    <canvas id="reportChart"></canvas>
    <canvas id="pieChart" style="margin-top:20px;"></canvas>
  `;

  const grades = JSON.parse(localStorage.getItem("grades")) || [];
  const subjects = [...new Set(grades.map(g => g.subject))];
  const averages = subjects.map(s => {
    const sub = grades.filter(g => g.subject === s);
    return sub.reduce((a, b) => a + b.score, 0) / sub.length;
  });

  new Chart(document.getElementById("reportChart"), {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{ label: "المعدل", data: averages }]
    }
  });

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: subjects,
      datasets: [{ data: averages }]
    }
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

// === التهيئة ===
window.onload = () => {
  renderTodayTasks();
  renderExams();
};
