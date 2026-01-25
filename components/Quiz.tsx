import React, { useState, useEffect, useRef } from 'react';
import { Question, ExamCategory, ExamProfile, Topic, QuizMode, MockTestResult, PracticeResult } from '../types';
import { getQuickExplanation } from '../services/geminiService';
import { submitAnswerToBackend, submitMockTest, finishPracticeSession } from '../services/mockBackend';
import { getAllExams, getAllStates } from '../services/paperService';
import { getTopics, getQuizQuestions, getFastQuestion, generateMockTest, generateDailyChallenge } from '../services/quizService';

// TODO: Step 1.5 - Replace mock services with real API calls
// import { api } from '../services/api';
// TODO: Step 2.2 - Add intelligent question selection based on user performance
// TODO: Step 2.4 - Add adaptive difficulty and personalized learning paths
// TODO: Step 3.3 - Add offline support and question caching
import { EXAM_PATTERNS } from '../constants';
import { 
    CheckCircle, XCircle, Zap, ArrowRight, RotateCcw, AlertCircle, Loader2, 
    Clock, ChevronRight, Trophy, ArrowLeft, MapPin, Globe,
    BookOpen, Stethoscope, Wrench, Scale, Building2, Shield, Sprout, Briefcase, Paintbrush, RefreshCw, PenTool, Layout, CheckSquare, Target, Brain, Award, BarChart3, List
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.FC<any>> = {
    'Engineering': Wrench,
    'Medical': Stethoscope,
    'Law': Scale,
    'Board': BookOpen,
    'Commerce': Building2,
    'Arts': Paintbrush,
    'Defence': Shield,
    'Agriculture': Sprout,
    'Government': Briefcase,
    'General': Globe
};

type QuizView = 'MODE_SELECT' | 'CATEGORY_SELECT' | 'LEVEL_SELECT' | 'EXAM_SELECT' | 'SUBJECT_SELECT' | 'TOPIC_SELECT' | 'PLAYING' | 'RESULT';

interface QuizProps {
    isDailyChallenge?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ isDailyChallenge = false }) => {
  const [view, setView] = useState<QuizView>('MODE_SELECT');
  const [quizMode, setQuizMode] = useState<QuizMode>('PRACTICE');

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
  const [selectedLevelType, setSelectedLevelType] = useState<'National' | 'State' | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamProfile | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Data Loading
  const [availableExams, setAvailableExams] = useState<ExamProfile[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading questions...");

  // Gameplay
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null); 
  const [practiceAnswers, setPracticeAnswers] = useState<{isCorrect: boolean, difficulty: 'Easy'|'Medium'|'Hard'}[]>([]); 
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({}); 
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({}); 
  const paletteRef = useRef<HTMLDivElement>(null);

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{isCorrect: boolean, explanation: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [aiDeepDive, setAiDeepDive] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Result Data
  const [mockResult, setMockResult] = useState<MockTestResult | null>(null);
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);

  // Auto-Start Daily Challenge
  useEffect(() => {
      if (isDailyChallenge) {
          startDailyChallenge();
      }
  }, [isDailyChallenge]);

  useEffect(() => {
    if (view === 'PLAYING' && timeLeft > 0 && questions.length > 0) {
      const timer = setInterval(() => {
          setTimeLeft(prev => prev - 1);
          setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && view === 'PLAYING') {
        if (quizMode === 'MOCK') handleSubmitMock(true); // Auto submit on time out
        else handleFinishPractice();
    }
  }, [timeLeft, view, questions, quizMode]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Scroll current question into view in palette
  useEffect(() => {
      if (view === 'PLAYING' && paletteRef.current) {
          const btn = paletteRef.current.children[currentQuestionIdx] as HTMLElement;
          if (btn) {
             // Simple scroll into view logic
             // btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
      }
  }, [currentQuestionIdx, view]);

  // --- NAVIGATION HANDLERS ---
  const handleModeSelect = (mode: QuizMode) => {
      setQuizMode(mode);
      setView('CATEGORY_SELECT');
  };

  const handleCategorySelect = (cat: ExamCategory) => {
      setSelectedCategory(cat);
      setView('LEVEL_SELECT');
  };

  const fetchExams = (level: 'National' | 'State', state?: string) => {
      const all = getAllExams();
      let filtered = all.filter(e => e.category === selectedCategory);
      
      if (level === 'National') {
          filtered = filtered.filter(e => e.level === 'National' || e.level === 'Board');
      } else {
          filtered = filtered.filter(e => e.level === 'State');
          if (state) filtered = filtered.filter(e => e.state === state);
      }
      setAvailableExams(filtered);
  };

  const handleLevelSelect = (level: 'National' | 'State') => {
      setSelectedLevelType(level);
      if (level === 'National') {
          fetchExams('National');
          setView('EXAM_SELECT');
      } 
  };

  const handleStateSelect = (state: string) => {
      setSelectedState(state);
      fetchExams('State', state);
      setView('EXAM_SELECT');
  };

  const handleExamSelect = (exam: ExamProfile) => {
      setSelectedExam(exam);
      if (quizMode === 'MOCK') {
          startMockTest(exam);
      } else {
          if (exam.hasSubjects) {
              setView('SUBJECT_SELECT');
          } else {
              setSelectedSubject("General");
              fetchTopics(exam.id, "General");
          }
      }
  };

  const handleSubjectSelect = (sub: string) => {
      setSelectedSubject(sub);
      fetchTopics(selectedExam!.id, sub);
  };

  const fetchTopics = async (examId: string, subject: string) => {
      setIsGenerating(true);
      setLoadingMessage("Loading questions...");
      const data = await getTopics(examId, subject);
      setTopics(data);
      setIsGenerating(false);
      setView('TOPIC_SELECT');
  };

  // --- CORE START FUNCTIONS ---

  const startDailyChallenge = async () => {
      setQuizMode('PRACTICE'); // Reuse practice UI logic
      setQuestions([]);
      setPracticeAnswers([]);
      setLoadingMessage("Preparing Daily Challenge...");
      setIsGenerating(true);

      try {
          const dailyQs = await generateDailyChallenge();
          if (dailyQs && dailyQs.length > 0) {
              setQuestions(dailyQs);
              setTimeLeft(300); // 5 Minutes
              setScore(0);
              setCurrentQuestionIdx(0);
              setIsAnswerChecked(false);
              setSelectedOption(null);
              setView('PLAYING');
          } else {
              setToastMessage("Could not load challenge.");
          }
      } catch (e) {
          setToastMessage("Connection error.");
      } finally {
          setIsGenerating(false);
      }
  };

  const startPracticeQuiz = async (topic: Topic) => {
      // TODO: Step 2.2 - Add intelligent question selection based on user performance
      // TODO: Step 2.4 - Implement adaptive difficulty
      
      // 1. Reset State
      setSelectedTopic(topic);
      setQuestions([]);
      setPracticeAnswers([]);
      setLoadingMessage("Loading questions...");
      setIsGenerating(true);

      try {
          // TODO: Step 1.5 - Replace with authenticated API call
          // const fullQuestions = await api.getQuizQuestions({
          //     examId: selectedExam!.id,
          //     subjectId: selectedSubject || "General",
          //     topicId: topic.id,
          //     userId: user.id,
          //     count: 10
          // });
          
          const fullQuestions = await getQuizQuestions(selectedExam!.id, selectedSubject || "General", topic.name);
          
          if (fullQuestions && fullQuestions.length > 0) {
            setQuestions(fullQuestions);
            setTimeLeft(600);
            setScore(0);
            setCurrentQuestionIdx(0);
            setIsAnswerChecked(false);
            setSelectedOption(null);
            setView('PLAYING');
          } else {
             setToastMessage("Could not load questions. Try again.");
          }
      } catch (e) {
          console.error(e);
          setToastMessage("Connection error.");
          // TODO: Step 2.1 - Add proper error handling and retry logic
      } finally {
          setIsGenerating(false);
      }
  };

  const startMockTest = async (exam: ExamProfile) => {
      // 1. Reset State
      setQuestions([]);
      setMockAnswers({});
      setMarkedForReview({});
      setTimeElapsed(0);
      setLoadingMessage("Preparing your test...");
      setIsGenerating(true);

      try {
          const subjects = exam.subjects || ["General"];
          const mockQs = await generateMockTest(exam.id, subjects);
          
          // Set Real Timer based on Pattern
          const pattern = EXAM_PATTERNS[exam.id] || EXAM_PATTERNS['default'];
          setTimeLeft(pattern.durationMinutes * 60);

          setQuestions(mockQs);
          setCurrentQuestionIdx(0);
          setView('PLAYING');
      } catch (e) {
          console.error(e);
          setToastMessage("Failed to start test.");
      } finally {
          setIsGenerating(false);
      }
  };

  // --- GAMEPLAY HANDLERS ---

  const handleOptionSelect = (idx: number) => {
    if (quizMode === 'PRACTICE') {
        if (!isAnswerChecked && !isSubmitting) setSelectedOption(idx);
    } else {
        setMockAnswers(prev => ({...prev, [currentQuestionIdx]: idx}));
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null) {
        setToastMessage("Please select an answer.");
        return;
    }
    setIsSubmitting(true);
    const currentQ = questions[currentQuestionIdx];

    // TODO: Step 1.5 - Replace with real API call
    // const response = await api.submitAnswer({
    //     userId: user.id,
    //     questionId: currentQ.id,
    //     selectedOptionIdx: selectedOption,
    //     sessionId: currentSessionId
    // });
    
    const response = await submitAnswerToBackend({
        userId: "user_demo",
        questionId: currentQ.id,
        selectedOptionIdx: selectedOption,
        correctOptionIdx: currentQ.correctAnswer,
        topic: currentQ.topic,
        timestamp: new Date().toISOString(),
        exam: selectedExam?.shortName || (isDailyChallenge ? 'Daily Challenge' : 'Practice'),
        subject: selectedSubject || 'General'
    }, currentQ.explanation || "Correct Answer.");

    if (response.success) {
        setIsAnswerChecked(true);
        setSubmissionFeedback({
            isCorrect: response.isCorrect,
            explanation: response.explanation
        });
        if (response.isCorrect) setScore(s => s + 1);
        
        setPracticeAnswers(prev => [...prev, {
            isCorrect: response.isCorrect,
            difficulty: currentQ.difficulty
        }]);
        
        // TODO: Step 2.3 - Update user performance analytics in real-time
    }
    setIsSubmitting(false);
  };

  const toggleMarkForReview = () => {
      setMarkedForReview(prev => ({
          ...prev, 
          [currentQuestionIdx]: !prev[currentQuestionIdx]
      }));
  };

  const handleSubmitMock = async (autoSubmit = false) => {
      // Strict Check: All questions must be attempted unless auto-submitted by timer
      if (!autoSubmit && Object.keys(mockAnswers).length < questions.length) {
          setToastMessage("Please answer all questions before submitting.");
          return;
      }

      setIsSubmitting(true);
      const answersPayload = questions.map((q, idx) => ({
          questionId: q.id,
          isCorrect: mockAnswers[idx] === q.correctAnswer,
          topic: q.topic,
          subject: q.subject
      }));

      const result = await submitMockTest(
          "user_demo", 
          answersPayload, 
          timeElapsed,
          selectedExam!.id
      );

      setMockResult(result);
      setView('RESULT');
      setIsSubmitting(false);
  };

  const handleFinishPractice = async () => {
      setIsSubmitting(true);
      const result = await finishPracticeSession(
          "user_demo",
          practiceAnswers,
          timeElapsed,
          isDailyChallenge ? 'Daily Challenge' : (selectedTopic?.name || "General")
      );
      setPracticeResult(result);
      setView('RESULT');
      setIsSubmitting(false);
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      if (quizMode === 'PRACTICE') {
          setSelectedOption(null);
          setIsAnswerChecked(false);
          setSubmissionFeedback(null);
          setAiDeepDive(null);
      }
    } else {
      if (quizMode === 'PRACTICE') handleFinishPractice();
    }
  };

  const askAI = async () => {
    if (!questions[currentQuestionIdx]) return;
    setIsLoadingAi(true);
    const q = questions[currentQuestionIdx];
    const expl = await getQuickExplanation(q.text, q.options[q.correctAnswer]);
    setAiDeepDive(expl);
    setIsLoadingAi(false);
  };

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderHeader = (title: string, subtitle?: string, onBack?: () => void) => (
      <div className="mb-6">
          {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-electricBlue transition-colors">
                  <ArrowLeft size={20} /> <span className="font-medium">Back</span>
              </button>
          )}
          <h1 className="text-3xl font-display font-bold text-navyDark">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
  );

  // --- VIEWS ---
  
  // GLOBAL LOADER (Overlay)
  if (isGenerating) {
       return (
         <div className="flex h-screen items-center justify-center flex-col bg-slate-50 fixed inset-0 z-50">
             <div className="relative">
                <Loader2 className="animate-spin text-electricBlue w-16 h-16 mb-4" />
             </div>
             <h3 className="text-xl font-display font-bold text-navyDark mt-4">{loadingMessage}</h3>
         </div>
       );
  }

  if (view === 'MODE_SELECT') {
      return (
          <div className="animate-slide-up max-w-4xl mx-auto py-10">
              <h1 className="text-3xl font-display font-bold text-navyDark mb-8">Choose Practice Mode</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => handleModeSelect('MOCK')}
                    className="group relative overflow-hidden bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-vibrantPurple shadow-sm hover:shadow-2xl transition-all text-left"
                  >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                      <Layout size={48} className="text-vibrantPurple mb-6 relative z-10" />
                      <h2 className="text-2xl font-bold text-navyDark mb-2 relative z-10">Mock Tests</h2>
                      <p className="text-gray-500 relative z-10">
                          Full exam simulation. Time limits, no immediate answers, and detailed rank analysis.
                      </p>
                  </button>

                  <button 
                    onClick={() => handleModeSelect('PRACTICE')}
                    className="group relative overflow-hidden bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-electricBlue shadow-sm hover:shadow-2xl transition-all text-left"
                  >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                      <PenTool size={48} className="text-electricBlue mb-6 relative z-10" />
                      <h2 className="text-2xl font-bold text-navyDark mb-2 relative z-10">Subject-wise Practice</h2>
                      <p className="text-gray-500 relative z-10">
                          Drill down by Subject & Topic. Immediate feedback, explanations, and mastery tracking.
                      </p>
                  </button>
              </div>
          </div>
      )
  }

  if (view === 'CATEGORY_SELECT') {
      const categories: ExamCategory[] = ['Engineering', 'Medical', 'Law', 'Board', 'Commerce', 'Arts', 'Defence', 'Agriculture', 'Government'];
      return (
          <div className="animate-fade-in max-w-5xl mx-auto pb-20">
              {renderHeader("Select Stream", "What are you preparing for?", () => setView('MODE_SELECT'))}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categories.map(cat => {
                      const Icon = CATEGORY_ICONS[cat] || Globe;
                      return (
                          <button 
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:-translate-y-1 hover:border-electricBlue/30 transition-all group aspect-square"
                          >
                               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-electricBlue group-hover:bg-electricBlue group-hover:text-white transition-colors duration-300">
                                   <Icon size={32} />
                               </div>
                               <span className="font-bold text-lg text-navyDark group-hover:text-electricBlue">{cat}</span>
                          </button>
                      )
                  })}
              </div>
          </div>
      )
  }

  if (view === 'LEVEL_SELECT') {
      const states = getAllStates();
      return (
          <div className="animate-slide-up max-w-4xl mx-auto">
              {renderHeader("Select Exam Type", `${selectedCategory} Entrance Exams`, () => setView('CATEGORY_SELECT'))}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button onClick={() => handleLevelSelect('National')} className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center ${selectedLevelType === 'National' ? 'border-electricBlue bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                      <Globe size={48} className={selectedLevelType === 'National' ? 'text-electricBlue' : 'text-gray-400'} />
                      <div><h3 className="text-xl font-bold text-navyDark">All India Level</h3></div>
                  </button>
                  <button onClick={() => setSelectedLevelType('State')} className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center ${selectedLevelType === 'State' ? 'border-studentLime bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}>
                      <MapPin size={48} className={selectedLevelType === 'State' ? 'text-studentLime' : 'text-gray-400'} />
                      <div><h3 className="text-xl font-bold text-navyDark">State Level</h3></div>
                  </button>
              </div>
              {selectedLevelType === 'State' && (
                  <div className="animate-fade-in bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-navyDark mb-4">Choose your State</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {states.map(state => (
                              <button key={state} onClick={() => handleStateSelect(state)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-studentLime hover:text-white transition-colors text-left truncate">{state}</button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )
  }

  if (view === 'EXAM_SELECT') {
      return (
          <div className="animate-slide-up max-w-4xl mx-auto">
              {renderHeader("Choose Exam", `${selectedCategory} • ${selectedState || 'All India'}`, () => setView('LEVEL_SELECT'))}
              <div className="grid grid-cols-1 gap-4">
                  {availableExams.map(exam => (
                      <button key={exam.id} onClick={() => handleExamSelect(exam)} className="bg-white p-6 rounded-2xl flex items-center justify-between hover:shadow-md border border-gray-100 hover:border-electricBlue transition-all group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 group-hover:bg-electricBlue group-hover:text-white transition-colors">{exam.shortName.charAt(0)}</div>
                              <div className="text-left"><h3 className="text-lg font-bold text-navyDark">{exam.name}</h3><p className="text-sm text-gray-500">{quizMode === 'MOCK' ? 'Start Mock Test' : 'Select for Practice'}</p></div>
                          </div>
                          <ChevronRight className="text-gray-300 group-hover:text-electricBlue" />
                      </button>
                  ))}
              </div>
          </div>
      )
  }

  if (view === 'SUBJECT_SELECT') {
      return (
          <div className="animate-slide-up max-w-4xl mx-auto">
              {renderHeader("Select Subject", selectedExam?.name, () => setView('EXAM_SELECT'))}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedExam?.subjects?.map(sub => (
                      <button key={sub} onClick={() => handleSubjectSelect(sub)} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-vibrantPurple hover:shadow-lg transition-all text-center group">
                          <BookOpen size={32} className="mx-auto mb-4 text-gray-300 group-hover:text-vibrantPurple transition-colors" />
                          <h3 className="font-bold text-lg text-navyDark group-hover:text-vibrantPurple">{sub}</h3>
                      </button>
                  ))}
              </div>
          </div>
      )
  }
  if (view === 'TOPIC_SELECT') {
      return (
          <div className="animate-slide-up max-w-4xl mx-auto relative min-h-[400px]">
              {renderHeader("Select Topic", `${selectedExam?.name} • ${selectedSubject}`, () => setView('SUBJECT_SELECT'))}
              
              <div className="grid grid-cols-1 gap-3">
                  {topics.map((topic, idx) => (
                      <button key={topic.id} onClick={() => startPracticeQuiz(topic)} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-100 hover:border-electricBlue hover:bg-blue-50/30 transition-all group">
                          <div className="flex items-center gap-4"><span className="text-gray-300 font-bold text-xl w-8 group-hover:text-electricBlue">{idx + 1}</span><span className="font-bold text-gray-700 text-lg">{topic.name}</span></div>
                          <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 group-hover:bg-electricBlue group-hover:text-white transition-colors">Start</span>
                      </button>
                  ))}
              </div>
          </div>
      )
  }

  if (view === 'RESULT') {
      const isMock = quizMode === 'MOCK';
      const resultData = isMock ? mockResult : practiceResult;

      if (!resultData) return <div>No result data.</div>;

      const strongest = isMock 
        ? (resultData as MockTestResult).strongTopics[0] 
        : (resultData as PracticeResult).strongestTopic;
      
      const weakest = isMock 
        ? (resultData as MockTestResult).weakTopics[0] 
        : (resultData as PracticeResult).weakestTopic;

      return (
          <div className="animate-fade-in max-w-5xl mx-auto pb-20">
              <div className="bg-navyDark text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-electricBlue/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="relative z-10 text-center">
                      <div className="inline-block p-4 rounded-full bg-white/10 mb-4 backdrop-blur-sm">
                          <Trophy size={48} className="text-yellow-400" />
                      </div>
                      <h1 className="text-4xl font-display font-bold mb-2">
                          {isDailyChallenge ? 'Challenge Complete!' : isMock ? 'Mock Test Complete!' : 'Practice Session Complete!'}
                      </h1>
                      <p className="text-blue-100 mb-8">
                          {isDailyChallenge ? 'Great job finishing today\'s challenge!' : isMock ? `Exam: ${selectedExam?.shortName}` : `Topic: ${selectedTopic?.name}`}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Total Score</p>
                              <p className="text-3xl font-bold">{resultData.score} <span className="text-lg text-blue-200">/ {resultData.total}</span></p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Accuracy</p>
                              <p className={`text-3xl font-bold ${resultData.accuracy > 75 ? 'text-green-400' : 'text-yellow-400'}`}>{resultData.accuracy}%</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Percentile Rank</p>
                              <p className="text-3xl font-bold text-vibrantPurple">Top {100 - (isMock ? (resultData as MockTestResult).percentile : (resultData as PracticeResult).rankPercentile)}%</p>
                          </div>
                           <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Avg Speed</p>
                              <p className="text-3xl font-bold">{isMock ? (resultData as MockTestResult).timePerQuestion : (resultData as PracticeResult).speedPerQuestion}s</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* SECTION ANALYSIS FOR MOCK TEST */}
                  {isMock && (resultData as MockTestResult).sectionWiseScore && (
                      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-bold text-navyDark mb-4 flex items-center gap-2">
                              <List className="text-electricBlue" /> Section-wise Analysis
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {(resultData as MockTestResult).sectionWiseScore.map((sec, i) => (
                                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                      <p className="font-bold text-gray-700">{sec.subject}</p>
                                      <div className="flex justify-between mt-2 text-sm">
                                          <span>Score: <span className="font-bold">{sec.score}/{sec.total}</span></span>
                                          <span className={`${sec.accuracy > 70 ? 'text-green-500' : 'text-orange-500'}`}>{sec.accuracy}% Acc</span>
                                      </div>
                                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                                          <div className="h-full bg-electricBlue rounded-full" style={{width: `${sec.accuracy}%`}}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-navyDark mb-6 flex items-center gap-2">
                          <Target className="text-electricBlue" /> Performance Analysis
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                              <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle size={18} className="text-green-600" />
                                  <span className="font-bold text-green-800">Strongest Area</span>
                              </div>
                              <p className="text-gray-700 font-medium pl-6">
                                  {strongest || "No strong areas detected yet."}
                              </p>
                          </div>

                          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle size={18} className="text-red-600" />
                                  <span className="font-bold text-red-800">Weakest Area</span>
                              </div>
                              <p className="text-gray-700 font-medium pl-6">
                                  {weakest || "Excellent! No weak areas detected."}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      {isMock ? (
                          <>
                            <h3 className="font-bold text-navyDark mb-6 flex items-center gap-2">
                                <Award className="text-vibrantPurple" /> Exam Readiness
                            </h3>
                            <div className="flex items-center justify-center h-40">
                                <div className={`text-center p-6 rounded-2xl border-2 ${
                                    (resultData as MockTestResult).examReadiness === 'High' ? 'border-green-500 bg-green-50' : 
                                    (resultData as MockTestResult).examReadiness === 'Medium' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
                                }`}>
                                    <p className="text-sm font-bold uppercase tracking-widest mb-2 text-gray-500">Predicted Readiness</p>
                                    <p className="text-4xl font-display font-bold text-navyDark">{(resultData as MockTestResult).examReadiness}</p>
                                </div>
                            </div>
                          </>
                      ) : (
                          <>
                            <h3 className="font-bold text-navyDark mb-6 flex items-center gap-2">
                                <BarChart3 className="text-vibrantPurple" /> Difficulty Breakdown
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <span className="w-16 text-sm font-bold text-gray-500">Easy</span>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 rounded-full" style={{width: `${(resultData as PracticeResult).difficultyBreakdown.Easy}%`}}></div>
                                    </div>
                                    <span className="text-sm font-bold">{(resultData as PracticeResult).difficultyBreakdown.Easy}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="w-16 text-sm font-bold text-gray-500">Medium</span>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{width: `${(resultData as PracticeResult).difficultyBreakdown.Medium}%`}}></div>
                                    </div>
                                    <span className="text-sm font-bold">{(resultData as PracticeResult).difficultyBreakdown.Medium}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="w-16 text-sm font-bold text-gray-500">Hard</span>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400 rounded-full" style={{width: `${(resultData as PracticeResult).difficultyBreakdown.Hard}%`}}></div>
                                    </div>
                                    <span className="text-sm font-bold">{(resultData as PracticeResult).difficultyBreakdown.Hard}%</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase">Suggested Next Topic</p>
                                <p className="font-bold text-navyDark text-lg mt-1 flex items-center gap-2">
                                    {(resultData as PracticeResult).suggestedNextTopic} <ArrowRight size={16} className="text-electricBlue"/>
                                </p>
                            </div>
                          </>
                      )}
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button onClick={() => setView('MODE_SELECT')} className="px-8 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors w-full md:w-auto">
                      Back to Dashboard
                  </button>
                  
                  {isMock ? (
                      <button onClick={() => startMockTest(selectedExam!)} className="px-8 py-4 rounded-xl font-bold text-white bg-electricBlue hover:bg-blue-600 transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                          <RotateCcw size={20} /> Take Another Mock
                      </button>
                  ) : (
                      <button onClick={isDailyChallenge ? startDailyChallenge : () => startPracticeQuiz(selectedTopic!)} className="px-8 py-4 rounded-xl font-bold text-white bg-electricBlue hover:bg-blue-600 transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                          <RotateCcw size={20} /> {isDailyChallenge ? 'Next Daily Challenge' : 'Retry Topic'}
                      </button>
                  )}
              </div>
          </div>
      );
  }
  
  if (questions.length === 0) return null; 

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-32 relative flex gap-6 px-4">
        {toastMessage && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navyDark text-white px-6 py-3 rounded-full z-50 animate-pop">
                {toastMessage}
            </div>
        )}

        {/* Enhanced Question Palette for Mock Tests (Scrollable) */}
        {quizMode === 'MOCK' && (
            <div className="hidden lg:flex flex-col w-72 bg-white p-4 rounded-3xl border border-gray-100 h-[calc(100vh-100px)] sticky top-4 overflow-hidden">
                <h3 className="font-bold text-navyDark mb-4">Question Palette</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={paletteRef}>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((_, idx) => {
                            let statusColor = 'bg-gray-100 text-gray-500 border border-gray-200'; 
                            if (mockAnswers[idx] !== undefined) statusColor = 'bg-green-500 text-white border-green-600'; 
                            else if (markedForReview[idx]) statusColor = 'bg-purple-500 text-white border-purple-600'; 
                            else if (idx === currentQuestionIdx) statusColor = 'bg-electricBlue text-white border-blue-600 ring-2 ring-blue-200'; 

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => setCurrentQuestionIdx(idx)}
                                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${statusColor}`}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 bg-white">
                    <div className="grid grid-cols-2 gap-2">
                         <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Answered</div>
                         <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div> Review</div>
                         <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 bg-electricBlue rounded-sm"></div> Current</div>
                         <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div> Left</div>
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-xs font-bold text-gray-400">Total: {questions.length} Questions</span>
                    </div>
                </div>
            </div>
        )}

        <div className="flex-1 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-20">
                <div>
                    <h2 className="font-bold text-navyDark text-sm md:text-base">{selectedExam?.shortName} {quizMode === 'MOCK' ? 'Mock Test' : (isDailyChallenge ? 'Daily Challenge' : `• ${selectedSubject}`)}</h2>
                    <p className="text-xs text-gray-500 font-medium">
                        {currentQ.subject ? <span className="text-electricBlue">{currentQ.subject} • </span> : ''}
                        Q{currentQuestionIdx + 1} of {questions.length}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold border ${timeLeft < 300 ? 'bg-red-50 text-errorRed border-red-100 animate-pulse' : 'bg-blue-50 text-electricBlue border-blue-100'}`}>
                    <Clock size={18} /> {formatTime(timeLeft)}
                </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-6 min-h-[300px]">
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-lg md:text-xl font-display font-medium text-navyDark leading-relaxed">{currentQ.text}</h3>
                    {currentQ.isRepeated && (
                        <div className="hidden md:flex flex-col items-end gap-1 ml-4">
                             <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                                <Zap size={10} fill="currentColor" /> High Yield
                            </span>
                            <span className="text-[10px] text-gray-400">Repeated {currentQ.frequency}x</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {currentQ.options.map((opt, idx) => {
                        let styleClass = "w-full p-4 md:p-5 rounded-xl border-2 text-left flex items-center gap-4 transition-all ";
                        
                        if (quizMode === 'PRACTICE' && isAnswerChecked) {
                            if (idx === currentQ.correctAnswer) styleClass += "bg-green-50 border-studentLime text-green-800";
                            else if (idx === selectedOption) styleClass += "bg-red-50 border-errorRed text-red-800";
                            else styleClass += "border-gray-100 opacity-60";
                        } else {
                            const isSelected = quizMode === 'MOCK' ? mockAnswers[currentQuestionIdx] === idx : selectedOption === idx;
                            if (isSelected) styleClass += "bg-blue-50 border-electricBlue text-electricBlue shadow-md transform scale-[1.01]";
                            else styleClass += "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-300";
                        }

                        return (
                            <button key={idx} onClick={() => handleOptionSelect(idx)} className={styleClass}>
                                <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 ${quizMode === 'MOCK' && mockAnswers[currentQuestionIdx] === idx ? 'bg-electricBlue text-white border-electricBlue' : 'bg-white text-gray-500 border-gray-200'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="font-medium text-sm md:text-base">{opt}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {quizMode === 'PRACTICE' && isAnswerChecked && submissionFeedback && (
                <div className="bg-white p-6 rounded-3xl border border-gray-200 mb-24 animate-fade-in">
                    <h4 className={`font-bold ${submissionFeedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{submissionFeedback.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                    <p className="text-gray-600 mt-2">{submissionFeedback.explanation}</p>
                    <button onClick={askAI} className="mt-4 text-electricBlue font-bold text-sm flex items-center gap-2"><Zap size={16}/> Ask AI</button>
                    {aiDeepDive && <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm">{aiDeepDive}</div>}
                </div>
            )}

            <div className="fixed bottom-0 left-0 lg:left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 flex justify-center items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-4 w-full max-w-4xl justify-between">
                    {quizMode === 'MOCK' ? (
                        <>
                             <div className="flex gap-2">
                                <button onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(c => c - 1)} className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 disabled:opacity-50" disabled={currentQuestionIdx === 0}>
                                    <ChevronRight className="rotate-180" size={24} />
                                </button>
                                <button onClick={toggleMarkForReview} className={`flex items-center gap-2 font-bold px-4 rounded-xl transition-colors ${markedForReview[currentQuestionIdx] ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                    <CheckSquare size={20} /> <span className="hidden md:inline">{markedForReview[currentQuestionIdx] ? 'Unmark' : 'Review'}</span>
                                </button>
                             </div>

                             <div className="flex gap-2">
                                {currentQuestionIdx < questions.length - 1 ? (
                                    <button onClick={() => setCurrentQuestionIdx(c => c + 1)} className="px-8 py-3 bg-navyDark text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2">
                                        Next <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSubmitMock(false)} 
                                        disabled={isSubmitting || Object.keys(mockAnswers).length < questions.length} 
                                        className="px-8 py-3 bg-electricBlue text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Test'}
                                    </button>
                                )}
                             </div>
                        </>
                    ) : (
                        <div className="ml-auto w-full flex justify-end">
                            {!isAnswerChecked ? (
                                <button onClick={handleCheckAnswer} className="w-full md:w-auto px-8 py-3 bg-electricBlue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">Check Answer</button>
                            ) : (
                                <button onClick={handleNext} className="w-full md:w-auto px-8 py-3 bg-navyDark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
                                    {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Finish & See Results'} 
                                    <ArrowRight size={18}/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Quiz;