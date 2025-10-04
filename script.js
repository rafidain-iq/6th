// script.js - منصة الدراسة النهائية
document.addEventListener("DOMContentLoaded", () => {
  const todayDateInput = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDateBtn = document.getElementById("goDate");
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDateDisplay = document.getElementById("todayDate");
  const saveTaskBtn = document.getElementById("saveTask");

  const overlay = document.getElementById("overlay");
  const examModal = document.getElementById("examModal");
  const closeExamBtn = document.getElementById("closeExam");
  const examTitleShow = document.getElementById("examTitleShow");
  const examQuestions = document.getElementById("examQuestions");
  const submitExamBtn = document.getElementById("submitExamBtn");
  const examResult = document.getElementById("examResult");

  let DATA = window.getInitialData();
  let tasksState = JSON.parse(localStorage.getItem("tasksState")) || {};
  let gradesState = JSON.parse(localStorage.getItem("gradesState")) || [];
  
  // --- Helper Functions ---
  function formatDate(date) {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  }

  function saveTasks() {
    localStorage.setItem("tasksState", JSON.stringify(tasksState));
  }

  function saveGrades() {
    localStorage.setItem("gradesState", JSON.stringify(gradesState));
  }

  function getTodayKey() {
    return formatDate(new Date(todayDateInput.value || new Date()));
  }

  // --- Display Functions ---
  function renderTasks(dateKey) {
    todayList.innerHTML = "";
    todayDateDisplay.textContent = dateKey;
    if (!DATA[dateKey] || !DATA[dateKey].tasks) return;

    DATA[dateKey].tasks.forEach((t) => {
      const doneKey = `${dateKey}-${t.subject}-${t.content}`;
      const isDone = tasksState[doneKey] || t.done;
      if (!isDone) {
        const li = document.createElement("li");
        li.textContent = `${t.subject} : ${t.content} (${t.hours} ساعة)`;
        const btn = document.createElement("button");
        btn.textContent = "✓ تم";
        btn.className = "btn small ghost";
        btn.style.marginRight = "8px";
        btn.addEventListener("click", () => {
          tasksState[doneKey] = true;
          saveTasks();
          li.remove();
          renderArchive(); // move to archive
        });
        li.prepend(btn);
        todayList.appendChild(li);
      }
    });
  }

  function renderExams(dateKey) {
    examsArea.innerHTML = "";
    if (!DATA[dateKey] || !DATA[dateKey].exams) return;

    DATA[dateKey].exams.forEach((exam, idx) => {
      const div = document.createElement("div");
      div.style.marginBottom = "8px";
      div.innerHTML = `<strong>${exam.subject}</strong> - ${exam.title} `;
      const startBtn = document.createElement("button");
      startBtn.textContent = "بدء الامتحان";
      startBtn.className = "btn small";
      startBtn.addEventListener("click", () => openExamModal(exam));
      div.appendChild(startBtn);
      examsArea.appendChild(div);
    });
  }

  function renderArchive() {
    const archiveContent = document.getElementById("archiveContent");
    archiveContent.innerHTML = "";
    Object.keys(DATA).forEach((dateKey) => {
      if (!DATA[dateKey].tasks) return;
      DATA[dateKey].tasks.forEach((t) => {
        const doneKey = `${dateKey}-${t.subject}-${t.content}`;
        const isDone = tasksState[doneKey] || t.done;
        if (isDone) {
          const div = document.createElement("div");
          div.textContent = `${dateKey} - ${t.subject} : ${t.content} (${t.hours} ساعة)`;
          archiveContent.appendChild(div);
        }
      });
    });
  }

  // --- Exam Modal ---
  let currentExam = null;
  function openExamModal(exam) {
    currentExam = exam;
    examTitleShow.textContent = `${exam.subject} - ${exam.title}`;
    examQuestions.innerHTML = "";
    examResult.innerHTML = "";
    exam.questions.forEach((q, i) => {
      const qDiv = document.createElement("div");
      qDiv.style.marginBottom = "6px";
      const label = document.createElement("label");
      label.textContent = `${i + 1}. ${q.text}`;
      const input = document.createElement("input");
      input.type = "text";
      input.style.width = "100%";
      input.dataset.correct = q.answer;
      qDiv.appendChild(label);
      qDiv.appendChild(input);
      examQuestions.appendChild(qDiv);
    });
    examModal.classList.remove("section-hidden");
    overlay.style.display = "block";
  }

  closeExamBtn.addEventListener("click", () => {
    examModal.classList.add("section-hidden");
    overlay.style.display = "none";
  });

  function normalizeText(str) {
    return str.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function smartGrading(input, correct) {
    const inp = normalizeText(input);
    const corr = normalizeText(correct);
    if (inp === corr) return true;

    // Allow minor differences (1-2 words)
    const inpWords = inp.split(" ");
    const corrWords = corr.split(" ");
    const diff = Math.abs(inpWords.length - corrWords.length);
    if (diff <= 2 && corrWords.every(w => inpWords.includes(w))) return true;

    // Check if key concepts exist
    const keywords = corrWords.filter(w => w.length > 2);
    const match = keywords.every(k => inp.includes(k));
    return match;
  }

  submitExamBtn.addEventListener("click", () => {
    let totalScore = 0;
    const inputs = examQuestions.querySelectorAll("input");
    inputs.forEach((input) => {
      const correct = input.dataset.correct;
      if (smartGrading(input.value, correct)) totalScore += 10; // each question 10 points
    });
    examResult.textContent = `تم التصحيح: الدرجة ${totalScore}/${inputs.length * 10}`;
    // Add to grades
    gradesState.push({
      subject: currentExam.subject,
      title: currentExam.title,
      score: totalScore,
      date: getTodayKey()
    });
    saveGrades();
    renderGrades();
  });

  // --- Render Grades ---
  function renderGrades() {
    const gradesContent = document.getElementById("gradesContent");
    gradesContent.innerHTML = "";
    if (!gradesState.length) {
      gradesContent.textContent = "لا توجد بيانات درجات حالياً.";
      return;
    }
    gradesState.forEach((g) => {
      const div = document.createElement("div");
      div.textContent = `${g.date} - ${g.subject} - ${g.title} : ${g.score} درجة`;
      gradesContent.appendChild(div);
    });
  }

  // --- Charts ---
  function renderStats() {
    const statsContent = document.getElementById("statsContent");
    statsContent.innerHTML = "<canvas id='statsChart' width='400' height='200'></canvas>";
    const ctx = document.getElementById("statsChart").getContext("2d");

    const materialHours = {};
    Object.keys(DATA).forEach((dateKey) => {
      if (!DATA[dateKey].tasks) return;
      DATA[dateKey].tasks.forEach((t) => {
        const doneKey = `${dateKey}-${t.subject}-${t.content}`;
        const isDone = tasksState[doneKey] || t.done;
        if (isDone) {
          if (!materialHours[t.subject]) materialHours[t.subject] = 0;
          materialHours[t.subject] += t.hours;
        }
      });
    });

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(materialHours),
        datasets: [{
          data: Object.values(materialHours),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8AFF33", "#FF33F0", "#33FFF2"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  // --- Event Listeners ---
  todayBtn.addEventListener("click", () => {
    todayDateInput.value = formatDate(new Date());
    const key = getTodayKey();
    renderTasks(key);
    renderExams(key);
  });

  goDateBtn.addEventListener("click", () => {
    const key = getTodayKey();
    renderTasks(key);
    renderExams(key);
  });

  saveTaskBtn.addEventListener("click", () => {
    const subject = document.getElementById("new_subject").value.trim();
    const content = document.getElementById("new_content").value.trim();
    const hours = parseFloat(document.getElementById("new_hours").value);
    const date = document.getElementById("new_date").value;
    if (!subject || !content || !date) return alert("يرجى إدخال جميع الحقول.");
    if (!DATA[date]) DATA[date] = { tasks: [], exams: [] };
    DATA[date].tasks.push({ subject, content, hours, done: false });
    renderTasks(getTodayKey());
    renderStats();
  });

  // --- Initial Render ---
  todayDateInput.value = formatDate(new Date());
  const key = getTodayKey();
  renderTasks(key);
  renderExams(key);
  renderGrades();
  renderArchive();
  renderStats();
});
