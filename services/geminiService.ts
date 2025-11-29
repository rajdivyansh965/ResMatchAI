
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { ResumeAnalysisResult, JobMatchResult, TailoredContent, CareerAdviceResult, AIUsageMetrics } from "../types";

// --- Pricing Configuration (Gemini 1.5/2.5 Flash Pricing) ---
const PRICING = {
  INPUT_COST_PER_1M: 0.075,
  OUTPUT_COST_PER_1M: 0.30,
};

// --- Prompt Templates ---
const PROMPTS = {
  ANALYZE_RESUME: (resumeText: string) => `
    You are an enterprise-grade ATS (Applicant Tracking System) and Senior Technical Recruiter.
    
    TASK:
    Analyze the following resume text with extreme precision. 
    1. Score it against modern hiring standards (FAANG/Fortune 500 level).
    2. Extract structured data including candidate details.
    3. Identify critical gaps in keywords, formatting, and impact metrics.
    
    RESUME TEXT:
    ${resumeText}
    
    REQUIREMENTS:
    - Be critical. High scores (>85) should be reserved for exceptional resumes.
    - Focus on "Show, Don't Tell" - look for quantified results (numbers, $, %).
    - Identify missing hard skills based on the context of the resume.
  `,

  MATCH_JOB: (resumeText: string, jobDescription: string) => `
    You are a Hiring Manager making a final decision. Compare the candidate against the Job Description.

    CANDIDATE RESUME:
    ${resumeText.substring(0, 15000)}

    JOB DESCRIPTION:
    ${jobDescription.substring(0, 5000)}

    TASK:
    1. Calculate a match percentage based on: Hard Skills (40%), Experience Relevance (30%), Keywords (20%), Soft Skills (10%).
    2. Explicitly list missing critical skills that are present in the JD but absent in the resume.
    3. Provide a gap analysis explaining why they might NOT get the interview.
  `,

  TAILOR_CONTENT: (resumeText: string, jobDescription: string) => `
    You are a specialized Career Coach and Professional Resume Writer.
    
    TASK:
    1. Write a compelling Cover Letter that bridges the candidate's past experience to the target role's future needs. Use a professional, confident tone.
    2. Rewrite the "Professional Summary" to heavily target the keywords in the Job Description.
    3. Re-order and refine the Skills section to prioritize matches.

    CONTEXT:
    Resume: ${resumeText.substring(0, 15000)}
    Target Job: ${jobDescription.substring(0, 5000)}
  `
};

// --- Schema Definitions ---
const atsAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    atsScore: {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER, description: "Overall score out of 100" },
        impactScore: { type: Type.NUMBER, description: "Score for action verbs and results" },
        brevityScore: { type: Type.NUMBER, description: "Score for conciseness" },
        styleScore: { type: Type.NUMBER, description: "Score for formatting and readability" },
        sectionScore: { type: Type.NUMBER, description: "Score for section completeness" },
      },
      required: ["overallScore", "impactScore", "brevityScore", "styleScore", "sectionScore"],
    },
    summary: { type: Type.STRING, description: "Executive summary of the analysis" },
    topSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          completeness: { type: Type.NUMBER },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    parsedContent: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        experienceYears: { type: Type.NUMBER },
      },
    },
  },
  required: ["atsScore", "summary", "topSkills", "improvements", "sections"],
};

const jobMatchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchPercentage: { type: Type.NUMBER },
    matchLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Excellent"] },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    gapAnalysis: { type: Type.STRING },
    culturalFitAnalysis: { type: Type.STRING },
  },
  required: ["matchPercentage", "matchLevel", "missingSkills", "matchingSkills", "gapAnalysis"],
};

const tailoredContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coverLetter: { type: Type.STRING },
    tailoredSummary: { type: Type.STRING },
    tailoredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["coverLetter", "tailoredSummary", "tailoredSkills"]
};

export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = "gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // --- Internal Helpers ---

  /**
   * Calculates the estimated cost of the API call based on token usage.
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * PRICING.INPUT_COST_PER_1M;
    const outputCost = (outputTokens / 1_000_000) * PRICING.OUTPUT_COST_PER_1M;
    return inputCost + outputCost;
  }

  /**
   * Generic wrapper for API calls with retry logic and metric tracking.
   */
  private async generate<T>(
    prompt: string, 
    schema: Schema | undefined, 
    temp: number = 0.1,
    isSearch: boolean = false
  ): Promise<T & AIUsageMetrics> {
    const startTime = performance.now();
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        const config: any = {
          temperature: temp,
        };

        if (schema) {
          config.responseMimeType = "application/json";
          config.responseSchema = schema;
        }

        if (isSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await this.ai.models.generateContent({
          model: this.modelId,
          contents: prompt,
          config: config,
        });

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        // Extract Usage Metadata
        const usageMetadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
        const inputTokens = usageMetadata.promptTokenCount || 0;
        const outputTokens = usageMetadata.candidatesTokenCount || 0;
        const totalTokens = usageMetadata.totalTokenCount || 0;
        
        const metrics: AIUsageMetrics = {
          usage: {
            inputTokens,
            outputTokens,
            totalTokens,
            totalCost: this.calculateCost(inputTokens, outputTokens)
          },
          latency,
          model: this.modelId
        };

        const text = response.text;
        if (!text) throw new Error("Empty response from AI");

        // If JSON schema was requested, parse the response
        const data = schema ? JSON.parse(text) : { text };

        return { ...data, ...metrics };

      } catch (error: any) {
        attempt++;
        console.warn(`Gemini API attempt ${attempt} failed:`, error);
        
        // Don't retry on client errors (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt === maxRetries) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
    throw new Error("Max retries exceeded");
  }

  // --- Public Methods ---

  async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    return this.generate<ResumeAnalysisResult>(
      PROMPTS.ANALYZE_RESUME(resumeText),
      atsAnalysisSchema
    );
  }

  async matchJob(resumeText: string, jobDescription: string): Promise<JobMatchResult> {
    return this.generate<JobMatchResult>(
      PROMPTS.MATCH_JOB(resumeText, jobDescription),
      jobMatchSchema
    );
  }

  async generateTailoredContent(resumeText: string, jobDescription: string): Promise<TailoredContent> {
    return this.generate<TailoredContent>(
      PROMPTS.TAILOR_CONTENT(resumeText, jobDescription),
      tailoredContentSchema,
      0.7 // Higher temperature for creative writing
    );
  }

  async getCareerAdvice(skills: string[], summary: string, preferredRole?: string, location?: string): Promise<CareerAdviceResult & AIUsageMetrics> {
    const locationStr = location ? `in ${location}` : "Remote or Worldwide";
    const roleStr = preferredRole ? `Target Role: ${preferredRole}` : "Roles matching the skills";
    
    const prompt = `Based on the following professional profile, find 5 relevant LIVE job openings and 3 internship opportunities.
      
      Search Criteria:
      - ${roleStr}
      - Location: ${locationStr}
      - Candidate Skills: ${skills.join(', ')}
      
      Output Requirements:
      1. List the jobs with Title, Company, Location and a brief description.
      2. List the internships.
      3. Provide a section "How to Crack It" with 3-4 specific, high-impact tips.
      
      Use Google Search to find real, current listings.`;

    // Note: Search results don't support JSON schema output easily with grounding, so we handle raw text
    const result = await this.generate<{ text: string }>(prompt, undefined, 0.4, true);

    // Manually parse grounding chunks if available
    // Since 'generate' returns the parsed object, we need to access the raw response in a real scenario
    // For this unified wrapper, we will do a simplified approach:
    // In a real app, we might need to modify 'generate' to return the full raw response object for access to 'candidates'
    // But for now, we will just return the text and let the UI parsing logic (if any) handle it, 
    // or we'd move the grounding extraction logic into 'generate'. 
    // For this demo, let's assume the text is sufficient, or we'd need to refactor 'generate' to return the full response object.
    
    // To keep it simple and working: we will just return the text and mock the links extraction 
    // because the 'generate' wrapper abstracts away the response object.
    // *Self-correction*: The previous implementation accessed groundingMetadata. 
    // I will add a small hack to 'generate' to return grounding data if needed, or just re-instantiate for this specific method 
    // if I want to strictly follow the pattern. 
    // Actually, let's just implement getCareerAdvice separately to access grounding chunks, reusing the cost logic.
    
    return this.getCareerAdviceWithGrounding(prompt);
  }

  // Specialized method for Search because it needs access to groundingMetadata
  private async getCareerAdviceWithGrounding(prompt: string): Promise<CareerAdviceResult & AIUsageMetrics> {
    const startTime = performance.now();
    const response = await this.ai.models.generateContent({
      model: this.modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const endTime = performance.now();
    
    const usageMetadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
    const metrics: AIUsageMetrics = {
      usage: {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
        totalCost: this.calculateCost(usageMetadata.promptTokenCount || 0, usageMetadata.candidatesTokenCount || 0)
      },
      latency: Math.round(endTime - startTime),
      model: this.modelId
    };

    const links: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      });
    }

    return {
      text: response.text || "No results found.",
      links,
      ...metrics
    };
  }
}
