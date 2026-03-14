import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { QuizMode } from '@shared/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface QuizState {
  currentExamId: string | null;
  currentSubject: string | null;
  currentTopic: string | null;
  setQuizContext: (examId: string, subject: string, topic: string) => void;
  clearQuizContext: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentExamId: null,
  currentSubject: null,
  currentTopic: null,
  setQuizContext: (examId, subject, topic) =>
    set({ currentExamId: examId, currentSubject: subject, currentTopic: topic }),
  clearQuizContext: () =>
    set({ currentExamId: null, currentSubject: null, currentTopic: null }),
}));

export interface QuizResult {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  topic: string;
  mode: QuizMode;
  score: number;
  total: number;
  percentage: number;
  timestamp: number;
  date: string;
}

interface QuizResultState {
  results: QuizResult[];
  addResult: (result: Omit<QuizResult, 'id' | 'timestamp' | 'date'>) => void;
}

export const useQuizResultStore = create<QuizResultState>((set) => ({
  results: [],
  addResult: (result) =>
    set((state) => ({
      results: [
        {
          ...result,
          id: `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          date: new Date().toISOString().split('T')[0],
        },
        ...state.results,
      ],
    })),
}));

export function useQuizStats() {
  const results = useQuizResultStore((s) => s.results);

  const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayResults = results.filter((r) => r.date === today);
  const todayQuestions = todayResults.reduce((sum, r) => sum + r.total, 0);
  const todayCorrect = todayResults.reduce((sum, r) => sum + r.score, 0);
  const todayAccuracy = todayQuestions > 0 ? Math.round((todayCorrect / todayQuestions) * 100) : 0;

  const uniqueDates = [...new Set(results.map((r) => r.date))].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const key = r.topic || r.subject;
    const existing = topicMap.get(key) || { correct: 0, total: 0 };
    topicMap.set(key, { correct: existing.correct + r.score, total: existing.total + r.total });
  }
  const topicStrengths = Array.from(topicMap.entries())
    .map(([topic, { correct, total }]) => ({
      topic,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  const recentResults = results.slice(0, 5);

  return {
    totalQuestions,
    avgAccuracy,
    todayAccuracy,
    streak,
    topicStrengths,
    recentResults,
    allResults: results,
  };
}
