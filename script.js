// --- المتغيرات العامة ---
let today = new Date().toISOString().split("T")[0]; 
let archive = [];
let grades = [];

// --- عناصر الواجهة ---
const todayList = document.getElementById("todayList");
const examsArea = document.getElementById("examsArea");
const archiveContent = document.getElementById("archiveContent");
const gradesContent = document.getElementById("gradesContent");

// --- المهام اليومية ---
function renderTasks() {
  todayList.innerHTML = "";
  const dayData = DATA[today] || { tasks: [], exams: [] };
  if (!dayData.tasks.length) {
    todayList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
    return;
  }
  dayData.tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${task.subject}</strong>: ${task.content} (${task.hours} ساعة)
      <button class="complete-btn">اكتمال</button>`;
    todayList.appendChild(li);

    li.querySelector(".complete-btn").addEventListener("click", () => {
      archive.push({ type: "task", date: today, ...task });
      li.remove();
      updateArchive();
    });
  });
}

// --- الامتحانات اليومية ---
function renderExams() {
  examsArea.innerHTML = "";
  const dayData = DATA[today] || { tasks: [], exams: [] };
  if (!dayData.exams.length) {
    examsArea.innerHTML = "<p>لا توجد امتحانات اليوم.</p>";
    return;
  }
  dayData.exams.forEach(exam => {
    const div = document.createElement("div");
    div.className = "exam-item";
    div.innerHTML = `<strong>${exam.subject}</strong>: ${exam.title}
      <button class="start-exam-btn">بدء الامتحان</button>`;
    examsArea.appendChild(div);

    div.querySelector(".start-exam-btn").addEventListener("click", () => openExam(exam));
  });
}

// --- فتح الامتحان ---
function openExam(exam) {
  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  examWindow.style.display = "block";
  examContent.innerHTML = "";
  exam.questions.forEach((q, idx) => {
    const qEl = document.createElement("div");
    qEl.className = "question-item";
    qEl.innerHTML = `<p>${idx + 1}. ${q.text}</p>
      <input type="text" class="answer-input" data-qid="${q.id}">`;
    examContent.appendChild(qEl);
  });

  document.getElementById("submitExamBtn").onclick = () => {
    let score = 0;
    exam.questions.forEach(q => {
      const userAnswer = document.querySelector(`[data-qid="${q.id}"]`).value.trim();
      if (checkAnswer(userAnswer, q.answer)) score += 10;
    });
    grades.push({ date: today, subject: exam.subject, title: exam.title, score });
    archive.push({ type: "exam", date: today, ...exam });
    updateGrades();
    updateArchive();
    examWindow.style.display = "none";
    renderExams();
  };
}

// --- تصحيح ذكي ---
function checkAnswer(user, correct) {
  user = user.toLowerCase().replace(/\s+/g, "");
  correct = correct.toLowerCase().replace(/\s+/g, "");

  if (user === correct) return true;

  let userWords = user.split(/[\s,.;]+/).sort();
  let correctWords = correct.split(/[\s,.;]+/).sort();
  if (userWords.join(",") === correctWords.join(",")) return true;

  const userNum = parseFloat(user.replace(/[^\d.eE-]/g, ""));
  const correctNum = parseFloat(correct.replace(/[^\d.eE-]/g, ""));
  if (!isNaN(userNum) && !isNaN(correctNum)) {
    if (Math.abs(userNum - correctNum) <= 0.1) return true;
  }
  return false;
}

// --- الأرشيف ---
function updateArchive() {
  archiveContent.innerHTML = "";
  archive.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${item.type}</strong> | ${item.subject || ""} | ${item.title || item.content} | ${item.date}`;
    archiveContent.appendChild(div);
  });
}

// --- جدول الدرجات ---
function updateGrades() {
  gradesContent.innerHTML = "";
  grades.forEach(g => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${g.subject}</strong> | ${g.title} | الدرجة: ${g.score}`;
    gradesContent.appendChild(div);
  });
}

// --- التقارير الشهرية ---
function renderReportChart() {
  const ctx = document.getElementById("reportChart").getContext("2d");
  const subjects = {};
  Object.keys(DATA).forEach(date => {
    (DATA[date].tasks || []).forEach(task => {
      if (!subjects[task.subject]) subjects[task.subject] = { hours: 0, total: 0 };
      subjects[task.subject].hours += task.hours;
      subjects[task.subject].total += task.hours; // نفترض التخطيط يساوي الساعات المخططة
    });
  });
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(subjects),
      datasets: [{
        label: "عدد الساعات المنجزة",
        data: Object.values(subjects).map(s => s.hours),
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    }
  });
}

// --- الإحصائيات الأسبوعية ---
function renderStatsChart() {
  const ctx = document.getElementById("statsChart").getContext("2d");
  const weekSubjects = {};
  const day = new Date(today);
  for (let i = 0; i < 7; i++) {
    const d = new Date(day);
    d.setDate(day.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    (DATA[dateStr]?.tasks || []).forEach(task => {
      if (!weekSubjects[task.subject]) weekSubjects[task.subject] = 0;
      weekSubjects[task.subject] += task.hours;
    });
  }
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(weekSubjects),
      datasets: [{
        label: "عدد الساعات الأسبوعية",
        data: Object.values(weekSubjects),
        backgroundColor: ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF"]
      }]
    }
  });
}

// --- التهيئة ---
function init() {
  document.getElementById("todayDate").innerText = today;
  renderTasks();
  renderExams();
  renderReportChart();
  renderStatsChart();
}

init();
