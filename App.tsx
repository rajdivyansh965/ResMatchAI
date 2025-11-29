
import React, { useState, useEffect } from 'react';
import { 
  Layout, BookOpen, Settings, Github, 
  Menu, X, Compass, RefreshCw
} from 'lucide-react';
import { ResumeUpload } from './components/ResumeUpload';
import { Dashboard } from './components/Dashboard';
import { JobMatch } from './components/JobMatch';
import { CareerAdvisor } from './components/CareerAdvisor';
import { Card } from './components/ui/Components';
import { GeminiService } from './services/geminiService';
import { ResumeAnalysisResult } from './types';

function App() {
  const [view, setView] = useState<'upload' | 'dashboard' | 'match' | 'career'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiService] = useState<GeminiService>(() => new GeminiService());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('resuMatch_analysis');
    const savedText = localStorage.getItem('resuMatch_resumeText');
    
    if (savedAnalysis) {
      try {
        setAnalysis(JSON.parse(savedAnalysis));
        if (savedText) setResumeText(savedText);
        setView('dashboard');
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save state to local storage when it changes
  useEffect(() => {
    if (analysis) {
      localStorage.setItem('resuMatch_analysis', JSON.stringify(analysis));
    }
    if (resumeText) {
      localStorage.setItem('resuMatch_resumeText', resumeText);
    }
  }, [analysis, resumeText]);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setResumeText(text); // Store for Job Match later

    try {
      const result = await geminiService.analyzeResume(text);
      setAnalysis(result);
      setView('dashboard');
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will clear all analysis data.")) {
      setAnalysis(null);
      setResumeText('');
      localStorage.removeItem('resuMatch_analysis');
      localStorage.removeItem('resuMatch_resumeText');
      setView('upload');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            ResuMatch AI
          </div>
          <div className="mt-2 text-xs text-slate-400 uppercase tracking-widest font-semibold">Enterprise Edition</div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setView('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              view === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layout className="w-5 h-5" />
            Upload & Analyze
          </button>
          
          <button 
            onClick={() => analysis ? setView('dashboard') : alert('Please analyze a resume first')}
            disabled={!analysis}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Settings className="w-5 h-5" />
            ATS Dashboard
          </button>

          <button 
            onClick={() => analysis ? setView('match') : alert('Please analyze a resume first')}
            disabled={!analysis}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              view === 'match' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Github className="w-5 h-5" />
            Job Matcher
          </button>

          <button 
            onClick={() => analysis ? setView('career') : alert('Please analyze a resume first')}
            disabled={!analysis}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              view === 'career' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Compass className="w-5 h-5" />
            Career Advisor
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={handleReset}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
           >
             <RefreshCw className="w-3 h-3" />
             Reset Application
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
           <div className="font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
             ResuMatch
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 text-white p-4 space-y-4 absolute top-16 left-0 w-full z-50 shadow-xl border-t border-slate-700">
             <button onClick={() => { setView('upload'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Upload</button>
             <button onClick={() => { if(analysis) setView('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 opacity-80">Dashboard</button>
             <button onClick={() => { if(analysis) setView('match'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 opacity-80">Job Match</button>
             <button onClick={() => { if(analysis) setView('career'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 opacity-80">Career Advisor</button>
             <div className="border-t border-slate-700 pt-2 mt-2">
               <button onClick={handleReset} className="block w-full text-left py-2 text-red-400">Reset Data</button>
             </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {view === 'upload' && !analysis && (
              <div className="max-w-2xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Intelligence Engine</h1>
                  <p className="text-slate-500">
                    Upload your resume to get enterprise-grade ATS scoring, semantic job matching, and AI-driven improvement suggestions.
                  </p>
                </div>
                <Card className="p-8 shadow-xl border-0 ring-1 ring-slate-200">
                  <ResumeUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                </Card>
              </div>
            )}
            
            {view === 'upload' && analysis && (
               <div className="text-center py-20">
                 <h2 className="text-2xl font-bold text-slate-800">Resume Analyzed</h2>
                 <p className="text-slate-500 mb-6">Your data is ready. Jump to the dashboard.</p>
                 <button onClick={() => setView('dashboard')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                   Go to Dashboard
                 </button>
               </div>
            )}

            {view === 'dashboard' && analysis && (
              <Dashboard 
                analysis={analysis} 
                onNavigateToJobMatch={() => setView('match')} 
              />
            )}

            {view === 'match' && (
              <JobMatch 
                resumeText={resumeText} 
                geminiService={geminiService} 
              />
            )}

            {view === 'career' && analysis && (
               <CareerAdvisor
                 analysis={analysis}
                 geminiService={geminiService}
               />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
