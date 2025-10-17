document.addEventListener("DOMContentLoaded", () => {

  // --- استدعاء البيانات من data.js ---
  const DATA = window.getInitialData();

  // --- المتغيرات العامة ---
  let today = new Date().toISOString().split("T")[0];
  if (!DATA[today]) today = Object.keys(DATA)[0];
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
  const navLinks = document.querySelectorAll(".navlink");
  const sections = document.querySelectorAll("main > section");

  const viewDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");

  const examWindow = document.getElementById("examWindow");
  const examContent = document.getElementById("examContent");
  const submitExamBtn = document.getElementById("submitExamBtn");

  const addGradeBtn = document.getElementById("addGradeBtn");

  // --- القائمة الجانبية ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  // --- التنقل بين الصفحات ---
  navLinks.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      sections.forEach(sec => sec.classList.add("section-hidden"));
      document.getElementById(tab).classList.remove("section-hidden");
      sidebar.classList.remove("open");
      overlay.classList.remove("show");

      // عند فتح التقارير أو الإحصائيات نعيد رسم الرسوم
      if (tab === "reports") renderReports();
      if (tab === "stats") renderStats();
    });
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
      const li = document.createElement("li");
      li.textContent = `${task.subject}: ${task.content} (${task.hours} ساعة)`;
      const btn = document.createElement("button");
      btn.textContent = "اكتمال";
      btn.className = "complete-btn";
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
    examWindow.classList.remove("section-hidden");

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
      updateGrades();
      updateArchive();
      examWindow.classList.add("section-hidden");
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

  // --- تحديث الأرشيف ---
  function updateArchive() {
    archiveContainer.innerHTML = "";
    archive.forEach(item => {
      const div = document.createElement("div");
      div.textContent = `${item.type} | ${item.subject || ""} | ${item.title || item.content} | ${item.date}`;
      archiveContainer.appendChild(div);
    });
  }

  // --- تحديث جدول الدرجات ---
  function updateGrades() {
    gradesContainer.innerHTML = "";
    if (!grades.length) {
      gradesContainer.textContent = "لا توجد درجات حالياً.";
      return;
    }
    grades.forEach(g => {
      const div = document.createElement("div");
      div.textContent = `${g.subject} | ${g.title} | الدرجة: ${g.score}`;
      gradesContainer.appendChild(div);
    });
  }

  // --- التقارير الشهرية ---
  function renderReports() {
    const ctx = document.getElementById("reportChart").getContext("2d");
    const subjects = {};
    Object.values(DATA).forEach(day => {
      day.tasks.forEach(t => {
        subjects[t.subject] = (subjects[t.subject] || 0) + t.hours;
      });
    });
    const labels = Object.keys(subjects);
    const values = Object.values(subjects);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "عدد الساعات الشهرية",
          data: values,
          backgroundColor: "#a89a82"
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // --- الإحصائيات الأسبوعية ---
  function renderStats() {
    const ctx = document.getElementById("statsChart").getContext("2d");
    const subjects = {};
    Object.values(DATA).forEach(day => {
      day.tasks.forEach(t => {
        subjects[t.subject] = (subjects[t.subject] || 0) + t.hours;
      });
    });
    const labels = Object.keys(subjects);
    const values = Object.values(subjects);

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          label: "الإحصائيات الأسبوعية",
          data: values,
          backgroundColor: ["#000", "#555", "#a89a82", "#ccc"]
        }]
      }
    });
  }

  // --- زر إضافة درجة ---
  addGradeBtn.addEventListener("click", () => {
    const subject = prompt("اسم المادة:");
    const title = prompt("عنوان الاختبار أو الواجب:");
    const score = prompt("الدرجة:");
    if (subject && title && score) {
      grades.push({ date: today, subject, title, score });
      updateGrades();
      alert("تمت إضافة الدرجة بنجاح ✅");
    }
  });

  // --- بدء التشغيل ---
  renderTasks();
  renderExams();
});
