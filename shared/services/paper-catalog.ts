import { EXAM_DATABASE, STATES_LIST } from '../constants';
import type { ExamProfile, ExamCategory, ExamLevel, PaperResource } from '../types';

export const getExamLevels = () => [
  { id: 'National' as const, label: 'All India Exams', desc: 'NEET, JEE, UPSC, & More' },
  { id: 'State' as const, label: 'State-wise Exams', desc: 'KEAM, KCET, MHT-CET & More' },
  { id: 'Board' as const, label: 'Board Exams', desc: 'CBSE, ICSE & State Boards' },
];

export const getAllStates = (): string[] => STATES_LIST;

export const getCategoriesForContext = (level: ExamLevel, state?: string): ExamCategory[] => {
  const relevant = EXAM_DATABASE.filter((e) => {
    if (e.level !== level) return false;
    if (level === 'State' && state && e.state !== state) return false;
    return true;
  });
  return Array.from(new Set(relevant.map((e) => e.category)));
};

export const getExamsByContext = (
  level: ExamLevel,
  category?: ExamCategory,
  state?: string,
): ExamProfile[] =>
  EXAM_DATABASE.filter((e) => {
    if (e.level !== level) return false;
    if (state && e.state !== state) return false;
    if (category && e.category !== category) return false;
    return true;
  });

export const getAvailableYears = (examId: string): number[] => {
  const exam = EXAM_DATABASE.find((e) => e.id === examId);
  if (!exam) return [];
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= exam.startYear; y--) {
    years.push(y);
  }
  return years;
};

export const getPapersForYear = (
  examId: string,
  year: number,
  subject?: string,
): PaperResource[] => {
  const exam = EXAM_DATABASE.find((e) => e.id === examId);
  if (!exam) return [];
  const title = subject
    ? `${exam.shortName} ${year} - ${subject}`
    : `${exam.shortName} ${year} Full Paper`;
  return [
    {
      id: `${examId}_${year}_${subject || 'full'}`,
      examId,
      year,
      subject,
      title,
      downloadUrl: '#',
      fileSize: '5.2 MB',
    },
  ];
};

