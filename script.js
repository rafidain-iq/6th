// script.js — إصدار مدمج متكامل مع نظام تعلم بسيط للأجوبة العددية والنصية
(() => {
  // -------------------- إعداد/مفاتيح --------------------
  const STORAGE_KEY = "study-data-user-changes-v2";
  const LEARN_KEY = "study-data-answer-accepts-v1";
  const PASS_PERCENT = 50; // عتبة النجاح للتلوين الأحمر/أخضر (بالمئة)

  // تحميل data.js
  const initialData = (typeof window.getInitialData === "function") ? window.getInitialData() : {};

  // بنية تخزين المستخدم (نخزن فقط تغييرات المستخدم)
  const defaultUserStore = {
    addedTasks: {},    // { "YYYY-MM-DD": [taskObj,...] }
    overrides: {},     // { "YYYY-MM-DD": { "task-id": {done:true,completedAt:...} } }
    grades: [],        // [{date,subject,title,score,total,recordedAt,answers: [{qid, user, model, score}]}, ...]
    _archive: []       // أرشفة إضافية
  };

  // قواعد التعلم لاعتبار إجابات معينة صحيحة لكل سؤال (keyed by question id)
  // شكل: { "<questionId>": ["accepted normalized answer 1", "ans2", ...], ... }
  function loadAccepts(){
    try {
      const raw = localStorage.getItem(LEARN_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){
      console.warn("failed load accepts", e);
      return {};
    }
  }
  function saveAccepts(obj){
    try { localStorage.setItem(LEARN_KEY, JSON.stringify(obj)); }
    catch(e){ console.error("fail save accepts", e); }
  }

  function loadUserStore(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultUserStore));
    } catch(e){
      console.warn("failed parse user store", e);
      return JSON.parse(JSON.stringify(defaultUserStore));
    }
  }
  function saveUserStore(store){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch(e){ console.error("failed save user store", e); }
  }

  // بناء DATA بدمج initialData + تغييرات المستخدم
  let DATA = {};
  function buildDataFromInitial(){
    DATA = JSON.parse(JSON.stringify(initialData || {})); // clone

    // ensure shape and ids
    Object.keys(DATA).forEach(date=>{
      const day = DATA[date];
      if(!day) { DATA[date] = {tasks:[], exams:[]}; return; }
      if(!Array.isArray(day.tasks)) day.tasks = [];
      if(!Array.isArray(day.exams)) day.exams = [];
      day.tasks.forEach((t,i)=>{ if(!t.id) t.id = `t-${date}-${i}`; if(t.done===undefined) t.done=false; });
      day.exams.forEach((e,i)=>{ if(!e.id) e.id = `e-${date}-${i}`; if(!Array.isArray(e.questions)) e.questions = []; e.questions.forEach((q,qi)=>{ if(!q.id) q.id = `${e.id}-q${qi}`; })});
    });

    if(!Array.isArray(DATA.grades)) DATA.grades = [];
    if(!Array.isArray(DATA._archive)) DATA._archive = [];

    // apply user store
    const store = loadUserStore();
    // added tasks
    Object.keys(store.addedTasks||{}).forEach(date=>{
      if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
      store.addedTasks[date].forEach(t=>{
        if(!t.id) t.id = `t-added-${date}-${Math.random().toString(36).slice(2,8)}`;
        if(t.done === undefined) t.done = false;
        DATA[date].tasks.push(t);
      });
    });
    // overrides
    Object.keys(store.overrides||{}).forEach(date=>{
      if(!DATA[date]) return;
      const dayOverrides = store.overrides[date];
      if(!dayOverrides) return;
      (DATA[date].tasks||[]).forEach(t=>{
        if(dayOverrides[t.id] && typeof dayOverrides[t.id].done !== "undefined"){
          t.done = !!dayOverrides[t.id].done;
          if(dayOverrides[t.id].completedAt) t.completedAt = dayOverrides[t.id].completedAt;
        }
      });
    });
    // grades
    if(Array.isArray(store.grades) && store.grades.length>0){
      DATA.grades = (DATA.grades || []).concat(store.grades);
    }
    // archive
    if(Array.isArray(store._archive) && store._archive.length>0){
      DATA._archive = (DATA._archive || []).concat(store._archive);
    }
  }

  buildDataFromInitial();

  // helpers to persist user changes (only user changes)
  function addUserTask(date, task){
    const store = loadUserStore();
    store.addedTasks = store.addedTasks || {};
    if(!store.addedTasks[date]) store.addedTasks[date] = [];
    store.addedTasks[date].push(task);
    saveUserStore(store);
    // apply to DATA
    if(!DATA[date]) DATA[date] = {tasks:[], exams:[]};
    DATA[date].tasks.push(task);
  }
  function setTaskDoneUser(date, taskId, completedAt){
    const store = loadUserStore();
    store.overrides = store.overrides || {};
    if(!store.overrides[date]) store.overrides[date] = {};
    store.overrides[date][taskId] = { done: true, completedAt: completedAt || new Date().toISOString() };
    saveUserStore(store);
    // update DATA
    if(DATA[date] && Array.isArray(DATA[date].tasks)){
      const t = DATA[date].tasks.find(x=>x.id === taskId);
      if(t){ t.done = true; t.completedAt = completedAt || new Date().toISOString(); }
    }
  }
  function addUserGradeRecord(gr){
    const store = loadUserStore();
    store.grades = store.grades || [];
    store.grades.push(gr);
    saveUserStore(store);
    DATA.grades = DATA.grades || [];
    DATA.grades.push(gr);
  }
  function addUserArchive(entry){
    const store = loadUserStore();
    store._archive = store._archive || [];
    store._archive.push(entry);
    saveUserStore(store);
    DATA._archive = DATA._archive || [];
    DATA._archive.push(entry);
  }

  // -------------------- نصوص / تصحيح ذكي --------------------
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

  // حساس للأرقام: يقبل قيمة عددية قريبة (نسبة خطأ أو فرق مطلق)
  function numericClose(modelStr, userStr){
    // حاول استخراج أول عدد من كل نص
    const parseFirstNum = str => {
      if(!str) return null;
      // replace commas, arabic digits normalization could be added; for now handle normal decimals
      const match = String(str).match(/-?\d+(\.\d+)?/);
      return match ? Number(match[0]) : null;
    };
    const m = parseFirstNum(modelStr);
    const u = parseFirstNum(userStr);
    if(m === null || u === null) return false;
    // if exactly equal
    if(Object.is(m, u)) return true;
    // relative tolerance: 2% or absolute tolerance 0.05 (configurable)
    const relTol = 0.02; // 2%
    const absTol = 0.05; // absolute
    if(Math.abs(m-u) <= absTol) return true;
    if(Math.abs(m-u) / (Math.abs(m) || 1) <= relTol) return true;
    return false;
  }

  // تحميل قواعد التعلم (accepted answers)
  let ACCEPTS = loadAccepts(); // object keyed by question id
  function isAcceptedByLearning(qid, userAnsNormalized){
    if(!qid) return false;
    const arr = ACCEPTS[qid];
    if(!Array.isArray(arr)) return false;
    return arr.includes(userAnsNormalized);
  }
  function addAcceptedAnswer(qid, userAnsNormalized){
    if(!qid || !userAnsNormalized) return;
    ACCEPTS[qid] = ACCEPTS[qid] || [];
    if(!ACCEPTS[qid].includes(userAnsNormalized)){
      ACCEPTS[qid].push(userAnsNormalized);
      saveAccepts(ACCEPTS);
    }
  }

  // الدالة الذكية لحساب درجات السؤال
  function smartScoreForAnswer(correctAns, userAns, perQuestion, qid){
    // إذا لا إجابة
    if(!userAns || userAns.trim().length === 0) return 0;

    const uNorm = normalizeText(userAns);
    const cNorm = normalizeText(correctAns || "");

    // أولاً: إذا تعلمنا سابقًا أن هذه الإجابة مقبولة
    if(qid && isAcceptedByLearning(qid, uNorm)) return perQuestion;

    // ثانيًا: مقارنة أرقام قريبة
    if(numericClose(correctAns, userAns)) return perQuestion;

    // ثالثًا: تطابق نصي مباشر
    if(uNorm === cNorm) return perQuestion;

    // رابعًا: قوائم
    if(isListLike(correctAns) || isListLike(userAns)){
      const splitPattern = /[\n,؛\-•]/;
      const correctItems = String(correctAns).split(splitPattern).map(s=>normalizeText(s)).filter(Boolean);
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

    // أخيراً: نسبة تطابق كلمات عامة
    const ratio = tokenOverlapRatio(correctAns, userAns);
    if(ratio >= 0.85) return perQuestion;
    if(ratio >= 0.4) return Math.round(perQuestion * 0.7);
    return Math.round(perQuestion * 0.3);
  }

  // -------------------- UI helpers --------------------
  function escapeHtml(str){
    if(str === undefined || str === null) return "";
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function getTodayKey(){
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,'0');
    const d = String(now.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  // -------------------- DOM / RENDER --------------------
  document.addEventListener("DOMContentLoaded", ()=>{
    // DOM refs
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const todayList = document.getElementById("todayList");
    const examsArea = document.getElementById("examsArea");
    const todayDateEl = document.getElementById("todayDate");
    const viewDate = document.getElementById("viewDate");
    const todayBtn = document.getElementById("todayBtn");
    const goDate = document.getElementById("goDate");
    const exportBtn = document.getElementById("exportBtn");
    const resetBtn = document.getElementById("resetBtn");
    const addTaskBtn = document.getElementById("saveTask");
    const addGradeBtn = document.getElementById("addGradeBtn"); // may exist
    const reportCanvas = document.getElementById("reportChart");
    const statsCanvas = document.getElementById("statsChart");

    // sidebar toggle
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

    if(viewDate) viewDate.value = getTodayKey();

    function renderDashboard(dateIso){
      if(!dateIso) dateIso = getTodayKey();
      renderTodayTasks(dateIso);
      renderExams(dateIso);
      if(todayDateEl) todayDateEl.textContent = dateIso;
    }

    function renderTodayTasks(dateIso){
      const day = DATA[dateIso];
      if(!todayList) return;
      todayList.innerHTML = "";
      if(!day || !Array.isArray(day.tasks) || day.tasks.length===0){
        todayList.innerHTML = "<li>لا توجد مهام لهذا اليوم</li>";
        return;
      }
      day.tasks.forEach(t=>{
        const li = document.createElement("li");
        li.className = "task-item";
        const doneHTML = t.done ? `<span class="muted">✓ مكتملة</span>` : `<button class="btn small mark-done" data-day="${dateIso}" data-id="${t.id}">✅</button>`;
        li.innerHTML = `<div><b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content || t.title || "")} <span class="muted">(${escapeHtml(String(t.hours||0))} س)</span> ${doneHTML}</div>`;
        todayList.appendChild(li);
      });
      // attach listeners
      todayList.querySelectorAll(".mark-done").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const day = btn.getAttribute("data-day");
          const id = btn.getAttribute("data-id");
          // mark done in store & data
          setTaskDoneUser(day, id, new Date().toISOString());
          // add to archive short record
          const task = (DATA[day] && DATA[day].tasks) ? DATA[day].tasks.find(x=>x.id===id) : null;
          if(task){
            addUserArchive({ subject: task.subject, content: task.content || task.title || "", date: day, completedAt: new Date().toISOString() });
          }
          renderTodayTasks(day);
          renderArchive();
        });
      });
    }

    function renderExams(dateIso){
      if(!examsArea) return;
      examsArea.innerHTML = "";
      const day = DATA[dateIso];
      if(!day || !Array.isArray(day.exams) || day.exams.length===0){ examsArea.innerHTML = "<div>لا توجد امتحانات لهذا اليوم</div>"; return; }
      day.exams.forEach(e=>{
        const div = document.createElement("div");
        div.className = "card exam-question";
        div.innerHTML = `<b>${escapeHtml(e.subject || "")}</b> — ${escapeHtml(e.title || "")}
          <div style="margin-top:6px"><button class="btn small start-exam" data-day="${dateIso}" data-eid="${e.id}">بدء الامتحان</button></div>`;
        examsArea.appendChild(div);
      });
      examsArea.querySelectorAll(".start-exam").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          openExam(btn.getAttribute("data-day"), btn.getAttribute("data-eid"));
        });
      });
    }

    // ---- exam modal refs ----
    const examModal = document.getElementById("examModal");
    const examTitleShow = document.getElementById("examTitleShow");
    const examQuestions = document.getElementById("examQuestions");
    const submitExamBtn = document.getElementById("submitExamBtn");
    const examResult = document.getElementById("examResult");
    const closeExam = document.getElementById("closeExam");

    let currentExamRef = null; // {day, index, exam}

    function openExam(day, examId){
      if(!DATA[day]) return;
      const idx = (DATA[day].exams||[]).findIndex(x => String(x.id) === String(examId) || x.id === examId);
      if(idx < 0) return;
      const examObj = DATA[day].exams[idx];
      currentExamRef = { day, index: idx, exam: examObj };
      examTitleShow.textContent = examObj.title || examObj.subject || "امتحان";
      examQuestions.innerHTML = "";
      examResult.innerHTML = "";
      // build questions
      if(!Array.isArray(examObj.questions) || examObj.questions.length===0){
        examQuestions.innerHTML = "<div>لا توجد أسئلة في هذا الامتحان.</div>";
      } else {
        examObj.questions.forEach((q,i)=>{
          const qText = escapeHtml(q.text || q.q || "");
          examQuestions.innerHTML += `
            <div class="card exam-q">
              <div><b>س${i+1}:</b> ${qText}</div>
              <input id="answer-${i}" class="ansInput" placeholder="اكتب إجابتك هنا">
              <div id="correct-${i}" class="muted small" style="display:none;margin-top:6px;">الإجابة النموذجية: ${escapeHtml(q.answer || q.a || "")}</div>
            </div>`;
        });
      }
      examModal.classList.remove("section-hidden");
      examModal.scrollTop = 0;
      if(submitExamBtn) submitExamBtn.onclick = ()=> submitExam(day, idx);
    }

    if(closeExam) closeExam.addEventListener("click", ()=> examModal.classList.add("section-hidden"));

    // submit and smart grade + show model & student answers + learning
    function submitExam(day, examIndex){
      const exam = (DATA[day] && DATA[day].exams && DATA[day].exams[examIndex]) ? DATA[day].exams[examIndex] : null;
      if(!exam) return;
      const totalScore = (exam.type === "cumulative") ? 100 : 30;
      const questions = exam.questions || [];
      const perQ = questions.length > 0 ? totalScore / questions.length : totalScore;
      let scoreObtained = 0;
      const answersRecord = [];
      questions.forEach((q,i)=>{
        const model = q.answer || q.a || "";
        const userEl = document.getElementById(`answer-${i}`);
        const userAns = userEl ? userEl.value.trim() : "";
        const qid = q.id || `${exam.id}-q${i}`;
        const qScore = smartScoreForAnswer(model, userAns, perQ, qid);
        scoreObtained += qScore;
        answersRecord.push({ qid, user: userAns, model, score: qScore });
        // show model
        const correctEl = document.getElementById(`correct-${i}`);
        if(correctEl) correctEl.style.display = "block";
      });

      scoreObtained = Math.round(scoreObtained);

      // save grade record (and also save answers)
      const rec = {
        date: day,
        subject: exam.subject || exam.title || "عام",
        title: exam.title || "",
        score: scoreObtained,
        total: totalScore,
        recordedAt: new Date().toISOString(),
        answers: answersRecord
      };
      addUserGradeRecord(rec);

      // show result + provide manual override button
      if(examResult){
        examResult.innerHTML = `<h4>النتيجة: ${scoreObtained} / ${totalScore}</h4>
          <div style="margin-top:8px">
            <button id="manualAdjust" class="btn small">تعديل النتيجة</button>
            <button id="acceptAll" class="btn small ghost">اعتماد إجابات مرَّضية (تعلم)</button>
          </div>`;
        // manual adjust
        document.getElementById("manualAdjust").addEventListener("click", ()=>{
          const newScoreRaw = prompt("أدخل الدرجة الجديدة (عدد):", String(scoreObtained));
          const newScore = Number(newScoreRaw);
          if(!isNaN(newScore)){
            // تعديل السجل الأخير (في DATA.grades و user store)
            const gIdx = DATA.grades.length - 1;
            if(gIdx >= 0){
              DATA.grades[gIdx].score = newScore;
              DATA.grades[gIdx].recordedAt = new Date().toISOString();
            }
            // أيضاً في user store
            const store = loadUserStore();
            if(Array.isArray(store.grades) && store.grades.length>0){
              store.grades[store.grades.length-1].score = newScore;
              saveUserStore(store);
            }
            alert("تم تعديل الدرجة يدوياً.");
            renderGrades();
            // update display
            examResult.querySelector("h4").textContent = `النتيجة: ${newScore} / ${totalScore}`;
          } else alert("درجة غير صحيحة.");
        });
        // accept all (تعلم): سيضيف الإجابات الحالية كـ accepted لكل qid
        document.getElementById("acceptAll").addEventListener("click", ()=>{
          answersRecord.forEach(ans=>{
            const qid = ans.qid;
            const uNorm = normalizeText(ans.user || "");
            if(uNorm) addAcceptedAnswer(qid, uNorm);
          });
          alert("تم اعتماد الإجابات الحالية كتعلّم — سيتم قبولها تلقائياً لاحقًا.");
        });
      }

      // after save, update UI lists
      renderGrades();
      renderReports();
      renderArchive();
    }

    // ---------------- grades table ----------------
    function renderGrades(){
      const container = document.getElementById("gradesContent");
      if(!container) return;
      const grades = DATA.grades || [];
      if(!grades || grades.length===0){
        container.innerHTML = "لا توجد درجات حالياً.";
        return;
      }
      let html = `<table class="table"><thead><tr><th>التاريخ</th><th>المادة</th><th>الامتحان</th><th>الدرجة</th><th>المجموع</th><th>ملاحظات</th></tr></thead><tbody>`;
      grades.forEach(g=>{
        const dateText = escapeHtml(g.date || (g.recordedAt ? g.recordedAt.split("T")[0] : ""));
        const pct = (Number(g.score) / Number(g.total || 100)) * 100;
        const failClass = (pct < PASS_PERCENT) ? 'fail-row' : '';
        html += `<tr class="${failClass}">
          <td>${dateText}</td>
          <td>${escapeHtml(g.subject)}</td>
          <td>${escapeHtml(g.title || "")}</td>
          <td>${escapeHtml(String(g.score))}</td>
          <td>${escapeHtml(String(g.total || 100))}</td>
          <td>${escapeHtml(String(Math.round(pct))) }%</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    }

    // ---------------- archive table ----------------
    function renderArchive(){
      const container = document.getElementById("archiveContent");
      if(!container) return;
      // build from DATA._archive or tasks marked done
      const archive = (Array.isArray(DATA._archive) ? DATA._archive.slice() : []);
      if(archive.length === 0){
        // build from tasks done
        Object.keys(DATA).forEach(d=>{
          if(!Array.isArray(DATA[d].tasks)) return;
          DATA[d].tasks.forEach(t=>{
            if(t.done) archive.push({ subject: t.subject, content: t.content || t.title || "", date: d, completedAt: t.completedAt || "" });
          });
        });
      }
      if(archive.length === 0){ container.innerHTML = "لا توجد مهام مؤرشفة."; return; }
      let html = `<table class="table"><thead><tr><th>التاريخ</th><th>المادة</th><th>الوصف</th><th>أكملت في</th></tr></thead><tbody>`;
      archive.forEach(a=>{
        html += `<tr>
          <td>${escapeHtml(a.date || "")}</td>
          <td>${escapeHtml(a.subject || "")}</td>
          <td>${escapeHtml(a.content || "")}</td>
          <td>${escapeHtml(a.completedAt ? a.completedAt.split("T")[0] : "")}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    }

    // ---------------- reports & stats ----------------
    // reports: monthly hours per subject (bar). stats: weekly completed hours per subject (doughnut) + list
    let reportsChart = null;
    let statsChart = null;

    function getMonthKey(dateStr){
      // returns YYYY-MM for a date key YYYY-MM-DD
      if(!dateStr) return null;
      return dateStr.slice(0,7);
    }

    function renderReports(targetMonth){
      if(!reportCanvas) return;
      // default month = current month
      const monthKey = targetMonth || (getTodayKey().slice(0,7));
      // accumulate hours per subject for that month
      const subjectHours = {};
      Object.keys(DATA).forEach(d=>{
        if(getMonthKey(d) !== monthKey) return;
        const day = DATA[d];
        (day.tasks || []).forEach(t=>{
          if(!t || !t.subject) return;
          subjectHours[t.subject] = (subjectHours[t.subject] || 0) + (Number(t.hours) || 0);
        });
      });
      const labels = Object.keys(subjectHours);
      const values = labels.map(l=>subjectHours[l]);

      if(reportsChart){ reportsChart.destroy(); reportsChart = null; }
      reportsChart = new Chart(reportCanvas.getContext("2d"), {
        type: "bar",
        data: { labels, datasets: [{ label: "ساعات هذا الشهر", data: values }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });

      // below chart: show list summary
      const reportsContainer = document.getElementById("reportsContent");
      if(reportsContainer){
        // keep canvas then append summary
        const summaryId = "report-summary";
        let summaryHtml = `<div id="${summaryId}" style="margin-top:12px"><h4>توضيح الساعات (${monthKey})</h4>`;
        if(labels.length === 0) summaryHtml += `<div>لا توجد ساعات مسجلة لهذا الشهر.</div>`;
        else {
          summaryHtml += `<ul>`;
          labels.forEach((lab, idx)=> summaryHtml += `<li>${escapeHtml(lab)}: ${escapeHtml(String(values[idx]))} ساعة</li>`);
          summaryHtml += `</ul>`;
        }
        summaryHtml += `</div>`;
        // remove old summary if exists
        const old = document.getElementById(summaryId);
        if(old) old.remove();
        reportsContainer.insertAdjacentHTML("beforeend", summaryHtml);
      }
    }

    // stats: weekly doughnut + list (week defined from Thursday to Wednesday)
    function weekStartFor(dateObj){
      // gives starting Thursday for the week that contains dateObj
      const copy = new Date(dateObj.getTime());
      // find current weekday: 0=Sun..6=Sat. We want to find most recent Thursday (weekday 4)
      const wd = copy.getDay(); // sun0..sat6
      // compute delta days to go back to Thursday (4)
      let delta = (wd - 4);
      if(delta < 0) delta += 7;
      copy.setDate(copy.getDate() - delta);
      // zero time
      copy.setHours(0,0,0,0);
      // produce key
      const y = copy.getFullYear();
      const m = String(copy.getMonth()+1).padStart(2,'0');
      const d = String(copy.getDate()).padStart(2,'0');
      return `${y}-${m}-${d}`;
    }
    function getWeekRangeKey(dateKey){
      // get week start (Thursday) for dateKey (YYYY-MM-DD)
      const [y,m,d] = dateKey.split("-");
      const dateObj = new Date(Number(y), Number(m)-1, Number(d));
      return weekStartFor(dateObj);
    }

    function renderStats(){
      if(!statsCanvas) return;
      // week start key for today
      const todayKey = getTodayKey();
      const weekStart = getWeekRangeKey(todayKey);
      // accumulate completed hours per subject for tasks with completedAt within this week (we'll consider tasks with date within weekStart..weekStart+6)
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate.getTime()); endDate.setDate(endDate.getDate()+6);
      const subjectCompleted = {};
      // check both DATA._archive and tasks with done true and completedAt in range
      // from DATA._archive
      (DATA._archive || []).forEach(a=>{
        const dd = a.completedAt ? a.completedAt.split("T")[0] : a.date;
        if(!dd) return;
        const dObj = new Date(dd);
        if(dObj >= startDate && dObj <= endDate){
          subjectCompleted[a.subject] = (subjectCompleted[a.subject] || 0) + (Number(a.hours)||0);
        }
      });
      // also from tasks done with completedAt
      Object.keys(DATA).forEach(d=>{
        (DATA[d].tasks||[]).forEach(t=>{
          if(!t.done) return;
          const comp = t.completedAt ? t.completedAt.split("T")[0] : d;
          const dobj = new Date(comp);
          if(dobj >= startDate && dobj <= endDate){
            subjectCompleted[t.subject] = (subjectCompleted[t.subject] || 0) + (Number(t.hours) || 0);
          }
        });
      });

      const labels = Object.keys(subjectCompleted);
      const values = labels.map(l=>subjectCompleted[l]);

      if(statsCanvas._chart) statsCanvas._chart.destroy();
      statsCanvas._chart = new Chart(statsCanvas.getContext("2d"), {
        type: "doughnut",
        data: { labels, datasets: [{ data: values }] },
        options: { responsive: true, plugins: { legend: { position: 'right' } } }
      });

      // below chart: list of subjects/hours
      const statsContainer = document.getElementById("statsContent");
      if(statsContainer){
        const summaryId = "stats-summary";
        let summaryHtml = `<div id="${summaryId}" style="margin-top:12px"><h4>ساعات هذا الأسبوع (من ${weekStart} إلى ${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')})</h4>`;
        if(labels.length === 0) summaryHtml += `<div>لا توجد ساعات مكتملة هذا الأسبوع.</div>`;
        else { summaryHtml += `<ul>`; labels.forEach((lab, idx)=> summaryHtml += `<li>${escapeHtml(lab)}: ${escapeHtml(String(values[idx]))} ساعة</li>`); summaryHtml += `</ul>`; }
        summaryHtml += `</div>`;
        const old = document.getElementById(summaryId);
        if(old) old.remove();
        statsContainer.insertAdjacentHTML("beforeend", summaryHtml);
      }
    }

    // ---------------- nav links ----------------
    document.querySelectorAll(".navlink").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll("main > section").forEach(s=>s.classList.add("section-hidden"));
        const tab = document.getElementById(btn.dataset.tab);
        if(tab) tab.classList.remove("section-hidden");
        if(sidebar) sidebar.classList.remove("open");
        if(overlay) overlay.classList.remove("show");

        if(btn.dataset.tab === "grades") renderGrades();
        if(btn.dataset.tab === "archive") renderArchive();
        if(btn.dataset.tab === "reports") renderReports();
        if(btn.dataset.tab === "stats") renderStats();
      });
    });

    // export data (creates a downloadable data.js using DATA merged) — note: this will export combined initial+user changes
    if(exportBtn) exportBtn.addEventListener("click", ()=>{
      const blob = new Blob([ "window.getInitialData = ()=>(" + JSON.stringify(DATA,null,2) + ")" ], {type:"application/javascript"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      a.click();
      URL.revokeObjectURL(url);
    });

    // reset button: remove only user changes (not data.js)
    if(resetBtn) resetBtn.addEventListener("click", ()=>{
      if(confirm("هل أنت متأكد من إعادة الحالة الأولية (حذف تغييراتك المحلية)؟")){
        localStorage.removeItem(STORAGE_KEY);
        // also clear accepts learning
        localStorage.removeItem(LEARN_KEY);
        // rebuild
        buildDataFromInitial();
        ACCEPTS = {};
        renderAll();
      }
    });

    // add task button (uses inputs in add section)
    const saveTaskBtn = document.getElementById("saveTask");
    if(saveTaskBtn){
      saveTaskBtn.addEventListener("click", ()=>{
        const subj = document.getElementById("new_subject").value.trim();
        const cont = document.getElementById("new_content").value.trim();
        const hrs = Number(document.getElementById("new_hours").value);
        const date = document.getElementById("new_date").value;
        if(!subj || !cont || !date || isNaN(hrs)){
          alert("يرجى تعبئة الحقول بشكل صحيح.");
          return;
        }
        const id = `t-added-${date}-${Math.random().toString(36).slice(2,8)}`;
        const t = { id, subject: subj, content: cont, hours: hrs, done: false, createdAt: new Date().toISOString() };
        addUserTask(date, t);
        alert("تمت الإضافة.");
        // if currently viewing that date, re-render
        const currentView = (viewDate && viewDate.value) ? viewDate.value : getTodayKey();
        renderDashboard(currentView);
      });
    }

    // add grade button (in sidebar)
    if(addGradeBtn){
      addGradeBtn.addEventListener("click", ()=>{
        const subj = prompt("اسم المادة:");
        if(!subj) return;
        const title = prompt("اسم الامتحان/ملاحظة:");
        const scoreRaw = prompt("الدرجة:");
        const score = Number(scoreRaw);
        if(isNaN(score)){ alert("درجة غير صحيحة"); return; }
        const totalRaw = prompt("المجموع الكلي (افتراضي 100):", "100");
        const total = Number(totalRaw) || 100;
        const date = prompt("تاريخ (YYYY-MM-DD) أو اترك فارغاً لليوم:");
        const recDate = date && date.trim() ? date.trim() : getTodayKey();
        const gradeObj = { date: recDate, subject: subj, title: title || "يدوي", score, total, recordedAt: new Date().toISOString(), answers: [] };
        addUserGradeRecord(gradeObj);
        alert("تمت إضافة الدرجة.");
        renderGrades();
      });
    }

    // date controls
    if(todayBtn) todayBtn.addEventListener("click", ()=> renderDashboard(getTodayKey()));
    if(goDate){
      goDate.addEventListener("click", ()=>{
        const val = (viewDate && viewDate.value) ? viewDate.value : '';
        if(val) renderDashboard(val);
      });
    }

    // initial render
    function renderAll(){
      const view = (viewDate && viewDate.value) ? viewDate.value : getTodayKey();
      renderDashboard(view);
      renderGrades();
      renderArchive();
      renderReports();
      renderStats();
    }
    renderAll();

    // expose some functions to window for debugging (opt)
    window._studyApp = {
      DATA, rebuild: ()=>{ buildDataFromInitial(); renderAll(); }, getAccepts: ()=>ACCEPTS, saveAccepts
    };
  }); // end DOMContentLoaded

})(); // end IIFE
