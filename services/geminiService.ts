import { GoogleGenAI, Type } from "@google/genai";
import { Task, AnalysisResult } from "../types";

// Safely access API key to prevent runtime ReferenceError if process is not defined
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

const ai = new GoogleGenAI({ apiKey: getApiKey() });

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
  
  // Goal Calculations (Weekly based)
  const weeklyTarget = task.weeklyDays * task.dailyGoal;
  const expectedTotalToDate = Math.round((daysPassed / 7) * weeklyTarget);
  const gap = totalLogged - expectedTotalToDate;
  
  // Completion
  const totalGoal = Math.round((totalDays / 7) * weeklyTarget);
  const remainingGoal = Math.max(0, totalGoal - totalLogged);
  const remainingDays = Math.max(0, totalDays - daysPassed);
  const requiredDailyAvg = remainingDays > 0 ? (remainingGoal / remainingDays).toFixed(2) : "N/A";

  const prompt = `
    Analyze the performance of the following task with a professional, analytical, yet encouraging tone.
    Generate the output as structured lists of short sentences (bullet points).
    
    IMPORTANT: Wrap key numbers, percentages, or status words (like '양호', '부족') in double asterisks like **this** to highlight them.

    Task Data:
    - Task Name: ${task.name}
    - Period: ${totalDays} days total, ${daysPassed} days passed (${progressPercent.toFixed(1)}%)
    - Performance: ${totalLogged} units done in ${activeDays} active days.
    - Goal: ${task.dailyGoal} units/day, ${task.weeklyDays} days/week.
    - Expected Progress (Calculated): Should have done approx ${expectedTotalToDate} units by now.
    - Current Gap: ${gap} units (${gap >= 0 ? 'Ahead' : 'Behind'}).
    - Consistency: ${consistency.toFixed(1)}% of days active.
    - Remaining: ${remainingGoal} units needed in ${remainingDays} days.
    - Required Daily Pace for Remainder: ${requiredDailyAvg} units/day (if working every day).

    Please provide the response in Korean JSON format with the following 4 arrays:
    1. "basicAnalysis": 4-5 bullet points summarizing current status (Time passed, total count, active days, consistency).
    2. "goalPerformance": 4-5 bullet points comparing actual vs expected (Goal count, achievement rate %, gap, efficiency).
    3. "averageAndPrediction": 4-5 bullet points (Daily average, projected completion, required effort).
    4. "suggestions": 3-4 concrete, actionable improvement tips.

    Tone: Analytical, Insightful.
  `;

  try {
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
      basicAnalysis: ["데이터를 분석하는 중 오류가 발생했습니다.", "잠시 후 다시 시도해주세요."],
      goalPerformance: ["분석 실패"],
      averageAndPrediction: ["분석 실패"],
      suggestions: ["네트워크 상태를 확인해주세요."],
      timestamp: Date.now(),
    };
  }
};

export const analyzeIntegratedPerformance = async (tasks: Task[], year: number, month?: number): Promise<AnalysisResult> => {
  const isYearly = month === undefined || month === null;
  const periodLabel = isYearly ? `${year}년` : `${year}년 ${month}월`;
  const periodType = isYearly ? "Yearly" : "Monthly";

  const tasksSummary = tasks.map(t => {
      let logsInPeriod;
      if (isYearly) {
        logsInPeriod = t.logs.filter(l => l.date.startsWith(`${year}-`));
      } else {
        logsInPeriod = t.logs.filter(l => l.date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
      }
      
      const totalInPeriod = logsInPeriod.reduce((acc, l) => acc + l.count, 0);
      return `- ${t.name}: ${totalInPeriod} units done in ${periodLabel}. Goal: ${t.dailyGoal}/day, ${t.weeklyDays} days/week.`;
  }).join('\n');

  const prompt = `
    Perform a comprehensive integrated dashboard analysis for the following tasks for ${periodLabel} (${periodType} View).
    
    Tasks Data:
    ${tasksSummary}

    IMPORTANT: Wrap key numbers, percentages, or status words (like '양호', '부족', 'Great') in double asterisks like **this** to highlight them.

    Please provide the response in Korean JSON format with the following 4 arrays, designed for a high-level executive dashboard:
    1. "basicAnalysis": "Comprehensive Status Analysis" - Overall volume, most active task, general trend.
    2. "goalPerformance": "Efficiency Metrics" - Efficiency relative to goals, time utilization, work balance.
    3. "averageAndPrediction": "Goal Achievement Forecast" - Will the user meet goals for this period? What's the outlook?
    4. "suggestions": "Customized Improvements" - Strategic advice for managing multiple tasks.

    Tone: Professional, Strategic, Executive Summary style.
  `;

  try {
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
      basicAnalysis: ["종합 분석을 생성하는 중 오류가 발생했습니다."],
      goalPerformance: ["데이터가 부족합니다."],
      averageAndPrediction: ["예측을 생성할 수 없습니다."],
      suggestions: ["잠시 후 다시 시도해주세요."],
      timestamp: Date.now(),
    };
  }
};