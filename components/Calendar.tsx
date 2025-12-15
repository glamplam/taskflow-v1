import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Task } from '../types';

interface CalendarProps {
  task: Task;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onUpdateLog: (date: string, delta: number) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ task, currentDate, onDateChange, onUpdateLog }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getLogForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return task.logs.find((l) => l.date === dateStr);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-6 bg-gray-800 p-3 rounded-lg border border-gray-700">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-700 rounded-full transition-colors group">
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          {year}년 <span className="text-white">{month + 1}월</span>
        </h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-700 rounded-full transition-colors group">
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-gray-500 text-xs font-bold py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-24 bg-transparent" />;
          
          const log = getLogForDay(day);
          const count = log ? log.count : 0;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Check for today (Local time string construction for visual highlight)
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const isToday = todayStr === dateStr;

          // Check for future date
          const cellDate = new Date(year, month, day);
          const isFuture = cellDate > today;

          const isGoalMet = count >= task.dailyGoal;

          return (
            <div
              key={day}
              className={`h-28 rounded-xl border flex flex-col justify-between p-3 relative group transition-all duration-300
                ${count > 0 ? 'bg-gray-800/60 border-gray-600' : 'bg-[#181818] border-gray-800'}
                ${isGoalMet ? 'shadow-[0_0_15px_rgba(34,197,94,0.15)] border-green-900/50' : ''}
                ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#121212]' : ''}
                ${!isFuture ? 'hover:border-gray-500' : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                      {day}
                  </span>
                  {isGoalMet && (
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                  )}
              </div>

              <div className="flex flex-col items-center justify-center flex-grow">
                {count > 0 ? (
                    <span className={`text-3xl font-bold ${isGoalMet ? 'text-green-400' : 'text-blue-200'}`}>
                        {count}
                    </span>
                ) : (
                    <span className="text-gray-700 text-2xl font-bold">-</span>
                )}
              </div>

              {!isFuture && (
                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 rounded-lg px-1.5 py-1 absolute bottom-2 left-2 right-2 shadow-lg z-10">
                     <button 
                        onClick={() => onUpdateLog(dateStr, -1)}
                        className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                     >
                        <Minus className="w-4 h-4" />
                     </button>
                     <span className="text-xs text-gray-400 font-medium">수정</span>
                     <button 
                        onClick={() => onUpdateLog(dateStr, 1)}
                        className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};