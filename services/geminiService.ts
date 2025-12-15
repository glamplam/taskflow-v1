import { GoogleGenAI, Type } from "@google/genai";
import { Task, AnalysisResult } from "../types";

// Safely access API key
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn('Error accessing process.env', e);
  }
  return '';
};

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiInstance) {
    const key = getApiKey();
    aiInstance = new GoogleGenAI({ apiKey: key || 'dummy_key' });
  }
  return aiInstance;
};

const getCommonAnalysisSchema = () => {
  return {
    type: Type.OBJECT,
    properties: {
      basicAnalysis: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      goalPerformance: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      averageAndPrediction: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      suggestions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
    },
    required: ["basicAnalysis", "goalPerformance", "averageAndPrediction", "suggestions"],
  };
};

export const analyzeTaskPerformance = async (task: Task): Promise<AnalysisResult> => {
  const now = new Date();
  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  
  // Basic Time Stats
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const daysPassed = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, (daysPassed / totalDays) * 100);

  // Log Stats
  const totalLogged = task.logs.reduce((acc, log) => acc + log.count, 0);
  const activeDays = task.logs.filter(l => l.count > 0).length;
  
  // Consistency
  const consistency = daysPassed > 0 ? (activeDays / daysPassed) * 100 : 0;
  
  // Goal Calculations
  const weeklyTarget = task.weeklyDays * task.dailyGoal;
  const expectedTotalToDate = Math.round((daysPassed / 7) * weeklyTarget);
  const gap = totalLogged - expectedTotalToDate;
  
  // Completion
  const totalGoal = Math.round((totalDays / 7) * weeklyTarget);
  const remainingGoal = Math.max(0, totalGoal - totalLogged);
  const remainingDays = Math.max(0, totalDays - daysPassed);
  const requiredDailyAvg = remainingDays > 0 ? (remainingGoal / remainingDays).toFixed(2) : "N/A";

  // Use pure ASCII for the prompt to avoid encoding SyntaxErrors, but ask for Korean output.
  const prompt = `
    Analyze the performance of the task below.
    Generate the output as structured lists of short sentences (bullet points).
    
    IMPORTANT: Wrap key numbers, percentages, or status words (e.g. 'Good', 'Bad') in double asterisks like **this** to highlight them.

    Task Data:
    - Task Name: ${task.name}
    - Period: ${totalDays} days total, ${daysPassed} days passed (${progressPercent.toFixed(1)}%)
    - Performance: ${totalLogged} units done in ${activeDays} active days.
    - Goal: ${task.dailyGoal} units/day, ${task.weeklyDays} days/week.
    - Expected Progress: Should have done approx ${expectedTotalToDate} units.
    - Current Gap: ${gap} units.
    - Consistency: ${consistency.toFixed(1)}% active.
    - Remaining: ${remainingGoal} units in ${remainingDays} days.
    - Required Daily Pace: ${requiredDailyAvg} units/day.

    Output Language: KOREAN (Hangul).

    Please provide the response in JSON format with the following 4 arrays:
    1. "basicAnalysis": 4-5 bullet points summarizing status.
    2. "goalPerformance": 4-5 bullet points comparing actual vs expected.
    3. "averageAndPrediction": 4-5 bullet points (forecast).
    4. "suggestions": 3-4 actionable tips.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getCommonAnalysisSchema(),
      },
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return {
      basicAnalysis: ["분석 중 오류 발생"],
      goalPerformance: ["데이터 부족"],
      averageAndPrediction: ["예측 불가"],
      suggestions: ["잠시 후 다시 시도해주세요"],
      timestamp: Date.now(),
    };
  }
};

export const analyzeIntegratedPerformance = async (tasks: Task[], year: number, month?: number): Promise<AnalysisResult> => {
  const isYearly = month === undefined || month === null;
  const periodLabel = isYearly ? `${year}` : `${year}-${month}`;
  
  const tasksSummary = tasks.map(t => {
      let logsInPeriod;
      if (isYearly) {
        logsInPeriod = t.logs.filter(l => l.date.startsWith(`${year}-`));
      } else {
        logsInPeriod = t.logs.filter(l => l.date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
      }
      
      const totalInPeriod = logsInPeriod.reduce((acc, l) => acc + l.count, 0);
      return `- ${t.name}: ${totalInPeriod} units done. Goal: ${t.dailyGoal}/day.`;
  }).join('\n');

  const prompt = `
    Perform a comprehensive executive dashboard analysis for: ${periodLabel}.
    
    Tasks Data:
    ${tasksSummary}

    Output Language: KOREAN (Hangul).

    IMPORTANT: Wrap key numbers or status words in double asterisks like **this**.

    Provide JSON response:
    1. "basicAnalysis": Overall volume and trends.
    2. "goalPerformance": Efficiency metrics.
    3. "averageAndPrediction": Achievement forecast.
    4. "suggestions": Strategic advice.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getCommonAnalysisSchema(),
      },
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Integrated Gemini analysis failed", error);
    return {
      basicAnalysis: ["종합 분석 실패"],
      goalPerformance: ["데이터 부족"],
      averageAndPrediction: ["예측 불가"],
      suggestions: ["잠시 후 다시 시도해주세요"],
      timestamp: Date.now(),
    };
  }
};