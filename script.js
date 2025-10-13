// script.js

document.addEventListener("DOMContentLoaded", () => {
  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData();

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0];
  if (!DATA[today]) {
    today = Object.keys(DATA)[0]; // إذا لم يوجد تاريخ اليوم، نختار أول يوم
  }

  let archive = [];
  let grades = [];

  // --- عناصر الواجهة ---
  const tasksList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const archiveContainer = document.getElementById("archiveContent");
  const gradesContainer = document.getElementById("gradesContent");
  const todayDateLabel = document.getElementById("todayDate");

  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("overlay");

  const viewDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");

  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  const submitExamBtn = document.getElementById("submitExamBtn");

  // --- القائمة الجانبية ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  // --- عرض التاريخ الافتراضي ---
  viewDateInput.value = today;
  todayDateLabel.textContent = today;

  // --- زر "اليوم" ---
  todayBtn.addEventListener("click", () => {
    today = new Date().toISOString().split("T")[0];
    viewDateInput.value = today;
    todayDateLabel.textContent = today;
    renderTasks();
    renderExams();
  });

  // --- زر "عرض" حسب التاريخ ---
  goDateBtn.addEventListener("click", () => {
    const selected = viewDateInput.value;
    if (DATA[selected]) {
      today = selected;
      todayDateLabel.textContent = today;
      renderTasks();
      renderExams();
    } else {
      alert("لا توجد بيانات لهذا اليوم.");
    }
  });

  // --- دالة عرض المهام اليومية ---
  function renderTasks() {
    tasksList.innerHTML = "";
    const day = DATA[today];

    if (!day || !day.tasks || day.tasks.length === 0) {
      tasksList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
      return;
    }

    day.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
        <strong>${task.subject}</strong>: ${task.content} (${task.hours} ساعة)
        <button class="complete-btn">اكتمال</button>
      `;

      const btn = li.querySelector(".complete-btn");
      btn.addEventListener("click", () => {
        archive.push({ type: "task", date: today, ...task });
        li.remove();
        updateArchive();
      });

      tasksList.appendChild(li);
    });
  }

  // --- دالة عرض الامتحانات اليومية ---
  function renderExams() {
    examsArea.innerHTML = "";
    const day = DATA[today];

    if (!day || !day.exams || day.exams.length === 0) {
      examsArea.innerHTML = "<p>لا توجد امتحانات اليوم.</p>";
      return;
    }

    day.exams.forEach(exam => {
      const div = document.createElement("div");
      div.className = "exam-item";
      div.innerHTML = `
        <strong>${exam.subject}</strong>: ${exam.title}
        <button class="start-exam-btn">بدء الامتحان</button>
      `;

      const btn = div.querySelector(".start-exam-btn");
      btn.addEventListener("click", () => openExam(exam));

      examsArea.appendChild(div);
    });
  }

  // --- فتح الامتحان ---
  function openExam(exam) {
    examWindow.style.display = "flex";
    examContent.innerHTML = "";

    exam.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "question-item";
      div.innerHTML = `
        <p>${idx + 1}. ${q.text}</p>
        <input type="text" class="answer-input" data-qid="${q.id}" placeholder="اكتب الإجابة هنا">
      `;
      examContent.appendChild(div);
    });

    submitExamBtn.onclick = () => {
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

  // --- تصحيح الإجابات ---
  function checkAnswer(user, correct) {
    user = user.toLowerCase().replace(/\s+/g, "");
    correct = correct.toLowerCase().replace(/\s+/g, "");

    if (user === correct) return true;

    const userWords = user.split(/[\s,.;]+/).sort();
    const correctWords = correct.split(/[\s,.;]+/).sort();
    if (userWords.join(",") === correctWords.join(",")) return true;

    const userNum = parseFloat(user.replace(/[^\d.eE-]/g, ""));
    const correctNum = parseFloat(correct.replace(/[^\d.eE-]/g, ""));
    if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) <= 0.1)
      return true;

    return false;
  }

  // --- تحديث الأرشيف ---
  function updateArchive() {
    archiveContainer.innerHTML = "";
    archive.forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${item.type}</strong> | ${item.subject || ""} | ${item.title || item.content} | ${item.date}
      `;
      archiveContainer.appendChild(div);
    });
  }

  // --- تحديث الدرجات ---
  function updateGrades() {
    gradesContainer.innerHTML = "";
    grades.forEach(g => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${g.subject}</strong> | ${g.title} | الدرجة: ${g.score}
      `;
      gradesContainer.appendChild(div);
    });
  }

  // --- تشغيل الصفحة أولاً ---
  renderTasks();
  renderExams();
});
