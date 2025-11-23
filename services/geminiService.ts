
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GapAnalysis, InterviewFeedback, InterviewQuestion, ConversationTurn } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = "gemini-2.5-flash";

/**
 * Analyzes the resume against the job description.
 */
export const analyzeFit = async (resumeText: string, jobDescription: string): Promise<GapAnalysis> => {
  const prompt = `
    You are an expert hiring manager and career coach. 
    Analyze the following RESUME against the JOB DESCRIPTION.
    
    RESUME:
    ${resumeText.slice(0, 10000)}
    
    JOB DESCRIPTION:
    ${jobDescription.slice(0, 10000)}
    
    Provide a detailed gap analysis in JSON format.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      matchScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating fit." },
      summary: { type: Type.STRING, description: "A brief executive summary of the fit." },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key qualifications the candidate has." },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas where the candidate is lacking." },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important keywords/skills found in JD but missing in Resume." },
      recommendedFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Topics to prepare for in the interview." },
    },
    required: ["matchScore", "summary", "strengths", "weaknesses", "missingKeywords", "recommendedFocusAreas"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GapAnalysis;
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Gap Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates interview questions based on the analysis.
 */
export const generateInterviewQuestions = async (
  resumeText: string,
  jobDescription: string,
  analysis: GapAnalysis,
  count: number
): Promise<InterviewQuestion[]> => {
  const prompt = `
    Based on the candidate's resume and the job description, generate exactly ${count} technical and behavioral interview questions.
    Focus on the 'Weaknesses' and 'Recommended Focus Areas' identified in the analysis to challenge the candidate.
    
    Analysis Context:
    ${JSON.stringify(analysis)}

    Output a JSON array of questions.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
        context: { type: Type.STRING, description: "Why this question is being asked (e.g., 'To test React knowledge')." }
      },
      required: ["id", "question"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewQuestion[];
    }
    throw new Error("Failed to generate questions");
  } catch (error) {
    console.error("Question Gen Error:", error);
    throw error;
  }
};

/**
 * Evaluates the completed interview.
 */
export const evaluateInterview = async (
  jobDescription: string,
  transcript: ConversationTurn[]
): Promise<InterviewFeedback> => {
  // We format the conversation for the model
  const conversationText = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

  const prompt = `
    You are an expert interviewer. Evaluate the following interview transcript for a job application.
    The transcript is a conversation between a MODEL (Interviewer) and a USER (Candidate).
    
    JOB DESCRIPTION:
    ${jobDescription.slice(0, 5000)}
    
    TRANSCRIPT:
    ${conversationText}
    
    Task:
    1. Identify the specific questions asked by the MODEL and the corresponding answers by the USER.
    2. Evaluate each answer.
    3. Provide an overall score and summary.

    Provide structured feedback in JSON.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Score from 0 to 100." },
      overallSummary: { type: Type.STRING },
      questionAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            userAnswer: { type: Type.STRING, description: "Summary of what the user actually said." },
            score: { type: Type.NUMBER, description: "0-10 score for this answer" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvedAnswer: { type: Type.STRING, description: "A better way to answer this question." }
          },
          required: ["question", "score", "strengths", "weaknesses", "improvedAnswer"]
        }
      }
    },
    required: ["overallScore", "overallSummary", "questionAnalysis"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewFeedback;
    }
    throw new Error("Failed to evaluate interview");
  } catch (error) {
    console.error("Evaluation Error:", error);
    throw error;
  }
};
