import React from 'react';
import { Task } from '../types';

interface StatsCardsProps {
  task: Task;
  currentDate: Date;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ task, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  // Filter logs for this month
  const monthlyLogs = task.logs.filter(log => log.date.startsWith(monthStr));
  
  const totalLogged = monthlyLogs.reduce((acc, log) => acc + log.count, 0);
  const activeDays = monthlyLogs.filter((log) => log.count > 0).length;
  const goalMetDays = monthlyLogs.filter(log => log.count >= task.dailyGoal).length;
  
  // Time Calculations for "Required Daily"
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  
  let daysPassed = 0;
  if (isCurrentMonth) {
    daysPassed = now.getDate();
  } else if (now > new Date(year, month + 1, 0)) {
    daysPassed = daysInMonth; // Past month
  } else {
    daysPassed = 0; // Future month
  }

  // Monthly Goal (Weekly * 4 as per prompt logic)
  const monthlyGoal = task.dailyGoal * task.weeklyDays * 4;
  
  const progressPercent = monthlyGoal > 0 ? (totalLogged / monthlyGoal) * 100 : 0;
  
  const remainingGoal = Math.max(0, monthlyGoal - totalLogged);
  const remainingDays = isCurrentMonth ? daysInMonth - daysPassed : (now < new Date(year, month, 1) ? daysInMonth : 0);
  
  const requiredDaily = remainingDays > 0 ? (remainingGoal / remainingDays).toFixed(2) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Completed in Month */}
      <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 shadow-lg">
        <div className="text-gray-400 text-sm font-medium mb-2">{month + 1}월 총 완료수</div>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-bold text-blue-400">{totalLogged}</div>
           <span className="text-xs text-gray-500">건</span>
        </div>
        <div className="text-xs text-blue-500/80 mt-2 font-medium flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
           월간 목표 달성률 {progressPercent.toFixed(1)}%
        </div>
      </div>
      
      {/* Active Days in Month */}
      <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 shadow-lg">
        <div className="text-gray-400 text-sm font-medium mb-2">{month + 1}월 활동일수</div>
        <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-green-400">{activeDays}</div>
            <span className="text-xs text-gray-500">일</span>
        </div>
         <div className="text-xs text-green-500/80 mt-2 font-medium flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
           {daysInMonth}일 중 {activeDays}일 활동
        </div>
      </div>

      {/* Goal Met Days (Days where daily goal was reached) */}
      <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 shadow-lg">
        <div className="text-gray-400 text-sm font-medium mb-2">{month + 1}월 목표 달성 횟수</div>
        <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-purple-400">{goalMetDays}</div>
            <span className="text-xs text-gray-500">일</span>
        </div>
        <div className="text-xs text-purple-500/80 mt-2 font-medium flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          활동일 중 {(activeDays > 0 ? (goalMetDays / activeDays * 100) : 0).toFixed(0)}% 달성 성공
        </div>
      </div>

      {/* Required Daily for remaining month */}
      <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 shadow-lg">
        <div className="text-gray-400 text-sm font-medium mb-2">남은 기간 일일 필요량</div>
        <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-orange-400">
                {requiredDaily}
            </div>
            <span className="text-xs text-gray-500">건/일</span>
        </div>
         <div className="text-xs text-orange-500/80 mt-2 font-medium flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
           남은 목표량 {remainingGoal}건
        </div>
      </div>
    </div>
  );
};