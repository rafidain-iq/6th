// script.js — النسخة النهائية (مهام + امتحانات + تقارير + درجات)

// ----------------------
// تحميل البيانات
// ----------------------
const STORAGE_KEY_DATA = "STUDY_DATA";
let DATA = loadData();
function loadData() {
  let local = localStorage.getItem(STORAGE_KEY_DATA);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("خطأ في قراءة التخزين المحلي", e);
    }
  }
  if (typeof window.getInitialData === "function") {
    return window.getInitialData();
  }
  return {};
}
function saveData() {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(DATA));
}

// ----------------------
// المتغيرات العامة
// ----------------------
let currentExam = null;
let GRADES = JSON.parse(localStorage.getItem("STUDY_GRADES") || "[]");

// ----------------------
// أدوات مساعدة
// ----------------------
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function todayStr() {
  return formatDate(new Date());
}

// ----------------------
// تحديث الواجهة
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

  // المهام
  dayData.tasks.forEach((t) => {
    let li = document.createElement("li");
    li.innerHTML = `<div><b>${t.subject}</b> — ${t.content}</div><div>${t.hours} س</div>`;
    todayEl.appendChild(li);
  });

  // الامتحانات
  dayData.exams.forEach((ex, idx) => {
    let btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "بدء " + ex.title;
    btn.onclick = () => openExam(dateStr, idx);
    examsArea.appendChild(btn);
  });
}

// ----------------------
// فتح الامتحان
// ----------------------
function openExam(dateStr, examIndex) {
  let ex = DATA[dateStr].exams[examIndex];
  currentExam = { dateStr, examIndex };

  document.getElementById("examTitleShow").textContent = ex.title;
  let qArea = document.getElementById("examQuestions");
  qArea.innerHTML = "";
  ex.questions.forEach((q, i) => {
    let div = document.createElement("div");
    div.className = "exam-question";
    div.innerHTML = `<div><b>س${i + 1}:</b> ${q.text}</div>
      <textarea data-qi="${i}" placeholder="أدخل إجابتك هنا"></textarea>`;
    qArea.appendChild(div);
  });

  document.getElementById("examModal").classList.remove("section-hidden");
  document.getElementById("examResult").innerHTML = "";
}

// ----------------------
// إغلاق الامتحان
// ----------------------
document.getElementById("closeExam").onclick = () => {
  document.getElementById("examModal").classList.add("section-hidden");
};

// ----------------------
// خوارزمية التشابه
// ----------------------
function normalize(txt) {
  return txt
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .trim();
}
function similarity(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (!a || !b) return 0;
  let longer = a.length > b.length ? a : b;
  let shorter = a.length > b.length ? b : a;
  let matches = 0;
  for (let ch of shorter) if (longer.includes(ch)) matches++;
  return matches / longer.length;
}

// ----------------------
// تصحيح الامتحان
// ----------------------
document.getElementById("submitExamBtn").onclick = () => {
  if (!currentExam) return;
  let { dateStr, examIndex } = currentExam;
  let ex = DATA[dateStr].exams[examIndex];

  let answers = [...document.querySelectorAll("#examQuestions textarea")];
  let total = ex.questions.length;
  let score = 0;
  let resultsHtml = "<h4>نتائج الامتحان</h4>";

  ex.questions.forEach((q, i) => {
    let userAns = answers[i].value.trim();
    let correct = q.answer;
    let sim = similarity(userAns, correct);

    let qScore = sim >= 0.8 ? 100 : sim >= 0.5 ? 70 : sim >= 0.3 ? 40 : 0;
    score += qScore;

    resultsHtml += `
      <div style="margin:8px 0">
        <b>س${i + 1}:</b> ${q.text}<br>
        <span style="color:blue">إجابتك:</span> ${userAns || "<i>فارغة</i>"}<br>
        <span style="color:green">النموذجية:</span> ${correct}<br>
        <span style="color:${qScore > 60 ? "green" : "red"}">درجة السؤال: ${qScore}/100</span>
      </div>`;
  });

  let finalScore = Math.round(score / total);
  resultsHtml =
    `<h3>الدرجة النهائية: ${finalScore} / 100</h3>` + resultsHtml;

  document.getElementById("examResult").innerHTML = resultsHtml;

  // حفظ الدرجة
  GRADES.push({
    date: dateStr,
    subject: ex.subject,
    title: ex.title,
    score: finalScore,
  });
  localStorage.setItem("STUDY_GRADES", JSON.stringify(GRADES));
  renderGrades();
};

// ----------------------
// عرض الدرجات
// ----------------------
function renderGrades() {
  let cont = document.getElementById("gradesContent");
  if (!cont) return;
  cont.innerHTML = "";
  if (GRADES.length === 0) {
    cont.innerHTML = "<p>لا توجد درجات مسجلة بعد.</p>";
    return;
  }
  let table = document.createElement("table");
  table.style.width = "100%";
  table.border = "1";
  table.innerHTML =
    "<tr><th>التاريخ</th><th>المادة</th><th>العنوان</th><th>الدرجة</th></tr>";
  GRADES.forEach((g) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.date}</td><td>${g.subject}</td><td>${g.title}</td><td>${g.score}</td>`;
    table.appendChild(tr);
  });
  cont.appendChild(table);
}

// ----------------------
// التنقل بين الأقسام
// ----------------------
document.querySelectorAll(".navlink").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll("main section")
      .forEach((s) => s.classList.add("section-hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("section-hidden");

    if (btn.dataset.tab === "grades") renderGrades();
    if (btn.dataset.tab === "reports") renderReports();
    if (btn.dataset.tab === "stats") renderStats();
    if (btn.dataset.tab === "archive") renderArchive();
  };
});

// ----------------------
// تقارير (مخططات دائرية)
// ----------------------
function renderReports() {
  let cont = document.getElementById("reportsContent");
  cont.innerHTML = "";

  if (GRADES.length === 0) {
    cont.innerHTML = "<p>لا توجد بيانات للعرض.</p>";
    return;
  }

  // حساب المتوسط لكل مادة
  let subjMap = {};
  GRADES.forEach((g) => {
    if (!subjMap[g.subject]) subjMap[g.subject] = [];
    subjMap[g.subject].push(g.score);
  });

  Object.keys(subjMap).forEach((subj) => {
    let avg =
      subjMap[subj].reduce((a, b) => a + b, 0) / subjMap[subj].length;

    let canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    let ctx = canvas.getContext("2d");

    // دائرة الخلفية
    ctx.beginPath();
    ctx.arc(75, 75, 70, 0, 2 * Math.PI);
    ctx.fillStyle = "#eee";
    ctx.fill();

    // نسبة
    ctx.beginPath();
    ctx.moveTo(75, 75);
    ctx.arc(75, 75, 70, -Math.PI / 2, (2 * Math.PI * avg) / 100 - Math.PI / 2);
    ctx.lineTo(75, 75);
    ctx.fillStyle = "#4caf50";
    ctx.fill();

    // نص
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(subj, 75, 70);
    ctx.fillText(Math.round(avg) + "%", 75, 90);

    let box = document.createElement("div");
    box.style.display = "inline-block";
    box.style.margin = "10px";
    box.appendChild(canvas);
    cont.appendChild(box);
  });
}

// ----------------------
// إحصائيات بسيطة
// ----------------------
function renderStats() {
  let cont = document.getElementById("statsContent");
  cont.innerHTML = "";
  cont.innerHTML = `<p>عدد الدرجات المسجلة: ${GRADES.length}</p>`;
}

// ----------------------
// الأرشيف (مواد مكتملة)
// ----------------------
function renderArchive() {
  let cont = document.getElementById("archiveContent");
  cont.innerHTML = "<p>لم يتم تفعيل الأرشيف بعد.</p>";
}

// ----------------------
// إضافة واجب جديد
// ----------------------
document.getElementById("saveTask").onclick = () => {
  let subj = document.getElementById("new_subject").value;
  let cont = document.getElementById("new_content").value;
  let hrs = Number(document.getElementById("new_hours").value);
  let date = document.getElementById("new_date").value;
  if (!subj || !cont || !date) return alert("أكمل الحقول");

  if (!DATA[date]) DATA[date] = { tasks: [], exams: [] };
  DATA[date].tasks.push({ subject: subj, content: cont, hours: hrs });
  saveData();
  alert("تم الحفظ");
};

// ----------------------
// أزرار التاريخ
// ----------------------
document.getElementById("todayBtn").onclick = () => {
  let t = todayStr();
  renderToday(t);
};
document.getElementById("goDate").onclick = () => {
  let d = document.getElementById("viewDate").value;
  if (d) renderToday(d);
};

// ----------------------
// تحميل أولي
// ----------------------
renderToday(todayStr());
