import React, { useState } from 'react';
import { Task } from '../types';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
  currentUser: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, currentUser }) => {
  const [name, setName] = useState('');
  const [dailyGoal, setDailyGoal] = useState('1');
  const [weeklyDays, setWeeklyDays] = useState('3');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      dailyGoal: parseInt(dailyGoal),
      weeklyDays: parseInt(weeklyDays),
      startDate,
      endDate,
      logs: [],
      createdBy: currentUser
    };

    onAddTask(newTask);
    setName('');
  };

  // Calculate projected totals for display
  const dGoal = parseInt(dailyGoal) || 0;
  const wDays = parseInt(weeklyDays) || 0;
  const weeklyTotal = dGoal * wDays;
  const monthlyTotal = weeklyTotal * 4;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-fit sticky top-6">
      <h2 className="text-xl font-bold text-white mb-6">새 업무 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">업무 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 유튜브 영상 편집"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">일일 목표 (회/시간)</label>
          <input
            type="number"
            min="1"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">주당 활동 일수</label>
          <input
            type="number"
            min="1"
            max="7"
            value={weeklyDays}
            onChange={(e) => setWeeklyDays(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">업무 기간</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-sm">
            <div>
                <span className="block text-gray-500 text-xs">주간목표</span>
                <span className="text-blue-400 font-bold text-lg">{weeklyTotal} <span className="text-sm font-normal text-gray-500">개</span></span>
            </div>
            <div>
                <span className="block text-gray-500 text-xs">월간목표</span>
                <span className="text-blue-400 font-bold text-lg">{monthlyTotal} <span className="text-sm font-normal text-gray-500">개</span></span>
            </div>
            <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
            <Plus className="w-4 h-4" />
            업무 추가
            </button>
        </div>
        
        <div className="text-xs text-right text-gray-500 pt-2">
          작성자: <span className="text-gray-300">{currentUser}</span>
        </div>
      </form>
    </div>
  );
};