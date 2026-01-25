import { EXAM_DATABASE, STATES_LIST } from "../constants";
import { ExamProfile, PaperResource, ExamCategory, ExamLevel } from "../types";

// TODO: Step 1.5 - Replace with real database queries
// TODO: Step 2.7 - Implement real file storage and management
// TODO: Step 3.7 - Add search and filtering capabilities
// TODO: Step 4.3 - Add OCR and paper digitization features

// --- BACKEND LOGIC SIMULATION ---
// TODO: Step 1.5 - Remove static data and connect to database

export const getExamLevels = () => [
    { id: 'National', label: 'All India Exams', icon: 'Globe', desc: 'NEET, JEE, UPSC, & More' },
    { id: 'State', label: 'State-wise Exams', icon: 'Map', desc: 'KEAM, KCET, MHT-CET & More' },
    { id: 'Board', label: 'Board Exams', icon: 'BookOpen', desc: 'CBSE, ICSE & State Boards' }
];

// Helper to get all available states from the static list (or dynamic if DB grows)
export const getAllStates = (): string[] => {
    return STATES_LIST;
}

// Get categories available for a specific level (and optional state)
// This scans the database to only show categories that actually have exams.
export const getCategoriesForContext = (level: ExamLevel, state?: string): ExamCategory[] => {
    const relevantExams = EXAM_DATABASE.filter(e => {
        if (e.level !== level) return false;
        if (level === 'State' && state && e.state !== state) return false;
        return true;
    });

    // Extract unique categories
    const categories = Array.from(new Set(relevantExams.map(e => e.category)));
    return categories as ExamCategory[];
};

export const getExamsByContext = (level: ExamLevel, category?: ExamCategory, state?: string): ExamProfile[] => {
    return EXAM_DATABASE.filter(e => {
        if (e.level !== level) return false;
        if (state && e.state !== state) return false;
        if (category && e.category !== category) return false;
        return true;
    });
};

export const getAvailableYears = (examId: string): number[] => {
    const exam = EXAM_DATABASE.find(e => e.id === examId);
    if (!exam) return [];

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    // Logic: Current Year down to Start Year
    for (let y = currentYear; y >= exam.startYear; y--) {
        years.push(y);
    }
    return years;
};

// Legacy support for other components
export const getAllExams = (): ExamProfile[] => {
    return EXAM_DATABASE;
}

// Helper for Category Grid UI
export const getCategoryIcon = (cat: ExamCategory): string => {
    const map: Record<ExamCategory, string> = {
        'Engineering': 'Wrench',
        'Medical': 'Stethoscope',
        'Science': 'FlaskConical',
        'Law': 'Scale',
        'Commerce': 'BarChart3',
        'Defence': 'Shield',
        'Government': 'Building2',
        'School': 'Backpack',
        'Board': 'BookOpen',
        'Polytechnic': 'Settings',
        'Pharmacy': 'Pill',
        'Agriculture': 'Sprout',
        'Management': 'Briefcase',
        'Recruitment': 'Users',
        'Arts': 'FileText',
        'General': 'Globe'
    };
    return map[cat] || 'FileText';
}

/**
 * Mocks the retrieval of specific paper files.
 */
export const getPapersForYear = (examId: string, year: number, subject?: string): PaperResource[] => {
    const exam = EXAM_DATABASE.find(e => e.id === examId);
    if (!exam) return [];

    const papers: PaperResource[] = [];
    const title = subject 
            ? `${exam.shortName} ${year} - ${subject}`
            : `${exam.shortName} ${year} Full Paper`;

    papers.push({
        id: `${examId}_${year}_${subject || 'full'}`,
        examId: examId,
        year: year,
        subject: subject,
        title: title,
        downloadUrl: '#',
        fileSize: '5.2 MB'
    });

    return papers;
};

export const getExamCategories = () => {
    const categories = Array.from(new Set(EXAM_DATABASE.map(e => e.category)));
    return categories.map(cat => ({
        id: cat,
        label: cat
    }));
};

export const getExamsByCategory = (category: ExamCategory): ExamProfile[] => {
    return EXAM_DATABASE.filter(e => e.category === category);
};