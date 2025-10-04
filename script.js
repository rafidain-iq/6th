// --- script.js متكامل ---

// تحميل البيانات الأساسية
const DATA = window.getInitialData();

// عناصر DOM
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menuBtn");
const todayList = document.getElementById("todayList");
const todayDateEl = document.getElementById("todayDate");
const examsArea = document.getElementById("examsArea");

// زر القائمة الجانبية
menuBtn.onclick = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
};
overlay.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
};

// قراءة اليوم الحالي
function getTodayDateStr() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
}

// --- حفظ واسترجاع المهام والدرجات من LocalStorage ---
function loadTasks() {
    return JSON.parse(localStorage.getItem("tasksData")) || {};
}
function saveTasks(tasks) {
    localStorage.setItem("tasksData", JSON.stringify(tasks));
}
function loadGrades() {
    return JSON.parse(localStorage.getItem("gradesData")) || [];
}
function saveGrades(grades) {
    localStorage.setItem("gradesData", JSON.stringify(grades));
}

// --- عرض واجبات اليوم ---
function renderToday(dateStr = null) {
    const tasksData = loadTasks();
    const dateKey = dateStr || getTodayDateStr();
    todayDateEl.textContent = dateKey;

    todayList.innerHTML = "";
    examsArea.innerHTML = "";

    // مهام اليوم
    const dayTasks = tasksData[dateKey]?.tasks || DATA[dateKey]?.tasks || [];
    dayTasks.forEach((t, idx) => {
        const li = document.createElement("li");
        li.textContent = `${t.subject}: ${t.content} (${t.hours} ساعة) `;
        const btn = document.createElement("button");
        btn.textContent = "تم الإنجاز";
        btn.onclick = () => {
            li.style.textDecoration = "line-through";
            t.done = true;
            saveTasks(tasksData);
            archiveTask(dateKey, t);
        };
        li.appendChild(btn);
        todayList.appendChild(li);
    });

    // امتحانات اليوم
    const dayExams = DATA[dateKey]?.exams || [];
    dayExams.forEach((ex, i) => {
        const div = document.createElement("div");
        div.className = "exam-item";
        div.innerHTML = `
            <b>${ex.subject}</b> - ${ex.title} 
            <button class="btn startExam">بدء الامتحان</button>
        `;
        const btn = div.querySelector(".startExam");
        btn.onclick = () => startExam(dateKey, i);
        examsArea.appendChild(div);
    });
}

// --- أرشيف المهام المكتملة ---
function archiveTask(dateStr, task) {
    const archive = JSON.parse(localStorage.getItem("archiveData")) || [];
    archive.push({date: dateStr, ...task});
    localStorage.setItem("archiveData", JSON.stringify(archive));
}

// --- تصحيح ذكي ---
function smartCompare(userAns, correctAns) {
    if (!userAns || !correctAns) return false;
    userAns = userAns.toLowerCase().trim();
    correctAns = correctAns.toLowerCase().trim();
    // السماح بفارق حرف أو كلمتين
    if (userAns === correctAns) return true;
    const uaWords = userAns.split(/\s+/);
    const caWords = correctAns.split(/\s+/);
    const diff = Math.abs(uaWords.length - caWords.length);
    if (diff <= 2 && caWords.every(w => uaWords.includes(w))) return true;
    // يمكن إضافة مقارنة مرنة أكثر لاحقاً
    return false;
}

// --- بدء الامتحان ---
function startExam(dateStr, exIndex) {
    const exam = DATA[dateStr].exams[exIndex];
    const modal = document.getElementById("examModal");
    const titleEl = document.getElementById("examTitleShow");
    const qDiv = document.getElementById("examQuestions");
    const resultDiv = document.getElementById("examResult");

    titleEl.textContent = `${exam.subject} - ${exam.title}`;
    qDiv.innerHTML = "";
    resultDiv.innerHTML = "";

    exam.questions.forEach((q, i) => {
        const qElem = document.createElement("div");
        qElem.className = "exam-question";
        qElem.innerHTML = `
            <p>${i+1}. ${q.text}</p>
            <input type="text" placeholder="إجابتك هنا">
        `;
        qDiv.appendChild(qElem);
    });

    modal.classList.remove("section-hidden");

    document.getElementById("submitExamBtn").onclick = () => {
        let score = 0;
        const inputs = qDiv.querySelectorAll("input");
        resultDiv.innerHTML = "<h4>نتيجة الامتحان:</h4>";

        exam.questions.forEach((q, i) => {
            const userAns = inputs[i].value;
            const correctAns = q.answer;
            const ok = smartCompare(userAns, correctAns);
            if (ok) score += 10;

            const div = document.createElement("div");
            div.innerHTML = `
                <p>السؤال ${i+1}: ${q.text}</p>
                <p>إجابتك: ${userAns}</p>
                <p>الإجابة النموذجية: ${correctAns}</p>
                <p>الدرجة: ${ok ? 10 : 0}/10</p>
                <hr>
            `;
            resultDiv.appendChild(div);
        });

        // تسجيل الدرجة
        const grades = loadGrades();
        grades.push({subject: exam.subject, title: exam.title, score, max: exam.questions.length*10, date: dateStr});
        saveGrades(grades);
        updateGrades();
    };

    document.getElementById("closeExam").onclick = () => {
        modal.classList.add("section-hidden");
    };
}

// --- تحديث الدرجات ---
function updateGrades() {
    const grades = loadGrades();
    const gradesDiv = document.getElementById("gradesContent");
    if (!grades.length) {
        gradesDiv.textContent = "لا توجد بيانات درجات حالياً.";
        return;
    }
    gradesDiv.innerHTML = "";
    grades.forEach(g => {
        const div = document.createElement("div");
        div.textContent = `${g.date} | ${g.subject} - ${g.title}: ${g.score}/${g.max}`;
        gradesDiv.appendChild(div);
    });
}

// --- التهيئة ---
document.addEventListener("DOMContentLoaded", () => {
    renderToday();
    updateGrades();
});
