import React from 'react';
import { InterviewFeedback } from '../types';
import { Trophy, ThumbsUp, ThumbsDown, ArrowRight, RefreshCw, Download, Mail } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface FeedbackReportProps {
  feedback: InterviewFeedback;
  onReset: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, onReset }) => {
  
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > 280) {
            doc.addPage();
            y = 20;
        }
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("JobPrep AI Report", margin, y);
    y += 15;

    // Overall Score
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Overall Score: ${feedback.overallScore} / 100`, margin, y);
    y += 10;

    // Summary
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(feedback.overallSummary, maxLineWidth);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 6) + 10;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Questions
    feedback.questionAnalysis.forEach((q, i) => {
        checkPageBreak(80);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const qTitle = `Q${i + 1}: ${q.question}`;
        const qLines = doc.splitTextToSize(qTitle, maxLineWidth);
        doc.text(qLines, margin, y);
        y += (qLines.length * 6) + 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Score: ${q.score}/10`, margin, y);
        y += 6;

        doc.setFont("helvetica", "italic");
        doc.setTextColor(60, 60, 60);
        const ansText = `Your Answer: "${q.userAnswer}"`;
        const ansLines = doc.splitTextToSize(ansText, maxLineWidth);
        doc.text(ansLines, margin, y);
        y += (ansLines.length * 5) + 4;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(22, 163, 74); // Green
        const strengthText = `+ Strengths: ${q.strengths.join(', ')}`;
        const strengthLines = doc.splitTextToSize(strengthText, maxLineWidth);
        doc.text(strengthLines, margin, y);
        y += (strengthLines.length * 5);

        doc.setTextColor(220, 38, 38); // Red
        const weakText = `- Areas to improve: ${q.weaknesses.join(', ')}`;
        const weakLines = doc.splitTextToSize(weakText, maxLineWidth);
        doc.text(weakLines, margin, y);
        y += (weakLines.length * 5) + 4;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // Blue
        const impText = `Tip: ${q.improvedAnswer}`;
        const impLines = doc.splitTextToSize(impText, maxLineWidth);
        doc.text(impLines, margin, y);
        y += (impLines.length * 5) + 10;
    });

    doc.save("JobPrep_Interview_Report.pdf");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("My JobPrep AI Interview Results");
    const body = encodeURIComponent(`Here are my interview results from JobPrep AI.\n\nScore: ${feedback.overallScore}/100\n\nSummary: ${feedback.overallSummary}\n\n(See attached or full download for details)`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-20">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analysis</h2>
        <p className="text-lg text-slate-500">Here is a breakdown of your session.</p>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-inner border border-white/20">
                <Trophy size={42} className="text-white drop-shadow-md" />
            </div>
            <div className="text-7xl font-black mb-3 tracking-tighter">{feedback.overallScore}<span className="text-3xl text-blue-200 font-medium">/100</span></div>
            <p className="text-blue-100 font-medium text-lg tracking-wide uppercase">{feedback.overallScore >= 80 ? 'Outstanding Performance' : feedback.overallScore >= 60 ? 'Solid Effort' : 'Needs Focus'}</p>
          </div>
        </div>
        <div className="p-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h3>
          <p className="text-slate-700 leading-relaxed text-lg">{feedback.overallSummary}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
         <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
         >
            <Download size={18} />
            Download PDF
         </button>
         <button
            onClick={handleEmail}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
         >
            <Mail size={18} />
            Email Results
         </button>
      </div>

      {/* Question by Question Breakdown */}
      <div className="space-y-6 pt-6">
        <h3 className="text-2xl font-bold text-slate-900 px-2">Question Breakdown</h3>
        {feedback.questionAnalysis.map((item, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:border-blue-200 group">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start gap-4">
               <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {index + 1}</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-2 leading-snug">{item.question}</h4>
               </div>
               <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  item.score >= 8 ? 'bg-green-100 text-green-700' : item.score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
               }`}>
                  {item.score}/10
               </div>
            </div>
            
            <div className="p-8 space-y-8">
               {/* User Answer */}
               <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Answer Summary</h5>
                  <div className="p-5 bg-slate-50/50 rounded-2xl text-slate-600 italic text-base border border-slate-100 relative">
                     <span className="absolute top-4 left-3 text-3xl text-slate-200 font-serif -z-10">“</span>
                     "{item.userAnswer}"
                  </div>
               </div>

               {/* Feedback Grid */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100/50">
                     <h5 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-4 uppercase tracking-wide">
                        <ThumbsUp size={16} /> Key Strengths
                     </h5>
                     <ul className="space-y-3">
                        {item.strengths.map((s, i) => (
                           <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                              {s}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100/50">
                     <h5 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-4 uppercase tracking-wide">
                        <ThumbsDown size={16} /> Areas to Improve
                     </h5>
                     <ul className="space-y-3">
                        {item.weaknesses.map((w, i) => (
                           <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                              {w}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Better Answer */}
               <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3 uppercase tracking-wide">
                     <ArrowRight size={16} /> AI Suggestion
                  </h5>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">
                     {item.improvedAnswer}
                  </p>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-12">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-1"
        >
          <RefreshCw size={20} />
          Start New Session
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;