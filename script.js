// script.js

document.addEventListener("DOMContentLoaded", () => {

  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData();

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // إذا التاريخ الحالي غير موجود في DATA، استخدم أول يوم موجود
  if (!DATA[today]) today = Object.keys(DATA)[0];

  let archive = [];
  let grades = [];

  // --- عناصر الواجهة ---
  const tasksContainer = document.getElementById("tasksContainer");
  const examsContainer = document.getElementById("examsContainer");
  const archiveContainer = document.getElementById("archiveContainer");
  const gradesContainer = document.getElementById("gradesContainer");

  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  // --- التحكم في الشريط الجانبي ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.style.display = sidebar.classList.contains("active") ? "block" : "none";
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.style.display = "none";
  });

  // --- دالة عرض المهام اليومية ---
  function renderTasks() {
    tasksContainer.innerHTML = "";
    if (!DATA[today] || !DATA[today].tasks.length) {
      tasksContainer.innerHTML = "<p>لا توجد مهام اليوم.</p>";
      return;
    }

    DATA[today].tasks.forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-item";
      taskEl.innerHTML = `
        <strong>${task.subject}</strong>: ${task.content} (${task.hours} ساعة)
        <button class="complete-btn">اكتمال</button>
      `;
      tasksContainer.appendChild(taskEl);

      // زر اكتمال
      taskEl.querySelector(".complete-btn").addEventListener("click", () => {
        archive.push({ type: "task", date: today, ...task });
        taskEl.remove();
        updateArchive();
      });
    });
  }

  // --- دالة عرض الامتحانات اليومية ---
  function renderExams() {
    examsContainer.innerHTML = "";
    if (!DATA[today] || !DATA[today].exams.length) {
      examsContainer.innerHTML = "<p>لا توجد امتحانات اليوم.</p>";
      return;
    }

    DATA[today].exams.forEach(exam => {
      const examEl = document.createElement("div");
      examEl.className = "exam-item";
      examEl.innerHTML = `
        <strong>${exam.subject}</strong>: ${exam.title}
        <button class="start-exam-btn">بدء الامتحان</button>
      `;
      examsContainer.appendChild(examEl);

      // زر بدء الامتحان
      examEl.querySelector(".start-exam-btn").addEventListener("click", () => {
        openExam(exam);
      });
    });
  }

  // --- دالة فتح الامتحان ---
  function openExam(exam) {
    const examWindow = document.getElementById("examWindow");
    const examContent = document.getElementById("examContent");
    examWindow.style.display = "block";
    examContent.innerHTML = "";

    exam.questions.forEach((q, idx) => {
      const qEl = document.createElement("div");
      qEl.className = "question-item";
      qEl.innerHTML = `
        <p>${idx + 1}. ${q.text}</p>
        <input type="text" class="answer-input" data-qid="${q.id}">
      `;
      examContent.appendChild(qEl);
    });

    // زر تسليم الامتحان
    document.getElementById("submitExamBtn").onclick = () => {
      let score = 0;
      const pointsPerQuestion = exam.questions.length ? Math.floor(100 / exam.questions.length) : 0;

      exam.questions.forEach(q => {
        const userAnswer = document.querySelector(`[data-qid="${q.id}"]`).value.trim();
        if (checkAnswer(userAnswer, q.answer)) {
          score += pointsPerQuestion;
        }
      });

      grades.push({ date: today, subject: exam.subject, title: exam.title, score });
      archive.push({ type: "exam", date: today, ...exam });
      updateGrades();
      updateArchive();
      examWindow.style.display = "none";
      renderExams();
    };
  }

  // --- دالة تصحيح ذكي ---
  function checkAnswer(user, correct) {
    user = user.toLowerCase().replace(/\s+/g, "");
    correct = correct.toLowerCase().replace(/\s+/g, "");

    // 1. نفس النص
    if (user === correct) return true;

    // 2. كلمات مفتاحية (ترتيب مختلف)
    let userWords = user.split(/[\s,.;]+/).sort();
    let correctWords = correct.split(/[\s,.;]+/).sort();
    if (userWords.join(",") === correctWords.join(",")) return true;

    // 3. أرقام علمية / رياضية
    const userNum = parseFloat(user.replace(/[^\d.eE-]/g, ""));
    const correctNum = parseFloat(correct.replace(/[^\d.eE-]/g, ""));
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      if (Math.abs(userNum - correctNum) <= 0.1) return true;
    }

    return false;
  }

  // --- تحديث الأرشيف ---
  function updateArchive() {
    archiveContainer.innerHTML = "";
    archive.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.innerHTML = `
        <strong>${item.type}</strong> | ${item.subject || ""} | ${item.title || item.content} | ${item.date}
      `;
      archiveContainer.appendChild(itemEl);
    });
  }

  // --- تحديث جدول الدرجات ---
  function updateGrades() {
    gradesContainer.innerHTML = "";
    grades.forEach(g => {
      const gradeEl = document.createElement("div");
      gradeEl.innerHTML = `
        <strong>${g.subject}</strong> | ${g.title} | الدرجة: ${g.score}
      `;
      gradesContainer.appendChild(gradeEl);
    });
  }

  // --- دالة التهيئة ---
  function init() {
    renderTasks();
    renderExams();
    updateArchive();
    updateGrades();
  }

  // --- تشغيل السكربت ---
  init();

});
