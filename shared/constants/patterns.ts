import type { ExamPattern } from '../types';

export const EXAM_PATTERNS: Record<string, ExamPattern> = {
  neet_ug: {
    examId: 'neet_ug',
    durationMinutes: 200,
    totalQuestions: 200,
    sections: [
      { subject: 'Physics', questionCount: 50 },
      { subject: 'Chemistry', questionCount: 50 },
      { subject: 'Biology', questionCount: 100 },
    ],
  },
  jee_main: {
    examId: 'jee_main',
    durationMinutes: 180,
    totalQuestions: 90,
    sections: [
      { subject: 'Physics', questionCount: 30 },
      { subject: 'Chemistry', questionCount: 30 },
      { subject: 'Mathematics', questionCount: 30 },
    ],
  },
  keam_eng: {
    examId: 'keam_eng',
    durationMinutes: 150,
    totalQuestions: 120,
    sections: [
      { subject: 'Physics', questionCount: 72 },
      { subject: 'Chemistry', questionCount: 48 },
    ],
  },
  clat: {
    examId: 'clat',
    durationMinutes: 120,
    totalQuestions: 150,
    sections: [
      { subject: 'English', questionCount: 30 },
      { subject: 'General Knowledge', questionCount: 35 },
      { subject: 'Legal Reasoning', questionCount: 40 },
      { subject: 'Logical Reasoning', questionCount: 30 },
      { subject: 'Quant', questionCount: 15 },
    ],
  },
  default: {
    examId: 'default',
    durationMinutes: 60,
    totalQuestions: 30,
    sections: [{ subject: 'General', questionCount: 30 }],
  },
};
