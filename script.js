// script.js — إصدار متكامل (يحافظ على البيانات محلياً، عرض مهام/امتحانات، تقارير، أرشيف، درجات، مودال امتحان، تصحيح ذكي)

(function(){
  // ---- إعداد وقراءة البيانات الأولية ----
  if(typeof window.getInitialData !== "function"){
    console.error("data.js غير موجود أو لم يعرّف window.getInitialData()");
    window.getInitialData = function(){ return {}; };
  }

  // clone initial data
  const INITIAL = window.getInitialData() || {};
  // نسخة العمل (سنحفظ تغييرات المستخدم في localStorage، لكن نحافظ على بنية البيانات)
  let DATA = {};

  const STORE_KEY = "study_app_store_v1"; // يخزن التعديلات: grades, archive, addedTasks, overrides
  function loadStore(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : { grades:[], archive:[], addedTasks:{}, overrides:{} , meta:{version:"1"} };
    } catch(e){
      console.warn("فشل قراءة التخزين المحلي، سيتم إعادة تهيئة المتجر.", e);
      return { grades:[], archive:[], addedTasks:{}, overrides:{} , meta:{version:"1"} };
    }
  }
  function saveStore(store){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch(e){ console.error("فشل حفظ التخزين المحلي", e); }
  }

  // دمج initial + store
  function buildData(){
    // clone deep
    DATA = JSON.parse(JSON.stringify(INITIAL || {}));
    // ensure days have tasks/exams arrays
    Object.keys(DATA).forEach(d=>{
      if(typeof DATA[d] !== 'object' || DATA[d] === null) DATA[d] = { tasks:[], exams:[] };
      if(!Array.isArray(DATA[d].tasks)) DATA[d].tasks = [];
      if(!Array.isArray(DATA[d].exams)) DATA[d].exams = [];
      DATA[d].tasks.forEach((t,i)=>{ if(!t.id) t.id = `t-${d}-${i}`; if(t.done === undefined) t.done = false; });
      DATA[d].exams.forEach((e,i)=>{ if(!e.id) e.id = `e-${d}-${i}`; if(!Array.isArray(e.questions)) e.questions = []; e.questions.forEach((q,qi)=>{ if(!q.id) q.id = `${e.id}-q${qi}`; }); });
    });

    // apply user-added tasks & overrides & grades & archive
    const store = loadStore();
    // added tasks
    Object.keys(store.addedTasks || {}).forEach(date=>{
      if(!DATA[date]) DATA[date] = { tasks: [], exams: [] };
      (store.addedTasks[date]||[]).forEach((t,i)=>{
        if(!t.id) t.id = `t-added-${date}-${Math.random().toString(36).slice(2,8)}`;
        if(t.done === undefined) t.done = false;
        DATA[date].tasks.push(t);
      });
    });
    // overrides (e.g., mark done)
    Object.keys(store.overrides || {}).forEach(date=>{
      const dayOverrides = store.overrides[date];
      if(!DATA[date]) return;
      (DATA[date].tasks || []).forEach(t=>{
        if(dayOverrides && dayOverrides[t.id]){
          const ov = dayOverrides[t.id];
          if(typeof ov.done !== "undefined") t.done = !!ov.done;
          if(ov.completedAt) t.completedAt = ov.completedAt;
        }
      });
    });
    // ensure store.grades and store.archive exist
    if(!Array.isArray(store.grades)) store.grades = [];
    if(!Array.isArray(store.archive)) store.archive = [];
  }

  // أول بناء
  buildData();

  // ---- عناصر DOM ----
  document.addEventListener("DOMContentLoaded", () => {
    // DOM refs (تأكدوا أن الـ HTML يحتوي هذه الـ ids)
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const viewDate = document.getElementById("viewDate");
    const todayBtn = document.getElementById("todayBtn");
    const goDate = document.getElementById("goDate");
    const addGradeBtn = document.getElementById("addGradeBtn");
    const exportBtn = document.getElementById("exportBtn");
    const resetBtn = document.getElementById("resetBtn");
    const saveTaskBtn = document.getElementById("saveTask");

    const todayList = document.getElementById("todayList");
    const examsArea = document.getElementById("examsArea");
    const archiveContent = document.getElementById("archiveContent");
    const gradesContent = document.getElementById("gradesContent");
    const reportsContent = document.getElementById("reportsContent");
    const reportCanvas = document.getElementById("reportChart");
    const statsCanvas = document.getElementById("statsChart");

    const examWindow = document.getElementById("examWindow") || document.getElementById("examModal") || null;
    const examContent = document.getElementById("examContent");
    const submitExamBtn = document.getElementById("submitExamBtn");

    // safety checks
    if(!todayList || !examsArea){ console.error("عناصر الواجهة مفقودة: تأكد من وجود #todayList و #examsArea"); }

    // ---- حالة التطبيق ----
    let store = loadStore(); // grades, archive, addedTasks, overrides
    let currentViewDate = getTodayKey();
    if(!DATA[currentViewDate]) {
      // if today's key not in DATA, pick first available date
      const keys = Object.keys(DATA).sort();
      if(keys.length) currentViewDate = keys[0];
    }
    if(viewDate) viewDate.value = currentViewDate;

    // ---- تفاعل الشريط الجانبي ----
    function openSidebar(){
      if(sidebar) sidebar.classList.add("open");
      if(overlay) overlay.classList.add("show");
    }
    function closeSidebar(){
      if(sidebar) sidebar.classList.remove("open");
      if(overlay) overlay.classList.remove("show");
    }
    if(menuBtn) menuBtn.addEventListener("click", ()=> {
      if(sidebar && sidebar.classList.contains("open")) closeSidebar(); else openSidebar();
    });
    if(overlay) overlay.addEventListener("click", ()=> closeSidebar());

    // ---- توابع حفظ/إعادة تحميل store ----
    function persistStore(){
      saveStore(store);
    }

    // ---- توابع مساعدة بالتصحيح الذكي ----
    function normalizeText(s){
      if(!s) return "";
      // remove diacritics, punctuation, normalize spaces and lowercase
      s = String(s);
      s = s.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g,"");
      s = s.replace(/[“”«»"']/g,"");
      s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟؟؟…]/g," ");
      s = s.replace(/\s+/g," ").trim().toLowerCase();
      return s;
    }
    function tokens(s){
      const n = normalizeText(s);
      return n ? n.split(/\s+/).filter(Boolean) : [];
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
    function numericClose(modelStr, userStr){
      const parseFirstNum = str => {
        if(!str) return null;
        // accept scientific notation and decimals
        const m = String(str).match(/-?\d+(\.\d+)?([eE]-?\d+)?/);
        return m ? Number(m[0]) : null;
      };
      const m = parseFirstNum(modelStr);
      const u = parseFirstNum(userStr);
      if(m === null || u === null) return false;
      if(Object.is(m,u)) return true;
      const relTol = 0.02; // 2%
      const absTol = Math.abs(m) < 1 ? 0.05 : Math.abs(m) * 0.02;
      if(Math.abs(m-u) <= absTol) return true;
      if(Math.abs(m-u) / (Math.abs(m) || 1) <= relTol) return true;
      return false;
    }
    function smartScoreForAnswer(correctAns, userAns, perQ){
      if(!userAns || userAns.trim().length === 0) return 0;
      const uNorm = normalizeText(userAns);
      const cNorm = normalizeText(correctAns || "");
      if(uNorm === cNorm) return perQ;
      if(numericClose(correctAns, userAns)) return perQ;
      // lists or keywords
      const cItems = (correctAns||"").split(/[,؛\n\-•]/).map(x=>normalizeText(x)).filter(Boolean);
      if(cItems.length > 1){
        let matched = 0;
        cItems.forEach(ci=>{
          if(tokenOverlapRatio(ci, userAns) >= 0.6) matched++;
        });
        if(matched === cItems.length) return perQ;
        if(matched > 0) return Math.round(perQ * 0.7);
        return Math.round(perQ * 0.3);
      }
      // generic token overlap
      const ratio = tokenOverlapRatio(correctAns, userAns);
      if(ratio >= 0.85) return perQ;
      if(ratio >= 0.4) return Math.round(perQ * 0.7);
      return Math.round(perQ * 0.3);
    }

    // ---- دوال تنسيق المفاتيح ----
    function getTodayKey(){ return new Date().toISOString().split("T")[0]; }
    function ensureDay(dateKey){
      if(!DATA[dateKey]) DATA[dateKey] = { tasks:[], exams:[] };
      if(!Array.isArray(DATA[dateKey].tasks)) DATA[dateKey].tasks = [];
      if(!Array.isArray(DATA[dateKey].exams)) DATA[dateKey].exams = [];
    }

    // ---- رندرة المهام ----
    function renderTasks(dateKey){
      dateKey = dateKey || currentViewDate;
      ensureDay(dateKey);
      if(!todayList) return;
      todayList.innerHTML = "";
      const day = DATA[dateKey];
      const visible = day.tasks.filter(t => !t.done);
      if(visible.length === 0){
        const li = document.createElement("li");
        li.innerHTML = "<span class='muted'>لا توجد مهام لهذا اليوم.</span>";
        todayList.appendChild(li);
        return;
      }
      visible.forEach(t=>{
        const li = document.createElement("li");
        li.className = "task-item";
        const subject = `<b>${escapeHtml(t.subject||"")}</b>`;
        const content = escapeHtml(t.content || t.title || "");
        const hours = escapeHtml(String(t.hours || ""));
        li.innerHTML = `<div>${subject}: ${content} <span class="muted">(${hours} س)</span></div>`;
        const btn = document.createElement("button");
        btn.className = "btn small";
        btn.textContent = "✅ اكتمال";
        btn.addEventListener("click", ()=>{
          // علامه مكتمل
          t.done = true;
          t.completedAt = new Date().toISOString();
          // سجل في الأرشيف المتجر
          store.archive = store.archive || [];
          store.archive.push({ type:"task", date: dateKey, subject: t.subject, content: t.content || t.title || "", hours: t.hours || 0, completedAt: t.completedAt });
          persistStore();
          renderTasks(dateKey);
          renderArchive();
        });
        li.appendChild(btn);
        todayList.appendChild(li);
      });
    }

    // ---- رندرة الامتحانات ----
    function renderExams(dateKey){
      dateKey = dateKey || currentViewDate;
      ensureDay(dateKey);
      if(!examsArea) return;
      examsArea.innerHTML = "";
      const day = DATA[dateKey];
      if(!day.exams || day.exams.length === 0){
        examsArea.innerHTML = "<div class='muted'>لا توجد امتحانات لهذا اليوم.</div>";
        return;
      }
      day.exams.forEach((e, idx)=>{
        const div = document.createElement("div");
        div.className = "card";
        div.style.marginBottom = "8px";
        div.innerHTML = `<strong>${escapeHtml(e.subject||"")}</strong> — ${escapeHtml(e.title||"")}`;
        const btn = document.createElement("button");
        btn.className = "btn small";
        btn.textContent = "بدء الامتحان";
        btn.addEventListener("click", ()=> openExam(dateKey, idx));
        const wrap = document.createElement("div");
        wrap.style.marginTop = "6px";
        wrap.appendChild(btn);
        div.appendChild(wrap);
        examsArea.appendChild(div);
      });
    }

    // ---- مودال الامتحان ----
    let currentExamRef = null; // {date, index, exam}
    function openExam(dateKey, examIndex){
      ensureDay(dateKey);
      const examObj = DATA[dateKey].exams[examIndex];
      if(!examObj) return;
      currentExamRef = { date: dateKey, index: examIndex, exam: examObj };
      if(!examWindow || !examContent) return;

      // ensure questions array exists
      const questions = Array.isArray(examObj.questions) ? examObj.questions : [];
      examContent.innerHTML = ""; // empty
      // add title
      const titleEl = document.createElement("h3");
      titleEl.style.textAlign = "center";
      titleEl.style.color = "#007bff";
      titleEl.textContent = examObj.title || examObj.subject || "امتحان";
      examContent.appendChild(titleEl);

      if(questions.length === 0){
        const p = document.createElement("div");
        p.textContent = "لا توجد أسئلة في هذا الامتحان.";
        examContent.appendChild(p);
      } else {
        questions.forEach((q,i)=>{
          const qCard = document.createElement("div");
          qCard.className = "card exam-q";
          const qText = q.text || q.q || "";
          qCard.innerHTML = `<div><b>س${i+1}:</b> ${escapeHtml(qText)}</div>
            <input id="answer-${i}" class="ansInput" placeholder="اكتب إجابتك هنا" style="width:100%;margin-top:8px;"> 
            <div id="correct-${i}" class="muted small" style="display:none;margin-top:6px;">الإجابة النموذجية: ${escapeHtml(q.answer || q.a || "")}</div>`;
          examContent.appendChild(qCard);
        });
      }

      // show modal/window: try to use modal class if exists, else style display
      examWindow.classList.remove("section-hidden");
      examWindow.style.display = "block";
      // scroll top
      examWindow.scrollTop = 0;

      // bind submit
      if(submitExamBtn){
        submitExamBtn.onclick = submitCurrentExam;
      }
    }

    function submitCurrentExam(){
      if(!currentExamRef) return;
      const examObj = currentExamRef.exam;
      const dateKey = currentExamRef.date;
      const questions = Array.isArray(examObj.questions) ? examObj.questions : [];
      const totalScore = (examObj.type === "cumulative") ? 100 : (questions.length * 10 || 30);
      const perQ = questions.length > 0 ? (totalScore / questions.length) : totalScore;
      let scoreObtained = 0;
      const answersRecord = [];

      questions.forEach((q,i)=>{
        const userEl = document.getElementById(`answer-${i}`);
        const userAns = userEl ? (userEl.value || "").trim() : "";
        const model = q.answer || q.a || "";
        const qScore = smartScoreForAnswer(model, userAns, perQ);
        scoreObtained += qScore;
        answersRecord.push({ qid: q.id || `${examObj.id||'e'}-q${i}`, user: userAns, model: model, score: qScore });
        // reveal model
        const corr = document.getElementById(`correct-${i}`);
        if(corr) corr.style.display = "block";
      });

      scoreObtained = Math.round(scoreObtained);

      // save grade record in store
      store.grades = store.grades || [];
      store.grades.push({
        date: dateKey,
        subject: examObj.subject || examObj.title || "عام",
        title: examObj.title || "",
        score: scoreObtained,
        total: totalScore,
        recordedAt: new Date().toISOString(),
        answers: answersRecord
      });

      // save into archive too
      store.archive = store.archive || [];
      store.archive.push({ type: "exam", date: dateKey, subject: examObj.subject, title: examObj.title, recordedAt: new Date().toISOString() });

      persistStore();
      renderGrades();
      renderArchive();
      // close exam window
      if(examWindow){
        examWindow.style.display = "none";
        examWindow.classList.add("section-hidden");
      }
      // re-render exams/tasks (in case any UI dependent)
      renderExams(dateKey);
      renderTasks(dateKey);
      // offer manual actions: none here, but UI shows answers
      alert(`تم تصحيح الامتحان — النتيجة: ${scoreObtained} / ${totalScore}`);
    }

    // ---- إضافة واجب جديد من الواجهة ----
    if(saveTaskBtn){
      saveTaskBtn.addEventListener("click", ()=>{
        const subj = (document.getElementById("new_subject")||{}).value || "";
        const cont = (document.getElementById("new_content")||{}).value || "";
        const hrs = Number((document.getElementById("new_hours")||{}).value || 0);
        const date = (document.getElementById("new_date")||{}).value || "";
        if(!subj || !cont || !date || isNaN(hrs) || hrs <= 0){
          alert("يرجى تعبئة جميع حقول الإضافة بشكل صحيح.");
          return;
        }
        const id = `t-added-${date}-${Math.random().toString(36).slice(2,8)}`;
        const t = { id, subject: subj, content: cont, hours: hrs, done: false, createdAt: new Date().toISOString() };
        store.addedTasks = store.addedTasks || {};
        store.addedTasks[date] = store.addedTasks[date] || [];
        store.addedTasks[date].push(t);
        persistStore();
        // rebuild DATA and re-render
        buildData();
        renderTasks(date);
        alert("تمت إضافة الواجب.");
      });
    }

    // ---- رندرة الأرشيف (جدول) ----
    function renderArchive(){
      store.archive = store.archive || [];
      if(!archiveContent) return;
      if(store.archive.length === 0){
        archiveContent.innerHTML = "<div class='muted'>لا توجد مهام مؤرشفة.</div>";
        return;
      }
      let html = `<table class="table"><thead><tr><th>النوع</th><th>المادة</th><th>الوصف / العنوان</th><th>التاريخ</th></tr></thead><tbody>`;
      store.archive.forEach(a=>{
        const type = (a.type === "exam") ? "امتحان" : "واجب";
        const subj = escapeHtml(a.subject || "-");
        const title = escapeHtml(a.title || a.content || "-");
        const date = escapeHtml(a.date || (a.recordedAt ? a.recordedAt.split("T")[0] : ""));
        html += `<tr><td>${type}</td><td>${subj}</td><td style="text-align:left">${title}</td><td>${date}</td></tr>`;
      });
      html += `</tbody></table>`;
      archiveContent.innerHTML = html;
    }

    // ---- رندرة الدرجات (جدول مع تمييز الرسوب باللون الأحمر) ----
    function renderGrades(){
      store.grades = store.grades || [];
      if(!gradesContent) return;
      if(store.grades.length === 0){
        gradesContent.innerHTML = "<div class='muted'>لا توجد درجات حالياً.</div>";
        return;
      }
      let html = `<table class="table"><thead><tr><th>التاريخ</th><th>المادة</th><th>العنوان</th><th>الدرجة</th><th>المجموع</th><th>%</th></tr></thead><tbody>`;
      store.grades.forEach(g=>{
        const date = escapeHtml(g.date || (g.recordedAt ? g.recordedAt.split("T")[0] : ""));
        const subj = escapeHtml(g.subject || "-");
        const title = escapeHtml(g.title || "-");
        const score = Number(g.score || 0);
        const total = Number(g.total || g.total === 0 ? g.total : 100) || 100;
        const pct = Math.round((score / (total || 1)) * 100);
        const failClass = (pct < 50) ? "fail-row" : "";
        html += `<tr class="${failClass}"><td>${date}</td><td>${subj}</td><td style="text-align:left">${title}</td><td>${score}</td><td>${total}</td><td>${pct}%</td></tr>`;
      });
      html += `</tbody></table>`;
      gradesContent.innerHTML = html;
    }

    // ---- تصدير / إعادة ضبط ----
    if(exportBtn) exportBtn.addEventListener("click", ()=>{
      // export merged DATA (initial + user changes)
      buildData();
      const blob = new Blob([ "window.getInitialData = " + JSON.stringify(DATA, null, 2) ], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data_export.js";
      a.click();
      URL.revokeObjectURL(url);
    });

    if(resetBtn) resetBtn.addEventListener("click", ()=>{
      if(!confirm("هل تريد حذف جميع التعديلات المحلية (الأرشيف، الدرجات، الواجبات المضافة)؟")) return;
      store = { grades:[], archive:[], addedTasks:{}, overrides:{}, meta:{version:"1"} };
      persistStore();
      buildData();
      renderAll();
      alert("تمت إعادة الحالة الأولية (محليًا).");
    });

    // ---- زر إضافة درجة ----
    if(addGradeBtn) addGradeBtn.addEventListener("click", ()=>{
      const subj = prompt("اسم المادة (مثال: كيمياء):");
      if(!subj) return;
      const title = prompt("اسم الامتحان/الوصف:");
      const scoreRaw = prompt("الدرجة (رقم):");
      const score = Number(scoreRaw);
      if(isNaN(score)){ alert("قيمة الدرجة غير صحيحة."); return; }
      const totalRaw = prompt("المجموع الكلي (افتراضي 100):", "100");
      const total = Number(totalRaw) || 100;
      const date = prompt("التاريخ (YYYY-MM-DD) أو اتركه فارغًا ليكون اليوم:");
      const dateKey = date && date.trim() ? date.trim() : getTodayKey();
      store.grades = store.grades || [];
      store.grades.push({ date: dateKey, subject: subj, title: title || "يدوي", score, total, recordedAt: new Date().toISOString(), answers: [] });
      persistStore();
      renderGrades();
      alert("تمت إضافة الدرجة.");
    });

    // ---- تقارير و إحصائيات (Chart.js) ----
    let reportsChart = null;
    let statsChart = null;

    function renderReports(monthKey){ // monthKey = 'YYYY-MM'
      buildData();
      monthKey = monthKey || (getTodayKey().slice(0,7));
      // collect hours per subject for the month
      const subjectHours = {};
      Object.keys(DATA).forEach(d=>{
        if(d.slice(0,7) !== monthKey) return;
        (DATA[d].tasks || []).forEach(t=>{
          if(!t || !t.subject) return;
          subjectHours[t.subject] = (subjectHours[t.subject] || 0) + (Number(t.hours) || 0);
        });
      });
      const labels = Object.keys(subjectHours);
      const values = labels.map(l=>subjectHours[l]);

      if(reportCanvas){
        if(reportsChart) reportsChart.destroy();
        reportsChart = new Chart(reportCanvas.getContext("2d"), {
          type: "bar",
          data: { labels, datasets: [{ label: "ساعات هذا الشهر", data: values }] },
          options: { responsive: true, plugins:{ legend:{ display:false } } }
        });
      }

      // below: textual summary
      if(reportsContent){
        const summaryId = "report-summary";
        const old = document.getElementById(summaryId);
        if(old) old.remove();
        const div = document.createElement("div");
        div.id = summaryId;
        div.style.marginTop = "12px";
        div.innerHTML = `<h4>توضيح الساعات (${monthKey})</h4>`;
        if(labels.length === 0) div.innerHTML += `<div class='muted'>لا توجد ساعات مسجلة لهذا الشهر.</div>`;
        else {
          const ul = document.createElement("ul");
          labels.forEach((lab, idx)=>{
            const li = document.createElement("li");
            li.textContent = `${lab}: ${values[idx]} ساعة`;
            ul.appendChild(li);
          });
          div.appendChild(ul);
        }
        reportsContent.appendChild(div);
      }
    }

    // week start Thursday logic + stats for week (completed hours)
    function weekStartFor(dateObj){
      const copy = new Date(dateObj.getTime());
      const wd = copy.getDay(); // 0 Sun .. 6 Sat
      // target: Thursday (4)
      let delta = wd - 4;
      if(delta < 0) delta += 7;
      copy.setDate(copy.getDate() - delta);
      copy.setHours(0,0,0,0);
      return copy;
    }
    function renderStats(forDateKey){
      buildData();
      const todayKey = forDateKey || getTodayKey();
      const [y,m,d] = todayKey.split("-");
      const dt = new Date(Number(y), Number(m)-1, Number(d));
      const startDate = weekStartFor(dt);
      const endDate = new Date(startDate.getTime()); endDate.setDate(endDate.getDate() + 6);

      const subjectCompleted = {};
      // from store.archive and tasks done
      (store.archive || []).forEach(a=>{
        // a.completedAt or a.recordedAt or a.date
        const comp = a.completedAt || a.recordedAt || a.date;
        if(!comp) return;
        const compDate = new Date(comp.split("T")[0]);
        if(compDate >= startDate && compDate <= endDate){
          subjectCompleted[a.subject || "عام"] = (subjectCompleted[a.subject || "عام"] || 0) + (Number(a.hours) || 0);
        }
      });
      // also scan DATA tasks with done flag and completedAt
      Object.keys(DATA).forEach(dKey=>{
        (DATA[dKey].tasks || []).forEach(t=>{
          if(!t.done) return;
          const comp = t.completedAt ? t.completedAt.split("T")[0] : dKey;
          const compDate = new Date(comp);
          if(compDate >= startDate && compDate <= endDate){
            subjectCompleted[t.subject || "عام"] = (subjectCompleted[t.subject || "عام"] || 0) + (Number(t.hours) || 0);
          }
        });
      });

      const labels = Object.keys(subjectCompleted);
      const values = labels.map(l=>subjectCompleted[l]);

      if(statsCanvas){
        if(statsChart) statsChart.destroy();
        statsChart = new Chart(statsCanvas.getContext("2d"), {
          type: "doughnut",
          data: { labels, datasets: [{ data: values }] },
          options: { responsive: true, plugins:{ legend:{ position:'right' } } }
        });
      }

      // below: list
      const statsContainer = document.getElementById("statsContent");
      if(statsContainer){
        const summaryId = "stats-summary";
        const old = document.getElementById(summaryId);
        if(old) old.remove();
        const div = document.createElement("div");
        div.id = summaryId;
        div.style.marginTop = "12px";
        const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
        div.innerHTML = `<h4>ساعات هذا الأسبوع (من ${startDate.toISOString().split("T")[0]} إلى ${endKey})</h4>`;
        if(labels.length === 0) div.innerHTML += `<div class='muted'>لا توجد ساعات مكتملة هذا الأسبوع.</div>`;
        else {
          const ul = document.createElement("ul");
          labels.forEach((lab, idx)=>{
            const li = document.createElement("li");
            li.textContent = `${lab}: ${values[idx]} ساعة`;
            ul.appendChild(li);
          });
          div.appendChild(ul);
        }
        statsContainer.appendChild(div);
      }
    }

    // ---- navigation between sections (tabs) ----
    document.querySelectorAll(".navlink").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll("main > section").forEach(s => s.classList.add("section-hidden"));
        const id = btn.dataset.tab;
        const el = document.getElementById(id);
        if(el) el.classList.remove("section-hidden");
        // run updates
        if(id === "grades") renderGrades();
        if(id === "archive") renderArchive();
        if(id === "reports") renderReports();
        if(id === "stats") renderStats();
        // close sidebar after click
        closeSidebar();
      });
    });

    // ---- date controls ----
    if(todayBtn) todayBtn.addEventListener("click", ()=>{
      currentViewDate = getTodayKey();
      if(viewDate) viewDate.value = currentViewDate;
      renderTasks(currentViewDate);
      renderExams(currentViewDate);
    });
    if(goDate) goDate.addEventListener("click", ()=>{
      const val = (viewDate && viewDate.value) ? viewDate.value : "";
      if(!val){ alert("اختر تاريخًا أو اضغط 'اليوم'"); return; }
      currentViewDate = val;
      renderTasks(currentViewDate);
      renderExams(currentViewDate);
    });

    // ---- helper escapeHtml ----
    function escapeHtml(str){
      if(str === undefined || str === null) return "";
      return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    // ---- إعادة بناء البيانات و رندر كامل ----
    function renderAll(){
      buildData();
      renderTasks(currentViewDate);
      renderExams(currentViewDate);
      renderArchive();
      renderGrades();
      renderReports();
      renderStats();
    }
    // initial render
    renderAll();

    // expose small API for debug
    window._studyApp = {
      rebuild: ()=>{ buildData(); renderAll(); },
      store,
      save: ()=>{ persistStore(); },
      getData: ()=> DATA
    };
  }); // DOMContentLoaded end

})(); // IIFE end
