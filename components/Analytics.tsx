import React, { useEffect, useState } from 'react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { 
    Calendar, Filter, ChevronDown, CheckCircle, Clock, BookOpen, Search 
} from 'lucide-react';
import { getProgressAnalytics, getQuizHistory } from '../services/mockBackend';
import { ProgressDataPoint, QuizAttemptDetailed } from '../types';

const Analytics: React.FC = () => {
    // --- STATE ---
    const [timeFilter, setTimeFilter] = useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');
    const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
    const [history, setHistory] = useState<QuizAttemptDetailed[]>([]);
    const [loading, setLoading] = useState(true);

    // --- EFFECT: Load Data ---
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const now = Date.now();
            let startDate = 0;
            if (timeFilter === 'WEEK') startDate = now - 7 * 24 * 60 * 60 * 1000;
            if (timeFilter === 'MONTH') startDate = now - 30 * 24 * 60 * 60 * 1000;

            const [chartData, listData] = await Promise.all([
                getProgressAnalytics({ userId: 'user_demo', startDate }),
                getQuizHistory({ userId: 'user_demo', limit: 20 })
            ]);

            setProgressData(chartData);
            setHistory(listData);
            setLoading(false);
        };
        load();
    }, [timeFilter]);

    // --- CHART TOOLTIP ---
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="text-xs font-bold text-gray-400">{label}</p>
                    <p className="text-electricBlue font-bold text-lg">{payload[0].value}% Score</p>
                    <p className="text-gray-500 text-xs">{payload[0].payload.attempts} attempts</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-navyDark">My Progress</h1>
                    <p className="text-gray-500">Track your improvement over time.</p>
                </div>
                
                {/* Time Filter Tabs */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                    {(['WEEK', 'MONTH', 'ALL'] as const).map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeFilter(tf)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                timeFilter === tf ? 'bg-electricBlue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {tf === 'WEEK' ? '7 Days' : tf === 'MONTH' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
             </div>

             {/* CHART SECTION */}
             <div className="glass-panel p-6 rounded-3xl h-96 relative">
                 <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <BookOpen size={20} className="text-vibrantPurple" /> Performance Trend
                 </h3>
                 
                 {loading ? (
                     <div className="flex h-full items-center justify-center text-gray-400">Loading chart...</div>
                 ) : progressData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 12, fill: '#94A3B8'}} 
                                axisLine={false} 
                                tickLine={false} 
                                dy={10}
                                tickFormatter={(val) => val.slice(5)} // Show MM-DD
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                tick={{fontSize: 12, fill: '#94A3B8'}} 
                                axisLine={false} 
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="avgScore" 
                                stroke="#4B8BFF" 
                                strokeWidth={4} 
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4B8BFF' }}
                            />
                        </LineChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="flex h-full items-center justify-center flex-col text-gray-400">
                        <BookOpen size={48} className="mb-2 opacity-20" />
                        <p>No data for this period.</p>
                     </div>
                 )}
             </div>

             {/* RECENT QUIZZES LIST */}
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-navyDark flex items-center gap-2">
                     <Clock className="text-electricBlue" /> Quizzes I Attended
                 </h2>
                 
                 {loading ? (
                     <div className="space-y-3">
                         {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                     </div>
                 ) : history.length > 0 ? (
                     <div className="grid grid-cols-1 gap-3">
                         {history.map(attempt => (
                             <div 
                                key={attempt.id} 
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-electricBlue/30 transition-all group"
                             >
                                 <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                         attempt.percentScore >= 80 ? 'bg-green-50 text-studentLime' : 
                                         attempt.percentScore >= 50 ? 'bg-blue-50 text-electricBlue' : 
                                         'bg-red-50 text-red-500'
                                     }`}>
                                         {attempt.percentScore}%
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-gray-800 text-lg">{attempt.subject}</h4>
                                         <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                             <span className="bg-gray-100 px-2 py-0.5 rounded">{attempt.exam}</span>
                                             <span>{new Date(attempt.timestamp).toLocaleDateString()}</span>
                                             <span>{attempt.score}/{attempt.totalQuestions} Correct</span>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="text-right hidden md:block">
                                     <p className="text-sm font-bold text-gray-400 group-hover:text-electricBlue transition-colors">View Details</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                         <Search size={48} className="mx-auto text-gray-300 mb-4" />
                         <h3 className="text-lg font-bold text-gray-600">No quizzes yet</h3>
                         <p className="text-gray-400">Start a quiz to see your history here!</p>
                     </div>
                 )}
             </div>
        </div>
    );
};

export default Analytics;