
import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, ChevronRight, Download, FileText, ArrowLeft,
    Stethoscope, Wrench, FlaskConical, Scale, BarChart3, Shield, Building2, Backpack, BookOpen,
    Calendar, Layers, Globe, Map, Settings, Pill, Sprout, Briefcase, Users
} from 'lucide-react';
import { ExamCategory, ExamProfile, ExamLevel } from '../types';
import { 
    getExamLevels, getAllStates, getCategoriesForContext, 
    getExamsByContext, getAvailableYears, getPapersForYear, 
    getAllExams, getCategoryIcon 
} from '../services/paperService';

const PastPapers: React.FC = () => {
    // --- STATE ---
    // Navigation Stack
    const [level, setLevel] = useState<ExamLevel | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
    const [selectedExam, setSelectedExam] = useState<ExamProfile | null>(null);

    // Filters (Leaf View)
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- DYNAMIC ICONS ---
    const IconMap: Record<string, React.FC<any>> = {
        'Stethoscope': Stethoscope,
        'Wrench': Wrench,
        'FlaskConical': FlaskConical,
        'Scale': Scale,
        'BarChart3': BarChart3,
        'Shield': Shield,
        'Building2': Building2,
        'Backpack': Backpack,
        'BookOpen': BookOpen,
        'Globe': Globe,
        'Map': Map,
        'Settings': Settings,
        'Pill': Pill,
        'Sprout': Sprout,
        'Briefcase': Briefcase,
        'Users': Users,
        'FileText': FileText
    };

    // --- SEARCH LOGIC ---
    const isSearching = searchQuery.length > 0;
    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        return getAllExams().filter(e => 
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            e.shortName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // --- HELPERS ---
    const handleBack = () => {
        if (selectedExam) {
            setSelectedExam(null);
            setSelectedYear(null);
            setSelectedSubject(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else if (selectedState) {
            setSelectedState(null);
        } else if (level) {
            setLevel(null);
        } else if (isSearching) {
            setSearchQuery('');
        }
    };

    const getBreadcrumb = () => {
        if (isSearching) return 'Search Results';
        let bc = 'Library';
        if (level) bc += level === 'National' ? ' / All India' : level === 'State' ? ' / State' : ' / Board';
        if (selectedState) bc += ` / ${selectedState}`;
        if (selectedCategory) bc += ` / ${selectedCategory}`;
        if (selectedExam) bc += ` / ${selectedExam.shortName}`;
        return bc;
    }

    // --- RENDERERS ---

    // 1. Root Level (All India vs State vs Board)
    const renderRootSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            {getExamLevels().map((lvl) => {
                const Icon = IconMap[lvl.icon];
                return (
                    <button
                        key={lvl.id}
                        onClick={() => {
                            setLevel(lvl.id as ExamLevel);
                            if (lvl.id === 'Board') setSelectedCategory('Board'); // Auto-select category for boards
                        }}
                        className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-electricBlue transition-all group hover:-translate-y-1 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-electricBlue group-hover:text-white transition-colors">
                            <Icon size={40} className="text-electricBlue group-hover:text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-navyDark">{lvl.label}</h3>
                            <p className="text-sm text-gray-500 mt-2">{lvl.desc}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    );

    // 2. State Grid (Only if Level === State)
    const renderStateGrid = () => (
        <div className="animate-slide-up">
            <h2 className="text-xl font-bold text-navyDark mb-6 flex items-center gap-2">
                <Map className="text-electricBlue" /> Select State
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getAllStates().map(state => (
                    <button
                        key={state}
                        onClick={() => setSelectedState(state)}
                        className="glass-panel p-4 rounded-xl font-bold text-gray-700 hover:bg-white hover:border-electricBlue hover:text-electricBlue transition-all text-center shadow-sm"
                    >
                        {state}
                    </button>
                ))}
            </div>
        </div>
    );

    // 3. Category Grid (Context Aware)
    const renderCategoryGrid = () => {
        const categories = getCategoriesForContext(level!, selectedState || undefined);
        
        if (categories.length === 0) {
            return (
                <div className="text-center py-10 text-gray-500">
                    No exams found for this selection yet. We are adding more soon!
                </div>
            );
        }

        return (
            <div className="animate-slide-up">
                <h2 className="text-xl font-bold text-navyDark mb-6 flex items-center gap-2">
                    <Filter className="text-electricBlue" /> Select Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map(cat => {
                        const iconName = getCategoryIcon(cat);
                        const Icon = IconMap[iconName] || FileText;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-electricBlue/50 hover:bg-white transition-all group"
                            >
                                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <span className="font-bold text-gray-700">{cat}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        );
    };

    // 4. Exam List
    const renderExamList = () => {
        const exams = getExamsByContext(level!, selectedCategory!, selectedState || undefined);

        return (
            <div className="animate-slide-up space-y-4 max-w-3xl mx-auto">
                 <h2 className="text-xl font-bold text-navyDark mb-6">Available Exams</h2>
                 {exams.map(exam => (
                     <button
                        key={exam.id}
                        onClick={() => setSelectedExam(exam)}
                        className="w-full glass-panel p-5 rounded-xl flex items-center justify-between hover:border-electricBlue hover:shadow-md transition-all group text-left bg-white"
                     >
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-electricBlue font-bold text-xl shadow-inner border border-white">
                                 {exam.shortName.charAt(0)}
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg text-navyDark">{exam.name}</h3>
                                 <p className="text-xs text-gray-500">{exam.level} • {exam.startYear}+ Years Available</p>
                             </div>
                         </div>
                         <ChevronRight className="text-gray-300 group-hover:text-electricBlue transition-colors" />
                     </button>
                 ))}
                 {exams.length === 0 && <p className="text-gray-500 text-center">No exams listed yet.</p>}
            </div>
        )
    };

    // 5. Paper View (Filters & Download)
    const renderPaperView = () => {
        const years = getAvailableYears(selectedExam!.id);
        
        // Auto-select latest year
        if (!selectedYear && years.length > 0) setSelectedYear(years[0]);

        const papers = selectedYear ? getPapersForYear(selectedExam!.id, selectedYear, selectedSubject || undefined) : [];

        return (
            <div className="animate-fade-in space-y-6">
                {/* Header */}
                <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
                    <h2 className="text-3xl font-display font-bold text-navyDark">{selectedExam!.name}</h2>
                    <p className="text-gray-600 mt-2">{selectedExam!.description || `Official Question Papers for ${selectedExam!.name}`}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-1/3 space-y-6">
                        {/* Year */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Select Year</label>
                            <div className="bg-white p-2 rounded-xl border border-gray-200 h-60 overflow-y-auto custom-scrollbar">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setSelectedYear(y)}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold mb-1 transition-all ${
                                            selectedYear === y ? 'bg-electricBlue text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3 space-y-6">
                        {/* Subjects (if applicable) */}
                        {selectedExam!.hasSubjects && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Filter by Subject</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSubject(null)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                            !selectedSubject ? 'bg-navyDark text-white border-navyDark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        All Subjects
                                    </button>
                                    {selectedExam!.subjects?.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setSelectedSubject(sub)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                                selectedSubject === sub ? 'bg-vibrantPurple text-white border-vibrantPurple' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paper List */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-700">Documents</h3>
                            {papers.length > 0 ? papers.map(paper => (
                                <div key={paper.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-electricBlue/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{paper.title}</h4>
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">PDF • {paper.fileSize}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-electricBlue transition-colors shadow-lg shadow-gray-200">
                                        <Download size={16} />
                                        <span className="hidden md:inline">Download</span>
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-400 font-medium">No papers found for this selection.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    // --- MAIN RENDER ---
    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
            {/* Header / Nav Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium overflow-x-auto whitespace-nowrap pb-2">
                    <span className="text-electricBlue font-bold">{getBreadcrumb()}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         {(level || isSearching) && (
                            <button onClick={handleBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <ArrowLeft size={24} className="text-navyDark" />
                            </button>
                        )}
                        <h1 className="text-3xl font-display font-bold text-navyDark">
                            {isSearching ? 'Search Results' : selectedExam ? 'Exam Details' : 'Past Papers'}
                        </h1>
                    </div>
                    
                    {/* Search Trigger */}
                    {!selectedExam && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search exams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-electricBlue/20 w-40 md:w-64 transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* View Controller */}
            <div className="min-h-[400px]">
                {isSearching ? (
                     searchResults.length > 0 ? (
                        <div className="animate-slide-up space-y-4 max-w-3xl mx-auto">
                            {searchResults.map(exam => (
                                <button
                                    key={exam.id}
                                    onClick={() => {
                                        setLevel(exam.level);
                                        if (exam.state) setSelectedState(exam.state);
                                        setSelectedCategory(exam.category);
                                        setSelectedExam(exam);
                                        setSearchQuery('');
                                    }}
                                    className="w-full glass-panel p-4 rounded-xl flex items-center justify-between hover:border-electricBlue hover:shadow-md transition-all text-left bg-white"
                                >
                                    <h3 className="font-bold text-navyDark">{exam.name}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{exam.level}</span>
                                </button>
                            ))}
                        </div>
                     ) : <div className="text-center py-20 text-gray-400">No matching exams found.</div>
                ) : selectedExam ? (
                    renderPaperView()
                ) : (
                    // Logic Tree for Navigation
                    <>
                        {!level && renderRootSelection()}
                        
                        {level === 'National' && !selectedCategory && renderCategoryGrid()}
                        {level === 'National' && selectedCategory && renderExamList()}

                        {level === 'State' && !selectedState && renderStateGrid()}
                        {level === 'State' && selectedState && !selectedCategory && renderCategoryGrid()}
                        {level === 'State' && selectedState && selectedCategory && renderExamList()}

                        {level === 'Board' && !selectedExam && renderExamList()} 
                        {/* Note: Board auto-selects 'Board' category in root handler */}
                    </>
                )}
            </div>
        </div>
    );
};

export default PastPapers;
