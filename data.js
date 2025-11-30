// data.js - شهر 12 / 2025 - نسخة مرتبة وفق جدولك الجديد
window.getInitialData = function () {
  const DATA = {
    // === أيام التعويض قبل الامتحانات (1-11 ديسمبر) ===
    "2025-12-01": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 1 & 2 & 3", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 1 & 2 & 3", hours: 3 }
      ], exams: [] },
    "2025-12-02": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 4 & 5 & 6", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 4 & 5 & 6", hours: 3 }
      ], exams: [] },
    "2025-12-03": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 7 & 8 & 9", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 7 & 8 & 9", hours: 3 }
      ], exams: [] },
    "2025-12-04": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 10 & 11 & 12", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 10 & 11 & 12", hours: 3 }
      ], exams: [] },
    // الجمعة استراحة (5-12)
    "2025-12-05": { tasks: [], exams: [] },
    "2025-12-06": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 13 & 14 & 15", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 13 & 14 & 15", hours: 3 }
      ], exams: [] },
    "2025-12-07": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 16 & 17 & 18", hours: 3 },
        { subject: "إنكليزي", content: "Unit 5 - Lecture 16 & Unit 6 - Lecture 1 & 2", hours: 3 }
      ], exams: [] },
    "2025-12-08": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 19 & 20 & 21", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 3 & 4 & 5", hours: 3 }
      ], exams: [] },
    // الثلاثاء 9-12 تخفيف الضغط: محاضرتين لكل مادة
    "2025-12-09": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 22 & 23", hours: 2 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 6 & 7", hours: 2 }
      ], exams: [] },
    "2025-12-10": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 24 & 25 & 26", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 8 & 9 & 10", hours: 3 }
      ], exams: [] },
    "2025-12-11": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 27 & 28 & 29", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 11 & 12 & 13", hours: 3 }
      ], exams: [] },

    // === أيام الامتحانات 12-27 ديسمبر ===
    "2025-12-12": { tasks: [], exams: [] }, // الجمعة استراحة
    "2025-12-14": { tasks: [
        { subject: "عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "إسلامية", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "رياضيات", title: "امتحان", questions: [] } ] },
    "2025-12-16": { tasks: [
        { subject: "عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "إسلامية", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "كيمياء", title: "امتحان", questions: [] } ] },
    "2025-12-18": { tasks: [
        { subject: "عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "إسلامية", title: "امتحان", questions: [] } ] },
    "2025-12-21": { tasks: [
        { subject: "عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "فيزياء", title: "امتحان", questions: [] } ] },
    "2025-12-23": { tasks: [
        { subject: "عربي", content: "مراجعة سريعة", hours: 1 },
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "عربي", title: "امتحان", questions: [] } ] },
    "2025-12-25": { tasks: [
        { subject: "أدب عربي", content: "مراجعة سريعة", hours: 1 }
      ], exams: [ { subject: "إنكليزي", title: "امتحان", questions: [] } ] },
    "2025-12-26": { tasks: [], exams: [] }, // الجمعة استراحة
    "2025-12-28": { tasks: [], exams: [ { subject: "أحياء", title: "امتحان", questions: [] } ] },

    // === بعد الامتحانات (28-31 ديسمبر) ===
    "2025-12-29": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 30 & 31 & 32", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 14 & 15 & 16", hours: 3 }
      ], exams: [] },
    "2025-12-30": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 33 & 34 & 35", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 17 & 18 & 19", hours: 3 }
      ], exams: [] },
    "2025-12-31": { tasks: [
        { subject: "أحياء", content: "الفصل الخامس - محاضرة 36 & مراجعة شاملة", hours: 3 },
        { subject: "إنكليزي", content: "Unit 6 - Lecture 20 & 21 & مراجعة شاملة", hours: 3 }
      ], exams: [] }
  };

  // إضافة معرفات تلقائية
  Object.keys(DATA).forEach(date => {
    const day = DATA[date];
    if (Array.isArray(day.tasks)) day.tasks.forEach((t, i) => (t.id = `t-${date}-${i}`));
    if (Array.isArray(day.exams)) day.exams.forEach((e, i) => (e.id = `e-${date}-${i}`));
  });

  return DATA;
};
