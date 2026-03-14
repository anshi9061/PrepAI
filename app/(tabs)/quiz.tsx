import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EXAM_PATTERNS } from '@shared/constants';
import {
  getTopics,
  getQuizQuestions,
  generateMockTest,
  generateDailyChallenge,
} from '@shared/services/quiz-logic';
import {
  getExamLevels,
  getAllStates,
  getCategoriesForContext,
  getExamsByContext,
} from '@shared/services/paper-catalog';
import { useQuizResultStore } from '@/lib/store';
import type { ExamProfile, ExamCategory, ExamLevel, Topic, Question, QuizMode } from '@shared/types';

type QuizView =
  | 'MODE'
  | 'LEVEL'
  | 'STATE'
  | 'CATEGORY'
  | 'EXAM_SELECT'
  | 'SUBJECT'
  | 'TOPIC'
  | 'PLAYING'
  | 'RESULT';

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Engineering: 'construct',
  Medical: 'medkit',
  Law: 'briefcase',
  Board: 'book',
  Defence: 'shield',
  Government: 'business',
  Science: 'flask',
  Commerce: 'cash',
  Polytechnic: 'build',
  Pharmacy: 'fitness',
  Agriculture: 'leaf',
  Management: 'people',
  Recruitment: 'clipboard',
  School: 'school',
};

const MODE_CONFIG: { id: QuizMode; title: string; desc: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }[] = [
  { id: 'PRACTICE', title: 'Practice Quiz', desc: 'Pick a topic, 10 questions, learn at your pace', icon: 'create', color: '#4B8BFF' },
  { id: 'MOCK', title: 'Mock Test', desc: 'Full exam simulation with timer and sections', icon: 'timer', color: '#7C53FF' },
  { id: 'DAILY', title: 'Daily Challenge', desc: '5 mixed questions, 5-minute timer', icon: 'flash', color: '#f97316' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuizScreen() {
  const [view, setView] = useState<QuizView>('MODE');
  const [mode, setMode] = useState<QuizMode>('PRACTICE');
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamProfile | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const addResult = useQuizResultStore((s) => s.addResult);

  const levels = getExamLevels();
  const states = getAllStates();
  const categories = selectedLevel
    ? getCategoriesForContext(selectedLevel, selectedState ?? undefined)
    : [];
  const filteredExams =
    selectedLevel && selectedCategory
      ? getExamsByContext(selectedLevel, selectedCategory, selectedState ?? undefined)
      : [];

  const autoSubmitRef = useRef(false);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          autoSubmitRef.current = true;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  useEffect(() => {
    if (timeLeft === 0 && autoSubmitRef.current) {
      autoSubmitRef.current = false;
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setView('RESULT');
    }
  }, [timeLeft]);

  const startTimer = useCallback((durationMinutes: number) => {
    setTimeLeft(durationMinutes * 60);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const saveResult = useCallback(() => {
    addResult({
      examId: selectedExam?.id || 'daily',
      examName: selectedExam?.shortName || (mode === 'DAILY' ? 'Daily Challenge' : 'Quiz'),
      subject: selectedSubject || 'Mixed',
      topic: mode === 'DAILY' ? 'Daily Challenge' : mode === 'MOCK' ? 'Mock Test' : (topics.find((_, i) => i === 0)?.name || 'General'),
      mode,
      score,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
    });
  }, [addResult, selectedExam, selectedSubject, mode, score, questions.length, topics]);

  const handleDailyChallenge = async () => {
    setError(null);
    setLoading(true);
    try {
      const qs = await generateDailyChallenge();
      if (qs.length === 0) {
        setError('No questions available. Please try again.');
        setLoading(false);
        return;
      }
      setQuestions(qs);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setAnswered(false);
      setLoading(false);
      setView('PLAYING');
      startTimer(5);
    } catch {
      setError('Failed to generate daily challenge. Please try again.');
      setLoading(false);
    }
  };

  const handleMockStart = async (exam: ExamProfile) => {
    setError(null);
    setLoading(true);
    try {
      const subjects = exam.subjects || ['General'];
      const qs = await generateMockTest(exam.id, subjects);
      if (qs.length === 0) {
        setError('No questions available for this exam.');
        setLoading(false);
        return;
      }
      const pattern = EXAM_PATTERNS[exam.id] || EXAM_PATTERNS['default'];
      setQuestions(qs);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setAnswered(false);
      setLoading(false);
      setView('PLAYING');
      startTimer(pattern.durationMinutes);
    } catch {
      setError('Failed to generate mock test. Please try again.');
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    if (!selectedExam || !selectedSubject) return;
    setError(null);
    setLoading(true);
    try {
      const qs = await getQuizQuestions(selectedExam.id, selectedSubject, topic.name);
      if (qs.length === 0) {
        setError('No questions available for this topic. Try another one.');
        setLoading(false);
        return;
      }
      setQuestions(qs);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setAnswered(false);
      setLoading(false);
      setView('PLAYING');
      startTimer(10);
    } catch {
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);
    if (optionIdx === questions[currentIdx].correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      stopTimer();
      setView('RESULT');
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  };

  const resetQuiz = () => {
    stopTimer();
    setView('MODE');
    setMode('PRACTICE');
    setSelectedLevel(null);
    setSelectedState(null);
    setSelectedCategory(null);
    setSelectedExam(null);
    setSelectedSubject(null);
    setQuestions([]);
    setTopics([]);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setLoading(false);
    setError(null);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (selectedExam && selectedSubject) {
      getTopics(selectedExam.id, selectedSubject).then(setTopics);
    }
  }, [selectedExam, selectedSubject]);

  const goBack = () => {
    setError(null);
    if (view === 'LEVEL') { setView('MODE'); }
    else if (view === 'STATE') { setView('LEVEL'); setSelectedState(null); }
    else if (view === 'CATEGORY') {
      if (selectedLevel === 'State') { setView('STATE'); setSelectedState(null); }
      else { setView('LEVEL'); setSelectedLevel(null); }
    }
    else if (view === 'EXAM_SELECT') { setView('CATEGORY'); setSelectedCategory(null); }
    else if (view === 'SUBJECT') { setView('EXAM_SELECT'); setSelectedExam(null); }
    else if (view === 'TOPIC') { setView('SUBJECT'); setSelectedSubject(null); }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#4B8BFF" />
        <Text className="text-slate-500 mt-4">Loading questions...</Text>
      </SafeAreaView>
    );
  }

  if (view === 'PLAYING' && questions.length > 0) {
    const q = questions[currentIdx];
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <TouchableOpacity onPress={resetQuiz}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-sm font-semibold text-slate-500">
              {currentIdx + 1} / {questions.length}
            </Text>
            {timeLeft > 0 && (
              <Text
                className={`text-xs font-bold mt-0.5 ${timeLeft <= 60 ? 'text-red-500' : 'text-brand-blue'}`}
              >
                {formatTime(timeLeft)}
              </Text>
            )}
          </View>
          <Text className="text-sm font-bold text-brand-blue">Score: {score}</Text>
        </View>
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-5 mt-2 shadow-sm">
            <Text className="text-xs font-medium text-brand-blue mb-2">
              {q.subject} &middot; {q.topic}
            </Text>
            <Text className="text-base font-semibold text-brand-navy leading-6">
              {q.text}
            </Text>
          </View>

          <View className="mt-4">
            {q.options.map((option, idx) => {
              let bg = 'bg-white';
              let border = 'border-slate-200';
              if (answered) {
                if (idx === q.correctAnswer) {
                  bg = 'bg-green-50';
                  border = 'border-green-400';
                } else if (idx === selectedOption && idx !== q.correctAnswer) {
                  bg = 'bg-red-50';
                  border = 'border-red-400';
                }
              } else if (idx === selectedOption) {
                bg = 'bg-blue-50';
                border = 'border-brand-blue';
              }
              return (
                <TouchableOpacity
                  key={idx}
                  className={`${bg} rounded-xl p-4 mb-3 border ${border}`}
                  onPress={() => handleAnswer(idx)}
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Text className="text-brand-navy text-sm">{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {answered && q.explanation && (
            <View className="bg-blue-50 rounded-xl p-4 mt-2 mb-4">
              <Text className="text-sm text-brand-navy">{q.explanation}</Text>
            </View>
          )}

          {answered && (
            <TouchableOpacity
              className="bg-brand-blue rounded-xl py-4 items-center mt-2 mb-8"
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'RESULT') {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-8" edges={['top']}>
        <View className="bg-white rounded-3xl p-8 items-center shadow-sm w-full">
          <View className="w-20 h-20 bg-brand-blue rounded-full items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">{pct}%</Text>
          </View>
          <Text className="text-2xl font-bold text-brand-navy mb-1">
            {mode === 'MOCK' ? 'Mock Test Complete' : mode === 'DAILY' ? 'Daily Challenge Complete' : 'Quiz Complete'}
          </Text>
          <Text className="text-slate-500 mb-6">
            You scored {score} out of {questions.length}
          </Text>

          <View className="flex-row w-full mb-4">
            <View className="flex-1 bg-green-50 rounded-xl p-3 mr-2 items-center">
              <Text className="text-green-700 font-bold text-lg">{score}</Text>
              <Text className="text-green-600 text-xs">Correct</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-3 ml-2 items-center">
              <Text className="text-red-700 font-bold text-lg">{questions.length - score}</Text>
              <Text className="text-red-600 text-xs">Wrong</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-brand-blue rounded-xl py-4 w-full items-center mt-2"
            onPress={() => {
              saveResult();
              resetQuiz();
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Start New Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {view !== 'MODE' && (
          <TouchableOpacity className="flex-row items-center mb-4" onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#4B8BFF" />
            <Text className="text-brand-blue font-medium ml-1">Back</Text>
          </TouchableOpacity>
        )}

        {error && (
          <View className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {view === 'MODE' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">Start a Quiz</Text>
            <Text className="text-slate-500 mb-6">Choose your quiz mode</Text>
            {MODE_CONFIG.map((m) => (
              <TouchableOpacity
                key={m.id}
                className="bg-white rounded-2xl p-5 mb-3 flex-row items-center shadow-sm"
                onPress={() => {
                  setMode(m.id);
                  if (m.id === 'DAILY') {
                    handleDailyChallenge();
                  } else {
                    setView('LEVEL');
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: m.color + '20' }}
                >
                  <Ionicons name={m.icon} size={22} color={m.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-brand-navy">{m.title}</Text>
                  <Text className="text-slate-400 text-sm mt-0.5">{m.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'LEVEL' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">Exam Level</Text>
            <Text className="text-slate-500 mb-6">Choose an exam level</Text>
            {levels.map((lvl) => (
              <TouchableOpacity
                key={lvl.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => {
                  setSelectedLevel(lvl.id);
                  if (lvl.id === 'State') setView('STATE');
                  else setView('CATEGORY');
                }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{lvl.label}</Text>
                <Text className="text-slate-400 text-sm mt-1">{lvl.desc}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'STATE' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">Select State</Text>
            <Text className="text-slate-500 mb-6">Choose your state</Text>
            {states.map((s) => (
              <TouchableOpacity
                key={s}
                className="bg-white rounded-2xl p-4 mb-2 shadow-sm"
                onPress={() => { setSelectedState(s); setView('CATEGORY'); }}
                activeOpacity={0.7}
              >
                <Text className="text-base text-brand-navy">{s}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'CATEGORY' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">
              {selectedLevel === 'State' ? selectedState : selectedLevel} Exams
            </Text>
            <Text className="text-slate-500 mb-6">Select a category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                className="bg-white rounded-2xl p-5 mb-3 flex-row items-center shadow-sm"
                onPress={() => { setSelectedCategory(cat); setView('EXAM_SELECT'); }}
                activeOpacity={0.7}
              >
                <View className="w-11 h-11 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons
                    name={CATEGORY_ICONS[cat] || 'folder'}
                    size={20}
                    color="#4B8BFF"
                  />
                </View>
                <Text className="text-base font-semibold text-brand-navy flex-1">{cat}</Text>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
            {categories.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
                <Text className="text-slate-400 mt-4">No categories available</Text>
              </View>
            )}
          </>
        )}

        {view === 'EXAM_SELECT' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">{selectedCategory}</Text>
            <Text className="text-slate-500 mb-6">Select an exam</Text>
            {filteredExams.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => {
                  setSelectedExam(exam);
                  if (mode === 'MOCK') {
                    handleMockStart(exam);
                  } else if (exam.hasSubjects && exam.subjects?.length) {
                    setView('SUBJECT');
                  } else {
                    setSelectedSubject('General');
                    setView('TOPIC');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{exam.name}</Text>
                {exam.description && (
                  <Text className="text-slate-400 text-sm mt-1">{exam.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'SUBJECT' && selectedExam?.subjects && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">{selectedExam.shortName}</Text>
            <Text className="text-slate-500 mb-6">Choose a subject</Text>
            {selectedExam.subjects.map((sub) => (
              <TouchableOpacity
                key={sub}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => { setSelectedSubject(sub); setView('TOPIC'); }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{sub}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'TOPIC' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">{selectedSubject}</Text>
            <Text className="text-slate-500 mb-6">Pick a topic</Text>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => handleTopicSelect(topic)}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{topic.name}</Text>
              </TouchableOpacity>
            ))}
            {topics.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="book-outline" size={48} color="#cbd5e1" />
                <Text className="text-slate-400 mt-4">No topics found for this subject</Text>
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
