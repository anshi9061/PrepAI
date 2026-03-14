import { TOPIC_DATABASE } from '../constants';
import { EXAM_PATTERNS } from '../constants';
import type { Question, Topic, ExamPattern } from '../types';

const CACHE_TTL = 30 * 60 * 1000;
const questionCache = new Map<string, { data: Question[]; timestamp: number }>();

const getCacheKey = (exam: string, subject: string, topic: string) =>
  `qs:${exam}:${subject}:${topic}`;

const getFromCache = (key: string): Question[] | null => {
  const cached = questionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};

const setCache = (key: string, data: Question[]) => {
  questionCache.set(key, { data, timestamp: Date.now() });
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generateProceduralMathPhysicsQuestion = (
  id: number,
  subject: string,
  topic: string,
): Question => {
  const v1 = Math.floor(Math.random() * 10) + 2;
  const v2 = Math.floor(Math.random() * 10) + 2;
  let text = '';
  let ans = 0;
  let explanation = '';

  if (Math.random() > 0.5) {
    text = `If a variable x = ${v1} and y = ${v2}, calculate the value of 2x + 3y.`;
    ans = 2 * v1 + 3 * v2;
    explanation = `Substitute values: 2(${v1}) + 3(${v2}) = ${2 * v1} + ${3 * v2} = ${ans}.`;
  } else {
    text = `A force of ${v1}N acts on a mass of ${v2}kg. What is the acceleration?`;
    ans = parseFloat((v1 / v2).toFixed(2));
    explanation = `Using Newton's Second Law F=ma, a = F/m = ${v1}/${v2} = ${ans} m/s².`;
  }

  const options = [ans, parseFloat((ans + 2).toFixed(2)), parseFloat((ans - 1.5).toFixed(2)), parseFloat((ans * 2).toFixed(2))];
  const stringOptions = options.map((o) => o.toString());
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map((i) => stringOptions[i]);
  const correctIndex = indices.indexOf(0);

  return {
    id,
    text,
    options: shuffledOptions,
    correctAnswer: correctIndex,
    topic,
    difficulty: 'Medium',
    explanation,
    isRepeated: false,
    subject,
  };
};

const generateContextualTheoryQuestion = (
  id: number,
  subject: string,
  topic: string,
): Question => {
  const concepts = ['primary function', 'basic unit', 'characteristic feature', 'main component', 'limiting factor', 'catalyst', 'derivative'];
  const concept = concepts[id % concepts.length];
  return {
    id,
    text: `Which of the following correctly describes a ${concept} of ${topic}?`,
    options: [
      `It is the fundamental principle of ${subject}.`,
      `It is unrelated to ${topic}.`,
      `It contradicts the laws of ${subject}.`,
      `It is only applicable in vacuum.`,
    ],
    correctAnswer: 0,
    topic,
    difficulty: 'Easy',
    explanation: `In the context of ${subject}, the ${concept} of ${topic} plays a vital role in defining its properties.`,
    isRepeated: Math.random() > 0.8,
    frequency: Math.random() > 0.8 ? 2 : 0,
    subject,
  };
};

export const getTopics = async (examId: string, subject?: string): Promise<Topic[]> => {
  const subjectKey = subject || 'General';
  const rawTopics = TOPIC_DATABASE[subjectKey] || [];
  if (rawTopics.length === 0) {
    return [
      { id: 'unit_1', name: 'Unit 1: Fundamentals', subject: subjectKey },
      { id: 'unit_2', name: 'Unit 2: Core Concepts', subject: subjectKey },
      { id: 'unit_3', name: 'Unit 3: Advanced Applications', subject: subjectKey },
    ];
  }
  return rawTopics.map((t, idx) => ({
    id: `${subjectKey.toLowerCase()}_${idx}`,
    name: t,
    subject: subjectKey,
  }));
};

export const getQuizQuestions = async (
  examId: string,
  subject: string,
  topicName: string,
): Promise<Question[]> => {
  const key = getCacheKey(examId, subject, topicName);
  const cached = getFromCache(key);
  if (cached) return cached;

  const questions: Question[] = [];
  while (questions.length < 10) {
    const idx = questions.length + 1;
    const q =
      subject === 'Physics' || subject === 'Mathematics'
        ? generateProceduralMathPhysicsQuestion(idx, subject, topicName)
        : generateContextualTheoryQuestion(idx, subject, topicName);
    questions.push(q);
  }

  const finalQuestions = shuffleArray(questions).slice(0, 10);
  setCache(key, finalQuestions);
  return finalQuestions;
};

export const generateMockTest = async (
  examId: string,
  subjects: string[],
): Promise<Question[]> => {
  const mockQuestions: Question[] = [];
  const pattern: ExamPattern = EXAM_PATTERNS[examId] || EXAM_PATTERNS['default'];

  for (const section of pattern.sections) {
    const { subject, questionCount } = section;
    for (let i = 0; i < questionCount; i++) {
      const idx = mockQuestions.length + 1000 + i;
      const q =
        subject === 'Physics' || subject === 'Mathematics' || subject === 'Quant'
          ? generateProceduralMathPhysicsQuestion(idx, subject, 'General')
          : generateContextualTheoryQuestion(idx, subject, 'General');
      if (i % 5 === 0) {
        q.isRepeated = true;
        q.frequency = Math.floor(Math.random() * 4) + 2;
      }
      mockQuestions.push(q);
    }
  }
  return mockQuestions;
};

export const generateDailyChallenge = async (): Promise<Question[]> => {
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'];
  return subjects.map((subject, i) =>
    subject === 'Physics' || subject === 'Mathematics'
      ? generateProceduralMathPhysicsQuestion(9000 + i, subject, 'Daily Challenge')
      : generateContextualTheoryQuestion(9000 + i, subject, 'Daily Challenge'),
  );
};
