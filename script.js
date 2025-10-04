// script.js - السكربت الكامل للمنصة

// --- تحميل البيانات الأولية من data.js أو LocalStorage ---
let DATA = JSON.parse(localStorage.getItem("studyData")) || window.getInitialData();

// --- حفظ البيانات تلقائياً في LocalStorage ---
function saveData() {
    localStorage.setItem("studyData", JSON.stringify(DATA));
    updateDashboard();
    updateGrades();
    updateStats();
    updateArchive();
}

// --- الحصول على تاريخ اليوم بصيغة YYYY-MM-DD ---
function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// --- التهيئة ---
const todayDateInput = document.getElementById("viewDate");
const todayBtn = document.getElementById("todayBtn");
const goDateBtn = document.getElementById("goDate");
todayDateInput.value = getTodayDate();

// --- تحديث عرض اليوم الحالي ---
function updateDashboard(dateStr = getTodayDate()) {
    const todayList = document.getElementById("todayList");
    const examsArea = document.getElementById("examsArea");
    todayList.innerHTML = "";
    examsArea.innerHTML = "";
    document.getElementById("todayDate").textContent = dateStr;

    const dayData = DATA[dateStr];
    if (!dayData) return;

    // --- عرض الواجبات ---
    dayData.tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.textContent = `${task.subject}: ${task.content} (${task.hours} ساعة)`;
        // زر تم الإنجاز
        const doneBtn = document.createElement("button");
        doneBtn.textContent = "تم الإنجاز";
        doneBtn.className = "btn small ghost";
        doneBtn.onclick = () => {
            moveTaskToArchive(dateStr, index);
        };
        li.appendChild(doneBtn);
        todayList.appendChild(li);
    });

    // --- عرض الامتحانات ---
    dayData.exams.forEach((exam, exIndex) => {
        const examDiv = document.createElement("div");
        examDiv.className = "exam-item";
        const title = document.createElement("strong");
        title.textContent = `${exam.subject} - ${exam.title}`;
        examDiv.appendChild(title);
        // زر بدء الامتحان
        const startBtn = document.createElement("button");
        startBtn.textContent = "بدء الامتحان";
        startBtn.className = "btn small";
        startBtn.onclick = () => openExamModal(dateStr, exIndex);
        examDiv.appendChild(startBtn);
        examsArea.appendChild(examDiv);
    });
}

// --- نقل الواجب للأرشيف ---
function moveTaskToArchive(dateStr, taskIndex) {
    const task = DATA[dateStr].tasks.splice(taskIndex, 1)[0];
    const archive = JSON.parse(localStorage.getItem("archiveData")) || [];
    archive.push({ ...task, date: dateStr });
    localStorage.setItem("archiveData", JSON.stringify(archive));
    saveData();
}

// --- فتح نافذة الامتحان ---
function openExamModal(dateStr, exIndex) {
    const modal = document.getElementById("examModal");
    modal.classList.remove("section-hidden");
    const exam = DATA[dateStr].exams[exIndex];
    document.getElementById("examTitleShow").textContent = `${exam.subject} - ${exam.title}`;
    const examQuestionsDiv = document.getElementById("examQuestions");
    examQuestionsDiv.innerHTML = "";

    // إنشاء أسئلة
    exam.questions.forEach((q, qIndex) => {
        const div = document.createElement("div");
        div.className = "exam-question";
        const label = document.createElement("label");
        label.textContent = `السؤال ${qIndex + 1}: ${q.text}`;
        const input = document.createElement("input");
        input.type = "text";
        input.dataset.qindex = qIndex;
        div.appendChild(label);
        div.appendChild(input);
        examQuestionsDiv.appendChild(div);
    });

    document.getElementById("submitExamBtn").onclick = () => {
        gradeExam(dateStr, exIndex);
        modal.classList.add("section-hidden");
    };
}

// --- التصحيح الذكي للامتحانات ---
function gradeExam(dateStr, exIndex) {
    const exam = DATA[dateStr].exams[exIndex];
    const inputs = document.querySelectorAll("#examQuestions input");
    let score = 0;
    exam.questions.forEach((q, i) => {
        const ans = inputs[i].value.trim().toLowerCase();
        const correct = q.answer.trim().toLowerCase();
        // مقارنة ذكية: قبول الاختلافات البسيطة أو المفهوم نفسه
        if (smartCompare(ans, correct)) score += 10; // كل سؤال 10 درجات
    });

    // إضافة الدرجة في قسم الدرجات
    const grades = JSON.parse(localStorage.getItem("gradesData")) || [];
    grades.push({
        subject: exam.subject,
        title: exam.title,
        score: score,
        max: exam.questions.length * 10,
        date: dateStr
    });
    localStorage.setItem("gradesData", JSON.stringify(grades));
    updateGrades();
}

// --- دالة المقارنة الذكية ---
function smartCompare(ans, correct) {
    // حذف علامات الترقيم والمسافات الزائدة
    const normalize = str => str.replace(/[^a-zA-Z0-9ء-ي\s]/g, '').trim();
    const a = normalize(ans);
    const c = normalize(correct);
    if (a === c) return true;
    // مقارنة الكلمات: فرق كلمة أو كلمتين مقبول
    const aWords = a.split(/\s+/);
    const cWords = c.split(/\s+/);
    const diff = Math.abs(aWords.length - cWords.length);
    if (diff <= 2 && aWords.every((w, i) => cWords[i] ? w === cWords[i] : true)) return true;
    // إذا كان المفهوم نفسه (تطابق جزئي للكلمات الأساسية)
    const commonWords = aWords.filter(w => cWords.includes(w));
    if (commonWords.length / cWords.length >= 0.6) return true;
    return false;
}

// --- تحديث الدرجات ---
function updateGrades() {
    const gradesDiv = document.getElementById("gradesContent");
    const grades = JSON.parse(localStorage.getItem("gradesData")) || [];
    if (!grades.length) {
        gradesDiv.textContent = "لا توجد بيانات درجات حالياً.";
        return;
    }
    gradesDiv.innerHTML = "";
    grades.forEach(g => {
        const div = document.createElement("div");
        div.textContent = `${g.date} - ${g.subject} - ${g.title}: ${g.score}/${g.max}`;
        gradesDiv.appendChild(div);
    });
}

// --- تحديث الإحصائيات ---
function updateStats() {
    const statsCtx = document.getElementById("statsChart").getContext("2d");
    const subjects = {};
    Object.keys(DATA).forEach(date => {
        const tasks = DATA[date].tasks;
        tasks.forEach(t => {
            subjects[t.subject] = (subjects[t.subject] || 0) + t.hours;
        });
    });
    const labels = Object.keys(subjects);
    const data = Object.values(subjects);
    if (window.statsChartInstance) window.statsChartInstance.destroy();
    window.statsChartInstance = new Chart(statsCtx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(() => `hsl(${Math.random()*360},60%,70%)`)
            }]
        }
    });
}

// --- تحديث الأرشيف ---
function updateArchive() {
    const archiveDiv = document.getElementById("archiveContent");
    const archive = JSON.parse(localStorage.getItem("archiveData")) || [];
    archiveDiv.innerHTML = "";
    archive.forEach(a => {
        const div = document.createElement("div");
        div.textContent = `${a.date} - ${a.subject}: ${a.content} (${a.hours || 0} ساعة)`;
        archiveDiv.appendChild(div);
    });
}

// --- إضافة واجب جديد ---
document.getElementById("saveTask").onclick = () => {
    const subj = document.getElementById("new_subject").value;
    const cont = document.getElementById("new_content").value;
    const hours = parseFloat(document.getElementById("new_hours").value);
    const date = document.getElementById("new_date").value;
    if (!subj || !cont || !date) return alert("يرجى ملء جميع الحقول");
    if (!DATA[date]) DATA[date] = { tasks: [], exams: [] };
    DATA[date].tasks.push({ subject: subj, content: cont, hours: hours, done: false });
    saveData();
};

// --- زر اليوم ---
todayBtn.onclick = () => {
    todayDateInput.value = getTodayDate();
    updateDashboard();
};

// --- زر عرض التاريخ ---
goDateBtn.onclick = () => {
    updateDashboard(todayDateInput.value);
};

// --- القائمة الجانبية ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
menuBtn.onclick = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
};
overlay.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
};

// --- زر تصدير البيانات ---
document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(url);
};

// --- زر إعادة الحالة الأولية ---
document.getElementById("resetBtn").onclick = () => {
    if (confirm("هل تريد إعادة تعيين البيانات؟ سيتم مسح كل التعديلات.")) {
        localStorage.removeItem("studyData");
        localStorage.removeItem("gradesData");
        localStorage.removeItem("archiveData");
        location.reload();
    }
};

// --- زر إغلاق الامتحان ---
document.getElementById("closeExam").onclick = () => {
    document.getElementById("examModal").classList.add("section-hidden");
};

// --- تحميل البيانات عند البدء ---
updateDashboard();
updateGrades();
updateStats();
updateArchive();
