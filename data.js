window.getInitialData = function () {
  const DATA = {};

  DATA["2025-10-01"] = {
    tasks: [
      { subject: "عربي", content: "أسلوب التقديم والتأخير - Lecture 1 & 2", hours: 2 },
      { subject: "أدب عربي", content: "جواهري - مراجعة", hours: 2 },
      { subject: "أحياء", content: "Chapter 3 - Lecture 11 & 12", hours: 2 }
    ],
    exams: [
      {
        subject: "كيمياء",
        title: "محاضرة 12-13",
        questions: [
          { text: "محلول امونيا NH3 PH=11 وبتركيز 0.05M احسب مقدار التغير في قيمة PH بعد إضافة 0.5M من ملحها كلوريد الامونيوم NH4Cl الى لتر منها ؟ log2=0.3", answer: `pH=8.3\nPH=-2.7` },
          { text: "احسب قيمة B\nPH\n1- لمحلول بفر مكون من حامض الخليك وخلات الصوديوم بتركيز 0.1M لكل منهما علماً ان Pka=4.7\n2- بعد اضافه 0.01M من HCl الى لتر من محلول log0.81=-0.09\n3- احسب قيمة DLTAPH", answer: `1- PH=4.7\n2- PH=4.61\n3- PH=-0.09` },
          { text: "احسب قيمة الاس الهيدروجيني PH\n1- لتر من محلول بفر مكون من حامض الخليك وخلات الصوديوم بتركيز 0.2M لكل منهما pka=4.7\n2- بعد اضافة 0.1M من HCl الى لتر من المحلول\n3- جد قيمة التغير في قيمة الأسّ الهيدروجيني pH", answer: `1-pH=4.7\n2- 4.22\n3- PH=-0.477` }
        ]
      }
    ]
  };

  // باقي الأيام بنفس النمط...
  // DATA["2025-10-02"], DATA["2025-10-03"] ... DATA["2025-10-30"]
  // احرص على إزالة `done: false` من كل task و exam و question

  // إضافة id لكل مهمة وامتحان + id لكل سؤال
  Object.keys(DATA).forEach(date => {
    const day = DATA[date];
    if (Array.isArray(day.tasks)) {
      day.tasks.forEach((t, i) => {
        t.id = t.id || `t-${date}-${i}`;
      });
    } else {
      day.tasks = [];
    }
    if (Array.isArray(day.exams)) {
      day.exams.forEach((e, i) => {
        e.id = e.id || `e-${date}-${i}`;
        if (Array.isArray(e.questions)) {
          e.questions.forEach((q, qi) => q.id = q.id || `${e.id}-q${qi}`);
        } else e.questions = [];
      });
    } else {
      day.exams = [];
    }
  });

  return DATA;
};
