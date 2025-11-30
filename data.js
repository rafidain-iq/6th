// data.js - جزء 1 من شهر 12 / 2025 (اليوم 1 إلى 15)
window.getInitialDataPart1 = function () {
  const DATA = {
    "2025-12-01": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 1 & الفصل الخامس - محاضرة 2", hours: 2 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 1 & Unit 5 - Lecture 2", hours: 2 }
      ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-02": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 5 - Lecture 3 & Unit 5 - Lecture 4", hours: 2 },
        { subject: "إسلامية", content: "الوحدة الثالثة - محاضرة 1 & الوحدة الثالثة - محاضرة 2", hours: 2 }
      ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-03": {
      tasks: [
        { subject: "عربي", content: "التمني والترجي", hours: 2 },
        { subject: "أدب عربي", content: "القضية الفلسطينية", hours: 2 }
      ],
      exams: [ { subject: "عربي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-04": {
      tasks: [ { subject: "عربي", content: "العرض والتحذير", hours: 2 } ],
      exams: [ { subject: "عربي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-05": {
      tasks: [ { subject: "شامل", content: "مراجعة", hours: 2 } ],
      exams: [ { subject: "شامل", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-06": {
      tasks: [
        { subject: "أدب عربي", content: "فدوى الطوقان - محاضرة 1 & فدوى الطوقان - محاضرة 2", hours: 2 },
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 3 & الفصل الخامس - محاضرة 4", hours: 2 }
      ],
      exams: [ { subject: "أدب عربي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-07": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 5 & الفصل الخامس - محاضرة 6", hours: 2 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 5 & Unit 5 - Lecture 6", hours: 2 }
      ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-08": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 7 & الفصل الخامس - محاضرة 8", hours: 2 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 7 & Unit 5 - Lecture 8", hours: 2 }
      ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-09": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 5 - Lecture 9 & Unit 5 - Lecture 10", hours: 2 },
        { subject: "إسلامية", content: "الوحدة الثالثة - محاضرة 3 & الوحدة الثالثة - محاضرة 4", hours: 2 }
      ],
      exams: [ { subject: "إسلامية", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-10": {
      tasks: [
        { subject: "عربي", content: "التحذير والإغراء", hours: 2 },
        { subject: "أدب عربي", content: "محمود درويش - محاضرة 1 & محمود درويش - محاضرة 2", hours: 2 }
      ],
      exams: [ { subject: "أدب عربي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-11": {
      tasks: [ { subject: "عربي", content: "مراجعة", hours: 2 } ],
      exams: [ { subject: "عربي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-12": {
      tasks: [ { subject: "شامل", content: "مراجعة", hours: 2 } ],
      exams: [ { subject: "شامل", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-13": {
      tasks: [
        { subject: "أدب عربي", content: "مراجعة شاملة ومركزة", hours: 2 },
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 9 & الفصل الخامس - محاضرة 10", hours: 2 }
      ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-14": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 11 & الفصل الخامس - محاضرة 12", hours: 2 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 1 & Unit 6 - Lecture 2", hours: 2 }
      ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-15": {
      tasks: [
        { subject: "إنكليزي", content: "Unit 6 - Lecture 3 & Unit 6 - Lecture 4", hours: 2 },
        { subject: "أدب عربي", content: "الشاعر الخفاجي - محاضرة 1 & الشاعر الخفاجي - محاضرة 2", hours: 2 }
      ],
      exams: [ { subject: "أدب عربي", title: "امتحان يومي", questions: [] } ]
    },
   "2025-12-16": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 13 & الفصل الخامس - محاضرة 14", hours: 2 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 5 & Unit 6 - Lecture 6", hours: 2 }
      ],
      exams: [
        { subject: "أحياء", title: "امتحان يومي", questions: [] },
        { subject: "إنكليزي", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-17": {
      tasks: [
        { subject: "أدب عربي", content: "الشاعر التكرى - محاضرة 1 & الشاعر التكرى - محاضرة 2", hours: 2 },
        { subject: "عربي", content: "مراجعة", hours: 2 }
      ],
      exams: [
        { subject: "أدب عربي", title: "امتحان يومي", questions: [] },
        { subject: "عربي", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-18": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 15 & الفصل الخامس - محاضرة 16", hours: 2 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 7 & Unit 6 - Lecture 8", hours: 2 }
      ],
      exams: [
        { subject: "أحياء", title: "امتحان يومي", questions: [] },
        { subject: "إنكليزي", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-19": {
      tasks: [
        { subject: "أدب عربي", content: "مراجعة شاملة", hours: 2 },
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 17 & الفصل الخامس - محاضرة 18", hours: 2 }
      ],
      exams: [
        { subject: "أدب عربي", title: "امتحان يومي", questions: [] },
        { subject: "أحياء", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-20": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 19 & الفصل الخامس - محاضرة 20", hours: 2 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 9 & Unit 6 - Lecture 10", hours: 2 }
      ],
      exams: [
        { subject: "أحياء", title: "امتحان يومي", questions: [] },
        { subject: "إنكليزي", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-21": {
      tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 21 & الفصل الخامس - محاضرة 22", hours: 2 },
        { subject: "أدب عربي", content: "مراجعة", hours: 2 }
      ],
      exams: [
        { subject: "أحياء", title: "امتحان يومي", questions: [] },
        { subject: "أدب عربي", title: "امتحان يومي", questions: [] }
      ]
    },
    "2025-12-22": {
      tasks: [ { subject: "أحياء", content: "الفصل الخامس - محاضرة 23 & الفصل الخامس - محاضرة 24", hours: 2 } ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-23": {
      tasks: [ { subject: "أحياء", content: "الفصل الخامس - محاضرة 25 & الفصل الخامس - محاضرة 26", hours: 2 } ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-24": {
      tasks: [ { subject: "أحياء", content: "الفصل الخامس - محاضرة 27 & الفصل الخامس - محاضرة 28", hours: 2 } ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-25": {
      tasks: [ { subject: "أحياء", content: "الفصل الخامس - محاضرة 29 & الفصل الخامس - محاضرة 30", hours: 2 } ],
      exams: [ { subject: "أحياء", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-26": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 11 & Unit 6 - Lecture 12", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-27": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 13 & Unit 6 - Lecture 14", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-28": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 15 & Unit 6 - Lecture 16", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-29": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 17 & Unit 6 - Lecture 18", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-30": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 19 & Unit 6 - Lecture 20", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    },
    "2025-12-31": {
      tasks: [ { subject: "إنكليزي", content: "Unit 6 - Lecture 21 & مراجعة شاملة", hours: 2 } ],
      exams: [ { subject: "إنكليزي", title: "امتحان يومي", questions: [] } ]
    }
  };

  // إضافة معرفات تلقائية
  Object.keys(DATA).forEach(date => {
    const day = DATA[date];
    if (Array.isArray(day.tasks)) day.tasks.forEach((t, i) => (t.id = `t-${date}-${i}`));
    if (Array.isArray(day.exams)) day.exams.forEach((e, i) => (e.id = `e-${date}-${i}`));
  });

  return DATA;
};
