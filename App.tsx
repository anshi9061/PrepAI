import React, { useState } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import PastPapers from './components/PastPapers';
import Analytics from './components/Analytics';
import ChatAssistant from './components/ChatAssistant';
import ImageStudio from './components/ImageStudio';
import RankDetails from './components/RankDetails';
import { LayoutDashboard, BookOpen, PenTool, BarChart2, LogOut, Hexagon, Star } from 'lucide-react';

// TODO: Step 1.3 - Add authentication context and user management
// TODO: Step 1.4 - Replace hardcoded user with real authentication
// TODO: Step 2.1 - Add loading states and error boundaries
// TODO: Step 3.2 - Add subscription management and premium features

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // TODO: Step 1.3 - Replace with real authentication state from AuthContext
  // Simple Onboarding State check (in a real app, use local storage)
  const [hasOnboarded, setHasOnboarded] = useState(true);
  
  // TODO: Step 1.4 - Add user state management
  // const { user, isAuthenticated, logout } = useAuth();
  
  // TODO: Step 2.1 - Add loading and error states
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard changeView={setCurrentView} />;
      case AppView.QUIZ: return <Quiz />;
      case AppView.PAPERS: return <PastPapers />;
      case AppView.ANALYTICS: return <Analytics />;
      case AppView.IMAGE_STUDIO: return <ImageStudio />;
      case AppView.RANK_DETAILS: return <RankDetails changeView={setCurrentView} />;
      case AppView.DAILY_CHALLENGE: return <Quiz isDailyChallenge={true} />;
      default: return <Dashboard changeView={setCurrentView} />;
    }
  };

  if (!hasOnboarded) {
    // Placeholder for Onboarding flow if needed
    return <div onClick={() => setHasOnboarded(true)}>Click to start</div>;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
        onClick={() => {
            setCurrentView(view);
            setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            currentView === view 
            ? 'bg-electricBlue text-white shadow-lg shadow-blue-200' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 md:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
            <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-electricBlue rounded-lg flex items-center justify-center">
                    <Hexagon className="text-white fill-current" size={20} />
                </div>
                <span className="text-2xl font-display font-bold text-navyDark">PREP AI</span>
            </div>

            <nav className="space-y-2">
                <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                <NavItem view={AppView.QUIZ} icon={PenTool} label="Quiz & Practice" />
                <NavItem view={AppView.DAILY_CHALLENGE} icon={Star} label="Daily Challenge" />
                <NavItem view={AppView.PAPERS} icon={BookOpen} label="Past Papers" />
                <NavItem view={AppView.IMAGE_STUDIO} icon={PenTool} label="Visual Studio" />
                <NavItem view={AppView.ANALYTICS} icon={BarChart2} label="Analytics" />
            </nav>
        </div>

        <div className="absolute bottom-0 w-full p-8 border-t border-gray-100">
             {/* TODO: Step 1.4 - Connect to real logout functionality */}
             <button className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
                <span className="text-sm font-medium">Log Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
             <div className="font-bold text-lg text-navyDark">PREP AI</div>
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
             {/* Decorative Background Blobs */}
             <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                 <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative z-10 max-w-6xl mx-auto">
                {renderView()}
            </div>
        </div>
      </main>

      <ChatAssistant />
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob 7s infinite;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;