document.addEventListener("DOMContentLoaded", () => {

  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData();

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0];
  if (!DATA[today]) today = Object.keys(DATA)[0];

  // 🔹 تحميل البيانات من التخزين المحلي (إن وُجدت)
  let archive = JSON.parse(localStorage.getItem("archiveData")) || [];
  let grades = JSON.parse(localStorage.getItem("gradesData")) || [];

  // --- عناصر الواجهة ---
  const tasksList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const archiveContainer = document.getElementById("archiveContent");
  const gradesContainer = document.getElementById("gradesContent");

  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const viewDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");

  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  const submitExamBtn = document.getElementById("submitExamBtn");

  // --- القائمة الجانبية ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // --- اختيار التاريخ ---
  viewDateInput.value = today;
  todayBtn.addEventListener("click", () => {
    today = new Date().toISOString().split("T")[0];
    viewDateInput.value = today;
    renderTasks();
    renderExams();
  });

  goDateBtn.addEventListener("click", () => {
    const selected = viewDateInput.value;
    if (DATA[selected]) {
      today = selected;
      renderTasks();
      renderExams();
    } else {
      alert("لا توجد بيانات لهذا اليوم");
    }
  });

  // --- عرض المهام اليومية ---
  function renderTasks() {
    tasksList.innerHTML = "";
    const day = DATA[today];
    if (!day || !day.tasks.length) {
      tasksList.innerHTML = "<li>لا توجد مهام اليوم.</li>";
      return;
    }

    day.tasks.forEach(task => {
      if (task.done) return; // ✅ إذا مكتملة، لا نعرضها

      const li = document.createElement("li");
      li.textContent = `${task.subject}: ${task.content} (${task.hours} ساعة)`;
      const btn = document.createElement("button");
      btn.textContent = "اكتمال";
      btn.className = "complete-btn";
      btn.addEventListener("click", () => {
        task.done = true;
        archive.push({ type: "task", date: today, ...task });
        saveData();
        renderTasks();
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
    if (!day || !day.exams.length) {
      examsArea.innerHTML = "<p>لا توجد امتحانات اليوم.</p>";
      return;
    }

    day.exams.forEach(exam => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${exam.subject}</strong>: ${exam.title} `;
      const btn = document.createElement("button");
      btn.textContent = "بدء الامتحان";
      btn.addEventListener("click", () => openExam(exam));
      div.appendChild(btn);
      examsArea.appendChild(div);
    });
  }

  // --- فتح الامتحان ---
  function openExam(exam) {
    examContent.innerHTML = "";
    examWindow.style.display = "block";

    exam.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${idx + 1}. ${q.text}</p>
        <input type="text" class="answer-input" data-qid="${q.id}">
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

      saveData();
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

    const userWords = user.split(/[\s,.;]+/).sort();
    const correctWords = correct.split(/[\s,.;]+/).sort();
    if (userWords.join(",") === correctWords.join(",")) return true;

    const userNum = parseFloat(user.replace(/[^\d.eE-]/g, ""));
    const correctNum = parseFloat(correct.replace(/[^\d.eE-]/g, ""));
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      if (Math.abs(userNum - correctNum) <= 0.1) return true;
    }

    return false;
  }

  // --- حفظ البيانات في LocalStorage ---
  function saveData() {
    localStorage.setItem("archiveData", JSON.stringify(archive));
    localStorage.setItem("gradesData", JSON.stringify(grades));
    localStorage.setItem("tasksData", JSON.stringify(DATA));
  }

  // --- تحديث الأرشيف كجدول ---
  function updateArchive() {
    if (!archive.length) {
      archiveContainer.innerHTML = "<p>لا يوجد أرشيف بعد.</p>";
      return;
    }

    let html = `
      <table class="table">
        <thead>
          <tr>
            <th>النوع</th>
            <th>المادة</th>
            <th>العنوان / المحتوى</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
    `;
    archive.forEach(item => {
      html += `
        <tr>
          <td>${item.type === "exam" ? "امتحان" : "واجب"}</td>
          <td>${item.subject || "-"}</td>
          <td>${item.title || item.content}</td>
          <td>${item.date}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    archiveContainer.innerHTML = html;
  }

  // --- تحديث الدرجات كجدول ---
  function updateGrades() {
    if (!grades.length) {
      gradesContainer.innerHTML = "<p>لا توجد درجات حالياً.</p>";
      return;
    }

    let html = `
      <table class="table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>المادة</th>
            <th>العنوان</th>
            <th>الدرجة</th>
          </tr>
        </thead>
        <tbody>
    `;
    grades.forEach(g => {
      html += `
        <tr>
          <td>${g.date}</td>
          <td>${g.subject}</td>
          <td>${g.title}</td>
          <td>${g.score}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    gradesContainer.innerHTML = html;
  }

  // --- تشغيل أولي ---
  renderTasks();
  renderExams();
  updateArchive();
  updateGrades();

});
