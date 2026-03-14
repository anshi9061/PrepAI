import type { ExamProfile } from '../types';

const BOARD_SUBJECTS_12 = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English',
  'Computer Science', 'Economics', 'Accountancy', 'Business Studies',
  'History', 'Political Science',
];

const BOARD_SUBJECTS_10 = [
  'Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Regional Language',
];

export const STATES_LIST = [
  'Kerala', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'West Bengal', 'Delhi', 'Uttar Pradesh', 'Rajasthan',
  'Gujarat', 'Assam', 'Odisha', 'Punjab', 'Haryana', 'Jharkhand',
  'Bihar', 'Goa', 'Madhya Pradesh', 'Jammu & Kashmir',
];

export const EXAM_DATABASE: ExamProfile[] = [
  // National - Medical
  { id: 'neet_ug', name: 'NEET UG', shortName: 'NEET', level: 'National', category: 'Medical', startYear: 2013, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology'], description: 'National Eligibility cum Entrance Test' },
  { id: 'neet_pg', name: 'NEET PG', shortName: 'NEET PG', level: 'National', category: 'Medical', startYear: 2013, hasSubjects: false },
  { id: 'aiims_ug', name: 'AIIMS MBBS (Old)', shortName: 'AIIMS', level: 'National', category: 'Medical', startYear: 2000, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology', 'GK'] },
  { id: 'jipmer', name: 'JIPMER (Old)', shortName: 'JIPMER', level: 'National', category: 'Medical', startYear: 2005, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'afmc', name: 'AFMC Nursing/MBBS', shortName: 'AFMC', level: 'National', category: 'Medical', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology'] },

  // National - Engineering
  { id: 'jee_main', name: 'JEE Main', shortName: 'JEE Main', level: 'National', category: 'Engineering', startYear: 2013, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'], description: 'Joint Entrance Examination Main' },
  { id: 'jee_adv', name: 'JEE Advanced', shortName: 'JEE Adv', level: 'National', category: 'Engineering', startYear: 2013, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'bitsat', name: 'BITSAT', shortName: 'BITSAT', level: 'National', category: 'Engineering', startYear: 2005, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Logic'] },
  { id: 'viteee', name: 'VITEEE', shortName: 'VITEEE', level: 'National', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
  { id: 'srmjeee', name: 'SRMJEEE', shortName: 'SRMJEEE', level: 'National', category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'comedk', name: 'COMEDK UGET', shortName: 'COMEDK', level: 'National', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },

  // National - Science / CUET
  { id: 'cuet_ug', name: 'CUET UG', shortName: 'CUET', level: 'National', category: 'Science', startYear: 2022, hasSubjects: true, subjects: ['General Test', ...BOARD_SUBJECTS_12] },
  { id: 'iiser_iat', name: 'IISER IAT', shortName: 'IAT', level: 'National', category: 'Science', startYear: 2017, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
  { id: 'nest', name: 'NEST', shortName: 'NEST', level: 'National', category: 'Science', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },

  // National - Law
  { id: 'clat', name: 'CLAT', shortName: 'CLAT', level: 'National', category: 'Law', startYear: 2008, hasSubjects: true, subjects: ['English', 'Current Affairs', 'Legal Reasoning', 'Logical Reasoning', 'Quantitative Techniques'] },
  { id: 'ailet', name: 'AILET', shortName: 'AILET', level: 'National', category: 'Law', startYear: 2010, hasSubjects: false },

  // National - Defence
  { id: 'nda', name: 'UPSC NDA', shortName: 'NDA', level: 'National', category: 'Defence', startYear: 2010, hasSubjects: true, subjects: ['Mathematics', 'GAT'] },
  { id: 'cds', name: 'UPSC CDS', shortName: 'CDS', level: 'National', category: 'Defence', startYear: 2010, hasSubjects: true, subjects: ['English', 'General Knowledge', 'Elementary Mathematics'] },
  { id: 'afcat', name: 'AFCAT', shortName: 'AFCAT', level: 'National', category: 'Defence', startYear: 2011, hasSubjects: false },

  // National - Government
  { id: 'upsc_pre', name: 'UPSC Prelims', shortName: 'UPSC', level: 'National', category: 'Government', startYear: 1995, hasSubjects: true, subjects: ['GS Paper 1', 'CSAT'] },
  { id: 'ssc_cgl', name: 'SSC CGL', shortName: 'SSC CGL', level: 'National', category: 'Government', startYear: 2015, hasSubjects: true, subjects: ['Reasoning', 'Awareness', 'Quant', 'English'] },
  { id: 'ibps_po', name: 'IBPS PO', shortName: 'IBPS PO', level: 'National', category: 'Government', startYear: 2015, hasSubjects: false },

  // National - Boards
  { id: 'cbse_12', name: 'CBSE Class 12', shortName: 'CBSE 12', level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'cbse_10', name: 'CBSE Class 10', shortName: 'CBSE 10', level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_10 },
  { id: 'icse_10', name: 'ICSE Class 10', shortName: 'ICSE 10', level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_10 },
  { id: 'isc_12', name: 'ISC Class 12', shortName: 'ISC 12', level: 'National', category: 'Board', startYear: 2010, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },

  // State - Boards
  { id: 'kerala_12', name: 'Kerala DHSE +2', shortName: 'Kerala +2', level: 'State', state: 'Kerala', category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'tn_12', name: 'TN Board +2', shortName: 'TN +2', level: 'State', state: 'Tamil Nadu', category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },
  { id: 'mh_12', name: 'Maharashtra HSC', shortName: 'Maha HSC', level: 'State', state: 'Maharashtra', category: 'Board', startYear: 2015, hasSubjects: true, subjects: BOARD_SUBJECTS_12 },

  // State - Kerala
  { id: 'keam_eng', name: 'KEAM Engineering', shortName: 'KEAM', level: 'State', state: 'Kerala', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'keam_med_old', name: 'KEAM Medical (Old)', shortName: 'KEAM Med', level: 'State', state: 'Kerala', category: 'Medical', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'kerala_poly', name: 'Kerala Polytechnic', shortName: 'Polytechnic', level: 'State', state: 'Kerala', category: 'Polytechnic', startYear: 2015, hasSubjects: false },
  { id: 'kpsc', name: 'Kerala PSC', shortName: 'KPSC', level: 'State', state: 'Kerala', category: 'Government', startYear: 2018, hasSubjects: false },

  // State - Karnataka
  { id: 'kcet', name: 'KCET Engineering', shortName: 'KCET', level: 'State', state: 'Karnataka', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
  { id: 'dcet', name: 'Karnataka DCET', shortName: 'DCET', level: 'State', state: 'Karnataka', category: 'Engineering', startYear: 2015, hasSubjects: false },

  // State - Tamil Nadu
  { id: 'tancet', name: 'TANCET (MBA/MCA)', shortName: 'TANCET', level: 'State', state: 'Tamil Nadu', category: 'Management', startYear: 2013, hasSubjects: true, subjects: ['MBA', 'MCA'] },
  { id: 'tnpsc', name: 'TNPSC Group Exams', shortName: 'TNPSC', level: 'State', state: 'Tamil Nadu', category: 'Government', startYear: 2015, hasSubjects: false },

  // State - Andhra Pradesh
  { id: 'ap_eamcet', name: 'AP EAMCET Eng', shortName: 'AP EAMCET', level: 'State', state: 'Andhra Pradesh', category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'ap_polycet', name: 'AP POLYCET', shortName: 'AP POLYCET', level: 'State', state: 'Andhra Pradesh', category: 'Polytechnic', startYear: 2015, hasSubjects: false },

  // State - Telangana
  { id: 'ts_eamcet', name: 'TS EAMCET Eng', shortName: 'TS EAMCET', level: 'State', state: 'Telangana', category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },

  // State - Maharashtra
  { id: 'mht_cet_eng', name: 'MHT CET Engineering', shortName: 'MHT CET', level: 'State', state: 'Maharashtra', category: 'Engineering', startYear: 2016, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'mht_cet_pharm', name: 'MHT CET Pharmacy', shortName: 'MHT CET P', level: 'State', state: 'Maharashtra', category: 'Pharmacy', startYear: 2016, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Biology'] },

  // State - West Bengal
  { id: 'wbjee', name: 'WBJEE', shortName: 'WBJEE', level: 'State', state: 'West Bengal', category: 'Engineering', startYear: 2010, hasSubjects: true, subjects: ['Mathematics', 'Physics', 'Chemistry'] },

  // State - Delhi
  { id: 'ipu_cet', name: 'IPU CET (Old)', shortName: 'IPU CET', level: 'State', state: 'Delhi', category: 'Engineering', startYear: 2012, hasSubjects: false },

  // State - Uttar Pradesh
  { id: 'upsee', name: 'UPSEE (Old)', shortName: 'UPSEE', level: 'State', state: 'Uttar Pradesh', category: 'Engineering', startYear: 2010, hasSubjects: false },
  { id: 'uppsc', name: 'UPPSC Exams', shortName: 'UPPSC', level: 'State', state: 'Uttar Pradesh', category: 'Government', startYear: 2015, hasSubjects: false },

  // State - Gujarat
  { id: 'gujcet', name: 'GUJCET', shortName: 'GUJCET', level: 'State', state: 'Gujarat', category: 'Engineering', startYear: 2015, hasSubjects: true, subjects: ['Physics', 'Chemistry', 'Maths/Bio'] },
];
