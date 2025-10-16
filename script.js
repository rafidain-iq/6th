document.addEventListener("DOMContentLoaded", () => {

  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData();

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (!DATA[today]) {
    // في حال لم يكن اليوم موجودًا في الداتا
    const dates = Object.keys(DATA).sort();
    today = dates[0];
  }

  // --- مراجع لعناصر DOM ---
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");

  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");

  const viewDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");

  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  const submitExamBtn = document.getElementById("submitExamBtn");

  const archiveContainer = document.getElementById("archiveContent");
  const gradesContainer = document.getElementById("gradesContent");

  // --- متغيرات بيانات ---
  let archive = [];
  let grades = [];

  // === فتح وإغلاق القائمة الجانبية ===
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  // === عرض تاريخ اليوم ===
  function updateDateHeader() {
    todayDate.textContent = `(${today})`;
  }

  // === دالة عرض المهام ===
  function renderTasks() {
    todayList.innerHTML = "";
    const day = DATA[today];
    if (!day || !day.tasks.length) {
      todayList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
      return;
    }

    day.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
        <strong>${task.subject}</strong>: ${task.content} (${task.hours} ساعة)
        <button class="complete-btn">✔️</button>
      `;
      const completeBtn = li.querySelector(".complete-btn");
      completeBtn.addEventListener("click", () => {
        archive.push({ type: "task", date: today, ...task });
        li.remove();
        updateArchive();
      });
      todayList.appendChild(li);
    });
  }

  // === دالة عرض الامتحانات ===
  function renderExams() {
    examsArea.innerHTML = "";
    const day = DATA[today];
    if (!day || !day.exams.length) {
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
      div.querySelector(".start-exam-btn").addEventListener("click", () => openExam(exam));
      examsArea.appendChild(div);
    });
  }

  // === دالة فتح الامتحان ===
  function openExam(exam) {
    examContent.innerHTML = "";
    examWindow.style.display = "block";

    exam.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "question-item";
      div.innerHTML = `
        <p>${idx + 1}. ${q.text}</p>
        <input type="text" class="answer-input" data-qid="${q.id}">
      `;
      examContent.appendChild(div);
    });

    submitExamBtn.onclick = () => {
      let score = 0;
      exam.questions.forEach(q => {
        const answer = document.querySelector(`[data-qid="${q.id}"]`).value.trim();
        if (checkAnswer(answer, q.answer)) score += 10;
      });

      grades.push({ date: today, subject: exam.subject, title: exam.title, score });
      archive.push({ type: "exam", date: today, ...exam });

      updateGrades();
      updateArchive();
      examWindow.style.display = "none";
      renderExams();
    };
  }

  // === دالة التصحيح الذكي ===
  function checkAnswer(user, correct) {
    user = user.toLowerCase().trim();
    correct = correct.toLowerCase().trim();

    if (user === correct) return true;

    // تطابق كلمات بشكل مرن
    const userWords = user.split(/[\s,.;]+/).sort().join(",");
    const correctWords = correct.split(/[\s,.;]+/).sort().join(",");
    if (userWords === correctWords) return true;

    // تطابق الأرقام
    const userNum = parseFloat(user.replace(/[^\d.eE-]/g, ""));
    const correctNum = parseFloat(correct.replace(/[^\d.eE-]/g, ""));
    if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) <= 0.1) return true;

    return false;
  }

  // === تحديث الأرشيف ===
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

  // === تحديث الدرجات ===
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

  // === عرض التاريخ حسب الاختيار ===
  viewDateInput.value = today;
  todayBtn.addEventListener("click", () => {
    today = new Date().toISOString().split("T")[0];
    viewDateInput.value = today;
    updateDateHeader();
    renderTasks();
    renderExams();
  });

  goDateBtn.addEventListener("click", () => {
    const date = viewDateInput.value;
    if (DATA[date]) {
      today = date;
      updateDateHeader();
      renderTasks();
      renderExams();
    } else {
      alert("لا توجد بيانات لهذا اليوم.");
    }
  });

  // === بدء التشغيل ===
  updateDateHeader();
  renderTasks();
  renderExams();
});
