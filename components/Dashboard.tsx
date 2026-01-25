import React, { useEffect, useState } from 'react';
import { Activity, BookOpen, Target, Award, ArrowUpRight, ArrowDownRight, Zap, Loader2, Clock, ChevronRight, Star } from 'lucide-react';
import { USER_NAME } from '../constants';
import { AppView, UserAnalytics, QuizAttemptDetailed } from '../types';
import { getDashboardAnalytics, getQuizHistory } from '../services/mockBackend';

// TODO: Step 1.5 - Replace with real API calls to backend
// import { getDashboardAnalytics, getQuizHistory } from '../services/api';
// TODO: Step 2.3 - Add real-time analytics updates
// TODO: Step 3.1 - Add performance metrics and caching

interface DashboardProps {
  changeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ changeView }) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizAttemptDetailed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            // TODO: Step 1.5 - Replace with authenticated API calls
            // const [stats, history] = await Promise.all([
            //     api.getDashboardAnalytics(user.id),
            //     api.getQuizHistory({ userId: user.id, limit: 3 })
            // ]);
            
            // Parallel Fetch
            const [stats, history] = await Promise.all([
                getDashboardAnalytics(),
                getQuizHistory({ userId: 'user_demo', limit: 3 })
            ]);
            setAnalytics(stats);
            setRecentQuizzes(history);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
            // TODO: Step 2.1 - Add proper error handling and user feedback
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full min-h-[400px]">
              <Loader2 className="animate-spin text-electricBlue" size={48} />
          </div>
      );
  }

  const stats = analytics || {
      dailyProgress: 0,
      dailyChange: 0,
      streak: 0,
      weakestTopic: null,
      weakestTopicScore: 0,
      rankPercentile: 0,
      totalQuestionsAttempted: 0,
      lastUpdated: new Date().toISOString()
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-navyDark">
            Welcome back, <span className="text-electricBlue">{USER_NAME}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to crush your goals today?</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <Zap className={`w-5 h-5 ${stats.streak > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
            <span className="font-bold text-navyDark">{stats.streak} Streak</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Progress Card - CLICKABLE */}
        <button 
            onClick={() => changeView(AppView.ANALYTICS)}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 text-left w-full"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-electricBlue/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center space-x-3 z-10">
                <div className="p-3 bg-blue-100 rounded-xl text-electricBlue">
                    <Activity size={24} />
                </div>
                <h3 className="font-semibold text-lg text-gray-700">Daily Progress</h3>
            </div>
            <div className="z-10">
                <p className="text-3xl font-bold font-display text-navyDark">{stats.dailyProgress}%</p>
                <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm flex items-center ${stats.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.dailyChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} 
                        {Math.abs(stats.dailyChange)}% from yesterday
                    </p>
                    <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </button>

        {/* Daily Challenge Card (REPLACED WEAKEST LINK) */}
        <button 
            onClick={() => changeView(AppView.DAILY_CHALLENGE)}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 text-left w-full border-2 border-transparent hover:border-yellow-200"
        >
             <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center space-x-3 z-10">
                <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
                    <Star size={24} fill="currentColor" />
                </div>
                <h3 className="font-semibold text-lg text-gray-700">Daily Challenge</h3>
            </div>
            <div className="z-10">
                <p className="text-sm font-medium text-gray-600 mb-1">
                    Complete today’s 5-question mini test
                </p>
                <span className="text-sm text-yellow-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start Now <ChevronRight size={16} />
                </span>
            </div>
        </button>

        {/* Rank Prediction Card - CLICKABLE */}
        <button
            onClick={() => changeView(AppView.RANK_DETAILS)}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 text-left w-full"
        >
             <div className="absolute top-0 right-0 w-24 h-24 bg-studentLime/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center space-x-3 z-10">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                    <Award size={24} />
                </div>
                <h3 className="font-semibold text-lg text-gray-700">Rank Percentile</h3>
            </div>
            <div className="z-10">
                <p className="text-3xl font-bold font-display text-navyDark">Top {100 - stats.rankPercentile}%</p>
                <p className="text-sm text-gray-500">Based on {stats.totalQuestionsAttempted} answers</p>
                <div className="mt-1 text-right">
                     <ChevronRight size={16} className="text-gray-400 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Actions */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-navyDark mt-4 mb-4">Start Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => changeView(AppView.QUIZ)}
                    className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-electricBlue/30 transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="text-electricBlue" />
                    </div>
                    <h3 className="font-bold text-gray-800">Quick Quiz</h3>
                    <p className="text-sm text-gray-500 mt-1">10 min personalized session</p>
                </button>

                <button 
                    onClick={() => changeView(AppView.PAPERS)}
                    className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-vibrantPurple/30 transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="text-vibrantPurple" />
                    </div>
                    <h3 className="font-bold text-gray-800">Past Papers</h3>
                    <p className="text-sm text-gray-500 mt-1">Access 10+ years of data</p>
                </button>
            </div>
        </div>

        {/* Recent Quizzes List */}
        <div className="lg:col-span-1">
            <div className="flex justify-between items-center mt-4 mb-4">
                <h2 className="text-xl font-bold text-navyDark">Recent Quizzes</h2>
                <button 
                    onClick={() => changeView(AppView.ANALYTICS)} 
                    className="text-sm font-bold text-electricBlue hover:underline"
                >
                    View all
                </button>
            </div>
            
            <div className="space-y-3">
                {recentQuizzes.length > 0 ? recentQuizzes.map(q => (
                    <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{q.subject}</h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Clock size={10} /> {new Date(q.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${q.percentScore >= 80 ? 'bg-green-100 text-studentLime' : q.percentScore >= 50 ? 'bg-blue-100 text-electricBlue' : 'bg-red-100 text-red-500'}`}>
                            {q.percentScore}%
                        </div>
                    </div>
                )) : (
                    <div className="bg-white/50 p-6 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                        No quizzes taken yet.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;