
import React, { useState } from 'react';
import { Compass, Briefcase, GraduationCap, ExternalLink, Lightbulb, Search, MapPin, User } from 'lucide-react';
import { Card, Button, Badge, Spinner } from './ui/Components';
import { GeminiService } from '../services/geminiService';
import { ResumeAnalysisResult, CareerAdviceResult } from '../types';

interface CareerAdvisorProps {
  analysis: ResumeAnalysisResult;
  geminiService: GeminiService;
}

export const CareerAdvisor = ({ analysis, geminiService }: CareerAdvisorProps) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<CareerAdviceResult | null>(null);
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');

  const handleScan = async () => {
    setLoading(true);
    try {
      const result = await geminiService.getCareerAdvice(
        analysis.topSkills,
        analysis.summary,
        role,
        location
      );
      setAdvice(result);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch career advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            Career Advisor & Opportunity Scanner
          </h2>
          <p className="text-slate-500">Real-time job market scanning and personalized interview strategies.</p>
        </div>
      </div>

      <Card className="p-6 bg-white border-blue-100 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" />
          Refine Search Criteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Target Role (Optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Target Location (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. New York, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleScan} size="md" isLoading={loading} icon={Briefcase}>
            {advice ? 'Update Results' : 'Scan for Live Opportunities'}
          </Button>
        </div>
        {loading && (
          <p className="text-xs text-center text-slate-400 animate-pulse mt-4">Searching LinkedIn, Indeed, and niche boards for matches...</p>
        )}
      </Card>

      {advice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (AI Text) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-blue-200 shadow-md">
              <div className="prose prose-slate max-w-none">
                <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b border-blue-100 pb-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>AI Recommendations & Strategy</span>
                </div>
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                  {advice.text.split('Source')[0] /* Attempt to hide raw source citations if they appear at bottom */}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar (Sources / Links) */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Live Listings & Sources
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Direct links found during the search. Click to apply or view details.
              </p>
              
              {advice.links.length > 0 ? (
                <div className="space-y-3">
                  {advice.links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
                    >
                      <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200 truncate">
                        {link.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {new URL(link.url).hostname}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  No direct links returned in metadata. Check the text for details.
                </div>
              )}
            </div>

            <Card className="p-6 bg-emerald-50 border-emerald-100">
              <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                For New Grads
              </h3>
              <p className="text-sm text-emerald-800">
                Look for "Associate", "Junior", or "Entry-Level" filters. 
                The "How to Crack It" section provides specific project ideas.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
