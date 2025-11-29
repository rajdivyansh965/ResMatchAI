import React from 'react';
import { 
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Tooltip
} from 'recharts';
import { AtsScore } from '../types';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge = ({ score }: ScoreGaugeProps) => {
  const data = [
    { name: 'Score', value: score, fill: score > 70 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' },
    { name: 'Max', value: 100, fill: '#e2e8f0' }
  ];

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={20} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
        <span className="text-4xl font-bold text-slate-800">{score}</span>
        <span className="text-sm text-slate-500 block">/100</span>
      </div>
    </div>
  );
};

interface DetailedRadarProps {
  scores: AtsScore;
}

export const DetailedRadar = ({ scores }: DetailedRadarProps) => {
  const data = [
    { subject: 'Impact', A: scores.impactScore, fullMark: 100 },
    { subject: 'Brevity', A: scores.brevityScore, fullMark: 100 },
    { subject: 'Style', A: scores.styleScore, fullMark: 100 },
    { subject: 'Sections', A: scores.sectionScore, fullMark: 100 },
    { subject: 'Overall', A: scores.overallScore, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="My Resume"
            dataKey="A"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            itemStyle={{ color: '#2563eb' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
