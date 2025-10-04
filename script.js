// script.js - الإصدار النهائي المدمج (حفظ في localStorage، تصحيح ذكي، إضافة درجات)
// تاريخ الإصدار: 2025-10-03-v4

// ------------------------- إعداد النسخة + DATA -------------------------
const DATA_VERSION = "2025-10-03-v4";
let DATA = {}; // سيُملأ من data.js أو localStorage

function saveData(){
  try {
    localStorage.setItem("study-data", JSON.stringify(DATA));
    localStorage.setItem("study-data_version", DATA_VERSION);
    // حفظ آخر عرض (اختياري)
    const viewEl = document.getElementById("viewDate");
    if(viewEl && viewEl.value) localStorage.setItem("study-last-view", viewEl.value);
  } catch(e){
    console.error("saveData error:", e);
  }
}

// ------------------------- تحميل البيانات -------------------------
function loadData(){
  const storedVersion = localStorage.getItem("study-data_version");
  const storedData = localStorage.getItem("study-data");

  // لو تغيّرت النسخة نفض الكاش المحلي (اختياري)
  if(storedVersion && storedVersion !== DATA_VERSION){
    localStorage.removeItem("study-data");
    localStorage.removeItem("study-data_version");
  }

  // أفضل مصدر: data.js (window.getInitialData)
  let loadedFrom = null;
  if(typeof window.getInitialData === "function"){
    try {
      DATA = window.getInitialData();
      loadedFrom = "data.js";
      // console.log("Loaded data from data.js");
    } catch(e){
      console.warn("window.getInitialData() failed", e);
    }
  }

  // إذا لم يُحمّل من data.js، حاول من localStorage
  if(!loadedFrom && storedData){
    try {
      DATA = JSON.parse(storedData);
      loadedFrom = "localStorage";
      // console.log("Loaded data from localStorage");
    } catch(e){
      console.warn("parse storedData failed", e);
      DATA = {};
    }
  }

  if(!loadedFrom){
    DATA = {};
    // console.warn("No data source found, DATA = {}");
  }

  // ضمان بنية كل يوم: tasks, exams
  Object.keys(DATA).forEach(date=>{
    if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
    if(!Array.isArray(DATA[date].tasks)) DATA[date].tasks = [];
    if(!Array.isArray(DATA[date].exams)) DATA[date].exams = [];

    // إضافة id و done لكل مهمة إن لم تكن موجودة
    DATA[date].tasks.forEach((t,i)=>{
      if(!t.id) t.id = `t-${date}-${i}`;
      if(t.done === undefined) t.done = false;
      if(!t.createdAt) t.createdAt = new Date().toISOString();
    });

    // إضافة id لكل امتحان وسؤال
    DATA[date].exams.forEach((e,i)=>{
      if(!e.id) e.id = `e-${date}-${i}`;
      if(!Array.isArray(e.questions)) e.questions = [];
      e.questions.forEach((q,qi)=>{ if(!q.id) q.id = `${e.id}-q${qi}`; });
    });
  });

  // تأكد وجود مكان الدرجات وgrades كمصفوفة عامة
  if(!Array.isArray(DATA.grades)) DATA.grades = DATA.grades || [];

  // حفظ مُنقّح
  saveData();
}

// ------------------------- مساعدات (تاريخ/HTML) -------------------------
function getTodayISO(){
  // استخدام toLocaleDateString('en-CA') ليتوافق مع yyyy-mm-dd حسب التوقيت المحلي
  try {
    return new Date().toLocaleDateString('en-CA');
  } catch(e){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}

function escapeHtml(str){
  if(str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

// ------------------------- دالة التصحيح الذكي (استبدال القديمة) -------------------------
function smartScoreForAnswer(correctAns, userAns, perQuestion){
  if(!userAns || userAns.trim().length === 0) return 0;

  const normalizeText = (s) => {
    if(!s) return "";
    const diacritics = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g;
    s = s.replace(diacritics,"");
    s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"”“،؛«»…]/g," ");
    s = s.replace(/\s+/g," ").trim().toLowerCase();
    return s;
  };

  const normUser = normalizeText(userAns);
  const normCorrect = normalizeText(correctAns);

  if(normUser === normCorrect) return perQuestion;

  const tokens = (s) => {
    const n = normalizeText(s);
    if(!n) return [];
    return n.split(/\s+/).filter(Boolean);
  };

  const tokenOverlapRatio = (a,b) => {
    const A = tokens(a);
    const B = tokens(b);
    if(A.length === 0) return 0;
    const setB = new Set(B);
    let matched = 0;
    A.forEach(w => { if(setB.has(w)) matched++; });
    return matched / A.length;
  };

  const isListLike = s => s && /[\n,؛\-•]/.test(s);

  // levenshtein
  function levenshtein(a,b){
    if(a === b) return 0;
    const la = a.length, lb = b.length;
    if(la === 0) return lb;
    if(lb === 0) return la;
    const dp = Array.from({length: la+1}, ()=> new Array(lb+1));
    for(let i=0;i<=la;i++) dp[i][0]=i;
    for(let j=0;j<=lb;j++) dp[0][j]=j;
    for(let i=1;i<=la;i++){
      for(let j=1;j<=lb;j++){
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
      }
    }
    return dp[la][lb];
  }

  // كلمات مفتاحية (عربية بسيطة)
  const arabicStopwords = new Set(["في","من","على","إلى","عن","هو","هي","ما","لم","لا","كيف","أن","كان","كانت","التي","الذي","و","لكن","لـ","بـ","أي","هذا","هذه","ذلك","تلك","قد"]);
  function extractKeywords(s){
    return tokens(s).filter(w => !arabicStopwords.has(w));
  }

  // 1) معالجة القوائم (عناصر منفصلة)
  if(isListLike(correctAns) || isListLike(userAns)){
    const splitPattern = /[\n,؛\-•]/;
    const correctItems = correctAns.split(splitPattern).map(s=>normalizeText(s)).map(s=>s.trim()).filter(Boolean);
    const userItems = userAns.split(splitPattern).map(s=>normalizeText(s)).map(s=>s.trim()).filter(Boolean);
    if(correctItems.length>0){
      let matchedItems = 0;
      correctItems.forEach(ci=>{
        const found = userItems.some(ui=>{
          const r = tokenOverlapRatio(ci, ui);
          if(r >= 0.6) return true;
          const ed = levenshtein(ci, ui);
          if(Math.max(ci.length, ui.length) > 0 && ed / Math.max(ci.length, ui.length) <= 0.12) return true;
          return false;
        });
        if(found) matchedItems++;
      });
      if(matchedItems === correctItems.length) return perQuestion;
      if(matchedItems >= Math.ceil(correctItems.length * 0.6)) return Math.round(perQuestion * 0.85);
      if(matchedItems > 0) return Math.round(perQuestion * 0.6);
      return Math.round(perQuestion * 0.3);
    }
  }

  // 2) نسبة تطابق كلمات عامة
  const overlap = tokenOverlapRatio(normCorrect, normUser);
  if(overlap >= 0.85) return perQuestion;

  // 3) اختلاف حرفي/كلمتين -> قبول (Levenshtein)
  const ed = levenshtein(normCorrect, normUser);
  const maxLen = Math.max(normCorrect.length, normUser.length, 1);
  if(ed <= 2 || (ed / maxLen) <= 0.08) return perQuestion;

  // 4) كلمات مفتاحية
  const correctKeywords = extractKeywords(normCorrect);
  if(correctKeywords.length > 0){
    const userSet = new Set(tokens(normUser));
    const missing = correctKeywords.filter(k => !userSet.has(k));
    if(missing.length === 0) return perQuestion;
    if(missing.length <= Math.floor(correctKeywords.length * 0.25)) return Math.round(perQuestion * 0.95);
  }

  // 5) درجات مرنة بحسب overlap
  if(overlap >= 0.65) return Math.round(perQuestion * 0.9);
  if(overlap >= 0.45) return Math.round(perQuestion * 0.7);

  // 6) محاولة بسيطة
  return Math.round(perQuestion * 0.35);
}

// ------------------------- واجهة (عرض Dashboard) -------------------------
function renderDashboard(dateIso){
  if(!dateIso) dateIso = getTodayISO();
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");
  if(!todayList || !examsArea || !todayDate) return;

  const day = DATA[dateIso];
  todayDate.textContent = dateIso;

  if(!day || ((!day.tasks || day.tasks.length===0) && (!day.exams || day.exams.length===0))){
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    return;
  }

  // عرض المهام (عرض الحالة المكتملة)
  const tasksHtml = (day.tasks || []).map(t=>{
    return `<li>
      <div>
        <b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} 
        <span class="muted">(${escapeHtml(String(t.hours||0))} ساعة)</span>
      </div>
      ${t.done ? `<span class="muted small">مكتملة</span>` : `<button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>`}
    </li>`;
  }).join("");
  todayList.innerHTML = tasksHtml || `<li>لا توجد مهام لهذا اليوم</li>`;

  // عرض الامتحانات
  const examsHtml = (day.exams || []).map(ex=>{
    return `<div class="card exam-question">
      <b>${escapeHtml(ex.subject)}</b> — ${escapeHtml(ex.title)}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>`;
  }).join("");
  examsArea.innerHTML = examsHtml || `<div>لا توجد امتحانات لهذا اليوم</div>`;
}

// ------------------------- تفعيل حالة المهمة + حفظ -------------------------
function markTaskDone(dateIso, taskId){
  if(!DATA[dateIso]) return;
  const task = (DATA[dateIso].tasks || []).find(t=>t.id === taskId);
  if(!task) return;
  task.done = true;
  task.completedAt = new Date().toISOString();
  saveData();
  renderDashboard(dateIso);
}

// ------------------------- فتح الامتحان + تصحيح وتسليم -------------------------
function openExam(dateIso, examId){
  if(!DATA[dateIso]) return;
  const exam = (DATA[dateIso].exams || []).find(e=>e.id === examId);
  if(!exam) return;

  document.getElementById("examTitleShow").textContent = exam.title || "";
  const qHtml = (exam.questions || []).map((q,i)=>`
    <div class="exam-question">
      <div><b>س${i+1}:</b> ${escapeHtml(q.text)}</div>
      <input type="text" id="answer-${i}" autocomplete="off">
      <div class="muted small" id="correct-${i}" style="display:none;">الإجابة النموذجية: ${escapeHtml(q.answer || "")}</div>
    </div>
  `).join("");
  const examQuestionsEl = document.getElementById("examQuestions");
  if(examQuestionsEl) examQuestionsEl.innerHTML = qHtml;
  document.getElementById("examResult").textContent = "";
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=> submitExam(dateIso, examId);
}
document.getElementById("closeExam")?.addEventListener("click", ()=>{
  document.getElementById("examModal")?.classList.add("section-hidden");
});

function submitExam(dateIso, examId){
  if(!DATA[dateIso]) return;
  const exam = (DATA[dateIso].exams || []).find(e=>e.id === examId);
  if(!exam) return;

  let totalScore = 30;
  if(exam.type === 'cumulative') totalScore = 100;
  const numQ = Math.max(1, (exam.questions||[]).length);
  const perQ = totalScore / numQ;
  let scoreObtained = 0;

  (exam.questions || []).forEach((q,i)=>{
    const userInputEl = document.getElementById("answer-"+i);
    const correctEl = document.getElementById("correct-"+i);
    const userAns = userInputEl ? (userInputEl.value || "") : "";
    const qScore = smartScoreForAnswer(q.answer || "", userAns, perQ);
    scoreObtained += qScore;
    if(correctEl) correctEl.style.display = "block";
  });

  scoreObtained = Math.round(scoreObtained);

  if(!Array.isArray(DATA.grades)) DATA.grades = [];
  DATA.grades.push({
    date: dateIso,
    subject: exam.subject,
    title: exam.title,
    score: scoreObtained,
    total: totalScore,
    recordedAt: new Date().toISOString()
  });

  saveData();
  renderGrades();
  const examResultEl = document.getElementById("examResult");
  if(examResultEl) examResultEl.textContent = `النتيجة: ${scoreObtained} / ${totalScore}`;
}

// ------------------------- تصدير + إعادة ضبط -------------------------
function exportDataAsFile(){
  try {
    const blob = new Blob([ "window.getInitialData = ()=>(" + JSON.stringify(DATA,null,2) + ")" ], {type:"application/javascript"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(url);
  } catch(e){
    console.error("exportDataAsFile error", e);
  }
}

function resetApp(){
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data");
    localStorage.removeItem("study-data_version");
    location.reload();
  }
}

// ------------------------- التقارير + الإحصائيات + أرشيف + درجات -------------------------
function generateColors(n){
  const palette = ['#2f3e46','#1f78b4','#ffd54f','#8fddc7','#ff8a65','#9fa8da','#c5e1a5','#ffcc80'];
  const res = [];
  for(let i=0;i<n;i++) res.push(palette[i % palette.length]);
  return res;
}

function renderReports(){
  const canvas = document.getElementById("reportChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const subjectHours = {};
  Object.values(DATA).forEach(day=>{
    if(day.tasks) day.tasks.forEach(t=>{
      if(!subjectHours[t.subject]) subjectHours[t.subject] = 0;
      subjectHours[t.subject] += Number(t.hours) || 0;
    });
  });
  if(canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels: Object.keys(subjectHours),
      datasets:[{
        label:'عدد الساعات',
        data: Object.values(subjectHours),
        backgroundColor: generateColors(Object.keys(subjectHours).length)
      }]
    },
    options:{responsive:true,plugins:{legend:{display:false}}}
  });
}

function renderStats(){
  const canvas = document.getElementById("statsChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const subjectCompleted = {};
  Object.values(DATA).forEach(day=>{
    if(day.tasks) day.tasks.forEach(t=>{
      if(t.done){
        if(!subjectCompleted[t.subject]) subjectCompleted[t.subject]=0;
        subjectCompleted[t.subject]+= Number(t.hours) || 0;
      }
    });
  });
  if(canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:Object.keys(subjectCompleted),
      datasets:[{
        data:Object.values(subjectCompleted),
        backgroundColor: generateColors(Object.keys(subjectCompleted).length)
      }]
    },
    options:{responsive:true,plugins:{legend:{position:'right'}}}
  });
}

function renderArchive(){
  const archiveEl = document.getElementById("archiveContent");
  if(!archiveEl) return;
  let html = '';
  Object.keys(DATA).sort().forEach(date=>{
    const day = DATA[date];
    if(day && day.tasks){
      const doneTasks = day.tasks.filter(t=>t.done);
      if(doneTasks.length>0){
        html += `<h4>${date}</h4><ul>`;
        doneTasks.forEach(t=>{
          html += `<li><b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} (${t.hours} س)</li>`;
        });
        html += `</ul>`;
      }
    }
  });
  archiveEl.innerHTML = html || 'لا توجد مهام مكتملة حتى الآن';
}

function renderGrades(){
  const gradesEl = document.getElementById("gradesContent");
  if(!gradesEl) return;
  if(!Array.isArray(DATA.grades) || DATA.grades.length===0){
    gradesEl.innerHTML = 'لا توجد بيانات درجات حالياً.';
    return;
  }
  gradesEl.innerHTML = `<table border="1" cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse;">
    <tr style="background:#f2f2f2"><th>التاريخ</th><th>المادة</th><th>الامتحان/المصدر</th><th>الدرجة</th></tr>
    ${DATA.grades.map(g=>`<tr>
      <td>${escapeHtml(g.date || g.recordedAt.split("T")[0])}</td>
      <td>${escapeHtml(g.subject || g.title || "")}</td>
      <td>${escapeHtml(g.title || "")}</td>
      <td>${escapeHtml(String(g.score || ""))} / ${escapeHtml(String(g.total || 100))}</td>
    </tr>`).join('')}
  </table>`;
}

// ------------------------- إضافة واجب (كما في النسخة الأصلية) -------------------------
function addTaskFromUI(){
  const subj = document.getElementById("new_subject")?.value.trim();
  const cont = document.getElementById("new_content")?.value.trim();
  const hrs = parseFloat(document.getElementById("new_hours")?.value);
  const date = document.getElementById("new_date")?.value;
  if(subj && cont && !isNaN(hrs) && date){
    if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({id, subject:subj, content:cont, hours:hrs, done:false, createdAt:getTodayISO()});
    saveData();
    alert("تمت الإضافة بنجاح ✅");
    renderDashboard(date);
  } else {
    alert("يرجى تعبئة جميع الحقول بشكل صحيح.");
  }
}

// ------------------------- إضافة درجة (نموذج مثل إضافة واجب) -------------------------
function openAddGradeModal(){
  // إذا المودال موجود بالفعل نعيد عرضه
  if(document.getElementById("gradeModal")){
    document.getElementById("gradeModal").classList.remove("section-hidden");
    return;
  }

  // بناء مودال بسيط
  const modal = document.createElement("div");
  modal.id = "gradeModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-inner card exam-card">
      <div style="text-align:left"><button id="closeGradeModal" class="btn ghost">إغلاق</button></div>
      <h3>إضافة درجة جديدة</h3>
      <div class="form-row"><label>المادة</label><input id="grade_subject" placeholder="مثال: كيمياء"></div>
      <div class="form-row"><label>الدرجة</label><input id="grade_value" type="number" min="0" max="100" step="1" placeholder="مثال: 25"></div>
      <div class="form-row"><label>التاريخ</label><input id="grade_date" type="date" value="${getTodayISO()}"></div>
      <div style="margin-top:8px"><button id="saveGradeBtn" class="btn">حفظ الدرجة</button></div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("closeGradeModal").addEventListener("click", ()=>{
    document.getElementById("gradeModal").classList.add("section-hidden");
  });

  document.getElementById("saveGradeBtn").addEventListener("click", ()=>{
    const subj = document.getElementById("grade_subject").value.trim();
    const val = parseFloat(document.getElementById("grade_value").value);
    const date = document.getElementById("grade_date").value;
    if(subj && !isNaN(val) && date){
      if(!Array.isArray(DATA.grades)) DATA.grades = [];
      DATA.grades.push({ date, subject: subj, title: `يدوي - ${subj}`, score: val, total: 100, recordedAt: new Date().toISOString() });
      saveData();
      renderGrades();
      alert("تمت إضافة الدرجة ✅");
      document.getElementById("gradeModal").classList.add("section-hidden");
    } else {
      alert("يرجى تعبئة الحقول (المادة، الدرجة، التاريخ).");
    }
  });
}

// ------------------------- ربط أزرار الواجهة + التنقل الجانبي -------------------------
document.addEventListener("DOMContentLoaded", async ()=>{
  loadData();

  // زر القائمة الجانبية
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if(menuBtn && sidebar && overlay){
    menuBtn.addEventListener("click", ()=>{ sidebar.classList.toggle("open"); overlay.classList.toggle("show"); });
    overlay.addEventListener("click", ()=>{ sidebar.classList.remove("open"); overlay.classList.remove("show"); });
  }

  // إضافة زر "إضافة درجة" إلى الشريط إن لم يكن موجود
  const sidebarInner = document.querySelector("#sidebar .sidebar-inner");
  if(sidebarInner && !document.getElementById("addGradeBtn")){
    const btn = document.createElement("button");
    btn.id = "addGradeBtn";
    btn.className = "btn";
    btn.textContent = "➕ إضافة درجة";
    btn.style.marginTop = "8px";
    btn.addEventListener("click", ()=>{
      // افتح نافذة إضافة الدرجة
      openAddGradeModal();
    });
    sidebarInner.appendChild(btn);
  }

  // ربط أزرار التصدير وإعادة الضبط إن وُجدت
  const exportBtn = document.getElementById("exportBtn");
  if(exportBtn) exportBtn.addEventListener("click", exportDataAsFile);
  const resetBtn = document.getElementById("resetBtn");
  if(resetBtn) resetBtn.addEventListener("click", resetApp);

  // ربط زر إضافة واجب إن وُجد
  const saveTaskBtn = document.getElementById("saveTask");
  if(saveTaskBtn) saveTaskBtn.addEventListener("click", addTaskFromUI);

  // ربط أزرار التاريخ
  const todayBtn = document.getElementById("todayBtn");
  if(todayBtn) todayBtn.addEventListener("click", ()=> renderDashboard(getTodayISO()));
  const goDateBtn = document.getElementById("goDate");
  if(goDateBtn){
    goDateBtn.addEventListener("click", ()=>{
      const val = document.getElementById("viewDate").value;
      if(val) renderDashboard(val);
    });
  }

  // ربط التنقل داخل القائمة (navlink)
  document.querySelectorAll(".navlink").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
      const tab = document.getElementById(btn.dataset.tab);
      if(tab) tab.classList.remove("section-hidden");
      if(sidebar) { sidebar.classList.remove("open"); overlay.classList.remove("show"); }
      if(btn.dataset.tab === "grades") renderGrades();
      if(btn.dataset.tab === "reports") renderReports();
      if(btn.dataset.tab === "stats") renderStats();
      if(btn.dataset.tab === "archive") renderArchive();
    });
  });

  // زر إغلاق الامتحان مرتبط سابقاً في HTML، التأكد من وجوده
  // render dashboard لليوم الحالي أو آخر عرض محفوظ
  const lastView = localStorage.getItem("study-last-view");
  if(lastView) renderDashboard(lastView);
  else renderDashboard(getTodayISO());
});

// ------------------------- تنظيف قبل الإنهاء -------------------------
// هذه الدالة قد تُستدعى من أماكن أخرى إن رغبت
function initAllUI(){
  renderDashboard(getTodayISO());
  renderGrades();
  renderReports();
  renderStats();
  renderArchive();
}

// تنفيذ once (يمكنك استدعاؤها يدوياً في console أيضا)
window.appInit = initAllUI;
