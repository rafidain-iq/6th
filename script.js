/* script.js — نسخة مُصحّحة ومتكاملة */

// --------------------------------- إعداد التحميل + النسخة ---------------------------------
const DATA_VERSION = "2025-10-01-v1";
let DATA = {};

function saveData(){
  try {
    localStorage.setItem("study-data", JSON.stringify(DATA));
    localStorage.setItem("study-data_version", DATA_VERSION);
  } catch(e){
    console.error("فشل حفظ البيانات في localStorage:", e);
  }
}

function loadData(){
  const storedVersion = localStorage.getItem("study-data_version");
  const stored = localStorage.getItem("study-data");

  if(stored && storedVersion === DATA_VERSION){
    try {
      DATA = JSON.parse(stored);
    } catch(e){
      console.warn("البيانات المحفوظة تالفة، سنحمّل من data.js", e);
      if(typeof window.getInitialData === "function") { DATA = window.getInitialData(); saveData(); }
      else DATA = {};
    }
  } else {
    // إذا الإصدار اختلف أو لا يوجد مخزن، نحمّل من data.js إن وجد
    if(typeof window.getInitialData === "function"){
      DATA = window.getInitialData();
      saveData();
    } else if(stored){
      try { DATA = JSON.parse(stored); } catch(e){ DATA = {}; }
    } else {
      DATA = {};
    }
  }

  // تأكد من الشكل العام: وجود مصفوفات tasks/exams لكل يوم، وإضافة id إن لم يوجد
  Object.keys(DATA).forEach(date=>{
    const day = DATA[date] || {};
    if(!Array.isArray(day.tasks)) day.tasks = [];
    if(!Array.isArray(day.exams)) day.exams = [];
    day.tasks.forEach((t,i)=>{
      if(!t.id) t.id = `t-${date}-${i}`;
      if(t.done === undefined) t.done = false;
    });
    day.exams.forEach((e,i)=>{
      if(!e.id) e.id = `e-${date}-${i}`;
      if(!Array.isArray(e.questions)) e.questions = [];
      e.questions.forEach((q,qi)=>{
        if(!q.id) q.id = `${e.id}-q${qi}`;
      });
    });
  });

  // احرص على وجود مصفوفة للدرجات إن لم توجد
  if(!Array.isArray(DATA.grades)) DATA.grades = DATA.grades || [];
}

loadData();

// -------------------------- أدوات مساعدة للتصحيح "الذكي" --------------------------
function normalizeText(s){
  if(!s) return "";
  const diacritics = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g;
  s = s.replace(diacritics,"");
  s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"”“،؛«»…]/g," ");
  s = s.replace(/\s+/g," ").trim().toLowerCase();
  return s;
}

function tokens(s){
  const n = normalizeText(s);
  if(!n) return [];
  return n.split(/\s+/).filter(Boolean);
}

function tokenOverlapRatio(correctAns, userAns){
  const c = tokens(correctAns);
  const u = tokens(userAns);
  if(c.length === 0) return 0;
  const setU = new Set(u);
  let matched = 0;
  c.forEach(w => { if(setU.has(w)) matched++; });
  return matched / c.length;
}

function isListLike(s){
  if(!s) return false;
  return /[,؛\n\-•]/.test(s);
}

function smartScoreForAnswer(correctAns, userAns, perQuestion){
  if(!userAns || userAns.trim().length === 0) return 0;
  const uNorm = normalizeText(userAns);
  const cNorm = normalizeText(correctAns);

  if(uNorm === cNorm) return perQuestion;

  // قوائم
  if(isListLike(correctAns) || isListLike(userAns)){
    const splitPattern = /[\n,؛\-•]/;
    const correctItems = correctAns.split(splitPattern).map(s=>normalizeText(s)).filter(Boolean);
    if(correctItems.length > 0){
      let matchedItems = 0;
      correctItems.forEach(ci=>{
        const ratio = tokenOverlapRatio(ci, userAns);
        if(ratio >= 0.6) matchedItems++;
      });
      if(matchedItems === correctItems.length) return perQuestion;
      if(matchedItems > 0) return Math.round(perQuestion * 0.7);
      return Math.round(perQuestion * 0.3);
    }
  }

  const ratio = tokenOverlapRatio(correctAns, userAns);
  if(ratio >= 0.85) return perQuestion;
  if(ratio >= 0.4) return Math.round(perQuestion * 0.7);
  return Math.round(perQuestion * 0.3);
}

// -------------------------- مساعدة HTML safety --------------------------
function escapeHtml(str){
  if(str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

// -------------------------- دوال التاريخ --------------------------
function getTodayKey(){
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// -------------------------- رندرة الواجهة ---------------------------------
document.addEventListener("DOMContentLoaded", ()=>{

  // مراجع عناصر DOM
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDateEl = document.getElementById("todayDate");
  const viewDate = document.getElementById("viewDate");
  const todayBtn = document.getElementById("todayBtn");
  const goDate = document.getElementById("goDate");
  const gradesTabBtn = document.getElementById("addGradeBtn"); // زر إضافة الدرجة (إن وُجد)

  // القائمة الجانبية
  if(menuBtn && sidebar && overlay){
    menuBtn.addEventListener("click", ()=>{
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    });
    overlay.addEventListener("click", ()=>{
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  }

  // تعيين قيمة input التاريخ إلى اليوم الافتراضي
  if(viewDate) viewDate.value = getTodayKey();

  // render dashboard حسب التاريخ المحدد (أو اليوم)
  function renderDashboard(dateIso){
    if(!dateIso) dateIso = getTodayKey();
    renderTodayTasks(dateIso);
    renderExams(dateIso);
  }

  // عرض المهام لليوم المحدد
  function renderTodayTasks(dateIso){
    const todayData = DATA[dateIso];
    if(todayDateEl) todayDateEl.textContent = dateIso ? `(اليوم ${dateIso})` : "";
    if(!todayList) return;
    todayList.innerHTML = "";

    if(!todayData || !Array.isArray(todayData.tasks) || todayData.tasks.length === 0){
      todayList.innerHTML = "<li>لا توجد مهام لهذا اليوم.</li>";
      return;
    }

    // عرض كل مهمة (غير المكتملة أولاً)
    const visibleTasks = todayData.tasks;
    visibleTasks.forEach((task, idx)=>{
      const li = document.createElement("li");
      li.className = "task-item";
      const doneLabel = task.done ? '<span class="muted">✓ مكتملة</span>' : `<button class="btn small" data-day="${dateIso}" data-id="${task.id}" data-idx="${idx}">✅</button>`;
      li.innerHTML = `<div><b>${escapeHtml(task.subject)}</b>: ${escapeHtml(task.content || task.title || '')} <span class="muted">(${escapeHtml(String(task.hours||0))} س)</span> ${doneLabel}</div>`;
      todayList.appendChild(li);
    });

    // تفويض حدث نقر على زر ✅
    todayList.querySelectorAll("button[data-id]").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        const day = btn.getAttribute("data-day");
        const tid = btn.getAttribute("data-id");
        markTaskDone(day, tid);
      });
    });
  }

  // عند الانتهاء من مهمة
  function markTaskDone(dateIso, taskId){
    if(!DATA[dateIso]) return;
    const task = DATA[dateIso].tasks.find(t=>t.id === taskId);
    if(!task) return;
    task.done = true;
    task.completedAt = new Date().toISOString();

    // تحديث الأرشيف داخل DATA (نخزن كمصفوفة في DATA._archive)
    if(!Array.isArray(DATA._archive)) DATA._archive = [];
    DATA._archive.push({
      subject: task.subject,
      content: task.content || task.title || "",
      date: dateIso,
      completedAt: task.completedAt
    });

    saveData();
    renderTodayTasks(dateIso);
    renderArchive(); // لتحديث الجدول إن كان مفتوحاً
  }

  // عرض الامتحانات
  function renderExams(dateIso){
    if(!examsArea) return;
    examsArea.innerHTML = "";
    const todayData = DATA[dateIso];
    if(!todayData || !Array.isArray(todayData.exams) || todayData.exams.length === 0){
      examsArea.innerHTML = "<div>لا توجد امتحانات لهذا اليوم.</div>";
      return;
    }

    todayData.exams.forEach((exam, i)=>{
      const div = document.createElement("div");
      div.className = "card exam-card";
      div.innerHTML = `<b>${escapeHtml(exam.subject || exam.title || '')}</b> — ${escapeHtml(exam.title || '')}
        <div style="margin-top:6px"><button class="btn small start-exam" data-day="${dateIso}" data-eid="${exam.id || i}">بدء الامتحان</button></div>`;
      examsArea.appendChild(div);
    });

    examsArea.querySelectorAll(".start-exam").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const day = btn.getAttribute("data-day");
        const eid = btn.getAttribute("data-eid");
        openExam(day, eid);
      });
    });
  }

  // ------------------- نافذة الامتحان -------------------
  const examModal = document.getElementById("examModal");
  const examTitleShow = document.getElementById("examTitleShow");
  const examQuestions = document.getElementById("examQuestions");
  const submitExamBtn = document.getElementById("submitExamBtn");
  const examResult = document.getElementById("examResult");
  const closeExam = document.getElementById("closeExam");

  let currentExamRef = null; // { day, examIndex, examObj }

  function openExam(day, examId){
    if(!DATA[day]) return;
    const idx = DATA[day].exams.findIndex(e=> (e.id==examId || e.id===examId) || (e.id && String(e.id)===String(examId)) );
    const examObj = idx >=0 ? DATA[day].exams[idx] : null;
    if(!examObj) return;

    currentExamRef = { day, index: idx, exam: examObj };
    examTitleShow.textContent = examObj.title || examObj.subject || "امتحان";
    examQuestions.innerHTML = "";
    examResult.innerHTML = "";

    if(!Array.isArray(examObj.questions) || examObj.questions.length === 0){
      examQuestions.innerHTML = "<div>لا توجد أسئلة في هذا الامتحان.</div>";
    } else {
      examObj.questions.forEach((q,i)=>{
        const qText = escapeHtml(q.text || q.q || "");
        examQuestions.innerHTML += `<div class="card exam-q">
          <div><b>س${i+1}:</b> ${qText}</div>
          <input id="answer-${i}" class="ansInput" placeholder="اكتب إجابتك هنا">
          <div id="correct-${i}" class="muted small" style="display:none;margin-top:6px;">الإجابة النموذجية: ${escapeHtml(q.answer || q.a || "")}</div>
        </div>`;
      });
    }

    examModal.classList.remove("section-hidden");
    examModal.scrollTop = 0;

    // ربط زر التسليم
    if(submitExamBtn){
      submitExamBtn.onclick = ()=> submitExam(day, idx);
    }
  }

  if(closeExam) closeExam.addEventListener("click", ()=> examModal.classList.add("section-hidden"));

  function submitExam(day, examIndex){
    const exam = (DATA[day] && DATA[day].exams && DATA[day].exams[examIndex]) ? DATA[day].exams[examIndex] : null;
    if(!exam) return;

    const totalScore = (exam.type === "cumulative") ? 100 : 30;
    const questions = exam.questions || [];
    const perQ = questions.length > 0 ? totalScore / questions.length : totalScore;
    let scoreObtained = 0;

    questions.forEach((q,i)=>{
      const model = q.answer || q.a || "";
      const userAnsEl = document.getElementById(`answer-${i}`);
      const userAns = userAnsEl ? userAnsEl.value.trim() : "";
      const qScore = smartScoreForAnswer(model, userAns, perQ);
      scoreObtained += qScore;

      // إظهار الإجابة النموذجية
      const correctEl = document.getElementById(`correct-${i}`);
      if(correctEl) correctEl.style.display = "block";
    });

    scoreObtained = Math.round(scoreObtained);

    // حفظ الدرجة داخل DATA.grades
    if(!Array.isArray(DATA.grades)) DATA.grades = [];
    DATA.grades.push({
      date: day,
      subject: exam.subject || exam.title || "عام",
      title: exam.title || "",
      score: scoreObtained,
      total: totalScore,
      recordedAt: new Date().toISOString()
    });

    saveData();
    renderGrades();
    if(examResult) examResult.innerHTML = `<h4>النتيجة: ${scoreObtained} / ${totalScore}</h4>`;
  }

  // ------------------- دراجات و اضافة الدرجة -------------------
  function renderGrades(){
    const container = document.getElementById("gradesContent");
    if(!container) return;
    const grades = DATA.grades || [];
    if(!grades || grades.length === 0){
      container.innerHTML = "لا توجد درجات حالياً.";
      return;
    }
    let html = `<table class="table"><tr><th>التاريخ</th><th>المادة</th><th>الامتحان</th><th>الدرجة</th></tr>`;
    grades.forEach(g=>{
      html += `<tr>
        <td>${escapeHtml(g.date || (g.recordedAt ? g.recordedAt.split("T")[0] : ""))}</td>
        <td>${escapeHtml(g.subject)}</td>
        <td>${escapeHtml(g.title || "")}</td>
        <td>${escapeHtml(String(g.score))} / ${escapeHtml(String(g.total || 100))}</td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  }

  // زر إضافة درجة بسيط (نموذجي) — يستخدم prompt (يمكن تعديل لاحقاً إلى نموذج HTML أجمل)
  if(gradesTabBtn){
    gradesTabBtn.addEventListener("click", ()=>{
      const subj = prompt("اسم المادة (مثال: كيمياء):");
      if(!subj) return;
      const scoreRaw = prompt("الدرجة (رقم):");
      const score = Number(scoreRaw);
      if(isNaN(score)){ alert("الدرجة غير صحيحة"); return; }
      const date = prompt("تاريخ (YYYY-MM-DD) أو اتركه فارغاً ليكون اليوم:");
      const recDate = date && date.trim() ? date.trim() : getTodayKey();

      if(!Array.isArray(DATA.grades)) DATA.grades = [];
      DATA.grades.push({ date: recDate, subject: subj, title: "إدخال يدوي", score, total: 100, recordedAt: new Date().toISOString() });
      saveData();
      alert("تمت إضافة الدرجة");
      renderGrades();
    });
  }

  // ------------------- الأرشيف -------------------
  function renderArchive(){
    const container = document.getElementById("archiveContent");
    if(!container) return;
    // نأخذ المهام المكتملة من DATA._archive (أو من مهام كل يوم التي done==true)
    const archive = Array.isArray(DATA._archive) ? DATA._archive.slice() : [];
    // في حال لم تكن موجودة _archive، نبنيها من المهام المكتملة
    if(archive.length === 0){
      Object.keys(DATA).forEach(d=>{
        if(!Array.isArray(DATA[d].tasks)) return;
        DATA[d].tasks.forEach(t=>{
          if(t.done) archive.push({ subject: t.subject, content: t.content || t.title || "", date: d, completedAt: t.completedAt || "" });
        });
      });
    }

    if(archive.length === 0){
      container.innerHTML = "لا توجد مهام مؤرشفة.";
      return;
    }

    let html = `<table class="table"><tr><th>التاريخ</th><th>المادة</th><th>الوصف</th><th>اكمل في</th></tr>`;
    archive.forEach(a=>{
      html += `<tr>
        <td>${escapeHtml(a.date || "")}</td>
        <td>${escapeHtml(a.subject || "")}</td>
        <td>${escapeHtml(a.content || "")}</td>
        <td>${escapeHtml(a.completedAt ? a.completedAt.split("T")[0] : "")}</td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  }

  // ------------------- التقارير (ساعات لكل مادة) -------------------
  function renderReports(){
    const canvas = document.getElementById("reportChart");
    if(!canvas) return;
    // جمع الساعات لكل مادة من DATA
    const subjectHours = {};
    Object.keys(DATA).forEach(d=>{
      const day = DATA[d];
      if(!day || !Array.isArray(day.tasks)) return;
      day.tasks.forEach(t=>{
        if(!t || !t.subject) return;
        subjectHours[t.subject] = (subjectHours[t.subject] || 0) + (Number(t.hours) || 0);
      });
    });

    const labels = Object.keys(subjectHours);
    const values = labels.map(l => subjectHours[l]);

    // تنظيف كانفاس سابق لو موجود
    if(canvas._chart) canvas._chart.destroy();

    canvas._chart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "ساعات", data: values }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  // ------------------- التنقل بين التابات -------------------
  document.querySelectorAll(".navlink").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
      const tab = document.getElementById(btn.dataset.tab);
      if(tab) tab.classList.remove("section-hidden");

      // تحديث المحتوى عند فتح التاب المناسب
      if(btn.dataset.tab === "grades") renderGrades();
      if(btn.dataset.tab === "archive") renderArchive();
      if(btn.dataset.tab === "reports") renderReports();

      // اغلاق الشريط
      if(sidebar) sidebar.classList.remove("open");
      if(overlay) overlay.classList.remove("show");
    });
  });

  // أزرار التاريخ واتحكم العرض
  if(todayBtn) todayBtn.addEventListener("click", ()=> renderDashboard(getTodayKey()));
  if(goDate){
    goDate.addEventListener("click", ()=>{
      const val = (viewDate && viewDate.value) ? viewDate.value : '';
      if(val) renderDashboard(val);
    });
  }

  // بدء العرض الأولي
  renderDashboard(getTodayKey());
  // نهيئ التقارير والدرجات لو كانت الواجهة تظهر مباشرة
  renderReports();
  renderGrades();
  renderArchive();

  // طباعة تصحيح سريع في الكونسول
  console.log("DATA keys:", Object.keys(DATA).slice(0,10));
}); // end DOMContentLoaded
