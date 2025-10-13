// data.js — البيانات الكاملة للشهر
window.getInitialData = function () {
  const DATA = {
    "2025-10-01": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 1 & 2", hours: 2 },
        { subject: "أدب عربي", content: "جواهري - مراجعة", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 11 & 12", hours: 2 }
      ],
      exams: []
    },

    "2025-10-02": {
      tasks: [],
      exams: [
        { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
      ]
    },

    "2025-10-03": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2 },
        { subject: "عربي", content: "التقديم والتأخير - Lecture 3 & 4", hours: 2 }
      ],
      exams: []
    },

    "2025-10-08": {
      tasks: [
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 1", hours: 2 },
        { subject: "أدب عربي", content: "ميخائيل نعيمة - ورقتين", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 17 & 18", hours: 2 }
      ],
      exams: [
        {
          subject: "كيمياء",
          title: "محاضرة 15-16-17-18",
          questions: [
            {
              text: "أحسب مقدار التغيير في الأس الهيدروجيني (ΔpH) بعد إضافة 0.05 مول من NaOH إلى 2 لتر من محلول بافر يحتوي على HNO2 و NaNO2",
              answer: "pH=3.61"
            },
            {
              text: "أحسب مقدار التغيير في الأس الهيدروجيني (ΔpH) بعد إضافة 2 غرام من NaOH إلى محلول يحتوي على CH3COOH و CH3COONa",
              answer: "pH=4.963"
            },
            {
              text: "عرف الأيون المشترك",
              answer: "هو محلول مائي يحتوي على مذابين أحدهما إلكتروليت ضعيف يتشابهان في احتوائهما على أيون مشترك"
            }
          ]
        }
      ]
    },

    "2025-10-10": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 19 & 20", hours: 2 },
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 2 & 3", hours: 2 }
      ],
      exams: [
        {
          subject: "إنكليزي",
          title: "قطع إنكليزي - إنشاء - تصاريف",
          questions: [
            { text: "اكتب النقطة 5 من الإنشاء", answer: "You can even improve your reading by reading English newspapers adverts and notices" },
            { text: "hear > p.p", answer: "heard" },
            { text: "lose > p.p", answer: "lost" }
          ]
        }
      ]
    },

    "2025-10-12": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 2 & 3", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 21 & 22", hours: 2 }
      ],
      exams: []
    },

    "2025-10-15": {
      tasks: [
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 6 & 7", hours: 2 },
        { subject: "أدب عربي", content: "حافظ إبراهيم - التحليل الأدبي", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 23 & 24", hours: 2 }
      ],
      exams: []
    }
  };

  // --- إضافة معرفات تلقائية ---
  Object.keys(DATA).forEach(date => {
    const day = DATA[date];
    if (Array.isArray(day.tasks)) {
      day.tasks.forEach((t, i) => {
        t.id = `t-${date}-${i}`;
        if (t.done === undefined) t.done = false;
      });
    }
    if (Array.isArray(day.exams)) {
      day.exams.forEach((e, i) => {
        e.id = `e-${date}-${i}`;
        if (!Array.isArray(e.questions)) e.questions = [];
        e.questions.forEach((q, qi) => q.id = `${e.id}-q${qi}`);
      });
    }
  });

  return DATA;
};
