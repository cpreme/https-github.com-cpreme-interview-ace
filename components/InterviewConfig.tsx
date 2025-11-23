import React from 'react';
import { Clock, Zap, BrainCircuit } from 'lucide-react';

interface InterviewConfigProps {
  onStartInterview: (count: number) => void;
  isLoading: boolean;
}

const InterviewConfig: React.FC<InterviewConfigProps> = ({ onStartInterview, isLoading }) => {
  const options = [
    { count: 2, label: 'Quick Warmup', desc: 'A fast check-in on key points.', icon: Zap, color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300', shadow: 'hover:shadow-teal-500/10' },
    { count: 5, label: 'Standard Session', desc: 'Cover the main technical and behavioral bases.', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300', shadow: 'hover:shadow-blue-500/10' },
    { count: 10, label: 'Deep Dive', desc: 'Thorough grilling on all aspects of the role.', icon: BrainCircuit, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'hover:border-cyan-300', shadow: 'hover:shadow-cyan-500/10' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <BrainCircuit className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={36} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Generating Questions...</h2>
          <p className="text-slate-500 mt-2 text-lg">Tailoring the interview to your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Select Interview Intensity</h2>
        <p className="text-lg text-slate-500">Choose how deep you want to go in this session.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4">
        {options.map((opt) => (
          <button
            key={opt.count}
            onClick={() => onStartInterview(opt.count)}
            className={`group relative flex flex-col p-8 bg-white rounded-3xl shadow-sm border border-slate-200 transition-all duration-300 hover:-translate-y-2 ${opt.border} ${opt.shadow} text-left h-full`}
          >
            <div className={`w-16 h-16 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
              <opt.icon size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">{opt.label}</h3>
            <p className="text-slate-500 leading-relaxed mb-8 flex-1">{opt.desc}</p>
            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
               <span className="font-bold text-slate-400 group-hover:text-slate-700 transition-colors">{opt.count} Questions</span>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${opt.bg} ${opt.color} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                 <span className="text-lg font-bold">→</span>
               </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterviewConfig;