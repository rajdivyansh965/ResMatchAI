
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Briefcase, CheckCircle, TrendingUp, AlertTriangle, 
  Award, ArrowRight, LayoutDashboard, Target, Printer, Download, Zap
} from 'lucide-react';
import { Card, Badge, Button } from './ui/Components';
import { ScoreGauge, DetailedRadar } from './AnalysisCharts';
import { ResumeAnalysisResult } from '../types';

interface DashboardProps {
  analysis: ResumeAnalysisResult;
  onNavigateToJobMatch: () => void;
}

export const Dashboard = ({ analysis, onNavigateToJobMatch }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'content'>('overview');

  const { atsScore, summary, topSkills, missingKeywords, improvements, sections, usage, latency, model } = analysis;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 print:space-y-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #dashboard-content, #dashboard-content * {
            visibility: visible;
          }
          #dashboard-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-slate-500 text-sm">AI Model: {model}</span>
             <span className="text-slate-300">|</span>
             <span className="text-slate-500 text-sm flex items-center gap-1">
               <Zap className="w-3 h-3 text-amber-500" /> 
               {latency}ms
             </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" icon={Printer}>
            Export PDF
          </Button>
          <Button onClick={onNavigateToJobMatch} variant="primary" icon={Target}>
            Run Job Match
          </Button>
        </div>
      </div>

      <div id="dashboard-content" className="space-y-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full z-0" />
            <h3 className="text-sm font-medium text-slate-500 mb-4 z-10">Overall ATS Score</h3>
            <ScoreGauge score={atsScore.overallScore} />
          </Card>
          
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-slate-500">Score Breakdown</h3>
              <Badge variant={atsScore.overallScore > 75 ? 'success' : 'warning'}>
                {atsScore.overallScore > 75 ? 'Production Ready' : 'Needs Optimization'}
              </Badge>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <DetailedRadar scores={atsScore} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impact & Results</span>
                    <span className="font-semibold">{atsScore.impactScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${atsScore.impactScore}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Brevity & Clarity</span>
                    <span className="font-semibold">{atsScore.brevityScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${atsScore.brevityScore}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">ATS Formatting</span>
                    <span className="font-semibold">{atsScore.styleScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${atsScore.styleScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detail Tabs */}
        <div className="border-b border-slate-200 no-print">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'skills', label: 'Skills & Keywords', icon: Award },
              { id: 'content', label: 'Section Analysis', icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Executive Summary
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {summary}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-white to-blue-50/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Key Improvements
                </h3>
                <ul className="space-y-3">
                  {improvements.slice(0, 5).map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Identified Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {topSkills.map((skill, idx) => (
                    <Badge key={idx} variant="info">{skill}</Badge>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6 border-l-4 border-l-amber-400">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Keywords</h3>
                <p className="text-sm text-slate-500 mb-4">Adding these industry-standard keywords may improve ATS visibility.</p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((keyword, idx) => (
                    <Badge key={idx} variant="warning">{keyword}</Badge>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">{section.name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      section.completeness >= 90 ? 'bg-emerald-100 text-emerald-800' :
                      section.completeness >= 70 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {section.completeness}% Complete
                    </span>
                  </div>
                  {section.issues.length > 0 ? (
                    <ul className="space-y-2">
                      {section.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start">
                          <span className="mr-2 text-red-400">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center text-emerald-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      No issues detected
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Metrics - demonstrating Observability */}
        <div className="border-t border-slate-100 pt-6 mt-8 flex flex-wrap gap-4 text-xs text-slate-400 no-print">
           <div className="flex items-center gap-1">
             <span className="font-semibold">Input Tokens:</span> {usage.inputTokens}
           </div>
           <div className="flex items-center gap-1">
             <span className="font-semibold">Output Tokens:</span> {usage.outputTokens}
           </div>
           <div className="flex items-center gap-1">
             <span className="font-semibold">Est. Cost:</span> ${usage.totalCost.toFixed(6)}
           </div>
        </div>
      </div>
    </div>
  );
};
