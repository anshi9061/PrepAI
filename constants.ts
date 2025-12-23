import { Paper, Question, QuizAttempt, TopicStrength, ExamProfile, ExamPattern } from "./types";

export const MOCK_QUESTIONS: Question[] = [
  // --- BIOLOGY (NEET Level) ---
  {
    id: 1,
    text: "Which of the following organelles is responsible for the synthesis of lipids?",
    options: ["Rough Endoplasmic Reticulum", "Smooth Endoplasmic Reticulum", "Golgi Apparatus", "Lysosome"],
    correctAnswer: 1,
    topic: "Cell Structure",
    difficulty: "Medium",
    explanation: "The Smooth Endoplasmic Reticulum (SER) is the major site for the synthesis of lipids.",
    subject: "Biology"
  },
  {
    id: 2,
    text: "In the context of genetics, what is the phenotypic ratio of a Mendelian dihybrid cross?",
    options: ["1:2:1", "3:1", "9:3:3:1", "9:7"],
    correctAnswer: 2,
    topic: "Genetics",
    difficulty: "Medium",
    explanation: "The standard phenotypic ratio for a dihybrid cross between two heterozygous parents is 9:3:3:1.",
    subject: "Biology"
  },
  {
    id: 3,
    text: "Which plant hormone promotes fruit ripening?",
    options: ["Auxin", "Gibberellin", "Ethylene", "Cytokinin"],
    correctAnswer: 2,
    topic: "Plant Physiology",
    difficulty: "Easy",
    explanation: "Ethylene is a gaseous hormone that regulates fruit ripening and senescence.",
    subject: "Biology"
  },
  
  // --- PHYSICS (JEE Level) ---
  {
    id: 4,
    text: "A particle is projected with velocity 20 m/s at an angle of 45° with the horizontal. What is its horizontal range? (g=10 m/s²)",
    options: ["20 m", "40 m", "80 m", "10 m"],
    correctAnswer: 1,
    topic: "Kinematics",
    difficulty: "Medium",
    explanation: "Range R = (u² sin 2θ) / g. Here u=20, θ=45. R = (400 * 1) / 10 = 40 meters.",
    subject: "Physics"
  },
  {
    id: 5,
    text: "Two resistors of 6Ω and 3Ω are connected in parallel. What is the equivalent resistance?",
    options: ["9Ω", "2Ω", "4.5Ω", "18Ω"],
    correctAnswer: 1,
    topic: "Current Electricity",
    difficulty: "Easy",
    explanation: "For parallel combination: 1/Req = 1/R1 + 1/R2. 1/Req = 1/6 + 1/3 = 3/6 = 1/2. Thus, Req = 2Ω.",
    subject: "Physics"
  },
  {
    id: 6,
    text: "The escape velocity from the surface of the Earth is approximately:",
    options: ["11.2 km/s", "7.9 km/s", "9.8 km/s", "330 m/s"],
    correctAnswer: 0,
    topic: "Gravitation",
    difficulty: "Easy",
    explanation: "The escape velocity for Earth is calculated as √(2gR) which is approximately 11.2 km/s.",
    subject: "Physics"
  },

  // --- CHEMISTRY (NEET/JEE) ---
  {
    id: 7,
    text: "Which of the following compounds exhibits hydrogen bonding?",
    options: ["CH4", "H2S", "NH3", "PH3"],
    correctAnswer: 2,
    topic: "Chemical Bonding",
    difficulty: "Medium",
    explanation: "Ammonia (NH3) exhibits hydrogen bonding due to the high electronegativity of Nitrogen attached to Hydrogen.",
    subject: "Chemistry"
  },
  {
    id: 8,
    text: "What is the hybridization of carbon in Ethene (C2H4)?",
    options: ["sp", "sp2", "sp3", "dsp2"],
    correctAnswer: 1,
    topic: "Organic Chemistry",
    difficulty: "Easy",
    explanation: "In Ethene, each carbon atom forms a double bond, resulting in sp2 hybridization.",
    subject: "Chemistry"
  },

  // --- MATHS (JEE) ---
  {
    id: 9,
    text: "If f(x) = sin(x), what is the derivative f'(π/2)?",
    options: ["1", "0", "-1", "undefined"],
    correctAnswer: 1,
    topic: "Calculus",
    difficulty: "Easy",
    explanation: "f'(x) = cos(x). At x = π/2, f'(π/2) = cos(π/2) = 0.",
    subject: "Mathematics"
  },
  {
    id: 10,
    text: "The roots of the equation x² - 5x + 6 = 0 are:",
    options: ["2, 3", "-2, -3", "1, 6", "-1, -6"],
    correctAnswer: 0,
    topic: "Quadratic Equations",
    difficulty: "Easy",
    explanation: "Factorizing: (x-2)(x-3) = 0. Roots are x=2 and x=3.",
    subject: "Mathematics"
  },

  // --- GENERAL KNOWLEDGE / LAW ---
  {
    id: 11,
    text: "The Preamble to the Constitution of India declares India as a:",
    options: ["Sovereign, Democratic Republic", "Sovereign, Socialist, Secular, Democratic Republic", "Federal State", "Unitary State"],
    correctAnswer: 1,
    topic: "Polity",
    difficulty: "Medium",
    explanation: "The Preamble declares India to be a Sovereign, Socialist, Secular, Democratic Republic.",
    subject: "General Knowledge"
  },
  {
    id: 12,
    text: "Who is known as the 'Father of Economics'?",
    options: ["Karl Marx", "Adam Smith", "John Maynard Keynes", "Amartya Sen"],
    correctAnswer: 1,
    topic: "Economics",
    difficulty: "Easy",
    explanation: "Adam Smith is classically considered the father of modern economics.",
    subject: "General Knowledge"
  }
];

// --- REAL EXAM PATTERNS ---
export const EXAM_PATTERNS: Record<string, ExamPattern> = {
    // 1. NEET: 200 Questions (180 to be answered, but we mock full set), 200 Mins
    'neet_ug': {
        examId: 'neet_ug',
        durationMinutes: 200, 
        totalQuestions: 200,
        sections: [
            { subject: "Physics", questionCount: 50 },
            { subject: "Chemistry", questionCount: 50 },
            { subject: "Biology", questionCount: 100 }
        ]
    },
    // 2. JEE Main: 90 Questions, 180 Mins
    'jee_main': {
        examId: 'jee_main',
        durationMinutes: 180,
        totalQuestions: 90,
        sections: [
            { subject: "Physics", questionCount: 30 },
            { subject: "Chemistry", questionCount: 30 },
            { subject: "Mathematics", questionCount: 30 }
        ]
    },
    // 3. KEAM: 120 Questions, 150 Mins
    'keam_eng': {
        examId: 'keam_eng',
        durationMinutes: 150,
        totalQuestions: 120,
        sections: [
            { subject: "Physics", questionCount: 72 }, // Weighted more in KEAM Eng
            { subject: "Chemistry", questionCount: 48 }
        ]
    },
    // 4. CLAT: 150 Questions, 120 Mins
    'clat': {
        examId: 'clat',
        durationMinutes: 120,
        totalQuestions: 150,
        sections: [
            { subject: "English", questionCount: 30 },
            { subject: "General Knowledge", questionCount: 35 },
            { subject: "Legal Reasoning", questionCount: 40 },
            { subject: "Logical Reasoning", questionCount: 30 },
            { subject: "Quant", questionCount: 15 }
        ]
    },
    // 5. Default Fallback
    'default': {
        examId: 'default',
        durationMinutes: 60,
        totalQuestions: 30,
        sections: [
            { subject: "General", questionCount: 30 }
        ]
    }
};

export const MOCK_PAPERS: Paper[] = [
  { id: 1, title: "JEE Main 2023 - Shift 1", exam: "JEE", year: 2023, subject: "Physics", downloadUrl: "#" },
  { id: 2, title: "NEET UG 2022", exam: "NEET", year: 2022, subject: "Biology", downloadUrl: "#" },
  { id: 3, title: "CBSE Class 12 Math", exam: "Board", year: 2023, subject: "Math", downloadUrl: "#" },
  { id: 4, title: "JEE Advanced 2021", exam: "JEE", year: 2021, subject: "Chemistry", downloadUrl: "#" },
  { id: 5, title: "SAT Practice Test #5", exam: "SAT", year: 2024, subject: "General", downloadUrl: "#" },
];

export const MOCK_ATTEMPTS: QuizAttempt[] = [
  { id: 101, date: "2024-05-20", score: 8, totalQuestions: 10, topic: "Physics" },
  { id: 102, date: "2024-05-21", score: 6, totalQuestions: 10, topic: "Chemistry" },
  { id: 103, date: "2024-05-22", score: 9, totalQuestions: 10, topic: "Math" },
  { id: 104, date: "2024-05-23", score: 7, totalQuestions: 10, topic: "Biology" },
];

export const TOPIC_STRENGTHS: TopicStrength[] = [
  { topic: "Organic Chem", strength: 45, fullMark: 100 },
  { topic: "Mechanics", strength: 80, fullMark: 100 },
  { topic: "Calculus", strength: 65, fullMark: 100 },
  { topic: "Genetics", strength: 90, fullMark: 100 },
  { topic: "Thermodynamics", strength: 55, fullMark: 100 },
];

export const USER_NAME = "Alex";

// --- EXAM DATABASE ---

const COMMON_SCIENCE_SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];
const BOARD_SUBJECTS_12 = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science", "Economics", "Accountancy", "Business Studies", "History", "Political Science"];
const BOARD_SUBJECTS_10 = ["Mathematics", "Science", "Social Science", "English", "Hindi", "Regional Language"];

export const STATES_LIST = [
  "Kerala", "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Maharashtra", 
  "West Bengal", "Delhi", "Uttar Pradesh", "Rajasthan", "Gujarat", "Assam", 
  "Odisha", "Punjab", "Haryana", "Jharkhand", "Bihar", "Goa", "Madhya Pradesh", "Jammu & Kashmir"
];

export const EXAM_DATABASE: ExamProfile[] = [
  // --- NATIONAL LEVEL EXAMS ---

  // Medical
  { id: 'neet_ug', name: "NEET UG", shortName: "NEET", level: 'National', category: 'Medical', startYear: 2013, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology"], description: "National Eligibility cum Entrance Test" },
  { id: 'neet_pg', name: "NEET PG", shortName: "NEET PG", level: 'National', category: 'Medical', startYear: 2013, hasSubjects: false },
  { id: 'aiims_ug', name: "AIIMS MBBS (Old)", shortName: "AIIMS", level: 'National', category: 'Medical', startYear: 2000, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology", "GK"] },
  { id: 'jipmer', name: "JIPMER (Old)", shortName: "JIPMER", level: 'National', category: 'Medical', startYear: 2005, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology"] },
  { id: 'afmc', name: "AFMC Nursing/MBBS", shortName: "AFMC", level: 'National', category: 'Medical', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology"] },
  
  // Engineering
  { id: 'jee_main', name: "JEE Main", shortName: "JEE Main", level: 'National', category: 'Engineering', startYear: 2013, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"], description: "Joint Entrance Examination Main" },
  { id: 'jee_adv', name: "JEE Advanced", shortName: "JEE Adv", level: 'National', category: 'Engineering', startYear: 2013, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: 'bitsat', name: "BITSAT", shortName: "BITSAT", level: 'National', category: 'Engineering', startYear: 2005, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics", "English", "Logic"] },
  { id: 'viteee', name: "VITEEE", shortName: "VITEEE", level: 'National', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: 'srmjeee', name: "SRMJEEE", shortName: "SRMJEEE", level: 'National', category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: 'comedk', name: "COMEDK UGET", shortName: "COMEDK", level: 'National', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  
  // Science / CUET
  { id: 'cuet_ug', name: "CUET UG", shortName: "CUET", level: 'National', category: 'Science', startYear: 2022, hasSubjects: true, subjects: ["General Test", ...BOARD_SUBJECTS_12] },
  { id: 'iiser_iat', name: "IISER IAT", shortName: "IAT", level: 'National', category: 'Science', startYear: 2017, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: 'nest', name: "NEST", shortName: "NEST", level: 'National', category: 'Science', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },

  // Law
  { id: 'clat', name: "CLAT", shortName: "CLAT", level: 'National', category: 'Law', startYear: 2008, hasSubjects: true, subjects: ["English", "Current Affairs", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques"] },
  { id: 'ailet', name: "AILET", shortName: "AILET", level: 'National', category: 'Law', startYear: 2010, hasSubjects: false },
  
  // Defence
  { id: 'nda', name: "UPSC NDA", shortName: "NDA", level: 'National', category: 'Defence', startYear: 2010, hasSubjects: true, subjects: ["Mathematics", "GAT"] },
  { id: 'cds', name: "UPSC CDS", shortName: "CDS", level: 'National', category: 'Defence', startYear: 2010, hasSubjects: true, subjects: ["English", "General Knowledge", "Elementary Mathematics"] },
  { id: 'afcat', name: "AFCAT", shortName: "AFCAT", level: 'National', category: 'Defence', startYear: 2011, hasSubjects: false },

  // Government & Competitive
  { id: 'upsc_pre', name: "UPSC Prelims", shortName: "UPSC", level: 'National', category: 'Government', startYear: 1995, hasSubjects: true, subjects: ["GS Paper 1", "CSAT"] },
  { id: 'ssc_cgl', name: "SSC CGL", shortName: "SSC CGL", level: 'National', category: 'Government', startYear: 2015, hasSubjects: true, subjects: ["Reasoning", "Awareness", "Quant", "English"] },
  { id: 'ibps_po', name: "IBPS PO", shortName: "IBPS PO", level: 'National', category: 'Government', startYear: 2015, hasSubjects: false },

  // --- BOARDS ---
  { id: 'cbse_12', name: "CBSE Class 12", shortName: "CBSE 12", level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'cbse_10', name: "CBSE Class 10", shortName: "CBSE 10", level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_10 },
  { id: 'icse_10', name: "ICSE Class 10", shortName: "ICSE 10", level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_10 },
  { id: 'isc_12', name: "ISC Class 12", shortName: "ISC 12", level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  
  { id: 'kerala_12', name: "Kerala DHSE +2", shortName: "Kerala +2", level: 'State', state: "Kerala", category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'tn_12', name: "TN Board +2", shortName: "TN +2", level: 'State', state: "Tamil Nadu", category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'mh_12', name: "Maharashtra HSC", shortName: "Maha HSC", level: 'State', state: "Maharashtra", category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },

  // --- STATE WISE EXAMS ---

  // KERALA
  { id: 'keam_eng', name: "KEAM Engineering", shortName: "KEAM", level: 'State', state: "Kerala", category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: 'keam_med_old', name: "KEAM Medical (Old)", shortName: "KEAM Med", level: 'State', state: "Kerala", category: 'Medical', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology"] },
  { id: 'kerala_poly', name: "Kerala Polytechnic", shortName: "Polytechnic", level: 'State', state: "Kerala", category: 'Polytechnic', startYear: 2015, hasSubjects: false },
  { id: 'kpsc', name: "Kerala PSC", shortName: "KPSC", level: 'State', state: "Kerala", category: 'Government', startYear: 2018, hasSubjects: false },

  // KARNATAKA
  { id: 'kcet', name: "KCET Engineering", shortName: "KCET", level: 'State', state: "Karnataka", category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: 'dcet', name: "Karnataka DCET", shortName: "DCET", level: 'State', state: "Karnataka", category: 'Engineering', startYear: 2015, hasSubjects: false },
  
  // TAMIL NADU
  { id: 'tancet', name: "TANCET (MBA/MCA)", shortName: "TANCET", level: 'State', state: "Tamil Nadu", category: 'Management', startYear: 2013, hasSubjects: true, subjects: ["MBA", "MCA"] },
  { id: 'tnpsc', name: "TNPSC Group Exams", shortName: "TNPSC", level: 'State', state: "Tamil Nadu", category: 'Government', startYear: 2015, hasSubjects: false },
  
  // ANDHRA PRADESH
  { id: 'ap_eamcet', name: "AP EAMCET Eng", shortName: "AP EAMCET", level: 'State', state: "Andhra Pradesh", category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: 'ap_polycet', name: "AP POLYCET", shortName: "AP POLYCET", level: 'State', state: "Andhra Pradesh", category: 'Polytechnic', startYear: 2015, hasSubjects: false },

  // TELANGANA
  { id: 'ts_eamcet', name: "TS EAMCET Eng", shortName: "TS EAMCET", level: 'State', state: "Telangana", category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  
  // MAHARASHTRA
  { id: 'mht_cet_eng', name: "MHT CET Engineering", shortName: "MHT CET", level: 'State', state: "Maharashtra", category: 'Engineering', startYear: 2016, hasSubjects: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: 'mht_cet_pharm', name: "MHT CET Pharmacy", shortName: "MHT CET P", level: 'State', state: "Maharashtra", category: 'Pharmacy', startYear: 2016, hasSubjects: true, subjects: ["Physics", "Chemistry", "Biology"] },
  
  // WEST BENGAL
  { id: 'wbjee', name: "WBJEE", shortName: "WBJEE", level: 'State', state: "West Bengal", category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ["Mathematics", "Physics", "Chemistry"] },

  // DELHI
  { id: 'ipu_cet', name: "IPU CET (Old)", shortName: "IPU CET", level: 'State', state: "Delhi", category: 'Engineering', startYear: 2012, hasSubjects: false },

  // UTTAR PRADESH
  { id: 'upsee', name: "UPSEE (Old)", shortName: "UPSEE", level: 'State', state: "Uttar Pradesh", category: 'Engineering', startYear: 2010, hasSubjects: false },
  { id: 'uppsc', name: "UPPSC Exams", shortName: "UPPSC", level: 'State', state: "Uttar Pradesh", category: 'Government', startYear: 2015, hasSubjects: false },

  // GUJARAT
  { id: 'gujcet', name: "GUJCET", shortName: "GUJCET", level: 'State', state: "Gujarat", category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ["Physics", "Chemistry", "Maths/Bio"] },

];

// --- TOPIC DATABASE ---
export const TOPIC_DATABASE: Record<string, string[]> = {
  "Physics": ["Kinematics", "Laws of Motion", "Work, Energy & Power", "Rotational Motion", "Gravitation", "Thermodynamics", "Electrostatics", "Current Electricity", "Magnetism", "Optics", "Modern Physics", "Semiconductors"],
  "Chemistry": ["Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block Elements", "p-Block Elements", "Organic Chemistry - Basic Principles", "Hydrocarbons", "Haloalkanes", "Alcohols & Phenols", "Aldehydes & Ketones", "Amines", "Biomolecules"],
  "Biology": ["Diversity in Living World", "Structural Organisation", "Cell Structure & Function", "Plant Physiology", "Human Physiology", "Reproduction", "Genetics & Evolution", "Biology in Human Welfare", "Biotechnology", "Ecology"],
  "Mathematics": ["Sets & Functions", "Trigonometry", "Complex Numbers", "Quadratic Equations", "Permutations & Combinations", "Binomial Theorem", "Sequences & Series", "Straight Lines", "Conic Sections", "Limits & Derivatives", "Probability", "Matrices & Determinants", "Calculus", "Vectors", "3D Geometry"],
  "English": ["Reading Comprehension", "Grammar", "Vocabulary", "Writing Skills", "Literature"],
  "General Knowledge": ["History", "Geography", "Polity", "Economics", "Current Affairs"],
  "Reasoning": ["Verbal Reasoning", "Non-Verbal Reasoning", "Analytical Reasoning", "Data Interpretation"],
  "Quant": ["Number System", "Arithmetic", "Algebra", "Geometry", "Mensuration"],
  "Legal Reasoning": ["Torts", "Contracts", "Criminal Law", "Constitution", "Legal GK"],
  "History": ["Ancient India", "Medieval India", "Modern India", "World History"],
  "Geography": ["Physical Geography", "Indian Geography", "World Geography"],
  "Economics": ["Microeconomics", "Macroeconomics", "Indian Economy"],
  "Accountancy": ["Accounting for Partnership", "Company Accounts", "Financial Statements", "Computerised Accounting"],
  "Business Studies": ["Nature of Management", "Principles of Management", "Business Environment", "Planning", "Organising"],
};