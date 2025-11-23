import React from 'react';
import { GapAnalysis } from '../types';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, ArrowRight, Target, ShieldCheck, ShieldAlert } from 'lucide-react';

interface GapAnalysisViewProps {
  analysis: GapAnalysis;
  onStartConfig: () => void;
}

const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ analysis, onStartConfig }) => {
  const scoreData = [{
    name: 'Match',
    value: analysis.matchScore,
    fill: analysis.matchScore > 75 ? '#16a34a' : analysis.matchScore > 50 ? '#f59e0b' : '#dc2626'
  }];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Score Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-teal-400" />
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Compatibility Score</h3>
          <div className="w-56 h-56 relative">
             <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="75%" outerRadius="100%" barSize={18} data={scoreData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={12} />
                </RadialBarChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-6xl font-extrabold tracking-tighter ${analysis.matchScore > 75 ? 'text-green-600' : analysis.matchScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {analysis.matchScore}%
                </span>
                <span className="text-xs text-slate-400 font-semibold mt-1">Match Rate</span>
             </div>
          </div>
          <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {analysis.summary}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Strengths */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md hover:border-green-200">
             <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                   <ShieldCheck className="text-green-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Key Strengths</h3>
             </div>
             <div className="flex flex-wrap gap-2.5">
                {analysis.strengths.map((item, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-white text-green-700 text-sm font-semibold rounded-full border border-green-100 shadow-sm">
                    {item}
                  </span>
                ))}
             </div>
          </div>

          {/* Gaps */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md hover:border-red-200">
             <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                   <ShieldAlert className="text-red-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Missing Skills & Keywords</h3>
             </div>
             <div className="flex flex-wrap gap-2.5">
                {analysis.missingKeywords.length > 0 ? analysis.missingKeywords.map((item, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-white text-red-600 text-sm font-semibold rounded-full border border-red-100 shadow-sm">
                    {item}
                  </span>
                )) : <span className="text-sm text-slate-400 italic">No major missing keywords detected.</span>}
             </div>
          </div>

          {/* Focus Areas */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-sm border border-amber-100 p-6 transition-all hover:shadow-md">
             <div className="flex items-center gap-3 mb-5 border-b border-amber-100/50 pb-4">
                <div className="bg-amber-100 p-2 rounded-lg">
                   <Target className="text-amber-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Interview Focus Areas</h3>
             </div>
             <ul className="grid sm:grid-cols-2 gap-3">
                {analysis.recommendedFocusAreas.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-8">
         <button 
            onClick={onStartConfig}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
         >
            Start Mock Interview
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default GapAnalysisView;