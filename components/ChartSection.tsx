import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';

interface ChartSectionProps {
  task: Task;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ task, currentDate, onDateChange }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  // Generate data for the selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const displayData = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const log = task.logs.find(l => l.date === dateStr);
    displayData.push({
      date: String(i), // Just the day number for X-axis
      fullDate: dateStr,
      count: log ? log.count : 0,
      goal: task.dailyGoal
    });
  }

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-300 font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
            월별 성과 그래프
          </h3>
          <div className="flex items-center gap-3 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
             <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
               <ChevronLeft className="w-4 h-4" />
             </button>
             <span className="text-sm font-bold text-gray-200 min-w-[80px] text-center">
               {year}년 {month + 1}월
             </span>
             <button onClick={handleNextMonth} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 30, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                tick={{fontSize: 12, fill: '#9ca3af'}} 
                tickMargin={10}
                interval={daysInMonth > 20 ? 4 : 0} 
            />
            <YAxis 
                stroke="#6b7280" 
                tick={{fontSize: 12, fill: '#9ca3af'}}
                allowDecimals={false}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#181818', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                labelFormatter={(label) => `${month + 1}월 ${label}일`}
            />
            <ReferenceLine y={task.dailyGoal} stroke="#60a5fa" strokeDasharray="3 3" label={{ value: '목표', fill: '#60a5fa', fontSize: 12, position: 'insideRight' }} />
            <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1e1e1e', strokeWidth: 2, stroke: '#3b82f6' }}
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};