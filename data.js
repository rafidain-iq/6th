// data.js - الأيام من 2025-10-01 إلى 2025-10-30 (كامل)
window.getInitialData = function () {
  const DATA = {
    
    // 2025-10-01 (الأربعاء) -> الأربعاء: عربي + أدب عربي + أحياء
    "2025-10-01": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 1 & 2", hours: 2 },
        { subject: "أدب عربي", content: "جواهري - مراجعة", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 11 & 12", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-02 (الخميس) -> اختبارات شاملة
    "2025-10-02": {
      tasks: [],
      exams: [
        { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
      ]
    },

    // 2025-10-03 (الجمعة) -> الجمعة: أحياء + عربي
    "2025-10-03": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2 },
        { subject: "عربي", content: "التقديم والتأخير - Lecture 3 & 4", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-04 (السبت) -> السبت: إنكليزي + كيمياء
    "2025-10-04": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 6 & 7", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-05 (الأحد) -> الأحد: إنكليزي + كيمياء
    "2025-10-05": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 8 & 9", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 15 & 16", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-06 (الاثنين) -> الاثنين: إنكليزي + كيمياء
    "2025-10-06": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 10 & 11", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 17 & 18", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-07 (الثلاثاء) -> الثلاثاء: عربي + أحياء
    "2025-10-07": {
      tasks: [
        { subject: "عربي", content: "التقديم والتأخير - Lecture 5 & 6", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 15 & 16", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-08 (الأربعاء) -> الأربعاء: عربي + أدب عربي + أحياء
    // ملاحظة: نكمل التقديم والتأخير ثم نبدأ التوكيد إذا لزم (مقسّم ضمن نفس حقل الـ content)
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
            { text: "أحسب مقدار التغيير في الأس الهيدروجيني (ΔpH) بعد إضافة 0.05 مول من هيدروكسيد الصوديوم NaOH إلى 2.00 لتر من محلول بافر يتكون من:
- حمض النتروز HNO2 تركيزه 0.12 M
- نتريت الصوديوم NaNO2 (أيون NO2−) تركيزه 0.15 M

المعطيات:
- مولات HNO2 الابتدائية: n(HNO2) = 0.12 M × 2.00 L = 0.24 mol
- مولات NO2− الابتدائية: n(NO2−) = 0.15 M × 2.00 L = 0.30 mol
- مولات NaOH المضافة: 0.05 mol
- ثابت التأين: Ka = 4.5 × 10^(-4)
- اللوغات المعطاة للاستخدام: log(1.8) = 0.26 ؛ log(1.25) = 0.10 ؛ log(4.5) = 0.65
", answer: "pka=3.35 - pH=3.45 - pH=3.61 - pH=0.16" },
            { text: "أحسب مقدار التغيير في الأس الهيدروجيني (ΔpH) بعد إضافة 2.00 غرام من NaOH إلى 1.00 لتر من محلول بافر يتكون من:
- حمض الخليك CH3COOH تركيزه 0.20 M
- خلات الصوديوم CH3COONa تركيزه 0.20 M

المعطيات:
- كتلة NaOH المضافة: 2.00 g
- الكتلة المولية لـ NaOH: 40 g/mol → عدد المولات: n(NaOH) = 2 / 40 = 0.05 mol
- ثابت التأين: Ka = 1.8 × 10^(-5)
- اللوغات المعطاة للاستخدام:
  log(5) = 0.7
  log(3.0477) = 0.4847
  log(1.8) = 0.26", answer: "pka=4.74 - pH=4.74 - pH=4.963 - pH=0.223" },
            { text: "عرف الايون المشترك", answer: "وهو محلول مائي يحتوي على مذابين احدهما الالكتروليت الضعيف يتشابهان في احتوائهما على ايون مشترك" }
          ]
        }
      ]
    },

    // 2025-10-09 (الخميس) -> اختبارات شاملة
    "2025-10-09": {
      tasks: [],
      exams: [
        { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
      ]
    },

    // 2025-10-10 (الجمعة) -> الجمعة: أحياء + عربي
    "2025-10-10": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 19 & 20", hours: 2 },
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 2 & 3", hours: 2 }
      ],
      exams: [
        {
          subject: "انكليزي",
          title: "قطع انكليزي - انشاء - تصاريف",
          questions: [
            { text: "اكتب النقطة 5 من الانشاء ", answer: "You Can even improve your reading by reading English newspapers,
adverts and notices" },
            { text: "hear>p.p", answer: "heard" },
            { text: "lose >p.p", answer: "lost" }  
]
        }
      ]
    },

    // 2025-10-11 (السبت) -> السبت: إنكليزي + كيمياء
    // ملاحظة: Unit 3 يصل لـ Lecture 12، نبدأ Unit 4 بعده
    "2025-10-11": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 3 - Lecture 12; Unit 4 - Lecture 1", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 19 & 20", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-12 (الأحد) -> الأحد: إنكليزي + كيمياء
    "2025-10-12": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 2 & 3", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 21 & 22", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-13 (الاثنين) -> الاثنين: إنكليزي + كيمياء
    "2025-10-13": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 4 & 5", hours: 2 },
        { subject: "كيمياء", content: "Chapter 3 - Lecture 23 & 24", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-14 (الثلاثاء) -> الثلاثاء: عربي + أحياء
    "2025-10-14": {
      tasks: [
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 4 & 5", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 21 & 22", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-15 (الأربعاء) -> الأربعاء: عربي + أدب عربي + أحياء
    "2025-10-15": {
      tasks: [
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 6 & 7", hours: 2 },
        { subject: "أدب عربي", content: "حافظ إبراهيم - التحليل الأدبي", hours: 2 },
        { subject: "أحياء", content: "Chapter 3 - Lecture 23 & 24", hours: 2 }
      ],
      exams: []
	},
	
    // 2025-10-16 (الخميس) -> اختبارات شاملة
    "2025-10-16": {
      tasks: [],
      exams: [
        { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
      ]
    },

    // 2025-10-17 (الجمعة) -> الجمعة: أحياء + عربي
    "2025-10-17": {
      tasks: [
        { subject: "أحياء", content: "Chapter 3 - Lecture 25 & 26", hours: 2 },
        { subject: "عربي", content: "أسلوب التوكيد - Lecture 8 (خاتمة)", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-18 (السبت) -> السبت: إنكليزي + كيمياء (بدء الفصل الرابع في كيمياء)
    "2025-10-18": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 7 & 8", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 1 & 2", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-19 (الأحد) -> الأحد: إنكليزي + كيمياء
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
}
  };


  // --- إضافة ID تلقائي لكل مهمة وامتحان ---
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
	  
