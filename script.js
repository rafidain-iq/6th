// script.js - النسخة المتكاملة

document.addEventListener("DOMContentLoaded", () => {
  // --- العناصر الأساسية ---
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  const todayBtn = document.getElementById("todayBtn");
  const goDate = document.getElementById("goDate");
  const viewDate = document.getElementById("viewDate");

  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDateLabel = document.getElementById("todayDate");

  const addSection = document.getElementById("add");
  const newSubject = document.getElementById("new_subject");
  const newContent = document.getElementById("new_content");
  const newHours = document.getElementById("new_hours");
  const newDate = document.getElementById("new_date");
  const saveTaskBtn = document.getElementById("saveTask");

  const gradesSection = document.getElementById("grades");
  const gradesContent = document.getElementById("gradesContent");

  const examModal = document.getElementById("examModal");
  const closeExamBtn = document.getElementById("closeExam");
  const examTitleShow = document.getElementById("examTitleShow");
  const examQuestions = document.getElementById("examQuestions");
  const submitExamBtn = document.getElementById("submitExamBtn");
  const examResult = document.getElementById("examResult");

  let DATA = window.getInitialData(); // تحميل البيانات الأساسية
  let LOCAL_STORAGE_KEY = "studyPlatformData";

  // --- تحميل البيانات من localStorage أو الاحتفاظ بالبيانات الأساسية ---
  function loadData() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        DATA = JSON.parse(saved);
      } catch (e) {
        console.warn("خطأ في استرجاع البيانات، سيتم استخدام البيانات الأساسية.");
      }
    }
  }

  function saveData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DATA));
  }

  loadData();

  // --- قائمة جانبية ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });

  document.querySelectorAll(".navlink").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("main .card").forEach(s => s.classList.add("section-hidden"));
      const tab = btn.dataset.tab;
      document.getElementById(tab).classList.remove("section-hidden");
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      if (tab === "dashboard") renderToday();
      if (tab === "grades") renderGrades();
    });
  });

  // --- الحصول على تاريخ اليوم الحالي بصيغة YYYY-MM-DD ---
  function getToday() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // --- عرض واجبات اليوم والامتحانات ---
  function renderToday(selectedDate) {
    const date = selectedDate || getToday();
    todayDateLabel.textContent = date;
    todayList.innerHTML = "";
    examsArea.innerHTML = "";

    if (!DATA[date]) return;

    const tasks = DATA[date].tasks || [];
    const exams = DATA[date].exams || [];

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.subject}: ${task.content} (${task.hours} ساعات)`;
      todayList.appendChild(li);
    });

    exams.forEach(exam => {
      const btn = document.createElement("button");
      btn.className = "btn small";
      btn.textContent = exam.title || exam.subject;
      btn.addEventListener("click", () => openExam(exam, date));
      examsArea.appendChild(btn);
    });
  }

  todayBtn.addEventListener("click", () => renderToday());
  goDate.addEventListener("click", () => renderToday(viewDate.value));

  // --- إضافة واجب جديد ---
  saveTaskBtn.addEventListener("click", () => {
    const subject = newSubject.value.trim();
    const content = newContent.value.trim();
    const hours = parseFloat(newHours.value);
    const date = newDate.value;

    if (!subject || !content || !date) return alert("يرجى تعبئة جميع الحقول");

    if (!DATA[date]) DATA[date] = { tasks: [], exams: [] };

    DATA[date].tasks.push({ subject, content, hours, done: false, id: `t-${date}-${Date.now()}` });
    saveData();
    renderToday(date);

    // إعادة ضبط النموذج
    newSubject.value = "";
    newContent.value = "";
    newHours.value = 1;
    newDate.value = "";
  });

  // --- إضافة الدرجات بنفس آلية الواجبات ---
  function addGrade(subject, grade, date) {
    if (!subject || !grade || !date) return;
    if (!DATA[date]) DATA[date] = { tasks: [], exams: [] };
    if (!DATA[date].grades) DATA[date].grades = [];
    DATA[date].grades.push({ subject, grade, id: `g-${date}-${Date.now()}` });
    saveData();
  }

  function renderGrades() {
    gradesContent.innerHTML = "";
    const allGrades = [];
    Object.keys(DATA).sort().forEach(date => {
      const dayGrades = DATA[date].grades || [];
      dayGrades.forEach(g => allGrades.push({ date, ...g }));
    });

    if (allGrades.length === 0) {
      gradesContent.textContent = "لا توجد بيانات درجات حالياً.";
      return;
    }

    allGrades.forEach(g => {
      const div = document.createElement("div");
      div.textContent = `${g.date} - ${g.subject}: ${g.grade}`;
      gradesContent.appendChild(div);
    });
  }

  // --- فتح الامتحان ---
  function openExam(exam, date) {
    examModal.classList.remove("section-hidden");
    examTitleShow.textContent = exam.title || exam.subject;
    examQuestions.innerHTML = "";

    if (!exam.questions) return;

    exam.questions.forEach(q => {
      const div = document.createElement("div");
      div.className = "exam-question";
      div.innerHTML = `
        <p>${q.text}</p>
        <input type="text" class="exam-answer" data-id="${q.id}">
      `;
      examQuestions.appendChild(div);
    });
  }

  closeExamBtn.addEventListener("click", () => examModal.classList.add("section-hidden"));

  // --- تصحيح ذكي للامتحانات ---
  submitExamBtn.addEventListener("click", () => {
    let score = 0;
    const inputs = document.querySelectorAll(".exam-answer");

    inputs.forEach(input => {
      const id = input.dataset.id;
      let correctAnswer = null;

      // البحث عن الإجابة الصحيحة
      Object.keys(DATA).forEach(date => {
        const day = DATA[date];
        day.exams.forEach(exam => {
          exam.questions.forEach(q => {
            if (q.id === id) correctAnswer = q.answer;
          });
        });
      });

      if (!correctAnswer) return;

      // --- مقارنة الإجابة ---
      const userAns = input.value.trim().toLowerCase();
      const corrAns = correctAnswer.trim().toLowerCase();

      // إذا تطابق النص حرفياً أو قريب جداً (1-2 كلمة فرق) أو نفس المفهوم
      if (userAns === corrAns) score++;
      else if (levenshtein(userAns, corrAns) <= 5) score++; // تشابه بسيط
      else if (semanticMatch(userAns, corrAns)) score++; // نفس المفهوم
    });

    examResult.textContent = `لقد حصلت على ${score} درجة من ${inputs.length}`;
  });

  // --- دوال مساعدة للتصحيح الذكي ---
  function levenshtein(a, b) {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
      }
    }
    return dp[a.length][b.length];
  }

  function semanticMatch(ans1, ans2) {
    // يمكن تحسين هذه الدالة لاحقاً لمقارنة المعنى
    // حالياً: إذا كانت تحتوي على نفس الكلمات الأساسية
    const keywords1 = ans1.split(" ").filter(w => w.length > 2);
    const keywords2 = ans2.split(" ").filter(w => w.length > 2);
    const common = keywords1.filter(w => keywords2.includes(w));
    return common.length >= Math.min(2, keywords2.length);
  }

  // --- التهيئة الأولية عند تحميل الصفحة ---
  renderToday();
});
