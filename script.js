// script.js — النسخة النهائية المتكاملة والمعدلة
// تخزين المفاتيح
const STORAGE_KEY_DATA = 'STUDY_DATA_FINAL_V1';
const STORAGE_KEY_RESULTS = 'STUDY_RESULTS_FINAL_V1';
const STORAGE_KEY_ARCHIVE = 'STUDY_ARCHIVE_FINAL_V1';
const STORAGE_KEY_LASTVIEW = 'STUDY_LAST_VIEW_FINAL_V1';

// تاريخ اليوم بصيغة ISO YYYY-MM-DD
const todayIsoReal = new Date().toISOString().split('T')[0];

// مساعدة صغيرة
function safeParse(s, fallback){ try{ return JSON.parse(s); } catch(e){ return fallback; } }
function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(s){ return String(s||''); }
function normalizeText(s){ return String(s||'').toLowerCase().trim(); }

// ---- تحميل بيانات البداية (من localStorage أو من data.js via getInitialData) ----
let DATA = safeParse(localStorage.getItem(STORAGE_KEY_DATA), null);
if(!DATA){
  if(typeof window.getInitialData === 'function') DATA = window.getInitialData();
  else DATA = {};
}
let RESULTS = safeParse(localStorage.getItem(STORAGE_KEY_RESULTS), []);
if(!Array.isArray(RESULTS)) RESULTS = [];
if(!safeParse(localStorage.getItem(STORAGE_KEY_ARCHIVE), null)) localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify([]));

// ---- حفظ البيانات (debounced lite) ----
let _saveTimer = null;
function saveAll(){
  if(_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(()=>{
    try{
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(DATA));
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(RESULTS));
    }catch(e){
      console.error('save error', e);
    } finally { _saveTimer = null; }
  }, 150);
}

// ---- عرض وإخفاء الأقسام ----
function showSection(id){
  const sections = ['dashboard','reports','grades','stats','archive','add'];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if(!el) return;
    if(s === id) el.classList.remove('section-hidden'); else el.classList.add('section-hidden');
  });
}

// ---- تحديد التاريخ الابتدائي ----
function pickInitialDate(){
  const last = localStorage.getItem(STORAGE_KEY_LASTVIEW);
  if(last) return last;
  if(DATA && DATA[todayIsoReal]) return todayIsoReal;
  return todayIsoReal;
}

// ---- عرض لوحة اليوم ----
function renderDashboard(dateIso){
  if(!dateIso) dateIso = pickInitialDate();
  try{ localStorage.setItem(STORAGE_KEY_LASTVIEW, dateIso); } catch(e){}

  const todayLabel = document.getElementById('todayDate');
  if(todayLabel) todayLabel.innerText = dateIso;

  const ul = document.getElementById('todayList');
  const examsArea = document.getElementById('examsArea');
  if(ul) ul.innerHTML = '';
  if(examsArea) examsArea.innerHTML = '';

  const day = DATA[dateIso] || { tasks: [], exams: [] };

  // عرض المهام (غير المكتملة فقط)
  const tasks = (day.tasks || []).filter(t => !t.done);
  if(!ul) console.warn('todayList element not found');
  if(tasks.length === 0){
    if(ul) ul.innerHTML = `<li style="padding:10px;color:#666">لا توجد مهام لهذا اليوم.</li>`;
  } else {
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.style.padding = '10px';
      li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${esc(t.subject || t.title || 'مادة')}</strong>
          <div style="font-size:13px;color:#444">${esc(t.content || t.text || t.title || '')} ${t.hours ? ' • ' + t.hours + ' س' : ''}</div>
        </div>
        <div>
          <button class="btn mark-done" data-id="${t.id}">✅ إكمال</button>
        </div>
      </div>`;
      ul.appendChild(li);
    });
    // ربط أزرار الإكمال
    ul.querySelectorAll('.mark-done').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        markTaskDone(dateIso, id);
        // تحديث العرض مباشرة
        renderDashboard(dateIso);
        renderArchive();
        renderReports();
        renderStats();
      });
    });
  }

  // عرض الامتحانات
  const exams = (day.exams || []);
  if(exams.length === 0){
    if(examsArea) examsArea.innerHTML = `<div style="padding:10px;color:#666">لا توجد امتحانات لهذا اليوم.</div>`;
  } else {
    exams.forEach((ex, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '8px';
      card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${esc(ex.title || 'امتحان')}</strong>
          <div style="font-size:13px;color:#555">${esc(ex.subject || '')}</div>
        </div>
        <div>
          <button class="btn start-exam" data-idx="${idx}">ابدأ الامتحان</button>
        </div>
      </div>`;
      examsArea.appendChild(card);
    });
    examsArea.querySelectorAll('.start-exam').forEach(b=>{
      b.addEventListener('click', ()=> startExam(dateIso, parseInt(b.dataset.idx,10)));
    });
  }
}

// ---- تعليم مهمة كمكتملة + أرشفتها ----
function markTaskDone(dateIso, id){
  const arr = (DATA[dateIso] && DATA[dateIso].tasks) || [];
  const index = arr.findIndex(x => x.id === id);
  if(index === -1) return false;
  arr[index].done = true;
  const archive = safeParse(localStorage.getItem(STORAGE_KEY_ARCHIVE), []);
  archive.push(Object.assign({}, arr[index], { completedAt: new Date().toISOString(), originDate: dateIso }));
  localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(archive));
  saveAll();
  return true;
}

// ---- فتح الامتحان ----
function startExam(dateIso, examIndex){
  const day = DATA[dateIso] || { exams: [] };
  const exam = (day.exams || [])[examIndex];
  if(!exam){
    alert('الامتحان غير متاح');
    return;
  }

  const examModal = document.getElementById('examModal');
  const overlay = document.getElementById('overlay');
  const qArea = document.getElementById('examQuestions');
  const resultArea = document.getElementById('examResult');
  const titleEl = document.getElementById('examTitleShow');

  if(!examModal || !qArea || !resultArea || !titleEl || !overlay){
    alert('مكونات المودال ناقصة في HTML.');
    return;
  }

  titleEl.innerText = `${exam.title || 'امتحان'} • ${exam.subject || ''}`;
  qArea.innerHTML = '';
  (exam.questions || []).forEach((q, i) => {
    const block = document.createElement('div');
    block.className = 'exam-question';
    block.innerHTML = `<div><strong>س${i+1}:</strong> ${esc(q.text || '')}</div>
      <div><textarea name="q${i}" style="width:100%;min-height:80px;margin-top:8px;padding:8px"></textarea></div>`;
    qArea.appendChild(block);
  });

  resultArea.innerHTML = '';
  examModal.classList.remove('section-hidden');
  overlay.classList.add('show');

  const closeBtn = document.getElementById('closeExam');
  if(closeBtn) closeBtn.style.display = 'inline-block';

  const submitBtn = document.getElementById('submitExamBtn');
  if(submitBtn){
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    newBtn.addEventListener('click', function(){
      newBtn.disabled = true;
      const answers = (exam.questions || []).map((_, i) => {
        const ta = document.querySelector(`textarea[name="q${i}"]`);
        return ta ? (ta.value||'').trim() : '';
      });
      const details = (exam.questions || []).map((q, i) => {
        const correct = normalizeText(answers[i]) === normalizeText(q.answer || '');
        return { question: q.text || '', given: answers[i] || '', answer: q.answer || '', correct };
      });
      const correctCount = details.filter(d => d.correct).length;
      const score = Math.round((correctCount / Math.max(1, (exam.questions||[]).length)) * 100);
      RESULTS.push({ examId: exam.id || uid(), title: exam.title || '', subject: exam.subject || '', date: dateIso, score, details });
      saveAll();

      let html = `<div style="padding:8px;border-radius:8px;background:linear-gradient(90deg,#f3ebe0,#fff)"><strong>النتيجة: ${score} / 100</strong></div><hr>`;
      details.forEach((d, idx) => {
        html += `<div style="margin-top:8px"><strong>س${idx+1}:</strong> ${esc(d.question)}<br><strong>إجابتك:</strong> ${esc(d.given)}<br><strong>الصحيح:</strong> ${esc(d.answer)}<br><strong>الحالة:</strong> ${d.correct ? '✅' : '❌'}</div><hr>`;
      });
      resultArea.innerHTML = html;

      setTimeout(()=> newBtn.disabled = false, 600);
      renderReports();
      renderStats();
      renderGrades();
    });
  }
}

// ---- زر إغلاق المودال ----
function setupCloseExam(){
  const closeBtn = document.getElementById('closeExam');
  const examModal = document.getElementById('examModal');
  const overlay = document.getElementById('overlay');
  if(!closeBtn) return;
  closeBtn.style.display = 'none';
  closeBtn.addEventListener('click', function(){
    if(examModal) examModal.classList.add('section-hidden');
    if(overlay) overlay.classList.remove('show');
    this.style.display = 'none';
    const qArea = document.getElementById('examQuestions'); if(qArea) qArea.innerHTML = '';
    const res = document.getElementById('examResult'); if(res) res.innerHTML = '';
  });
}

// ---- باقي الدوال: الأرشيف / التقارير / الإحصائيات / الدرجات / إضافة واجبات / شريط جانبي / التصدير ----
// (لم تتغير، أبقيتها كما هي من نسختك السابقة)

... // بقية الدوال من نسختك (renderArchive, renderReports, renderStats, renderGrades, setupExportReset, setupSidebar, setupAddTask, setupDateControls)

// ---- التهيئة عند DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', ()=>{
  setupSidebar();
  setupCloseExam();
  setupExportReset();
  setupAddTask();
  setupDateControls();

  const initial = pickInitialDate();
  const viewDateEl = document.getElementById('viewDate');
  if(viewDateEl && !viewDateEl.value) viewDateEl.value = initial;

  renderDashboard(initial);
  renderReports();
  renderStats();
  renderArchive();
  renderGrades();
  showSection('dashboard');

  console.log('Dashboard initialized. Initial date:', initial);
});
