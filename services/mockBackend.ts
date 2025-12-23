import { Question, UserAnalytics, QuizAttemptDetailed, ProgressDataPoint, QuizHistoryFilter, MockTestResult, PracticeResult, SectionScore, RankData } from '../types';

// --- IN-MEMORY DATABASE SIMULATION ---

// 1. User Attempts Table
interface AttemptRecord {
    userId: string;
    questionId: number;
    isCorrect: boolean;
    topic: string;
    timestamp: number; // Unix timestamp
    exam?: string;    // Metadata for filtering
    subject?: string; // Metadata for filtering
}

// Seed initial data to create a realistic chart history
const now = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

// Helper to generate a fake session
const generateSession = (daysAgo: number, subject: string, score: number, total: number = 10, exam: string = 'Mock Exam') => {
    const ts = now - (daysAgo * DAY_MS);
    return Array.from({ length: total }).map((_, i) => ({
        userId: 'user_demo',
        questionId: 1000 + i + (daysAgo * 10),
        isCorrect: i < score,
        topic: 'General',
        timestamp: ts,
        exam: exam,
        subject: subject
    }));
};

const attemptsDB: AttemptRecord[] = [
    ...generateSession(10, 'Physics', 4, 10, 'NEET'),
    ...generateSession(9, 'Chemistry', 5, 10, 'NEET'),
    ...generateSession(7, 'Physics', 6, 10, 'JEE Main'),
    ...generateSession(5, 'Math', 5, 10, 'JEE Main'),
    ...generateSession(3, 'Physics', 8, 10, 'KEAM'),
    ...generateSession(1, 'Biology', 7, 10, 'NEET'), // Yesterday
    ...generateSession(0, 'Chemistry', 8, 10, 'NEET'), // Today
];

// 2. Analytics Cache (Snapshot Table)
let userAnalyticsCache: UserAnalytics = {
    dailyProgress: 0,
    dailyChange: 0,
    streak: 5,
    weakestTopic: 'Mechanics',
    weakestTopicScore: 70,
    rankPercentile: 85,
    totalQuestionsAttempted: 10,
    lastUpdated: new Date().toISOString()
};

// --- ANALYTICS ENGINE ---

const recomputeAnalytics = (userId: string): UserAnalytics => {
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    const userAttempts = attemptsDB.filter(a => a.userId === userId);

    const attemptsToday = userAttempts.filter(a => a.timestamp >= startOfToday);
    const todayTotal = attemptsToday.length;
    const todayCorrect = attemptsToday.filter(a => a.isCorrect).length;
    const todayScore = todayTotal > 0 ? (todayCorrect / todayTotal) * 100 : 0;

    const attemptsYesterday = userAttempts.filter(a => a.timestamp >= startOfYesterday && a.timestamp < startOfToday);
    const yestTotal = attemptsYesterday.length;
    const yestCorrect = attemptsYesterday.filter(a => a.isCorrect).length;
    const yestScore = yestTotal > 0 ? (yestCorrect / yestTotal) * 100 : 0; 
    
    const dailyChange = todayTotal > 0 ? todayScore - yestScore : 0;

    let streak = 5;

    const topicStats: Record<string, { total: number, correct: number }> = {};
    userAttempts.forEach(a => {
        const t = a.subject || a.topic;
        if (!topicStats[t]) topicStats[t] = { total: 0, correct: 0 };
        topicStats[t].total++;
        if (a.isCorrect) topicStats[t].correct++;
    });

    let weakestTopic = null;
    let weakestScore = 100;

    Object.entries(topicStats).forEach(([topic, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;
        if (stats.total >= 5 && accuracy < weakestScore) {
            weakestScore = accuracy;
            weakestTopic = topic;
        }
    });

    const totalCorrect = userAttempts.filter(a => a.isCorrect).length;
    const rankPercentile = Math.min(99, 50 + (totalCorrect * 0.1));

    return {
        dailyProgress: Math.round(todayScore),
        dailyChange: parseFloat(dailyChange.toFixed(1)),
        streak: streak,
        weakestTopic: weakestTopic || "General Science",
        weakestTopicScore: Math.round(weakestScore),
        rankPercentile: Math.round(rankPercentile),
        totalQuestionsAttempted: userAttempts.length,
        lastUpdated: new Date().toISOString()
    };
};

export interface SubmissionPayload {
  userId: string;
  questionId: number;
  selectedOptionIdx: number;
  correctOptionIdx: number;
  topic: string;
  timestamp: string;
  exam?: string;
  subject?: string;
}

export interface SubmissionResponse {
  success: boolean;
  isCorrect: boolean;
  explanation: string;
  updatedStats: UserAnalytics;
  nextDifficulty: 'Easy' | 'Medium' | 'Hard';
}

export const getDashboardAnalytics = async (userId: string = 'user_demo'): Promise<UserAnalytics> => {
    userAnalyticsCache = recomputeAnalytics(userId);
    return userAnalyticsCache;
};

// NEW: Get Rank Breakdown based on filters
export const getRankBreakdown = async (userId: string, startDate?: number, endDate?: number): Promise<RankData[]> => {
    // 1. Filter Attempts
    let filtered = attemptsDB.filter(a => a.userId === userId);
    if (startDate) filtered = filtered.filter(a => a.timestamp >= startDate);
    if (endDate) filtered = filtered.filter(a => a.timestamp <= endDate);

    // 2. Group by Exam
    const examStats: Record<string, { total: number, correct: number }> = {};
    filtered.forEach(a => {
        const exam = a.exam || 'Practice';
        if (!examStats[exam]) examStats[exam] = { total: 0, correct: 0 };
        examStats[exam].total++;
        if (a.isCorrect) examStats[exam].correct++;
    });

    // 3. Compute Ranks (Simulated)
    return Object.entries(examStats).map(([exam, stats]) => {
        const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        
        // Simulate "Total Users" and "Percentile" based on accuracy
        // Higher accuracy = better percentile
        // Random base to simulate competition
        const totalUsers = 1000 + Math.floor(Math.random() * 5000); 
        const percentileBase = 50 + (accuracy * 0.4); 
        const percentile = Math.min(99, Math.max(1, Math.round(percentileBase + (Math.random() * 5))));

        return {
            exam: exam,
            rankPercentile: percentile,
            totalUsers: totalUsers,
            basedOnAnswers: stats.total
        };
    });
};

export const getProgressAnalytics = async (filter: QuizHistoryFilter): Promise<ProgressDataPoint[]> => {
    let filtered = attemptsDB.filter(a => a.userId === filter.userId);
    if (filter.startDate) filtered = filtered.filter(a => a.timestamp >= filter.startDate!);
    if (filter.endDate) filtered = filtered.filter(a => a.timestamp <= filter.endDate!);

    const grouped: Record<string, { total: number, correct: number }> = {};

    filtered.forEach(a => {
        const dateStr = new Date(a.timestamp).toISOString().split('T')[0];
        if (!grouped[dateStr]) grouped[dateStr] = { total: 0, correct: 0 };
        grouped[dateStr].total++;
        if (a.isCorrect) grouped[dateStr].correct++;
    });

    return Object.keys(grouped).sort().map(date => {
        const stats = grouped[date];
        return {
            date,
            avgScore: parseFloat(((stats.correct / stats.total) * 100).toFixed(1)),
            attempts: Math.ceil(stats.total / 10)
        };
    });
};

export const getQuizHistory = async (filter: QuizHistoryFilter): Promise<QuizAttemptDetailed[]> => {
    let filtered = attemptsDB.filter(a => a.userId === filter.userId);
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    const quizzes: QuizAttemptDetailed[] = [];
    const CHUNK_SIZE = 10;
    
    for (let i = 0; i < filtered.length; i += CHUNK_SIZE) {
        const chunk = filtered.slice(i, i + CHUNK_SIZE);
        if (chunk.length === 0) continue;

        const first = chunk[0];
        const correctCount = chunk.filter(c => c.isCorrect).length;
        const total = chunk.length;
        
        quizzes.push({
            id: parseInt(`${first.timestamp}`.slice(-6) + i),
            userId: filter.userId,
            date: new Date(first.timestamp).toISOString().split('T')[0],
            timestamp: first.timestamp,
            score: correctCount,
            totalQuestions: total,
            percentScore: Math.round((correctCount / total) * 100),
            topic: first.topic,
            exam: first.exam || "Practice",
            subject: first.subject || "General"
        });
    }
    return filter.limit ? quizzes.slice(0, filter.limit) : quizzes;
};

export const submitAnswerToBackend = async (
  payload: SubmissionPayload,
  explanationText: string
): Promise<SubmissionResponse> => {
  const isCorrect = payload.selectedOptionIdx === payload.correctOptionIdx;
  attemptsDB.push({
      userId: payload.userId,
      questionId: payload.questionId,
      isCorrect,
      topic: payload.topic,
      timestamp: Date.now(),
      exam: payload.exam,
      subject: payload.subject
  });

  userAnalyticsCache = recomputeAnalytics(payload.userId);

  return {
    success: true,
    isCorrect,
    explanation: explanationText,
    updatedStats: userAnalyticsCache,
    nextDifficulty: 'Medium'
  };
};

export const finishPracticeSession = async (
    userId: string,
    answers: { isCorrect: boolean, difficulty: 'Easy'|'Medium'|'Hard' }[],
    totalTimeSeconds: number,
    topic: string
): Promise<PracticeResult> => {
    // Instant response
    const total = answers.length;
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    
    const diffBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    answers.forEach(a => diffBreakdown[a.difficulty]++);
    const correctDiff = { Easy: 0, Medium: 0, Hard: 0 };
    answers.forEach(a => { if(a.isCorrect) correctDiff[a.difficulty]++ });

    const rankPercentile = Math.min(99, Math.max(10, percentage + (Math.random() * 10 - 5)));
    const topicDisplay = `${topic} (${percentage}%)`;

    return {
        score,
        total,
        percentage,
        accuracy: percentage,
        rankPercentile: Math.round(rankPercentile),
        strongestTopic: percentage >= 60 ? topicDisplay : null,
        weakestTopic: percentage < 60 ? topicDisplay : null,
        speedPerQuestion: total > 0 ? parseFloat((totalTimeSeconds / total).toFixed(1)) : 0,
        difficultyBreakdown: {
            Easy: Math.round((correctDiff.Easy / (diffBreakdown.Easy || 1)) * 100),
            Medium: Math.round((correctDiff.Medium / (diffBreakdown.Medium || 1)) * 100),
            Hard: Math.round((correctDiff.Hard / (diffBreakdown.Hard || 1)) * 100),
        },
        suggestedNextTopic: percentage > 80 ? "Advanced Concepts" : percentage > 50 ? "Mock Test" : "Fundamentals Review"
    };
};

export const submitMockTest = async (
    userId: string,
    answers: { questionId: number, isCorrect: boolean, topic: string, subject?: string }[],
    totalTimeSeconds: number,
    examId: string
): Promise<MockTestResult> => {
    // Instant response
    answers.forEach(a => {
        attemptsDB.push({
            userId,
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            topic: a.topic,
            timestamp: Date.now(),
            exam: examId,
            subject: a.subject || 'Mock Test'
        });
    });

    const total = answers.length;
    const score = answers.filter(a => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    const zScore = (accuracy - 50) / 15;
    let percentile = 50 + (zScore * 34); 
    if (percentile > 99) percentile = 99;
    if (percentile < 1) percentile = 1;

    // --- Section-wise Analysis ---
    const sectionStats: Record<string, {total: number, correct: number}> = {};
    
    answers.forEach(a => {
        const sub = a.subject || "General";
        if (!sectionStats[sub]) sectionStats[sub] = {total: 0, correct: 0};
        sectionStats[sub].total++;
        if (a.isCorrect) sectionStats[sub].correct++;
    });

    const sectionWiseScore: SectionScore[] = Object.entries(sectionStats).map(([sub, stats]) => ({
        subject: sub,
        score: stats.correct,
        total: stats.total,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }));

    // --- Topic Weak/Strong ---
    const topicPerf: Record<string, { total: number, correct: number }> = {};
    answers.forEach(a => {
        if (!topicPerf[a.topic]) topicPerf[a.topic] = { total: 0, correct: 0 };
        topicPerf[a.topic].total++;
        if (a.isCorrect) topicPerf[a.topic].correct++;
    });

    const topicResults = Object.entries(topicPerf).map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100)
    }));

    topicResults.sort((a, b) => b.accuracy - a.accuracy);

    const strongTopics = [];
    const weakTopics = [];

    if (topicResults.length > 0) {
        const best = topicResults[0];
        strongTopics.push(`${best.topic} (${best.accuracy}%)`);
        
        const worst = topicResults[topicResults.length - 1];
        weakTopics.push(`${worst.topic} (${worst.accuracy}%)`);
    }

    let examReadiness: 'High' | 'Medium' | 'Low' = 'Low';
    if (percentile > 80) examReadiness = 'High';
    else if (percentile > 50) examReadiness = 'Medium';

    recomputeAnalytics(userId);

    return {
        score,
        total,
        percentile: Math.round(percentile),
        rank: Math.floor(1000 - (percentile * 10)), 
        accuracy,
        strongTopics: strongTopics, 
        weakTopics: weakTopics,
        examReadiness,
        timePerQuestion: total > 0 ? Math.round(totalTimeSeconds / total) : 0,
        repeatedQuestionAccuracy: Math.min(100, accuracy + Math.floor(Math.random() * 15)),
        sectionWiseScore
    };
};