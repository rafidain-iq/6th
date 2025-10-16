// data.js - الأيام من 2025-10-01 إلى 2025-10-30
window.getInitialData = function () {
  const DATA = {
    "2025-10-01": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 1 & 2", hours: 2 },
        { subject: "أدب عربي", content: "الجواهري - مراجعة", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 11 & 12", hours: 2 }
      ],
      exams: []
    },
    "2025-10-02": {
      tasks: [],
      exams: [{ subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }]
    },
    "2025-10-03": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2 },
        { subject: "عربي", content: "التقديم والتأخير - Lecture 3 & 4", hours: 2 }
      ],
      exams: []
    },
    "2025-10-04": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 6 & 7", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2 }
      ],
      exams: []
    },
    "2025-10-05": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 8 & 9", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 15 & 16", hours: 2 }
      ],
      exams: []
    },
    "2025-10-06": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 10 & 11", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 17 & 18", hours: 2 }
      ],
      exams: []
    },
    "2025-10-07": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 5 & 6", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 15 & 16", hours: 2 }
      ],
      exams: []
    },
    "2025-10-08": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 7; أسلوب التوكيد - Lecture 1", hours: 2 },
        { subject: "أدب عربي", content: "ميخائيل نعيمة - ورقتين", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 17 & 18", hours: 2 }
      ],
      exams: [
        {
          subject: "كيمياء",
          title: "محاضرة 15-16-17-18",
          questions: [
            { text: "احسب التغيير في pH بعد إضافة 0.05 مول NaOH إلى 2 لتر من محلول بافر...", answer: "pka=3.35 - pH=3.45 - pH=3.61 - pH=0.16" },
            { text: "احسب ΔpH بعد إضافة 2g NaOH إلى 1L محلول بافر CH3COOH / CH3COONa", answer: "pka=4.74 - pH=4.74 - pH=4.96 - ΔpH=0.22" },
            { text: "عرف الأيون المشترك", answer: "هو محلول مائي يحتوي على مذابين أحدهما إلكتروليت ضعيف يتشابهان في الأيون المشترك" }
          ]
        }
      ]
    },
    "2025-10-09": {
      tasks: [],
      exams: [{ subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }]
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
            { text: "اكتب النقطة الخامسة من الإنشاء", answer: "You can even improve your reading by reading English newspapers, adverts and notices" },
            { text: "hear > p.p", answer: "heard" },
            { text: "lose > p.p", answer: "lost" }
          ]
        }
      ]
    },
    "2025-10-11": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 12; Unit 4 - Lecture 1", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 19 & 20", hours: 2 }
      ],
      exams: []
    },
    "2025-10-12": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 2 & 3", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 21 & 22", hours: 2 }
      ],
      exams: []
    },
    "2025-10-13": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 4 & 5", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 23 & 24", hours: 2 }
      ],
      exams: []
    },
    "2025-10-14": {
      tasks: [
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 4 & 5", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 21 & 22", hours: 2 }
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
    },
    "2025-10-16": { tasks: [], exams: [{ subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }] },
    "2025-10-17": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 25 & 26", hours: 2 },
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 8 (خاتمة)", hours: 2 }
      ],
      exams: []
    },
    "2025-10-18": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 7 & 8", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 1 & 2", hours: 2 }
      ],
      exams: []
    },
    "2025-10-19": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 9 & 10", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 3 & 4", hours: 2 }
      ],
      exams: []
    },
      // 2025-10-20 (الاثنين) -> الاثنين: إنكليزي + كيمياء
  "2025-10-20": {
    tasks: [],
    exams: []
  },

  // 2025-10-21 (الثلاثاء) -> الثلاثاء: عربي + أحياء
  "2025-10-21": {
    tasks: [],
    exams: []
  },

  // 2025-10-22 (الأربعاء) -> الأربعاء: عربي + أدب + أحياء
  "2025-10-22": {
    tasks: [
      { subject: "عربي", content: "مراجعة عامة  ", hours: 2 },
      { subject: "أدب عربي", content: "مراجعة ميخائيل نعيمة", hours: 2 },
      { subject: "أحياء", content: "Chapter 4 - Lecture 3 & 4", hours: 2 }
    ],
    exams: []
  },

  // 2025-10-23 (الخميس) -> اختبارات شاملة
  "2025-10-23": {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
    ]
  },

  // 2025-10-24 (الجمعة)
  "2025-10-24": {
    tasks: [],
    exams: []
  },

  // 2025-10-25 (السبت)
  "2025-10-25": {
    tasks: [],
    exams: []
  },

  // 2025-10-26 (الأحد)
  "2025-10-26": {
    tasks: [],
    exams: []
  },

  // 2025-10-27 (الاثنين)
  "2025-10-27": {
    tasks: [],
    exams: []
  },

  // 2025-10-28 (الثلاثاء)
  "2025-10-28": {
    tasks: [],
    exams: []
  },

  // 2025-10-29 (الأربعاء)
  "2025-10-29": {
    tasks: [],
    exams: []
  },

  // 2025-10-30 (الخميس)
  "2025-10-30": {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
    ]
  }
 };

  // إضافة معرفات تلقائية
  Object.keys(DATA).forEach(date => {
    const day = DATA[date];
    if (Array.isArray(day.tasks))
      day.tasks.forEach((t, i) => (t.id = `t-${date}-${i}`));
    if (Array.isArray(day.exams))
      day.exams.forEach((e, i) => (e.id = `e-${date}-${i}`));
  });

  return DATA;
};
