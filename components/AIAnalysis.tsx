import React, { useState } from 'react';
import { Task, AnalysisResult } from '../types';
import { analyzeTaskPerformance } from '../services/geminiService';
import { Sparkles, RefreshCw, Square, Circle, Lightbulb, TrendingUp } from 'lucide-react';

interface AIAnalysisProps {
  task: Task;
}

// Helper to render text with **bold** highlights
export const HighlightText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Determine color based on context if possible, otherwise default to blue
          let colorClass = "text-blue-400";
          if (content.includes("부족") || content.includes("경고") || content.startsWith("-")) {
            colorClass = "text-red-400";
          } else if (content.includes("양호") || content.includes("달성")) {
            colorClass = "text-green-400";
          } else if (content.includes("필요") || content.includes("개선")) {
             colorClass = "text-yellow-400";
          }
          
          return <span key={i} className={`${colorClass} font-bold`}>{content}</span>;
        }
        return <span key={i} className="text-gray-300">{part}</span>;
      })}
    </span>
  );
};

export const AnalysisCard = ({ title, items, icon: Icon, colorClass }: { title: string, items: string[], icon: any, colorClass: string }) => (
  <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-5 h-full shadow-lg">
    <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
      <Icon className={`w-5 h-5 ${colorClass} fill-current`} />
      <h4 className={`font-bold text-lg ${colorClass}`}>{title}</h4>
    </div>
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm flex items-start gap-2 leading-relaxed">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 shrink-0"></span>
          <div className="text-gray-300">
            <HighlightText text={item} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ task }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeTaskPerformance(task);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI 성과 분석 리포트
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/30"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {analysis ? '리포트 갱신' : '분석 시작'}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-10 text-center">
          <p className="text-gray-400 mb-2">아직 분석된 데이터가 없습니다.</p>
          <p className="text-gray-500 text-sm">'분석 시작'을 눌러 업무 수행 패턴과 개선점을 확인해보세요.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-5 h-64 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-1/3 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-800 rounded w-4/5"></div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
          <AnalysisCard 
            title="기본 현황 분석" 
            items={analysis.basicAnalysis} 
            icon={Square} 
            colorClass="text-blue-500" 
          />
          <AnalysisCard 
            title="평균 및 예측" 
            items={analysis.averageAndPrediction} 
            icon={Square} 
            colorClass="text-blue-500" 
          />
           <AnalysisCard 
            title="목표 대비 성과" 
            items={analysis.goalPerformance} 
            icon={Circle} 
            colorClass="text-blue-500" 
          />
           <AnalysisCard 
            title="개선 제안" 
            items={analysis.suggestions} 
            icon={Lightbulb} 
            colorClass="text-blue-500" 
          />
        </div>
      )}
    </div>
  );
};