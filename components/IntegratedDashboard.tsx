import React, { useState, useEffect } from 'react';
import { Task, AnalysisResult } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Square, Circle, Lightbulb, BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyzeIntegratedPerformance } from '../services/geminiService';
import { AnalysisCard, HighlightText } from './AIAnalysis';

interface IntegratedDashboardProps {
  tasks: Task[];
}

type ViewType = 'monthly' | 'yearly';

export const IntegratedDashboard: React.FC<IntegratedDashboardProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('monthly');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // --- Handlers ---
  const handlePrev = () => {
    if (viewType === 'monthly') {
      setCurrentDate(new Date(year, month - 2, 1));
    } else {
      setCurrentDate(new Date(year - 1, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewType === 'monthly') {
      setCurrentDate(new Date(year, month, 1));
    } else {
      setCurrentDate(new Date(year + 1, month - 1, 1));
    }
  };

  const toggleViewType = (type: ViewType) => {
    setViewType(type);
    setAnalysis(null); // Reset analysis when switching view
  };

  // --- Aggregation Logic ---
  
  // Calculate date range info
  const daysInMonth = new Date(year, month, 0).getDate();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear ? 366 : 365;

  const periodLabel = viewType === 'monthly' ? `${year}년 ${month}월` : `${year}년`;
  const filterPrefix = viewType === 'monthly' ? `${year}-${String(month).padStart(2, '0')}` : `${year}-`;

  // Aggregate Data
  let totalDone = 0;
  let totalGoal = 0;
  let activeDaysSet = new Set<string>();
  const taskPerformance: { name: string; done: number; goal: number }[] = [];

  tasks.forEach(task => {
    // Filter logs for the selected period (month or year)
    const logsInPeriod = task.logs.filter(l => l.date.startsWith(filterPrefix));
    const taskDone = logsInPeriod.reduce((acc, l) => acc + l.count, 0);
    
    // Calculate Goal
    let taskPeriodGoal = 0;
    if (viewType === 'monthly') {
      // Monthly Goal (Simplified: weekly * 4)
      taskPeriodGoal = task.dailyGoal * task.weeklyDays * 4; 
    } else {
      // Yearly Goal (weekly * 52)
      taskPeriodGoal = task.dailyGoal * task.weeklyDays * 52; 
    }

    totalDone += taskDone;
    totalGoal += taskPeriodGoal;

    logsInPeriod.forEach(l => {
      if (l.count > 0) activeDaysSet.add(l.date);
    });

    taskPerformance.push({
      name: task.name,
      done: taskDone,
      goal: taskPeriodGoal
    });
  });

  const activeDaysCount = activeDaysSet.size;
  const remainingGoal = Math.max(0, totalGoal - totalDone);
  const totalPeriodDays = viewType === 'monthly' ? daysInMonth : daysInYear;
  
  // Avg Daily Done: Total done / active days
  const avgDailyDone = activeDaysCount > 0 ? (totalDone / activeDaysCount).toFixed(1) : "0.0";
  const progressPercentage = totalGoal > 0 ? Math.min(100, (totalDone / totalGoal) * 100).toFixed(1) : "0.0";

  // --- Chart Data Preparation ---

  // 1. Period Performance (Bar Chart)
  // Monthly View -> Weekly Breakdown (1-5 weeks)
  // Yearly View -> Monthly Breakdown (1-12 months)
  const periodData = [];
  
  if (viewType === 'monthly') {
    for (let i = 1; i <= 5; i++) {
       periodData.push({ name: `${i}주차`, completed: 0, goal: totalGoal / 5 }); 
    }
    tasks.forEach(t => {
        t.logs.filter(l => l.date.startsWith(filterPrefix)).forEach(l => {
            const day = parseInt(l.date.split('-')[2]);
            const weekIdx = Math.min(4, Math.floor((day - 1) / 7));
            periodData[weekIdx].completed += l.count;
        });
    });
  } else {
    for (let i = 1; i <= 12; i++) {
        periodData.push({ name: `${i}월`, completed: 0, goal: totalGoal / 12 });
    }
    tasks.forEach(t => {
        t.logs.filter(l => l.date.startsWith(`${year}-`)).forEach(l => {
             const m = parseInt(l.date.split('-')[1]);
             if (m >= 1 && m <= 12) {
                 periodData[m - 1].completed += l.count;
             }
        });
    });
  }

  // 2. Trend Data (Line Chart)
  // Monthly View -> Daily Trend (1-31 days)
  // Yearly View -> Monthly Trend (1-12 months)
  const trendData = [];

  if (viewType === 'monthly') {
    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        const dateStr = `${filterPrefix}-${dayStr}`;
        let dayTotal = 0;
        tasks.forEach(t => {
            const log = t.logs.find(l => l.date === dateStr);
            if (log) dayTotal += log.count;
        });
        trendData.push({ name: `${i}일`, count: dayTotal });
    }
  } else {
    // Reuse periodData for yearly trend visualization logic, but mapped for line chart
    for (let i = 1; i <= 12; i++) {
        trendData.push({ name: `${i}월`, count: periodData[i-1].completed });
    }
  }

  // 3. Donut Data
  const donutData = [
      { name: '달성', value: totalDone },
      { name: '미달성', value: remainingGoal }
  ];
  const COLORS = ['#3b82f6', '#4b5563'];

  // --- AI Analysis Handler ---
  const runAnalysis = async () => {
    setLoading(true);
    // If yearly, pass undefined for month
    const result = await analyzeIntegratedPerformance(tasks, year, viewType === 'monthly' ? month : undefined);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run analysis when date or view type changes if tasks exist
    if (tasks.length > 0) {
        runAnalysis();
    }
  }, [year, month, viewType]);


  return (
    <div className="space-y-6">
      {/* Navigator */}
      <div className="bg-[#1e1e1e] rounded-xl border border-blue-900/30 p-4 flex items-center justify-between shadow-lg shadow-blue-900/10">
        <div className="flex items-center gap-4">
             <button onClick={handlePrev} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={handleNext} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <ChevronRight className="w-5 h-5" />
             </button>
        </div>
        <h2 className="text-3xl font-bold text-blue-500 drop-shadow-sm">{periodLabel}</h2>
        <div className="flex bg-gray-800 rounded-lg p-1">
             <button 
                onClick={() => toggleViewType('monthly')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewType === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                월별
             </button>
             <button 
                onClick={() => toggleViewType('yearly')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewType === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                년별
             </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-green-500" />
              전체 요약 ({periodLabel})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                  <span className="text-gray-400 text-sm mb-2">총 완료수</span>
                  <span className="text-4xl font-bold text-blue-400 mb-2">{totalDone}</span>
                  <span className="text-orange-400 text-sm font-medium">{progressPercentage}%</span>
              </div>
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                  <span className="text-gray-400 text-sm mb-2">활동일수</span>
                  <span className="text-4xl font-bold text-green-400 mb-2">{activeDaysCount}</span>
                  <span className="text-green-600 text-sm font-medium">{(activeDaysCount / totalPeriodDays * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                  <span className="text-gray-400 text-sm mb-2">남은 목표량</span>
                  <span className="text-4xl font-bold text-purple-400 mb-2">{remainingGoal}</span>
                  <span className="text-green-500 text-sm font-medium">{progressPercentage}%</span>
              </div>
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                  <span className="text-gray-400 text-sm mb-2">평균 일일 완료</span>
                  <span className="text-4xl font-bold text-blue-300 mb-2">{avgDailyDone}</span>
                  <span className="text-gray-500 text-sm font-medium">건/일</span>
              </div>
          </div>
      </div>

      {/* Integrated AI Analysis */}
      <div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                통합 업무 분석 ({viewType === 'monthly' ? '월간' : '연간'})
            </h3>
            <button
                onClick={runAnalysis}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
            >
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                분석 갱신
            </button>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-800/50 rounded-xl"></div>)}
             </div>
          ) : analysis ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisCard title="종합 현황 분석" items={analysis.basicAnalysis} icon={Square} colorClass="text-blue-500" />
                <AnalysisCard title="효율성 지표" items={analysis.goalPerformance} icon={Square} colorClass="text-blue-500" />
                <AnalysisCard title="목표 달성 전망" items={analysis.averageAndPrediction} icon={Circle} colorClass="text-blue-500" />
                <AnalysisCard title="맞춤형 개선 제안" items={analysis.suggestions} icon={Lightbulb} colorClass="text-blue-500" />
             </div>
          ) : (
             <div className="text-center py-10 text-gray-500">데이터 분석을 시작해주세요.</div>
          )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart (Weekly or Monthly breakdown) */}
          <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-green-500" />
                  기간별 성과 ({viewType === 'monthly' ? '주차별' : '월별'})
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} />
                        <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                        <Bar dataKey="completed" fill="#d946ef" radius={[4, 4, 0, 0]} barSize={viewType === 'monthly' ? 40 : 20} />
                        {viewType === 'monthly' && <Bar dataKey="goal" fill="#d97706" radius={[4, 4, 0, 0]} barSize={40} />}
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-red-500" />
                  전체 달성률
              </h3>
              <div className="h-64 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} iconType="rect" />
                      </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                       <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                  </div>
              </div>
          </div>

          {/* Task Comparison (Horizontal Bar) */}
          <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  업무별 달성률 비교
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={taskPerformance} margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                          <XAxis type="number" stroke="#9ca3af" />
                          <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} tick={{fontSize: 12}} />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                          <Bar dataKey="done" fill="#d97706" radius={[0, 4, 4, 0]} barSize={30} background={{ fill: '#374151' }} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Trend Line Chart */}
          <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  트렌드 분석 ({viewType === 'monthly' ? '일별' : '월별'})
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 10}} interval={viewType === 'monthly' ? 2 : 0} />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};