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
      exams: []
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
      exams: []
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
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 11 & 12", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 5 & 6", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-21 (الثلاثاء) -> الثلاثاء: عربي + أحياء (بدء الفصل الرابع للأحياء)
    "2025-10-21": {
      tasks: [
        { subject: "عربي", content: "مراجعة التقديم + التوكيد", hours: 2 },
        { subject: "أحياء", content: "Chapter 4 - Lecture 1 & 2", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-22 (الأربعاء) -> الأربعاء: عربي + أدب + أحياء
    "2025-10-22": {
      tasks: [
        { subject: "عربي", content: "مراجعة عامة على الأساليب النحوية", hours: 2 },
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

    // 2025-10-24 (الجمعة) -> الجمعة: أحياء + عربي
    "2025-10-24": {
      tasks: [
        { subject: "أحياء", content: "Chapter 4 - Lecture 5 & 6", hours: 2 },
        { subject: "عربي", content: "مراجعة شاملة في التوكيد", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-25 (السبت) -> السبت: إنكليزي + كيمياء
    "2025-10-25": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 13 & 14", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 7 & 8", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-26 (الأحد) -> الأحد: إنكليزي + كيمياء
    "2025-10-26": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 4 - Lecture 15 & 16", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 9 & 10", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-27 (الاثنين) -> الاثنين: إنكليزي + كيمياء
    "2025-10-27": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 5 - Lecture 1 & 2", hours: 2 },
        { subject: "كيمياء", content: "Chapter 4 - Lecture 11 & 12", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-28 (الثلاثاء) -> الثلاثاء: عربي + أحياء
    "2025-10-28": {
      tasks: [
        { subject: "عربي", content: "مراجعة الأسلوبين السابقين", hours: 2 },
        { subject: "أحياء", content: "Chapter 4 - Lecture 7 (الأخيرة)", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-29 (الأربعاء) -> الأربعاء: عربي + أدب عربي + أحياء (مراجعة عامة)
    "2025-10-29": {
      tasks: [
        { subject: "عربي", content: "مراجعة شاملة (التقديم + التوكيد)", hours: 2 },
        { subject: "أدب عربي", content: "تلخيص عام للأدب الحديث", hours: 2 },
        { subject: "أحياء", content: "مراجعة عامة فصل 3 + 4", hours: 2 }
      ],
      exams: []
    },

    // 2025-10-30 (الخميس) -> اختبارات شاملة
    "2025-10-30": {
      tasks: [],
      exams: [
        { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [] }
      ]
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
	  
