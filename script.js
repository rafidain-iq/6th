// ------------------------- إعداد تحميل البيانات مع نسخة -------------------------
const DATA_VERSION = "2025-10-03-v1"; // تأكد تغيّر التاريخ عند التحديث
let DATA = {};

function saveData(){
  localStorage.setItem("study-data", JSON.stringify(DATA));
}

// تحميل البيانات من data.js مباشرة مع تحديث الكاش
(function loadData(){
  // مسح النسخة المخزنة لو الإصدار تغير
  const storedVersion = localStorage.getItem("study-data_version");
  const storedData = localStorage.getItem("study-data");

  // ✅ إذا النسخة اختلفت أو ماكو بيانات
  if(storedVersion !== DATA_VERSION || !storedData){
    if(typeof window.getInitialData === "function"){
      DATA = window.getInitialData();
      localStorage.setItem("study-data_version", DATA_VERSION);
      saveData();
    } else {
      DATA = {};
    }
  } else {
    // ✅ إذا النسخة نفسها، لكن نريد نتأكد نقرأ من data.js دائمًا
    if(typeof window.getInitialData === "function"){
      // نقرأ من data.js (أكتوبر الجديد)
      DATA = window.getInitialData();
      localStorage.setItem("study-data_version", DATA_VERSION);
      saveData();
    } else {
      try {
        DATA = JSON.parse(storedData);
      } catch(e){
        DATA = {};
      }
    }
  }

  // ضمان وجود هيكل صحيح لكل يوم
  Object.keys(DATA).forEach(date=>{
    if(!Array.isArray(DATA[date].tasks)) DATA[date].tasks = [];
    if(!Array.isArray(DATA[date].exams)) DATA[date].exams = [];
  });
})();

// ------------------------- أدوات مساعدة للتصحيح "الذكي" -------------------------
function normalizeText(s){
  if(!s) return "";
  // إزالة تشكيل عربي بسيط، إزالة علامات ترقيم، تحويل لحروف صغيرة، إزالة مسافات متعددة
  // إزالة حركات: ة/ـ/، لكن لا نحذف همزة/حروف أساسية
  const diacritics = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g;
  s = s.replace(diacritics, "");
  s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"”“،؛«»…]/g," ");
  s = s.replace(/\s+/g," ").trim().toLowerCase();
  return s;
}

// تحويل إجابة إلى مجموعة كلمات مفاتيح (set)
function tokens(s){
  const n = normalizeText(s);
  if(!n) return [];
  return n.split(/\s+/).filter(Boolean);
}

// حساب نسبة تطابق كلمات (بدون ترتيب)
function tokenOverlapRatio(correctAns, userAns){
  const c = tokens(correctAns);
  const u = tokens(userAns);
  if(c.length === 0) return 0;
  const setU = new Set(u);
  let matched = 0;
  c.forEach(w => { if(setU.has(w)) matched++; });
  return matched / c.length;
}

// اكتشاف إذا كانت الإجابة قائمة/تعداد — نقارن مجموع العناصر (بناءً على فصل بسطر أو فاصلة)
function isListLike(s){
  if(!s) return false;
  return /[,؛\n\-•]/.test(s);
}

// إذا كانت الإجابة صحيحة أفكارياً حتى لو مرتبة بصورة مختلفة: 
// نستخدم tokenOverlapRatio ونتحمل اختلافات طفيفة
function smartScoreForAnswer(correctAns, userAns, perQuestion){
  // حالات خاصة
  if(!userAns || userAns.trim().length === 0) return 0;
  const uNorm = normalizeText(userAns);
  const cNorm = normalizeText(correctAns);

  if(uNorm === cNorm) return perQuestion;

  // لو الإجابات قائمة (قوائم) نعاملها كمجموع عناصر: نتحقق وجود كل عنصر مهم
  if(isListLike(correctAns) || isListLike(userAns)){
    // نقسم حسب فواصل أو أسطر
    const splitPattern = /[\n,؛\-•]/;
    const correctItems = correctAns.split(splitPattern).map(s=>normalizeText(s)).filter(Boolean);
    const userItems = userAns.split(splitPattern).map(s=>normalizeText(s)).filter(Boolean);
    if(correctItems.length > 0){
      // لكل عنصر في correctItems نتحقق إذا هناك تطابق بنسبة كلمات داخل العنصر
      let matchedItems = 0;
      correctItems.forEach(ci=>{
        const ratio = tokenOverlapRatio(ci, userAns); // نتحقق في النص الكامل للمستخدم
        if(ratio >= 0.6) matchedItems++;
      });
      if(matchedItems === correctItems.length) return perQuestion;
      if(matchedItems > 0) return Math.round(perQuestion * 0.7);
      return Math.round(perQuestion * 0.3);
    }
  }

  // نسبة التطابق الكلمية العامة
  const ratio = tokenOverlapRatio(correctAns, userAns);

  if(ratio >= 0.85) return perQuestion;           // تطابق عالي -> كامل
  if(ratio >= 0.4) return Math.round(perQuestion * 0.7); // تطابق متوسط -> 70%
  return Math.round(perQuestion * 0.3);           // محاولة فقط -> 30%
}

// ------------------------- واجهة (Dashboard) -------------------------
function getTodayISO(){
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function renderDashboard(dateIso){
  const day = DATA[dateIso];
  const todayList = document.getElementById("todayList");
  const examsArea = document.getElementById("examsArea");
  const todayDate = document.getElementById("todayDate");
  if(!todayList || !examsArea || !todayDate) return;

  if(!day){
    todayList.innerHTML = `<li>لا توجد بيانات لهذا اليوم</li>`;
    examsArea.innerHTML = "";
    todayDate.textContent = dateIso;
    return;
  }

  todayDate.textContent = dateIso;

  // عرض المهام (فقط غير المكتملة)
  todayList.innerHTML = day.tasks.map(t => `
    <li>
      <div>
        <b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} 
        <span class="muted">(${t.hours} ساعة)</span>
      </div>
      ${t.done ? '' : `<button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>`}
    </li>
  `).join("") || `<li>لا توجد مهام لهذا اليوم</li>`;

  // عرض الامتحانات
  examsArea.innerHTML = (day.exams || []).map(ex => `
    <div class="card exam-question">
      <b>${escapeHtml(ex.subject)}</b> — ${escapeHtml(ex.title)}
      <div><button class="btn small" onclick="openExam('${dateIso}','${ex.id}')">بدء الامتحان</button></div>
    </div>
  `).join("") || `<div>لا توجد امتحانات لهذا اليوم</div>`;
}

function markTaskDone(dateIso, taskId){
  if(!DATA[dateIso]) return;
  const task = DATA[dateIso].tasks.find(t => t.id === taskId);
  if(task){
    task.done = true;
    task.completedAt = new Date().toISOString();
    saveData();
    renderDashboard(dateIso);
  }
}

// ------------------------- الامتحانات (فتح/إغلاق/عرض) -------------------------
function openExam(dateIso, examId){
  if(!DATA[dateIso]) return;
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;
  document.getElementById("examTitleShow").textContent = exam.title;
  const qHtml = (exam.questions||[]).map((q,i)=>`
    <div class="exam-question">
      <div><b>س${i+1}:</b> ${escapeHtml(q.text)}</div>
      <input type="text" id="answer-${i}" autocomplete="off">
      <div class="muted small" id="correct-${i}" style="display:none;">الإجابة النموذجية: ${escapeHtml(q.answer)}</div>
    </div>
  `).join("");
  document.getElementById("examQuestions").innerHTML = qHtml;
  document.getElementById("examResult").textContent = "";
  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("submitExamBtn").onclick = ()=>submitExam(dateIso, examId);
}

document.getElementById("closeExam").addEventListener("click", ()=>{
  document.getElementById("examModal").classList.add("section-hidden");
});

// ------------------------- التصحيح (يومي/تراكمي) -------------------------
function submitExam(dateIso, examId){
  if(!DATA[dateIso]) return;
  const exam = DATA[dateIso].exams.find(e => e.id === examId);
  if(!exam) return;

  // قرار نوع الامتحان: إذا exam.type === 'cumulative' => 100، وإلا 30
  let totalScore = 30;
  if(exam.type === 'cumulative') totalScore = 100;
  const numQ = Math.max(1, (exam.questions||[]).length);
  const perQuestion = totalScore / numQ;

  let scoreObtained = 0;
  exam.questions.forEach((q,i)=>{
    const userInputEl = document.getElementById("answer-"+i);
    const correctEl = document.getElementById("correct-"+i);
    const userAns = userInputEl ? userInputEl.value.trim() : "";
    const qScore = smartScoreForAnswer(q.answer, userAns, perQuestion);
    scoreObtained += qScore;
    if(correctEl) correctEl.style.display = "block";
  });

  // تقريبي للتقريب لقيمة عددية صحيحة
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

// ------------------------- مساعدة HTML safety -------------------------
function escapeHtml(str){
  if(str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

// ------------------------- شريط جانبي وناف -> التنقل -------------------------
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
if(menuBtn){
  menuBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
}
if(overlay){
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

// ------------------------- أزرار التاريخ -------------------------
document.getElementById("todayBtn").addEventListener("click", ()=> renderDashboard(getTodayISO()));
document.getElementById("goDate").addEventListener("click", ()=>{
  const val = document.getElementById("viewDate").value;
  if(val) renderDashboard(val);
});

// ------------------------- إضافة واجب -------------------------
document.getElementById("saveTask").addEventListener("click", ()=>{
  const subj = document.getElementById("new_subject").value.trim();
  const cont = document.getElementById("new_content").value.trim();
  const hrs = parseFloat(document.getElementById("new_hours").value);
  const date = document.getElementById("new_date").value;
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
});

// ------------------------- تصدير + إعادة ضبط -------------------------
document.getElementById("exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([ "window.getInitialData = ()=>(" + JSON.stringify(DATA,null,2) + ")" ], {type:"application/javascript"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("resetBtn").addEventListener("click", ()=>{
  if(confirm("هل أنت متأكد من إعادة الضبط؟")){
    localStorage.removeItem("study-data");
    localStorage.removeItem("study-data_version");
    location.reload();
  }
});

// ------------------------- التقارير (Chart.js) -------------------------
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

  // تفريغ كانفاس سابق (إذا كان موجود)
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

// ------------------------- احصائيات (دونات) -------------------------
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

// ------------------------- الأرشيف -------------------------
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

// ------------------------- الدرجات -------------------------
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

// ------------------------- مولد ألوان (حسب عدد العناصر) -------------------------
function generateColors(n){
  const palette = ['#2f3e46','#1f78b4','#ffd54f','#8fddc7','#ff8a65','#9fa8da','#c5e1a5','#ffcc80'];
  const res = [];
  for(let i=0;i<n;i++) res.push(palette[i % palette.length]);
  return res;
}

// ------------------------- تحميل أولي -------------------------
document.addEventListener("DOMContentLoaded", ()=>{
  renderDashboard(getTodayISO());
});
