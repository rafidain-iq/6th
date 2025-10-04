// script.js — إصلاح شامل للقائمة الجانبية، زر "تم"، ومودال الامتحان
(function(){
  // ---------- إعداد و تحميل البيانات ----------
  const STORAGE_KEY = "study-data";
  const ARCHIVE_KEY = "study-archive";
  const GRADES_KEY  = "study-grades";

  const initial = (typeof window.getInitialData === "function") ? window.getInitialData() : {};
  // clone initial to avoid mutating original
  function deepClone(obj){ return JSON.parse(JSON.stringify(obj || {})); }

  // تحميل من localStorage أو من data.js
  let DATA = (() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      try { const parsed = JSON.parse(raw); return parsed; }
      catch(e){ return deepClone(initial); }
    }
    return deepClone(initial);
  })();

  // ضمان وجود بنية صحيحة وإعطاء ids عند الحاجة
  function ensureIds(data){
    Object.keys(data).forEach(date=>{
      const day = data[date];
      if(!day) return;
      if(!Array.isArray(day.tasks)) day.tasks = [];
      if(!Array.isArray(day.exams)) day.exams = [];
      day.tasks.forEach((t,i)=>{
        if(!t.id) t.id = `t-${date}-${i}-${Math.random().toString(36).slice(2,6)}`;
        if(t.done === undefined) t.done = false;
      });
      day.exams.forEach((e,i)=>{
        if(!e.id) e.id = `e-${date}-${i}-${Math.random().toString(36).slice(2,6)}`;
        if(!Array.isArray(e.questions)) e.questions = [];
        e.questions.forEach((q,qi)=>{
          if(!q.id) q.id = `${e.id}-q${qi}`;
        });
      });
    });
  }
  ensureIds(DATA);

  // helpers
  function saveAll(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  }
  function loadArchive(){ return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]"); }
  function saveArchive(arr){ localStorage.setItem(ARCHIVE_KEY, JSON.stringify(arr)); }
  function loadGrades(){ return JSON.parse(localStorage.getItem(GRADES_KEY) || "[]"); }
  function saveGrades(g){ localStorage.setItem(GRADES_KEY, JSON.stringify(g)); }

  function todayISO(dateObj){
    const d = dateObj ? new Date(dateObj) : new Date();
    return d.toISOString().split("T")[0];
  }

  // ---------- عناصر DOM ----------
  document.addEventListener("DOMContentLoaded", ()=>{
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const todayList = document.getElementById("todayList");
    const examsArea = document.getElementById("examsArea");
    const todayDateEl = document.getElementById("todayDate");
    const viewDate = document.getElementById("viewDate");
    const todayBtn = document.getElementById("todayBtn");
    const goDate = document.getElementById("goDate");
    const saveTaskBtn = document.getElementById("saveTask");
    const exportBtn = document.getElementById("exportBtn");
    const resetBtn = document.getElementById("resetBtn");
    const gradesContent = document.getElementById("gradesContent");
    const archiveContent = document.getElementById("archiveContent");
    const statsCanvas = document.getElementById("statsChart");
    const addGradeBtn = document.getElementById("addGradeBtn");

    const examModal = document.getElementById("examModal");
    const examTitleShow = document.getElementById("examTitleShow");
    const examQuestions = document.getElementById("examQuestions");
    const examResult = document.getElementById("examResult");
    const submitExamBtn = document.getElementById("submitExamBtn");
    const closeExamBtn = document.getElementById("closeExam");

    // عرض/إخفاء الشريط الجانبي بثبات
    function openSidebar(){
      sidebar.classList.add("open");
      sidebar.setAttribute("aria-hidden","false");
      overlay.classList.add("show");
      overlay.setAttribute("aria-hidden","false");
      // focus trap small: focus first navlink if exists
      const first = sidebar.querySelector(".navlink, button");
      if(first) first.focus();
    }
    function closeSidebar(){
      sidebar.classList.remove("open");
      sidebar.setAttribute("aria-hidden","true");
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden","true");
    }

    menuBtn && menuBtn.addEventListener("click", ()=>{
      if(sidebar.classList.contains("open")) closeSidebar(); else openSidebar();
    });
    overlay && overlay.addEventListener("click", closeSidebar);

    // Navigation links (show/hide sections)
    document.querySelectorAll(".navlink").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll("main > section").forEach(s=> s.classList.add("section-hidden"));
        const tab = btn.dataset.tab;
        const section = document.getElementById(tab);
        if(section) section.classList.remove("section-hidden");
        closeSidebar();
        // after opening, update dynamic parts
        if(tab === "grades") renderGrades();
        if(tab === "archive") renderArchive();
        if(tab === "reports") renderReports();
        if(tab === "stats") renderStats();
      });
    });

    // تاريخ العرض الافتراضي = اليوم
    viewDate.value = todayISO();
    function currentKey(){ return viewDate.value || todayISO(); }

    // ---------- رندر اللوحة (الواجبات + الامتحانات) ----------
    function renderDashboard(dateKey){
      todayDateEl.textContent = dateKey;
      todayList.innerHTML = "";
      examsArea.innerHTML = "";

      const day = DATA[dateKey];
      const tasks = (day && Array.isArray(day.tasks)) ? day.tasks : [];

      if(tasks.length === 0){
        todayList.innerHTML = `<li>لا توجد مهام لهذا اليوم</li>`;
      } else {
        tasks.forEach(t=>{
          // إذا كان موجود done=true نتجاهله من العرض (نقل للأرشيف يكون مفصول)
          if(t.done) return;
          const li = document.createElement("li");
          li.className = "task-row";
          li.innerHTML = `<div class="task-text"><b>${escapeHtml(t.subject)}</b>: ${escapeHtml(t.content)} <span class="muted">(${t.hours} ساعة)</span></div>`;
          const btn = document.createElement("button");
          btn.className = "btn small done-btn";
          btn.title = "تم الإنجاز";
          btn.textContent = "✔";
          btn.addEventListener("click", ()=>{
            // عند الضغط: علم المهمة كمكتملة، احفظ وأنقل للأرشيف، وأزل من العرض
            t.done = true;
            // أضف للأرشيف
            const archive = loadArchive();
            archive.push(Object.assign({date: dateKey}, t));
            saveArchive(archive);
            saveAll();
            // إعادة عرض نفس اليوم (أو إزالة العنصر)
            renderDashboard(dateKey);
          });
          li.appendChild(btn);
          todayList.appendChild(li);
        });
      }

      // الامتحانات
      const exams = (day && Array.isArray(day.exams)) ? day.exams : [];
      if(exams.length === 0){
        examsArea.innerHTML = `<div>لا توجد امتحانات لهذا اليوم</div>`;
      } else {
        exams.forEach((ex, idx)=>{
          const eDiv = document.createElement("div");
          eDiv.className = "exam-card-mini";
          eDiv.innerHTML = `<strong>${escapeHtml(ex.subject)}</strong> — ${escapeHtml(ex.title)} `;
          const start = document.createElement("button");
          start.className = "btn small";
          start.textContent = "بدء الامتحان";
          start.addEventListener("click", ()=> openExam(dateKey, idx));
          eDiv.appendChild(start);
          examsArea.appendChild(eDiv);
        });
      }
    }

    // ---------- مودال الامتحان (قابل للتمرير) ----------
    function openExam(dateKey, exIdx){
      const exam = DATA[dateKey].exams[exIdx];
      if(!exam) return;
      examTitleShow.textContent = `${exam.subject} — ${exam.title}`;
      examQuestions.innerHTML = "";
      examResult.innerHTML = "";

      // اجعل المودال قابل للتمرير جيداً
      const modalInner = examModal.querySelector(".modal-inner");
      if(modalInner){
        modalInner.style.maxHeight = "70vh";
        modalInner.style.overflowY = "auto";
      }

      // بناء الحقول
      exam.questions.forEach((q,i)=>{
        const qwrap = document.createElement("div");
        qwrap.className = "exam-question";
        qwrap.innerHTML = `<div class="q-text"><b>س${i+1}:</b> ${escapeHtml(q.text)}</div>`;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "answer-input";
        input.dataset.correct = q.answer || "";
        input.placeholder = "أدخل إجابتك هنا";
        qwrap.appendChild(input);
        examQuestions.appendChild(qwrap);
      });

      // إظهار المودال
      examModal.classList.remove("section-hidden");
      overlay.classList.add("show");
      overlay.setAttribute("aria-hidden","false");

      // submit handler (ننشئ جديد كل مرة)
      submitExamBtn.onclick = ()=>{
        // جمع النتائج
        const inputs = examQuestions.querySelectorAll("input.answer-input");
        let totalScore = 0;
        let totalMax = exam.questions.length * 10;
        let detailsHtml = "";

        inputs.forEach((inp, i)=>{
          const user = (inp.value || "").trim();
          const correct = inp.dataset.correct || "";
          const ok = smartScore(correct, user);
          const score = ok ? 10 : 0;
          totalScore += score;
          detailsHtml += `<div class="result-row"><div><b>السؤال ${i+1}:</b> ${escapeHtml(exam.questions[i].text)}</div>
            <div>إجابتك: ${escapeHtml(user)}</div>
            <div>النموذجية: ${escapeHtml(correct)}</div>
            <div>الدرجة: ${score}/10</div></div><hr>`;
        });

        // عرض النتيجة بطريقة قابلة للطي (details) لتفادي طول الصفحة
        examResult.innerHTML = `<div class="exam-summary"><h3>النتيجة: ${totalScore}/${totalMax}</h3>
          <details><summary>عرض التفاصيل</summary>${detailsHtml}</details></div>`;

        // حفظ الدرجة
        const grades = loadGrades();
        grades.push({ date: dateKey, subject: exam.subject, title: exam.title, score: totalScore, max: totalMax, recordedAt: new Date().toISOString() });
        saveGrades(grades);
        // تحديث واجهة الدرجات
        renderGrades();

        // لا نقوم بإغلاق المودال تلقائياً — المستخدم يقدر يشاهد النتائج ثم يغلق
      };

      closeExamBtn.onclick = ()=>{
        examModal.classList.add("section-hidden");
        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden","true");
      };
    }

    // ---------- دالة الذكاء البسيط للتصحيح ----------
    function normalize(s){
      return (s||"").toString().replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g,"").replace(/[^\wء-ي\s]/g," ").replace(/\s+/g," ").trim().toLowerCase();
    }
    function smartScore(correct, user){
      // قبول حالات تطابق حرفية
      const a = normalize(user);
      const b = normalize(correct);
      if(!b) return false; // لا توجد إجابة نموذجية -> لا تصحح
      if(a === b) return true;
      // مقارنة كلمات: إذا احتوى المستخدم على معظم مفردات الإجابة النموذجية => صحيح
      const bw = b.split(" ").filter(Boolean);
      const aw = a.split(" ").filter(Boolean);
      if(bw.length === 0) return false;
      let matched = 0;
      const setA = new Set(aw);
      bw.forEach(w=>{ if(setA.has(w)) matched++; });
      if(matched / bw.length >= 0.6) return true; // 60% مطابقة كلمات
      // اختلاف طفيف: فرق كلمة أو كلمتين مقبول
      if(Math.abs(aw.length - bw.length) <= 2 && bw.every(w=> aw.includes(w) || w.length<=2)) return true;
      // مجموعة مرادفات صغيرة (قابلة للتوسع)
      const synonymsGroups = [["مشتركة","متشابهة","قريبة"], ["سبب","علّة","دافع"], ["خاصية","ميزة","سمه"]];
      for(const grp of synonymsGroups){
        if(grp.some(x=>a.includes(x)) && grp.some(x=>b.includes(x))) return true;
      }
      return false;
    }

    // ---------- رندرة الدرجات والأرشيف والإحصائيات ----------
    function renderGrades(){
      const gradesDiv = gradesContent || document.getElementById("gradesContent");
      const grades = loadGrades();
      if(!grades.length){
        gradesDiv.innerHTML = "لا توجد بيانات درجات حالياً.";
        return;
      }
      gradesDiv.innerHTML = "";
      grades.slice().reverse().forEach(g=>{
        const el = document.createElement("div");
        el.className = "grade-row";
        el.innerHTML = `<div><b>${escapeHtml(g.subject)}</b> — ${escapeHtml(g.title)}</div>
          <div class="muted small">${escapeHtml(g.date)} — ${g.score}/${g.max}</div>`;
        gradesDiv.appendChild(el);
      });
    }

    function renderArchive(){
      const ar = loadArchive();
      const el = archiveContent || document.getElementById("archiveContent");
      if(!ar.length){ el.innerHTML = "لا توجد مهام مؤرشفة حالياً."; return; }
      el.innerHTML = "";
      ar.slice().reverse().forEach(item=>{
        const d = document.createElement("div");
        d.className = "arch-row";
        d.innerHTML = `<div><b>${escapeHtml(item.subject)}</b> — ${escapeHtml(item.content)} <span class="muted">(${escapeHtml(String(item.hours||0))} س)</span></div>
          <div class="muted small">${escapeHtml(item.date)}</div>`;
        el.appendChild(d);
      });
    }

    // تقارير/احصائيات بسيطة: ساعات المواد (مكتملة فقط)
    function renderStats(){
      // بناء dataset
      const subjectHours = {};
      Object.keys(DATA).forEach(date=>{
        const day = DATA[date];
        if(!day || !day.tasks) return;
        day.tasks.forEach(t=>{
          if(t.done){
            subjectHours[t.subject] = (subjectHours[t.subject]||0) + (Number(t.hours)||0);
          }
        });
      });
      // إذا فيه canvas
      const canvas = statsCanvas || document.getElementById("statsChart");
      if(!canvas) return;
      // destroy previous chart if any
      if(window._studyChart) window._studyChart.destroy();
      const ctx = canvas.getContext("2d");
      window._studyChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(subjectHours), datasets: [{ data: Object.values(subjectHours), backgroundColor: generateColors(Object.keys(subjectHours).length) }] },
        options: { responsive:true, plugins:{legend:{position:'bottom'}} }
      });
    }

    function generateColors(n){
      const palette = ['#2f3e46','#1f78b4','#ffd54f','#8fddc7','#ff8a65','#9fa8da','#c5e1a5','#ffcc80','#b39ddb','#80cbc4'];
      return Array.from({length:n}, (_,i)=> palette[i % palette.length]);
    }

    // ---------- إضافة واجب جديد ----------
    saveTaskBtn && saveTaskBtn.addEventListener("click", ()=>{
      const subj = document.getElementById("new_subject").value.trim();
      const cont = document.getElementById("new_content").value.trim();
      const hrs = parseFloat(document.getElementById("new_hours").value) || 0;
      const date = document.getElementById("new_date").value;
      if(!subj || !cont || !date){ alert("يرجى تعبئة الحقول"); return; }
      if(!DATA[date]) DATA[date] = { tasks: [], exams: [] };
      const id = `t-${date}-${Math.random().toString(36).slice(2,8)}`;
      DATA[date].tasks.push({ id, subject: subj, content: cont, hours: hrs, done:false });
      ensureIds(DATA); // يضمن الحقول
      saveAll();
      // عرض اليوم الذي تم اختيار التاريخ له مباشرة
      viewDate.value = date;
      renderDashboard(date);
      // نظف الحقول
      document.getElementById("new_subject").value = "";
      document.getElementById("new_content").value = "";
    });

    // ---------- زر تصدير data.js (ينشئ ملف js بسيط) ----------
    exportBtn && exportBtn.addEventListener("click", ()=>{
      const js = "window.getInitialData = " + JSON.stringify(DATA, null, 2) + ";";
      const blob = new Blob([js], {type:"application/javascript"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      a.click();
      URL.revokeObjectURL(url);
    });

    // ---------- زر إعادة الحالة الأولية ----------
    resetBtn && resetBtn.addEventListener("click", ()=>{
      if(confirm("إعادة الحالة الأولية ستحذف التعديلات المحلية. هل تريد المتابعة؟")){
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ARCHIVE_KEY);
        localStorage.removeItem(GRADES_KEY);
        location.reload();
      }
    });

    // ---------- زر إضافة درجات (نموذج مبسط) ----------
    addGradeBtn && addGradeBtn.addEventListener("click", ()=>{
      const subject = prompt("أدخل اسم المادة:");
      if(!subject) return;
      const title = prompt("أدخل عنوان الدرجة (مثال: امتحان 1):") || "درجة جديدة";
      const score = parseFloat(prompt("أدخل الدرجة (عدد)")) || 0;
      const max = parseFloat(prompt("أدخل الحد الأقصى (مثال: 30)")) || 100;
      const date = prompt("أدخل التاريخ (YYYY-MM-DD) أو اتركه لليوم:") || todayISO();
      const grades = loadGrades();
      grades.push({ date, subject, title, score, max, recordedAt: new Date().toISOString() });
      saveGrades(grades);
      alert("تمت إضافة الدرجة.");
      renderGrades();
    });

    // ---------- عرض الدرجات والأرشيف عند البدء ----------
    function renderGrades(){ // small wrapper
      const el = gradesContent || document.getElementById("gradesContent");
      const grades = loadGrades();
      if(!grades.length){ el.innerHTML = "لا توجد بيانات درجات حالياً."; return; }
      el.innerHTML = grades.slice().reverse().map(g=> `<div class="grade-row"><b>${escapeHtml(g.subject)}</b> — ${escapeHtml(g.title)} : ${g.score}/${g.max} <div class="muted small">${escapeHtml(g.date)}</div></div>`).join("");
    }

    function renderArchive(){ // wrapper call once
      const el = archiveContent || document.getElementById("archiveContent");
      const ar = loadArchive();
      if(!ar.length){ el.innerHTML = "لا توجد مهام مؤرشفة حالياً."; return; }
      el.innerHTML = ar.slice().reverse().map(i=> `<div class="arch-row"><b>${escapeHtml(i.subject)}</b> — ${escapeHtml(i.content)} <span class="muted">(${escapeHtml(String(i.hours||0))} س)</span><div class="muted small">${escapeHtml(i.date)}</div></div>`).join("");
    }

    // ---------- عرض التقارير بسيطة ----------
    function renderReports(){
      // for now, reuse renderStats
      renderStats();
    }

    // ---------- التحديثات العامة عند تحميل الصفحة ----------
    // عرض اليوم الحالي افتراضياً
    renderDashboard(currentKey());
    renderGrades();
    renderArchive();
    renderStats();

    // أزرار التاريخ
    todayBtn && todayBtn.addEventListener("click", ()=>{
      viewDate.value = todayISO();
      renderDashboard(currentKey());
    });
    goDate && goDate.addEventListener("click", ()=> renderDashboard(currentKey()));

    // small utility
    function escapeHtml(str){
      if(str === undefined || str === null) return "";
      return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
    }

    // exposed functions (for debugging if needed)
    window._study = { DATA, saveAll, renderDashboard, renderGrades, renderArchive, renderStats };
  }); // DOMContentLoaded end

})(); // IIFE end
