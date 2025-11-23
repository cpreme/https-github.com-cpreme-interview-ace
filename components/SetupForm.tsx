import React, { useState, useRef } from 'react';
import { Upload, FileText, Briefcase, ArrowRight, AlertCircle, Wand2, Eye, Sparkles } from 'lucide-react';

interface SetupFormProps {
  onComplete: (resume: string, jd: string) => void;
  onShowExample: () => void;
  isLoading: boolean;
}

const SAMPLE_DATA: Record<string, { resume: string; jd: string; label: string }> = {
  ENGINEERING: {
    label: 'Frontend Engineer',
    resume: `JOHN DOE
San Francisco, CA | john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 6+ years of experience building scalable web applications. Specialized in the React ecosystem with a strong focus on performance optimization, accessibility, and developer experience. Proven track record of leading teams and delivering high-impact projects.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3
- Frameworks & Libraries: React, Next.js, Vue.js, Redux, React Query, Tailwind CSS, Material UI
- Tools: Webpack, Vite, Git, Docker, AWS (S3, CloudFront), Jest, Cypress
- Backend: Node.js, Express, GraphQL, PostgreSQL (Basic)

PROFESSIONAL EXPERIENCE

Senior Frontend Engineer | TechFlow Solutions | 2021 – Present
- Led the migration of a legacy monolithic dashboard to a micro-frontend architecture using Next.js, reducing build times by 60%.
- Implemented a rigorous code review process and CI/CD pipelines, increasing deployment frequency from weekly to daily.
- Mentored 3 junior developers, guiding them to promotion within 18 months.
- optimized core web vitals, improving LCP from 2.5s to 0.8s, directly impacting SEO rankings.

Frontend Developer | Creative Digital Agency | 2018 – 2021
- Developed responsive, pixel-perfect user interfaces for high-profile e-commerce clients using React and Redux.
- Collaborated closely with designers to implement complex animations and interactive elements using Framer Motion.
- Integrated third-party APIs (Stripe, Contentful) and handled state management for complex multi-step forms.

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018`,
    jd: `JOB TITLE: Senior React Developer
LOCATION: Remote / Hybrid
COMPANY: FutureStream Inc.

ABOUT THE ROLE
We are looking for a Senior React Developer to join our Product Engineering team. You will be responsible for building and maintaining our core customer-facing streaming platform, which serves millions of users daily. We value clean code, performance, and a user-centric mindset.

RESPONSIBILITIES
- Design and develop high-performance, reusable, and reliable UI components using React and TypeScript.
- Collaborate with product managers and UX designers to translate requirements into technical specifications.
- Optimize application performance for maximum speed and scalability across different devices.
- Write unit and integration tests to ensure high code quality (Jest, React Testing Library).
- Participate in code reviews and contribute to architectural decisions.
- Troubleshoot and debug complex issues in production environments.

REQUIREMENTS
- 5+ years of professional experience in frontend development.
- Strong proficiency in JavaScript, TypeScript, and the React ecosystem (Hooks, Context, etc.).
- Experience with state management libraries (Redux, Zustand, or React Query).
- Familiarity with modern build tools (Vite, Webpack) and CI/CD workflows.
- Solid understanding of HTML5, CSS3, and modern styling solutions (Tailwind CSS, Styled Components).
- Experience with server-side rendering (Next.js) is a strong plus.`
  },
  PRODUCT_MANAGEMENT: {
    label: 'Product Manager',
    resume: `ALICE SMITH
Product Manager
Seattle, WA | alice.smith@email.com

SUMMARY
Results-oriented Product Manager with 5 years of experience in B2B SaaS. Expert in translating customer needs into product roadmaps and leading cross-functional teams to deliver value. Strong background in data analytics and agile methodologies.

EXPERIENCE
Product Manager | CloudSaaS Inc | 2020 - Present
- Owned the product lifecycle for the "Enterprise Reporting" module, increasing feature adoption by 40% YoY.
- Conducted 50+ customer interviews to identify pain points, leading to a pivot in our analytics strategy.
- Collaborated with engineering and design to launch 3 major features on time and under budget.
- Defined OKRs and KPIs, tracking success through Mixpanel and Tableau.

Associate PM | StartUp IO | 2018 - 2020
- Managed backlog and sprint planning for the mobile app team.
- Launched the first Android version of the app, achieving a 4.5-star rating.

SKILLS
- Product Strategy, Roadmapping, Agile/Scrum, User Research, A/B Testing, SQL, Jira, Figma.`,
    jd: `JOB TITLE: Senior Product Manager
COMPANY: DataFlow Systems

ROLE OVERVIEW
We are seeking a Senior Product Manager to lead our Core Data Platform team. You will define the vision and strategy for our data ingestion pipeline, working closely with engineers and data scientists.

RESPONSIBILITIES
- Define product strategy and roadmap for the Data Platform.
- Prioritize features based on customer value, business viability, and technical feasibility.
- Lead discovery efforts, including market research and user interviews.
- Define and track success metrics (KPIs) for your product area.
- Evangelize the product vision to stakeholders and leadership.

REQUIREMENTS
- 4+ years of Product Management experience, preferably in B2B or Data products.
- Proven track record of launching successful technical products.
- Strong analytical skills; ability to use data to drive decisions.
- Excellent communication and stakeholder management skills.
- Experience with Agile development methodologies.`
  },
  DESIGN: {
    label: 'Product Designer',
    resume: `BOB JONES
Product Designer
New York, NY | portfolio.bobjones.design

PROFILE
Multi-disciplinary Product Designer with a passion for creating intuitive, accessible, and delightful user experiences. 4 years of experience spanning UX research, UI design, and prototyping.

EXPERIENCE
Product Designer | FinTech Corp | 2021 - Present
- Redesigned the mobile onboarding flow, increasing conversion rate by 15%.
- Built and maintained the company's design system in Figma, improving design-to-dev handoff efficiency by 30%.
- Conducted usability testing sessions to validate design concepts.

UI/UX Designer | Agency Studio | 2019 - 2021
- Designed websites and mobile apps for various clients in retail and healthcare.
- Created high-fidelity prototypes using Protopie and Principle.

SKILLS
- Figma, Sketch, Adobe CC, Prototyping, Wireframing, User Research, HTML/CSS (Basic).`,
    jd: `JOB TITLE: Product Designer
COMPANY: Creative Solutions

We are looking for a Product Designer to join our team. You will work across the entire design process, from research and discovery to high-fidelity visual design.

WHAT YOU'LL DO
- Create user flows, wireframes, and prototypes to effectively communicate interaction and design ideas.
- Conduct user research and usability testing to inform design decisions.
- Collaborate with PMs and Engineers to ship high-quality products.
- Contribute to and evolve our design system.

WHO YOU ARE
- 3+ years of product design experience.
- A strong portfolio showcasing your design process and visual skills.
- Proficiency in Figma and modern prototyping tools.
- Ability to think through complex interaction problems.`
  },
  PROGRAM_MANAGEMENT: {
    label: 'Program Manager',
    resume: `CHARLIE BROWN
Technical Program Manager
Austin, TX

SUMMARY
Organized and proactive TPM with expertise in managing complex cloud infrastructure projects. Certified Scrum Master (CSM) and PMP.

EXPERIENCE
TPM | Cloud Infra Ltd | 2019 - Present
- Managed a $2M cloud migration project, moving 500+ services to AWS with zero downtime.
- Facilitated cross-team planning and dependency management across 5 engineering teams.
- Implemented a standardized risk management framework, reducing project delays by 20%.

Project Manager | TechBuilds | 2016 - 2019
- Led the delivery of enterprise software implementations for Fortune 500 clients.
- Managed project budgets, timelines, and stakeholder communication.

SKILLS
- Project Management (PMP), Agile/Scrum (CSM), JIRA, Confluence, Risk Management, Stakeholder Communication.`,
    jd: `JOB TITLE: Technical Program Manager
COMPANY: ScaleUp Tech

We need a TPM to drive execution for our Infrastructure Engineering organization.

RESPONSIBILITIES
- Drive planning and execution of complex technical programs.
- Manage dependencies, risks, and timelines across multiple teams.
- Communicate program status to leadership and stakeholders.
- Improve engineering processes and operational efficiency.

QUALIFICATIONS
- 5+ years of experience in Technical Program Management.
- Strong understanding of software development lifecycle (SDLC).
- Experience managing cloud infrastructure or platform projects.
- Excellent organizational and communication skills.`
  }
};

const SetupForm: React.FC<SetupFormProps> = ({ onComplete, onShowExample, isLoading }) => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setResumeText(event.target.result as string);
        setFileName(file.name);
      }
    };
    reader.readAsText(file);
  };

  const fillData = (key: string) => {
    const data = SAMPLE_DATA[key];
    if (data) {
        setResumeText(data.resume);
        setJdText(data.jd);
        setFileName(`sample_${key.toLowerCase()}_resume.txt`);
    }
  };

  const isValid = resumeText.length > 50 && jdText.length > 50;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master Your Next <span className="text-blue-600">Interview</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Upload your resume and the job description. Our AI will analyze your fit and conduct a hyper-realistic mock interview.
            </p>
          </div>
          
          <button 
             onClick={onShowExample}
             className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
          >
             <Eye size={16} />
             See Example Report
          </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resume Section */}
        <div className="group bg-white p-1 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
          <div className="p-6 pb-2 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
               <FileText size={22} />
            </div>
            <h2 className="font-bold text-lg text-slate-800">Your Resume</h2>
          </div>
          
          <div className="p-6 pt-2 flex-1 flex flex-col gap-4">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all duration-300 group-hover:border-blue-100"
             >
                <div className="mb-3 p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                    <Upload className="group-hover:text-blue-600 transition-colors" size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-600">{fileName ? fileName : "Upload text file (.txt, .md)"}</span>
                <span className="text-xs mt-1 text-slate-400">or drag and drop</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                />
             </div>
             
             <div className="relative flex-1">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Alternatively, paste your resume text here..."
                  className="w-full h-40 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                />
             </div>
          </div>
        </div>

        {/* Job Description Section */}
        <div className="group bg-white p-1 rounded-3xl shadow-sm border border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
          <div className="p-6 pb-2 flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
               <Briefcase size={22} />
            </div>
            <h2 className="font-bold text-lg text-slate-800">Job Description</h2>
          </div>
          <div className="p-6 pt-2 flex-1">
             <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-full min-h-[260px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none transition-all"
              />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-2 text-slate-500">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-sm font-semibold uppercase tracking-wide">Demo Mode</span>
             </div>
             <div className="relative flex-1 sm:w-64">
                <select 
                    className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pr-8 cursor-pointer transition-all font-medium"
                    onChange={(e) => fillData(e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled>Select a role to autofill...</option>
                    {Object.entries(SAMPLE_DATA).map(([key, data]) => (
                        <option key={key} value={key}>{data.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Wand2 size={14} />
                </div>
             </div>
         </div>

         <button
          onClick={() => onComplete(resumeText, jdText)}
          disabled={!isValid || isLoading}
          className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-95 w-full sm:w-auto
            ${isValid && !isLoading
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:-translate-y-0.5' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Fit...</span>
            </>
          ) : (
            <>
              <span>Analyze Match</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>

      {!isValid && (
        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-3 rounded-lg text-sm font-medium animate-in fade-in">
          <AlertCircle size={16} />
          Please provide both a resume and a job description to proceed.
        </div>
      )}
    </div>
  );
};

export default SetupForm;