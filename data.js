window.getInitialData = function () {
  const DATA = {};

  DATA["2025-10-01"] = {
    tasks: [
      { subject: "عربي", content: "أسلوب التقديم والتأخير - Lecture 1 & 2", hours: 2, done: false },
      { subject: "أدب عربي", content: "جواهري - مراجعة", hours: 2, done: false },
      { subject: "أحياء", content: "Chapter 3 - Lecture 11 & 12", hours: 2, done: false }
    ],
    exams: [
      {
        subject: "كيمياء",
        title: "محاضرة 12-13",
        questions: [
          { text: "محلول امونيا NH3 PH=11 وبتركيز 0.05M احسب مقدار التغير في قيمة PH بعد إضافة 0.5M من ملحها كلوريد الامونيوم NH4Cl الى لتر منها ؟ log2=0.3", answer: `pH=8.3\nPH=-2.7` },
          { text: "احسب قيمة B\nPH\n1- لمحلول بفر مكون من حامض الخليك وخلات الصوديوم بتركيز 0.1M لكل منهما علماً ان Pka=4.7\n2- بعد اضافه 0.01M من HCl الى لتر من محلول log0.81=-0.09\n3- احسب قيمة DLTAPH", answer: `1- PH=4.7\n2- PH=4.61\n3- PH=-0.09` },
          { text: "احسب قيمة الاس الهيدروجيني PH\n1- لتر من محلول بفر مكون من حامض الخليك وخلات الصوديوم بتركيز 0.2M لكل منهما pka=4.7\n2- بعد اضافة 0.1M من HCl الى لتر من المحلول\n3- جد قيمة التغير في قيمة الأسّ الهيدروجيني pH", answer: `1-pH=4.7\n2- 4.22\n3- PH=-0.477` }
        ],
        done: false
      }
    ]
  };

  DATA["2025-10-02"] = {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [], done: false }
    ]
  };

  DATA["2025-10-03"] = {
    tasks: [
      { subject: "أحياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2, done: false },
      { subject: "عربي", content: "أسلوب التقديم والتأخير - Lecture 3 & 4", hours: 2, done: false }
    ],
    exams: [
      {
        subject: "انكليزي",
        title: "قطع انكليزي+ انشاء + تصاريف محاضرة (4-5)",
        questions: [
          { text: "اكتب نقطة 2ونصف الثالثه انشاء", answer: `First you can hear People\nSpeaking English all day in many different Situations. Will allow you to have a lot of practice\nspeaking English. Secondly, if you stay with a British family, that will help you more to\nobserve British way of life and learn how People Communicate with each others.` },
          { text: "I'm hungry. Let's have lunch in the College…….", answer: "Canteen" },
          { text: "tell >p.l", answer: "told" }
        ],
        done: false
      }
    ]
  };

  DATA["2025-10-04"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 3 - Lecture 6 & 7", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 3 - Lecture 13 & 14", hours: 2, done: false },
      { subject: "رياضيات", content: "مراجعة مسائل", hours: 1, done: false }
    ],
    exams:[
      {
        subject:"أحياء",
        title:"محاضرة 11-12-13–14",
        questions:[
          { text: "ما موقع الطور البوغي", answer: "الزيجة" },
          { text: "عرف الثالوس الاولي", answer: "هي عبارة عن تركيب قلبي الشكل اخضر اللون مسطح ينشأ من نمو البوغ يمثل الطور المشيجي الجنسي يحتوي على اشباه الجذور ويحمل حوافظ مشيجيه انثويه وحوامض مشيجيه ذكريه" },
          { text: "عرف الزهرة غير التامة", answer: "هي الزهرة التي تحتوي اما على الاسديه او المدقات ويطلق عليها ايضاً زهرة احادية الجنس" }
        ],
        done: false
      }
    ]
  };

  DATA["2025-10-05"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 3 - Lecture 8 & 9", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 3 - Lecture 15 & 16", hours: 2, done: false }
    ],
    exams:[
      {
        subject:"عربي",
        title:"محاضرة 2-3",
        questions:[
          { text: `(لَهُم مَّغْفِرَةٌ وَأَجْرٌ عَظِيمٌ) ، (فَمِنْهُمْ شَقِيٌّ وَسَعِيدٌ)\nدل على المتقدم ، وبين نوعه وحكمه وسبب تقديمه`, answer: `المتقدم : لهم - منهم\nنوعه - خبر متقدم\nحكمه : وجوباً\nسبب التقديم : لان المبتدأ نكرة غير مضافة ولا موصوفة والخبر شبه جملة` },
          { text: `1- قَلبٌ يُصادِقُني الطِلابَ جَراءَةً\nوَمِنَ القُلوبِ مُصادِقٌ وَمُوارِبُ\n\n2- وَلِكُلِّ حالٍ مُعقِبٌ وَلَرُبَّما\nأَجلى لَكَ المَكروهُ عَمّا يُحمَدُ\nدل على المتقدم ، وبين نوعه وحكمه وسبب تقديمه`, answer: `المتقدم : من القلوب - لكل حال\nنوعه : خبر متقدم\nحكمه : وجوباً\nسبب التقديم : لان المبتدأ نكرة غير مضافة ولا موصوفة والخبر شبه جملة` },
          { text: `بين الخطأ في الجمل الاتيه ، ثم صححه ؟\n1- ثوابها للفضيلة\n2- تقدم الخبر (وجوباً ) في : (مالي نصيب) (هل لي نصيب )`, answer: `الجملة : ثوابها - هل لي نصيب - مالي نصيب\nالخطأ : 1- تقدم المبتدأ المتصل به الضمير (ها) العائد على متأخر لفظاً ورتبة\n2- سبقت جملة تقديم الخبر على المبتدأ ب (نفي) و (استفهام)\nالتصحيح :1- للفضيلة ثوابها\n2- لي نصيب` }
        ],
        done: false
      }
    ]
  };

  DATA["2025-10-06"] = {
    tasks:[
      {subject:"إنكليزي",content:"Unit 3 - Lecture 10 & 11",hours:2,done:false},
      {subject:"كيمياء",content:"Chapter 3 - Lecture 17 & 18",hours:2,done:false}
    ],
    exams:[
      {
        subject:"ادب عربي",
        title:"علي الشرقي+ حافظ ابراهيم",
        questions:[
          {text:"تحدث عن مسيرة (علي الشرقي) الجهادية؟",answer:"‏يعد على الشرقي إحدى الشخصيات المهمة في ثورة العشرين فقد كان مرافقاً للحبوبي في مسيرته الجهادية ضد الانكليز عام 1915 وكان مبعوثه إلى عشائر الغراف."},
          {text:"ما هي الفنون أو الأساليب البلاغية التي ضمنها على الشرقي في قصيدته",answer:"استعمل طباق السلب والطباق الإيجاب والجناس غير التام وبعض فنون البديع."},
          {text:"هل للماضي دلالة في شعر حافظ ابراهيم أثبت او علل ذلك ؟",answer:"يعمد الى توظيف الفعل الماضي لتقديم مقدار تعلقه بالماضي وقيمه القومية وتغنيه بالماضي المجيد."}
        ],
        done:false
      }
    ]
  };

  DATA["2025-10-07"] = {
    tasks:[
      {subject:"عربي", content:"أسلوب التوكيد - Lecture 1 & 2", hours:2, done:false},
      {subject:"أحياء", content:"Chapter 3 - Lecture 19 & 20", hours:2, done:false},
      {subject:"فيزياء", content:"مراجعة الفصل 3 - Lesson 1 & 2", hours:1, done:false}
    ],
    exams:[
      {
        subject:"انكليزي",
        title:"محاضرة 6-7-8-9",
        questions:[
          {text:"will you be free to play in the match on Saturday? The football coach asked me.", answer:"The football coach asked me if I would be free to play in the match on Saturday."},
          {text:"When did you lose your bag? I asked her.", answer:"I asked her when she had lost her bag"},
          {text:"if she (not apply) for a scholarship, of course she won't get one.", answer:"doesn't apply"}
        ],
        done:false
      }
    ]
  };

  DATA["2025-10-08"] = {
    tasks:[
      {subject:"عربي", content:"أسلوب التوكيد - Lecture 3 & 4", hours:2, done:false},
      {subject:"أدب عربي", content:"ميخائيل نعيمة - ورقتين", hours:2, done:false},
      {subject:"أحياء", content:"Chapter 3 - Lecture 21 & 22", hours:2, done:false}
    ],
    exams:[]
  };

  DATA["2025-10-09"] = {
    tasks:[],
    exams:[{subject:"شامل", title:"امتحانات شاملة + إسلامية", questions:[], done:false}]
  };

  DATA["2025-10-10"] = {
    tasks:[
      {subject:"أحياء", content:"Chapter 4 - Lecture 1 & 2", hours:2, done:false},
      {subject:"عربي", content:"مراجعة أسلوب التوكيد", hours:2, done:false}
    ],
    exams:[]
  };

  DATA["2025-10-11"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 1 & 2", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 1 & 2", hours: 2, done: false },
      { subject: "رياضيات", content: "مراجعة مسائل", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-12"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 3 & 4", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 3 & 4", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-13"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 5 & 6", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 5 & 6", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-14"] = {
    tasks: [
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false },
      { subject: "أحياء", content: "Chapter 4 - Lecture 3 & 4", hours: 2, done: false },
      { subject: "فيزياء", content: "مراجعة الفصل 3 - Lesson 3 & 4", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-15"] = {
    tasks: [
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false },
      { subject: "أدب عربي", content: "مراجعة ميخائيل نعيمة", hours: 2, done: false },
      { subject: "أحياء", content: "Chapter 4 - Lecture 5 & 6", hours: 2, done: false }
    ],
    exams: []
  };


  DATA["2025-10-16"] = {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [], done: false }
    ]
  };

  DATA["2025-10-17"] = {
    tasks: [
      { subject: "أحياء", content: "Chapter 4 - Lecture 7 & 8", hours: 2, done: false },
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-18"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 7 & 8", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 7 & 8", hours: 2, done: false },
      { subject: "رياضيات", content: "مراجعة مسائل", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-19"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 9 & 10", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 9 & 10", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-20"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 11 & 12", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 11 & 12", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-21"] = {
    tasks: [
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false },
      { subject: "أحياء", content: "Chapter 4 - Lecture 9 & 10", hours: 2, done: false },
      { subject: "فيزياء", content: "مراجعة الفصل 3 - Lesson 5 & 6", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-22"] = {
    tasks: [
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false },
      { subject: "أدب عربي", content: "مراجعة ميخائيل نعيمة", hours: 2, done: false },
      { subject: "أحياء", content: "Chapter 4 - Lecture 11 & 12", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-23"] = {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [], done: false }
    ]
  };

  DATA["2025-10-24"] = {
    tasks: [
      { subject: "أحياء", content: "Chapter 4 - Lecture 13 & 14", hours: 2, done: false },
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-25"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 13 & 14", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 13 & 14", hours: 2, done: false },
      { subject: "رياضيات", content: "مراجعة مسائل", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-26"] = {
    tasks: [
      { subject: "إسلامية", content: "مراجعة ورقة واحدة", hours: 1, done: false },
      { subject: "أحياء", content: "Chapter 4 - Lecture 15 & 16", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-27"] = {
    tasks: [
      { subject: "إنكليزي", content: "Unit 4 - Lecture 15 & 16", hours: 2, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 15 & 16", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-28"] = {
    tasks: [
      { subject: "أحياء", content: "Chapter 4 - Lecture 17 & 18", hours: 2, done: false },
      { subject: "عربي", content: "مراجعة أسلوب التوكيد", hours: 2, done: false },
      { subject: "فيزياء", content: "مراجعة الفصل 3 - Lesson 11 & 12", hours: 1, done: false }
    ],
    exams: []
  };

  DATA["2025-10-29"] = {
    tasks: [
      { subject: "رياضيات", content: "مراجعة مسائل", hours: 1, done: false },
      { subject: "كيمياء", content: "Chapter 4 - Lecture 17 & 18", hours: 2, done: false }
    ],
    exams: []
  };

  DATA["2025-10-30"] = {
    tasks: [],
    exams: [
      { subject: "شامل", title: "امتحانات شاملة + إسلامية", questions: [], done: false }
    ]
  }; 

// إضافة id لكل مهمة وامتحان + done لكل مهمة  
Object.keys(DATA).forEach(date=>{  
  const day = DATA[date];  
  if(Array.isArray(day.tasks)){  
    day.tasks.forEach((t,i)=>{  
      t.id = t.id || t-${date}-${i};  
      if(t.done === undefined) t.done = false;  
    });  
  } else {  
    day.tasks = [];  
  }  
  if(Array.isArray(day.exams)){  
    day.exams.forEach((e,i)=>{  
      e.id = e.id || e-${date}-${i};  
      if(Array.isArray(e.questions)){  
        e.questions.forEach((q,qi)=> q.id = q.id || `${e.id}-q${qi}`);  
      } else e.questions = [];  
    });  
  } else {  
    day.exams = [];  
  }  
});  

return DATA;};
