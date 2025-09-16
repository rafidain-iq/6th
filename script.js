// ----------------------
// تحميل وتخزين البيانات
// ----------------------
const STORAGE_KEY_DATA = "STUDY_DATA";
let DATA = loadData();
let GRADES = JSON.parse(localStorage.getItem("STUDY_GRADES") || "[]");

function loadData() {
  let local = localStorage.getItem(STORAGE_KEY_DATA);
  if (local) {
    try { return JSON.parse(local); }
    catch (e) { console.error("خطأ في قراءة التخزين المحلي", e); }
  }
  if (typeof window.getInitialData === "function") return window.getInitialData();
  return {};
}
function saveData() {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(DATA));
}
function saveGrades() {
  localStorage.setItem("STUDY_GRADES", JSON.stringify(GRADES));
}

// ----------------------
// تحديث عرض اليوم
// ----------------------
function renderToday(dateStr) {
  let todayEl = document.getElementById("todayList");
  let examsArea = document.getElementById("examsArea");
  todayEl.innerHTML = "";
  examsArea.innerHTML = "";
  document.getElementById("todayDate").textContent = dateStr;

  let dayData = DATA[dateStr];
  if (!dayData) {
    todayEl.innerHTML = "<li>لا توجد مهام</li>";
    return;
  }

  // عرض المهام
  dayData.tasks.forEach((t, idx) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <div><b>${t.subject}</b> — ${t.content}</div>
      <div>
        ${t.hours} س 
        <button class="btn small completeBtn" data-date="${dateStr}" data-idx="${idx}">
          ${t.done ? "✓ مكتمل" : "إكمال"}
        </button>
      </div>`;
    if (t.done) li.style.opacity = "0.5";
    todayEl.appendChild(li);
  });

  // ربط أزرار الإكمال
  document.querySelectorAll(".completeBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      let d = e.target.dataset.date;
      let i = e.target.dataset.idx;
      DATA[d].tasks[i].done = !DATA[d].tasks[i].done;
      saveData();
      renderToday(d);
    });
  });

  // عرض الامتحانات
  if (dayData.exams) {
    dayData.exams.forEach((ex, idx) => {
      let div = document.createElement("div");
      div.innerHTML = `
        <div class="card" style="margin-top:10px">
          <b>${ex.title}</b>
          <button class="btn small" onclick="startExam('${dateStr}',${idx})">بدء الامتحان</button>
        </div>`;
      examsArea.appendChild(div);
    });
  }
}

// ----------------------
// الامتحانات
// ----------------------
let currentExam = null;

function startExam(dateStr, idx) {
  currentExam = { dateStr, idx };
  let exam = DATA[dateStr].exams[idx];

  document.getElementById("examTitleShow").textContent = exam.title;
  let qArea = document.getElementById("examQuestions");
  qArea.innerHTML = "";

  exam.questions.forEach((q, i) => {
    let div = document.createElement("div");
    div.className = "exam-question";
    div.innerHTML = `
      <div><b>س${i + 1}:</b> ${q.q}</div>
      <input type="text" id="ans_${i}" placeholder="إجابتك هنا">`;
    qArea.appendChild(div);
  });

  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("examResult").innerHTML = "";
}

document.getElementById("closeExam").addEventListener("click", () => {
  document.getElementById("examModal").classList.add("section-hidden");
});

document.getElementById("submitExamBtn").addEventListener("click", () => {
  if (!currentExam) return;
  let { dateStr, idx } = currentExam;
  let exam = DATA[dateStr].exams[idx];
  let correct = 0;
  let answersShow = "<h4>الأجوبة النموذجية:</h4><ul>";

  exam.questions.forEach((q, i) => {
    let userAns = document.getElementById("ans_" + i).value.trim();
    let modelAns = q.a.trim();
    answersShow += `<li>س${i + 1}: <b>${modelAns}</b> — إجابتك: ${userAns}</li>`;
    if (userAns && modelAns && userAns === modelAns) correct++;
  });

  let score = Math.round((correct / exam.questions.length) * 100);
  answersShow += "</ul>";

  document.getElementById("examResult").innerHTML =
    `<div><b>نتيجتك: ${score}/100</b></div>` + answersShow;

  // حفظ في سجل الدرجات
  GRADES.push({
    title: exam.title,
    date: dateStr,
    score: score
  });
  saveGrades();
});

// ----------------------
// سجل الدرجات
// ----------------------
function renderGrades() {
  let gEl = document.getElementById("gradesContent");
  gEl.innerHTML = "";
  if (GRADES.length === 0) {
    gEl.textContent = "لا توجد درجات مسجلة";
    return;
  }
  let table = document.createElement("table");
  table.style.width = "100%";
  table.border = "1";
  table.innerHTML = "<tr><th>التاريخ</th><th>الامتحان</th><th>الدرجة</th></tr>";
  GRADES.forEach(g => {
    table.innerHTML += `<tr><td>${g.date}</td><td>${g.title}</td><td>${g.score}/100</td></tr>`;
  });
  gEl.appendChild(table);
}

// ----------------------
// القائمة الجانبية
// ----------------------
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// ----------------------
// التنقل بين التبويبات
// ----------------------
document.querySelectorAll(".navlink").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("main section").forEach(sec => sec.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    if (btn.dataset.tab === "grades") renderGrades();
  });
});

// ----------------------
// عند التشغيل
// ----------------------
let todayStr = new Date().toISOString().split("T")[0];
renderToday(todayStr);
document.getElementById("viewDate").value = todayStr;
document.getElementById("todayBtn").addEventListener("click", () => {
  let d = new Date().toISOString().split("T")[0];
  renderToday(d);
  document.getElementById("viewDate").value = d;
});
document.getElementById("goDate").addEventListener("click", () => {
  let d = document.getElementById("viewDate").value;
  if (d) renderToday(d);
});
