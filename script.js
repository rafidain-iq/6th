// ------------------------- إعداد النسخة والتخزين -------------------------
const DATA_VERSION = "2025-10-03-v3"; // غيّرها عند ترقيّة data.js
let DATA = {};

function saveData(){
  try {
    localStorage.setItem("study-data", JSON.stringify(DATA));
    localStorage.setItem("study-data_version", DATA_VERSION);
  } catch(e){
    console.error('saveData failed', e);
  }
}

// ------------------------- تحميل البيانات (data.js ثم fallback localStorage) -------------------------
async function loadData(){
  const storedVersion = localStorage.getItem("study-data_version");
  const storedData = localStorage.getItem("study-data");
  let loaded = false;

  // إذا تغيّرت النسخة - احذف البيانات المخزنة حتى لا تظل قديمة
  if(storedVersion !== DATA_VERSION){
    localStorage.removeItem("study-data");
  }

  // 1) حاول استخدام window.getInitialData (محمّل عبر <script src="data.js">)
  if(typeof window.getInitialData === "function"){
    try {
      DATA = window.getInitialData();
      loaded = true;
      console.log('[loadData] loaded from window.getInitialData()');
    } catch(e){
      console.warn('[loadData] window.getInitialData threw', e);
    }
  }

  // 2) إذا لم تُحمّل دالة getInitialData، حاول fetch ملف data.js مباشرة مع كاش-بستر
  if(!loaded){
    try {
      const url = '/data.js?t=' + Date.now(); // عدّل المسار لو لازم
      const resp = await fetch(url, { cache: 'no-store' });
      if(resp.ok){
        const txt = await resp.text();
        // تنفيذ النص لتعريف window.getInitialData
        (0, eval)(txt);
        if(typeof window.getInitialData === "function"){
          try {
            DATA = window.getInitialData();
            loaded = true;
            console.log('[loadData] fetched + evaled data.js');
          } catch(e){
            console.warn('[loadData] getInitialData after eval threw', e);
          }
        } else {
          console.warn('[loadData] fetched data.js but no window.getInitialData defined');
        }
      } else {
        console.warn('[loadData] fetch /data.js returned', resp.status);
      }
    } catch(e){
      console.warn('[loadData] fetch data.js failed', e);
    }
  }

  // 3) fallback: لو ما قدرنا نجيب data.js استخدم التخزين المحلي إن وُجد
  if(!loaded){
    if(storedData){
      try {
        DATA = JSON.parse(storedData);
        loaded = true;
        console.log('[loadData] loaded from localStorage');
      } catch(e){
        console.warn('[loadData] parsing storedData failed', e);
        DATA = {};
      }
    } else {
      DATA = {};
    }
  }

  // 4) تأكد بنية كل يوم وأضف IDs للمهام والامتحانات إن لم تكن موجودة
  Object.keys(DATA).forEach(date=>{
    const day = DATA[date] || {};
    if(!day.tasks) day.tasks = [];
    if(!day.exams) day.exams = [];

    // تأكد من حقول كل مهمة
    day.tasks.forEach((t, i)=>{
      if(!t.id) t.id = `t-${date}-${i}`;
      if(t.done === undefined) t.done = false;
      if(!t.createdAt) t.createdAt = new Date().toISOString();
    });

    // تأكد من حقول الامتحانات والأسئلة
    day.exams.forEach((e, i)=>{
      if(!e.id) e.id = `e-${date}-${i}`;
      if(!Array.isArray(e.questions)) e.questions = [];
      e.questions.forEach((q, qi)=>{ if(!q.id) q.id = `${e.id}-q${qi}`; });
    });

    DATA[date] = day;
  });

  // 5) احفظ النسخة المُحملة في localStorage
  saveData();
  console.log('[loadData] finished. keys count:', Object.keys(DATA).length);
}

// ------------------------- أدوات ذكية للتصحيح -------------------------
function normalizeText(s){
  if(!s) return "";
  const diacritics = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g;
  s = s.replace(diacritics, "");
  s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"”“،؛«»…]/g," ");
  s = s.replace(/\s+/g," ").trim().toLowerCase();
  return s;
}
function tokens(s){ const n = normalizeText(s); if(!n) return []; return n.split(/\s+/).filter(Boolean); }
function tokenOverlapRatio(correctAns, userAns){
  const c = tokens(correctAns), u = tokens(userAns);
  if(c.length === 0) return 0;
  const setU = new Set(u); let matched = 0;
  c.forEach(w => { if(setU.has(w)) matched++; });
  return matched / c.length;
}
function isListLike(s){ if(!s) return false; return /[,؛\n\-•]/.test(s); }
function smartScoreForAnswer(correctAns, userAns, perQuestion){
  if(!userAns || userAns.trim().length === 0) return 0;
  const uNorm = normalizeText(userAns);
  const cNorm = normalizeText(correctAns);
  if(uNorm === cNorm) return perQuestion;
  if(isListLike(correctAns) || isListLike(userAns)){
    const splitPattern = /[\n,؛\-•]/;
    const correctItems = correctAns.split(splitPattern).map(s=>normalizeText(s)).filter(Boolean);
    let matchedItems = 0;
    correctItems.forEach(ci=>{
      const ratio = tokenOverlapRatio(ci, userAns);
      if(ratio >= 0.6) matchedItems++;
    });
    if(matchedItems === correctItems.length) return perQuestion;
    if(matchedItems > 0) return Math.round(perQuestion * 0.7);
    return Math.round(perQuestion * 0.3);
  }
  const ratio = tokenOverlapRatio(correctAns, userAns);
  if(ratio >= 0.85) return perQuestion;
  if(ratio >= 0.4) return Math.round(perQuestion * 0.7);
  return Math.round(perQuestion * 0.3);
}

// ------------------------- مساعدة HTML safety -------------------------
function escapeHtml(str){
  if(str === undefined || str === null) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

// ------------------------- الداشبورد -------------------------
function getTodayISO(){ return new Date().toISOString().split("T")[0]; }

function renderDashboard(dateIso){
  // ضمان أن المفتاح بصيغة صحيحة
  if(!dateIso) dateIso = getTodayISO();
  // إذا لم يوجد مفتاح اليوم في DATA، لا نريد تلقائياً أن نحذف أو نغيّر data.js،
  // لكن نعرض رسالة ونترك الإمكانية للمستخدم للإضافة.
  if(!DATA[dateIso]) {
    const todayList = document.getElementById("todayList");
    const examsArea = document.getElementById("examsArea");
    const todayDate = document.getElementById("todayDate");
    if(!todayList || !examsArea || !todayDate) return;
    todayDate.textContent = dateIso;
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    return;
  }

  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");
  if(!todayList || !examsArea || !todayDate) return;

  todayDate.textContent = dateIso;

  // عرض المهام (غير المكتملة أولاً)
  const tasksHtml = (day.tasks || []).map(t => `
    <li>
      <div>
        <b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} 
        <span class="muted">(${escapeHtml(String(t.hours))} ساعة)</span>
      </div>
      ${t.done ? '' : `<button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>`}
    </li>
  `).join("");
  todayList.innerHTML = tasksHtml || `<li>لا توجد مهام لهذا اليوم</li>`;

  // عرض الامتحانات
  const examsHtml = (day.exams || []).map(ex => `
    <div class="card exam-question">
      <b>${escapeHtml(ex.subject)}</b> — ${escapeHtml(ex.title)}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>
  `).join("");
  examsArea.innerHTML = examsHtml || `<div>لا توجد امتحانات لهذا اليوم</div>`;
}

// ------------------------- وضع علامة إنجاز -------------------------
function markTaskDone(dateIso, taskId){
  if(!DATA[dateIso]) return;
  const task = (DATA[dateIso].tasks || []).find(t=>t.id === taskId);
  if(task){
    task.done = true;
    task.completedAt = new Date().toISOString();
    saveData();
    renderDashboard(dateIso);
  }
}

// ------------------------- امتحانات (فتح/إغلاق/عرض/تسليم) -------------------------
function openExam(dateIso, examId){
  if(!DATA[dateIso]) return;
  const exam = (DATA[dateIso].exams || []).find(e=>e.id === examId);
  if(!exam) return;
  document.getElementById("examTitleShow").textContent = exam.title;
  const qHtml = (exam.questions || []).map((q,i)=>`
    <div class="exam-question">
      <div><b>س${i+1}:</b> ${escapeHtml(q.text)}</div>
      <input type="text" id="answer-${i}" autocomplete="off">
      <div class="muted small" id="correct-${i}" style="display:none;">الإجابة النموذجية: ${escapeHtml(q.answer || '')}</div>
    </div>
  `).join("");
  document.getElementById("examQuestions").innerHTML = qHtml;
  document.getElementById("examResult").textContent = "";
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=>submitExam(dateIso, examId);
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
  (exam.questions||[]).forEach((q,i)=>{
    const userInputEl = document.getElementById("answer-"+i);
    const correctEl = document.getElementById("correct-"+i);
    const userAns = userInputEl ? userInputEl.value.trim() : "";
    const qScore = smartScoreForAnswer(q.answer || "", userAns, perQ);
    scoreObtained += qScore;
    if(correctEl) correctEl.style.display = "block";
  });
  scoreObtained = Math.round(scoreObtained);
  if(!DATA.grades) DATA.grades = [];
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
  document.getElementById("examResult").textContent = `النتيجة: ${scoreObtained} / ${totalScore}`;
}

// ------------------------- تقارير (Chart.js) -------------------------
function renderReports(){
  const canvas = document.getElementById("reportChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const subjectHours = {};
  Object.values(DATA).forEach(day=>{
    (day.tasks||[]).forEach(t=>{
      if(!subjectHours[t.subject]) subjectHours[t.subject] = 0;
      subjectHours[t.subject] += Number(t.hours) || 0;
    });
  });
  if(canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels: Object.keys(subjectHours),
      datasets:[{ label:'عدد الساعات', data: Object.values(subjectHours), backgroundColor: generateColors(Object.keys(subjectHours).length) }]
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
    (day.tasks||[]).forEach(t=>{
      if(t.done){
        if(!subjectCompleted[t.subject]) subjectCompleted[t.subject] = 0;
        subjectCompleted[t.subject] += Number(t.hours) || 0;
      }
    });
  });
  if(canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(ctx,{
    type:'doughnut',
    data:{ labels:Object.keys(subjectCompleted), datasets:[{ data:Object.values(subjectCompleted), backgroundColor: generateColors(Object.keys(subjectCompleted).length) }]},
    options:{responsive:true,plugins:{legend:{position:'right'}}}
  });
}

// ------------------------- الأرشيف والدرجات -------------------------
function renderArchive(){
  const archiveEl = document.getElementById("archiveContent");
  if(!archiveEl) return;
  let html = '';
  Object.keys(DATA).sort().forEach(date=>{
    const day = DATA[date];
    const doneTasks = (day.tasks||[]).filter(t=>t.done);
    if(doneTasks.length>0){
      html += `<h4>${date}</h4><ul>`;
      doneTasks.forEach(t=> html += `<li><b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} (${escapeHtml(String(t.hours))} س)</li>`);
      html += `</ul>`;
    }
  });
  archiveEl.innerHTML = html || 'لا توجد مهام مكتملة حتى الآن';
}

function renderGrades(){
  const gradesEl = document.getElementById("gradesContent");
  if(!gradesEl) return;
  if(!DATA.grades || DATA.grades.length===0){
    gradesEl.innerHTML = 'لا توجد بيانات درجات حالياً.';
    return;
  }
  gradesEl.innerHTML = `<table border="1" cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse;">
    <tr style="background:#f2f2f2"><th>التاريخ</th><th>المادة</th><th>الامتحان</th><th>الدرجة</th></tr>
    ${DATA.grades.map(g=>`<tr>
      <td>${escapeHtml(g.date)}</td>
      <td>${escapeHtml(g.subject)}</td>
      <td>${escapeHtml(g.title)}</td>
      <td>${escapeHtml(String(g.score))} / ${escapeHtml(String(g.total || 100))}</td>
    </tr>`).join('')}
  </table>`;
}

// ------------------------- مولد ألوان -------------------------
function generateColors(n){
  const palette = ['#2f3e46','#1f78b4','#ffd54f','#8fddc7','#ff8a65','#9fa8da','#c5e1a5','#ffcc80'];
  const res = [];
  for(let i=0;i<n;i++) res.push(palette[i % palette.length]);
  return res;
}

// ------------------------- إضافة واجب -------------------------
document.getElementById("saveTask")?.addEventListener("click", ()=>{
  const subj = document.getElementById("new_subject").value.trim();
  const cont = document.getElementById("new_content").value.trim();
  const hrs = parseFloat(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
  if(subj && cont && !isNaN(hrs) && date){
    if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
    const id = "t-"+date+"-"+Math.random().toString(36).slice(2,8);
    DATA[date].tasks.push({ id, subject:subj, content:cont, hours:hrs, done:false, createdAt:new Date().toISOString() });
    saveData();
    const viewEl = document.getElementById("viewDate");
    if(viewEl) viewEl.value = date;
    localStorage.setItem('study-last-view', date);
    renderDashboard(date);
    // تنظيف الحقول
    document.getElementById("new_subject").value = "";
    document.getElementById("new_content").value = "";
    document.getElementById("new_hours").value = 1;
    alert("تمت الإضافة بنجاح ✅");
  } else {
    alert("يرجى تعبئة جميع الحقول بشكل صحيح.");
  }
});

// ------------------------- تصدير + إعادة ضبط -------------------------
document.getElementById("exportBtn")?.addEventListener("click", ()=>{
  const content = "window.getInitialData = ()=>(" + JSON.stringify(DATA,null,2) + ");\n";
  const blob = new Blob([ content ], {type:"application/javascript"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("resetBtn")?.addEventListener("click", ()=>{
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data");
    localStorage.removeItem("study-data_version");
    localStorage.removeItem("study-last-view");
    location.reload();
  }
});

// ------------------------- إعداد DOM بعد التحميل -------------------------
document.addEventListener("DOMContentLoaded", async ()=>{
  await loadData();

  // ضع قيمة viewDate إلى آخر مشاهدة أو اليوم
  const lastView = localStorage.getItem('study-last-view') || getTodayISO();
  const viewEl = document.getElementById("viewDate");
  if(viewEl) viewEl.value = lastView;

  // عرض الداشبورد لأول مرة
  renderDashboard(lastView);

  // القائمة الجانبية + أزرار التنقل
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

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

  document.querySelectorAll(".navlink").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
      const tab = document.getElementById(btn.dataset.tab);
      if(tab) tab.classList.remove("section-hidden");
      sidebar.classList.remove("open");
      overlay.classList.remove("show");

      if(btn.dataset.tab === "grades") renderGrades();
      if(btn.dataset.tab === "reports") renderReports();
      if(btn.dataset.tab === "stats") renderStats();
      if(btn.dataset.tab === "archive") renderArchive();
    });
  });

  // أزرار التاريخ
  document.getElementById("todayBtn")?.addEventListener("click", ()=> {
    const today = getTodayISO();
    if(viewEl) viewEl.value = today;
    renderDashboard(today);
  });
  document.getElementById("goDate")?.addEventListener("click", ()=>{
    const val = document.getElementById("viewDate").value;
    if(val){
      localStorage.setItem('study-last-view', val);
      renderDashboard(val);
    }
  });

});
