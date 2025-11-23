import React, { useState } from 'react';
import { AppStep, GapAnalysis, InterviewQuestion, ConversationTurn, InterviewFeedback } from './types';
import { analyzeFit, generateInterviewQuestions, evaluateInterview } from './services/geminiService';
import SetupForm from './components/SetupForm';
import GapAnalysisView from './components/GapAnalysisView';
import InterviewConfig from './components/InterviewConfig';
import InterviewSession from './components/InterviewSession';
import FeedbackReport from './components/FeedbackReport';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Demo data for the "View Example Report" feature
const DEMO_FEEDBACK: InterviewFeedback = {
  overallScore: 85,
  overallSummary: "You demonstrated a strong understanding of product management principles and showcased excellent communication skills. Your ability to articulate the 'why' behind product decisions was impressive. However, your answers regarding technical trade-offs lacked specific depth, and you could improve on defining success metrics more quantitatively.",
  questionAnalysis: [
    {
      question: "Tell me about a time you had to manage a conflict between engineering and design.",
      userAnswer: "I had a situation where design wanted a complex animation but engineering said it would take too long. I sat them down, we looked at the timeline, and compromised on a simpler version for MVP.",
      score: 8,
      strengths: ["Good conflict resolution", "Focus on MVP/Delivery"],
      weaknesses: ["Could be more specific about the impact"],
      improvedAnswer: "I facilitated a trade-off discussion by mapping the animation's user value against the 3-day engineering cost. We agreed to ship a simplified version to meet the launch deadline, tagging the full animation as a fast-follow. This saved the sprint goal while keeping design debt visible."
    },
    {
      question: "How do you prioritize features?",
      userAnswer: "I usually look at what customers want the most and what is easiest to build.",
      score: 6,
      strengths: ["Customer focus"],
      weaknesses: ["Lacks a formal framework", "Too vague"],
      improvedAnswer: "I utilize the RICE scoring model (Reach, Impact, Confidence, Effort) to quantify value. For strategic alignment, I also map features against our OKRs. For example, in my last role, this method helped us deprioritize a flashy feature in favor of a retention fix that reduced churn by 5%."
    }
  ]
};

const STEPS = [
  { id: AppStep.SETUP, label: 'Setup' },
  { id: AppStep.ANALYSIS, label: 'Analysis' },
  { id: AppStep.INTERVIEW, label: 'Interview' },
  { id: AppStep.FEEDBACK, label: 'Results' },
];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data Store
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const getCurrentStepIndex = () => {
    if (step === AppStep.CONFIG) return 2; // Treat config as part of Interview step visually
    return STEPS.findIndex(s => s.id === step);
  };

  const handleSetupComplete = async (resume: string, jd: string) => {
    setResumeText(resume);
    setJdText(jd);
    setIsLoading(true);
    try {
      const result = await analyzeFit(resume, jd);
      setAnalysis(result);
      setStep(AppStep.ANALYSIS);
    } catch (error) {
      alert("Failed to analyze. Please ensure your API Key is valid and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConfig = () => {
    setStep(AppStep.CONFIG);
  };

  const handleStartInterview = async (count: number) => {
    if (!analysis) return;
    setIsLoading(true);
    try {
      const q = await generateInterviewQuestions(resumeText, jdText, analysis, count);
      setQuestions(q);
      setStep(AppStep.INTERVIEW);
    } catch (error) {
      alert("Failed to generate questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewComplete = async (finalTranscript: ConversationTurn[]) => {
    setTranscript(finalTranscript);
    setIsLoading(true); // Show loading state while analyzing
    try {
      const result = await evaluateInterview(jdText, finalTranscript);
      setFeedback(result);
      setStep(AppStep.FEEDBACK);
    } catch (error) {
      console.error(error);
      alert("Failed to evaluate interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDemo = () => {
    setFeedback(DEMO_FEEDBACK);
    setStep(AppStep.FEEDBACK);
  };

  const handleReset = () => {
    setStep(AppStep.SETUP);
    setResumeText('');
    setJdText('');
    setAnalysis(null);
    setQuestions([]);
    setTranscript([]);
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Subtle Top Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none -z-10" />

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-tight">Ai</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">JobPrep</span>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((s, idx) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                    isCurrent ? 'bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-100' : 
                    isCompleted ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-teal-500" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`} />
                    )}
                    <span className="text-sm">{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-8 h-[1px] mx-1 ${isCompleted ? 'bg-blue-100' : 'bg-slate-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {step === AppStep.SETUP && (
          <SetupForm 
            onComplete={handleSetupComplete} 
            onShowExample={handleShowDemo}
            isLoading={isLoading} 
          />
        )}

        {step === AppStep.ANALYSIS && analysis && (
          <GapAnalysisView analysis={analysis} onStartConfig={handleStartConfig} />
        )}

        {step === AppStep.CONFIG && (
          <InterviewConfig onStartInterview={handleStartInterview} isLoading={isLoading} />
        )}

        {step === AppStep.INTERVIEW && questions.length > 0 && (
           <>
            {isLoading ? (
               <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="p-4 bg-white rounded-full shadow-xl mb-6 ring-1 ring-slate-100">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analyzing Interview...</h2>
                  <p className="text-slate-500 mt-2">Generating detailed feedback on your answers</p>
               </div>
            ) : (
               <InterviewSession 
                  questions={questions} 
                  resumeText={resumeText}
                  jdText={jdText}
                  onComplete={handleInterviewComplete} 
               />
            )}
           </>
        )}

        {step === AppStep.FEEDBACK && feedback && (
          <FeedbackReport feedback={feedback} onReset={handleReset} />
        )}
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-12">
        JobPrep AI • Powered by Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;