
import React, { useState } from 'react';
import { Briefcase, CheckCircle, XCircle, ArrowRight, Target, PenTool, FileText, Copy } from 'lucide-react';
import { Card, Button, Badge, Spinner } from './ui/Components';
import { GeminiService } from '../services/geminiService';
import { JobMatchResult, TailoredContent } from '../types';

interface JobMatchProps {
  resumeText: string;
  geminiService: GeminiService | null;
}

export const JobMatch = ({ resumeText, geminiService }: JobMatchProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [tailoredContent, setTailoredContent] = useState<TailoredContent | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'coverLetter' | 'tailored'>('analysis');

  const handleMatch = async () => {
    if (!geminiService) return;
    setIsMatching(true);
    setMatchResult(null); // Reset previous match
    setTailoredContent(null); // Reset previous tailoring
    try {
      const result = await geminiService.matchJob(resumeText, jobDescription);
      setMatchResult(result);
    } catch (error) {
      console.error(error);
      alert("Error performing job match. Please check your API key.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleTailor = async () => {
    if (!geminiService || !matchResult) return;
    setIsTailoring(true);
    try {
      const content = await geminiService.generateTailoredContent(resumeText, jobDescription);
      setTailoredContent(content);
      setActiveTab('coverLetter');
    } catch (error) {
      console.error(error);
      alert("Error tailoring content. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Briefcase className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Job Match Intelligence</h2>
          <p className="text-slate-500">Compare your resume against a specific job description and get tailored content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-4">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-4">Target Job Description</h3>
            <textarea
              className="flex-1 w-full min-h-[300px] p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none font-mono text-slate-600"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {jobDescription.length > 0 ? `${jobDescription.length} chars` : 'Paste text to begin'}
              </span>
              <Button 
                onClick={handleMatch} 
                isLoading={isMatching}
                disabled={!jobDescription || jobDescription.length < 50}
                icon={ArrowRight}
              >
                Analyze Match
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="h-full">
          {matchResult ? (
             <div className="h-full flex flex-col space-y-6">
               <div className="flex space-x-2 border-b border-slate-200 pb-2">
                 <button 
                   onClick={() => setActiveTab('analysis')}
                   className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'analysis' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                   Match Analysis
                 </button>
                 {tailoredContent && (
                   <>
                    <button 
                      onClick={() => setActiveTab('coverLetter')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'coverLetter' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Cover Letter
                    </button>
                    <button 
                      onClick={() => setActiveTab('tailored')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'tailored' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Tailored Resume
                    </button>
                   </>
                 )}
               </div>

               {activeTab === 'analysis' && (
                 <div className="space-y-6 animate-in fade-in">
                    <Card className="p-6 bg-slate-900 text-white border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Match Score</p>
                          <div className="text-5xl font-bold mt-1 text-white">{matchResult.matchPercentage}%</div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                          matchResult.matchLevel === 'Excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                          matchResult.matchLevel === 'High' ? 'bg-blue-500/20 text-blue-400' :
                          matchResult.matchLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {matchResult.matchLevel} Fit
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-slate-900 mb-4">Gap Analysis</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {matchResult.gapAnalysis}
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.missingSkills.map((skill, i) => (
                              <Badge key={i} variant="error"><XCircle className="w-3 h-3 mr-1"/> {skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {!tailoredContent && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900">Want to improve your odds?</h4>
                          <p className="text-sm text-blue-700">Generate a tailored cover letter and optimized resume summary.</p>
                        </div>
                        <Button onClick={handleTailor} isLoading={isTailoring} icon={PenTool} variant="secondary">
                          Generate tailored content
                        </Button>
                      </div>
                    )}
                 </div>
               )}

               {activeTab === 'coverLetter' && tailoredContent && (
                 <div className="animate-in fade-in h-full">
                    <Card className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" /> 
                          AI Generated Cover Letter
                        </h4>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(tailoredContent.coverLetter)} icon={Copy}>
                          Copy
                        </Button>
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-lg overflow-y-auto border border-slate-200 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                        {tailoredContent.coverLetter}
                      </div>
                    </Card>
                 </div>
               )}

               {activeTab === 'tailored' && tailoredContent && (
                 <div className="animate-in fade-in space-y-6">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-slate-900">Optimized Summary</h4>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(tailoredContent.tailoredSummary)} icon={Copy}>
                          Copy
                        </Button>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {tailoredContent.tailoredSummary}
                      </p>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-slate-900 mb-4">Targeted Skills List</h4>
                      <div className="flex flex-wrap gap-2">
                        {tailoredContent.tailoredSkills.map((skill, i) => (
                          <Badge key={i} variant="success">{skill}</Badge>
                        ))}
                      </div>
                    </Card>
                 </div>
               )}

             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-center">
              {isMatching ? (
                <div className="text-center">
                  <Spinner size="lg" className="mb-4 text-blue-500" />
                  <p className="text-slate-600 font-medium">Analyzing compatibility...</p>
                  <p className="text-slate-400 text-sm mt-1">Comparing semantic vectors</p>
                </div>
              ) : (
                <>
                  <Target className="w-16 h-16 mb-4 opacity-20" />
                  <p>Results will appear here after analysis</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
