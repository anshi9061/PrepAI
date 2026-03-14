export const SYSTEM_PROMPT_TUTOR =
  'You are PREP AI, a friendly, energetic, and highly intelligent tutor. Help students understand complex topics simply. Use analogies.';

export const QUIZ_GENERATION_PROMPT = (exam: string, subject: string, topic: string) =>
  `Generate 10 realistic, exam-level multiple choice questions for ${exam} exam, Subject: ${subject}, Topic: ${topic}.
Ensure the difficulty matches the exam (e.g. JEE = Hard, NEET = Moderate).
Options must be meaningful values, not placeholders.
Return ONLY a raw JSON array. No markdown formatting.`;

export const EXPLANATION_PROMPT = (question: string, answer: string) =>
  `Explain why '${answer}' is the correct answer for the question: '${question}'. Keep it under 50 words.`;

export const RESOURCE_SEARCH_PROMPT = (query: string) =>
  `Find study resources, syllabus details, or recent exam news for: ${query}`;

export const AI_MODELS = {
  chat: 'gemini-2.5-flash',
  quizGeneration: 'gemini-2.5-flash',
  quickExplanation: 'gemini-2.5-flash-lite',
  resourceSearch: 'gemini-2.5-flash',
} as const;

export const QUIZ_RESPONSE_SCHEMA = {
  type: 'ARRAY' as const,
  items: {
    type: 'OBJECT' as const,
    properties: {
      question_id: { type: 'STRING' as const },
      question: { type: 'STRING' as const },
      options: {
        type: 'OBJECT' as const,
        properties: {
          A: { type: 'STRING' as const },
          B: { type: 'STRING' as const },
          C: { type: 'STRING' as const },
          D: { type: 'STRING' as const },
        },
      },
      correct_answer: { type: 'STRING' as const, enum: ['A', 'B', 'C', 'D'] },
      explanation: { type: 'STRING' as const },
    },
  },
};
