// script.js - نسخة نهائية متوافقة بالكامل مع data.js و style.css

document.addEventListener("DOMContentLoaded", () => {

  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData ? window.getInitialData() : {};

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (!DATA[today]) {
    today = Object.keys(DATA)[0]; // إذا اليوم الحالي غير موجود
  }

  let archive = [];
  let grades = [];

  // --- عناصر الواجهة ---
  const tasksList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const archiveContainer = document.getElementById("archiveContent");
  const gradesContainer = document.getElementById("gradesContent");

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  const viewDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");

  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  const submitExamBtn = document.getElementById("submitExamBtn");

  // --- فتح وإغلاق القائمة الجانبية ---
  function toggleSidebar() {
    const isOpen = sidebar.classList.contains("open");
    sidebar.classList.toggle("open", !isOpen);
    overlay.classList.toggle("show", !isOpen);
  }

  menuBtn.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  // --- عرض التاريخ الحالي ---
  viewDateInput.value = today;
  document.getElementById("todayDate").textContent = today;

  todayBtn.addEventListener("click", () => {
    today = new Date().toISOString().split("T")[0];
    viewDateInput.value = today;
    renderTasks();
    renderExams();
    document.getElementById("todayDate").textContent = today;
  });

  goDateBtn.addEventListener("click", () => {
    const selected = viewDateInput.value;
    if (DATA[selected]) {
      today = selected;
      renderTasks();
      renderExams();
      document.getElementById("todayDate").textContent = today;
    } else {
      alert("لا توجد بيانات لهذا اليوم.");
    }
  });

  // --- عرض المهام اليومية ---
  function renderTasks() {
    tasksList.innerHTML = "";
    const day = DATA[today];
    if (!day || !day.tasks || day.tasks.length === 0) {
      tasksList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
      return;
    }

    day.tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.subject}: ${task.content} (${task.hours} ساعة)`;

      const btn = document.createElement("button");
      btn.textContent = "تمّ";
      btn.className = "btn ghost small";
      btn.style.marginRight = "10px";

      btn.addEventListener("click", () => {
        archive.push({ type: "task", date: today, ...task });
        li.remove();
        updateArchive();
      });

      li.appendChild(btn);
      tasksList.appendChild(li);
    });
  }

  // --- عرض الامتحانات اليومية ---
  function renderExams() {
    examsArea.innerHTML = "";
    const day = DATA[today];
    if (!day || !day.exams || day.exams.length === 0) {
      examsArea.innerHTML = "<p>لا توجد امتحانات اليوم.</p>";
      return;
    }

    day.exams.forEach(exam => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `<strong>${exam.subject}</strong>: ${exam.title || "امتحان"} `;
      const btn = document.createElement("button");
      btn.textContent = "بدء الامتحان";
      btn.className = "btn";
      btn.addEventListener("click", () => openExam(exam));
      div.appendChild(btn);
      examsArea.appendChild(div);
    });
  }

  // --- فتح الامتحان ---
  function openExam(exam) {
    examContent.innerHTML = "";
    examWindow.style.display = "block";

    if (!exam.questions || exam.questions.length === 0) {
      examContent.innerHTML = "<p>لا توجد أسئلة لهذا الامتحان.</p>";
      return;
    }

    exam.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.classList.add("exam-card");
      div.innerHTML = `
        <p><strong>${idx + 1}.</strong> ${q.text}</p>
        <input type="text" class="answer-input" data-qid="${q.id}" placeholder="إجابتك هنا">
      `;
      examContent.appendChild(div);
    });

    submitExamBtn.onclick = () => {
      let score = 0;
      exam.questions.forEach(q => {
        const userAnswer = document.querySelector(`[data-qid="${q.id}"]`).value.trim();
        if (checkAnswer(userAnswer, q.answer)) {
          score += 10;
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

  // --- تصحيح الإجابات ---
  function checkAnswer(user, correct) {
    user = (user || "").toLowerCase().replace(/\s+/g, "");
    correct = (correct || "").toLowerCase().replace(/\s+/g, "");

    if (user === correct) return true;

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
    if (archive.length === 0) {
      archiveContainer.innerHTML = "<p>لا يوجد أرشيف بعد.</p>";
      return;
    }
    archive.forEach(item => {
      const div = document.createElement("div");
      div.textContent = `${item.type} | ${item.subject || ""} | ${item.title || item.content} | ${item.date}`;
      archiveContainer.appendChild(div);
    });
  }

  // --- تحديث الدرجات ---
  function updateGrades() {
    gradesContainer.innerHTML = "";
    if (grades.length === 0) {
      gradesContainer.innerHTML = "<p>لا توجد درجات حالياً.</p>";
      return;
    }
    grades.forEach(g => {
      const div = document.createElement("div");
      div.textContent = `${g.subject} | ${g.title} | الدرجة: ${g.score}`;
      gradesContainer.appendChild(div);
    });
  }

  // --- التهيئة ---
  renderTasks();
  renderExams();

});
