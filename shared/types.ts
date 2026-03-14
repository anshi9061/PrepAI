export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation?: string;
  isRepeated?: boolean;
  frequency?: number;
  subject?: string;
}

export interface QuizAttempt {
  id: number;
  date: string;
  score: number;
  totalQuestions: number;
  topic: string;
}

export interface QuizAttemptDetailed extends QuizAttempt {
  userId: string;
  exam?: string;
  subject?: string;
  percentScore: number;
  timestamp: number;
}

export interface ProgressDataPoint {
  date: string;
  avgScore: number;
  attempts: number;
}

export interface QuizHistoryFilter {
  userId: string;
  exam?: string;
  subject?: string;
  topic?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export interface Paper {
  id: number;
  title: string;
  exam: string;
  year: number;
  subject: string;
  downloadUrl: string;
}

export interface TopicStrength {
  topic: string;
  strength: number;
  fullMark: number;
}

export interface UserAnalytics {
  dailyProgress: number;
  dailyChange: number;
  streak: number;
  weakestTopic: string | null;
  weakestTopicScore: number;
  rankPercentile: number;
  totalQuestionsAttempted: number;
  lastUpdated: string;
}

export interface RankData {
  exam: string;
  rankPercentile: number;
  totalUsers: number;
  basedOnAnswers: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type ExamLevel = 'National' | 'State' | 'Board';

export type ExamCategory =
  | 'Medical'
  | 'Engineering'
  | 'Science'
  | 'Law'
  | 'Commerce'
  | 'Arts'
  | 'Defence'
  | 'Government'
  | 'School'
  | 'Board'
  | 'Polytechnic'
  | 'Pharmacy'
  | 'Agriculture'
  | 'Management'
  | 'Recruitment'
  | 'General';

export interface ExamProfile {
  id: string;
  name: string;
  shortName: string;
  level: ExamLevel;
  state?: string;
  category: ExamCategory;
  startYear: number;
  hasSubjects: boolean;
  subjects?: string[];
  icon?: string;
  description?: string;
}

export interface PaperResource {
  id: string;
  examId: string;
  year: number;
  subject?: string;
  title: string;
  downloadUrl: string;
  fileSize?: string;
}

export type QuizMode = 'PRACTICE' | 'MOCK' | 'DAILY';

export interface Topic {
  id: string;
  name: string;
  subject: string;
}

export interface QuizConfig {
  examId: string;
  subject?: string;
  topicId: string;
  topicName: string;
  mode: QuizMode;
}

export interface SectionScore {
  subject: string;
  score: number;
  total: number;
  accuracy: number;
}

export interface MockTestResult {
  score: number;
  total: number;
  percentile: number;
  rank: number;
  accuracy: number;
  strongTopics: string[];
  weakTopics: string[];
  examReadiness: 'High' | 'Medium' | 'Low';
  timePerQuestion: number;
  repeatedQuestionAccuracy: number;
  sectionWiseScore: SectionScore[];
}

export interface PracticeResult {
  score: number;
  total: number;
  percentage: number;
  accuracy: number;
  rankPercentile: number;
  strongestTopic: string | null;
  weakestTopic: string | null;
  speedPerQuestion: number;
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  suggestedNextTopic: string;
}

export interface ExamPatternSection {
  subject: string;
  questionCount: number;
}

export interface ExamPattern {
  examId: string;
  durationMinutes: number;
  totalQuestions: number;
  sections: ExamPatternSection[];
}

export interface AIQuizQuestion {
  question_id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}
