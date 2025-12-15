import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X } from 'lucide-react';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, task, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [dailyGoal, setDailyGoal] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDailyGoal(task.dailyGoal);
      setWeeklyDays(task.weeklyDays);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      name,
      dailyGoal,
      weeklyDays,
      startDate,
      endDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl shadow-2xl border border-gray-600 overflow-hidden transform transition-all scale-100 pointer-events-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">업무 편집</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">업무 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">일일 목표</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">주당 활동 일수</label>
              <input
                type="number"
                min="1"
                max="7"
                value={weeklyDays}
                onChange={(e) => setWeeklyDays(Number(e.target.value))}
                className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">업무 기간</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#2d2d2d] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#2d2d2d] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-gray-700/50 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors border border-gray-600 hover:text-white"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};