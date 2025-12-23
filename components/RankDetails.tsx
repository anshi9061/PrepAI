import React, { useState, useEffect } from 'react';
import { AppView, RankData } from '../types';
import { getRankBreakdown } from '../services/mockBackend';
import { ArrowLeft, Calendar, Award, Users, Target, Filter } from 'lucide-react';

interface RankDetailsProps {
    changeView: (view: AppView) => void;
}

const RankDetails: React.FC<RankDetailsProps> = ({ changeView }) => {
    const [ranks, setRanks] = useState<RankData[]>([]);
    const [filter, setFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL' | 'CUSTOM'>('ALL');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const now = Date.now();
            let start = 0;
            let end = now;

            if (filter === 'TODAY') {
                start = new Date().setHours(0,0,0,0);
            } else if (filter === 'WEEK') {
                start = now - 7 * 24 * 60 * 60 * 1000;
            } else if (filter === 'MONTH') {
                start = now - 30 * 24 * 60 * 60 * 1000;
            } else if (filter === 'CUSTOM' && customStart && customEnd) {
                start = new Date(customStart).getTime();
                end = new Date(customEnd).getTime();
            }

            const data = await getRankBreakdown('user_demo', start, end);
            setRanks(data);
            setLoading(false);
        };

        fetchData();
    }, [filter, customStart, customEnd]);

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => changeView(AppView.DASHBOARD)} 
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-navyDark" />
                </button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-navyDark">Rank Analytics</h1>
                    <p className="text-gray-500">See where you stand among peers.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                filter === f ? 'bg-electricBlue text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {f === 'TODAY' ? 'Today' : f === 'WEEK' ? 'Last 7 Days' : f === 'MONTH' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                    <button
                        onClick={() => setFilter('CUSTOM')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            filter === 'CUSTOM' ? 'bg-electricBlue text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <Calendar size={16} /> Custom
                    </button>
                </div>

                {filter === 'CUSTOM' && (
                    <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <input 
                            type="date" 
                            className="bg-transparent text-sm outline-none text-gray-700"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                            type="date" 
                            className="bg-transparent text-sm outline-none text-gray-700"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
                </div>
            ) : ranks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ranks.map((rank, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-navyDark">{rank.exam}</h3>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                        Top {100 - rank.rankPercentile}%
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-electricBlue mb-2">
                                            <Award size={20} />
                                        </div>
                                        <p className="text-2xl font-bold text-navyDark">{rank.rankPercentile}<span className="text-sm text-gray-400">%ile</span></p>
                                        <p className="text-xs text-gray-400 mt-1">Percentile</p>
                                    </div>
                                    <div className="text-center border-l border-r border-gray-100 px-2">
                                        <div className="w-10 h-10 mx-auto bg-purple-50 rounded-full flex items-center justify-center text-vibrantPurple mb-2">
                                            <Users size={20} />
                                        </div>
                                        <p className="text-2xl font-bold text-navyDark">{rank.totalUsers.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400 mt-1">Total Users</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-2">
                                            <Target size={20} />
                                        </div>
                                        <p className="text-2xl font-bold text-navyDark">{rank.basedOnAnswers}</p>
                                        <p className="text-xs text-gray-400 mt-1">Your Answers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Filter className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-600">No Data Found</h3>
                    <p className="text-gray-400">Try changing the date filters or take more tests.</p>
                </div>
            )}
        </div>
    );
};

export default RankDetails;