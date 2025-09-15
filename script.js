// script.js

// مفاتيح التخزين
const STORAGE_KEY_MAIN = "study-data";
const STORAGE_KEY_ARCHIVE = "study-archive";

// تحميل بيانات أولية أو من localStorage
let DATA = JSON.parse(localStorage.getItem(STORAGE_KEY_MAIN)) || window.getInitialData();

// --- حفظ ---
function saveAll() {
  localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(DATA));
}

// --- تحميل آمن ---
function safeParse(str, def) {
  try {
    return str ? JSON.parse(str) : def;
  } catch {
    return def;
  }
}

// ========== المهام ==========
function markTaskDone(dateIso, id) {
  if (!DATA[dateIso]) return;
  const arr = DATA[dateIso].tasks || [];
  const index = arr.findIndex(x => x.id === id);
  if (index === -1) return false;

  // عدل الحالة
  arr[index].done = true;

  // أضف نسخة للأرشيف
  const archive = safeParse(localStorage.getItem(STORAGE_KEY_ARCHIVE), []);
  archive.push({
    ...arr[index],
    completedAt: new Date().toISOString(),
    originDate: dateIso
  });
  localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(archive));

  // حفظ وتحديث العرض
  saveAll();
  renderDashboard(dateIso);
  renderArchive();
  renderReports();
  renderStats();
  renderGrades();
  return true;
}

// ========== العرض ==========
function renderDashboard(dateIso) {
  const day = DATA[dateIso];
  const container = document.getElementById("dashboard");
  if (!container || !day) return;

  container.innerHTML = `
    <h2>المهام اليومية (${dateIso})</h2>
    <ul class="tasks-list">
      ${day.tasks.filter(t => !t.done).map(t => `
        <li>
          <div>
            <b>${t.subject}</b>: ${t.content} 
            <span class="muted">(${t.hours} ساعة)</span>
          </div>
          <button class="btn small" onclick="markTaskDone('${dateIso}','${t.id}')">✅</button>
        </li>
      `).join("")}
    </ul>

    <h2>امتحانات اليوم</h2>
    ${day.exams.map(ex => `
      <div class="exam-card card">
        <h3>${ex.subject} - ${ex.title}</h3>
        <div>
          ${ex.questions.map((q,i) => `
            <div class="exam-question">
              <b>س${i+1}:</b> ${q.text}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("")}
  `;
}

// باقي التبويبات (نفس البنية البسيطة، انت تقدر توسعها)
function renderArchive(){
  const container = document.getElementById("archive");
  if(!container) return;
  const archive = safeParse(localStorage.getItem(STORAGE_KEY_ARCHIVE), []);
  container.innerHTML = `
    <h2>الأرشيف</h2>
    <ul class="tasks-list">
      ${archive.map(a => `
        <li>
          <div>
            <b>${a.subject}</b>: ${a.content}
            <span class="muted">(أنجز في ${a.completedAt.slice(0,10)})</span>
          </div>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderReports(){
  const container = document.getElementById("reports");
  if(!container) return;
  container.innerHTML = `<h2>التقارير</h2><p>قيد التطوير...</p>`;
}

function renderStats(){
  const container = document.getElementById("stats");
  if(!container) return;
  container.innerHTML = `<h2>الإحصائيات</h2><p>قيد التطوير...</p>`;
}

function renderGrades(){
  const container = document.getElementById("grades");
  if(!container) return;
  container.innerHTML = `<h2>الدرجات</h2><p>قيد التطوير...</p>`;
}

// ========== التنقل ==========
function showSection(id){
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("section-hidden"));
  document.getElementById(id).classList.remove("section-hidden");
}

// ========== تشغيل مبدئي ==========
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().slice(0,10);
  if(DATA[today]){
    renderDashboard(today);
  }
  renderArchive();
  renderReports();
  renderStats();
  renderGrades();
});
