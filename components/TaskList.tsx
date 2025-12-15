import React from 'react';
import { Task } from '../types';
import { Edit2, Trash2, User } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, selectedTaskId, onSelectTask, onDeleteTask, onEditTask }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6 min-h-[400px]">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">업무 목록</h2>
      </div>
      
      {tasks.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          등록된 업무가 없습니다. 좌측 패널에서 새로운 업무를 추가해주세요.
        </div>
      ) : (
        <div className="w-full">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-400 border-b border-gray-700/50">
                <div className="col-span-1 text-center">순번</div>
                <div className="col-span-3">업무명</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-2 text-center">일일 목표</div>
                <div className="col-span-2 text-center">주당 활동</div>
                <div className="col-span-2 text-right">관리</div>
            </div>
            
            <div className="divide-y divide-gray-700/50">
                {tasks.map((task, index) => {
                    const isSelected = selectedTaskId === task.id;
                    return (
                        <div 
                            key={task.id} 
                            onClick={() => onSelectTask(task.id)}
                            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors cursor-pointer
                                ${isSelected ? 'bg-blue-900/20' : 'hover:bg-gray-700/30'}
                            `}
                        >
                            <div className="col-span-1 text-center font-bold text-gray-500">{index + 1}</div>
                            <div className={`col-span-3 font-medium truncate ${isSelected ? 'text-blue-400' : 'text-gray-200'}`}>
                                {task.name}
                            </div>
                            <div className="col-span-2 text-center text-gray-400 flex items-center justify-center gap-1.5 text-xs">
                                <User className="w-3 h-3" />
                                {task.createdBy}
                            </div>
                            <div className="col-span-2 text-center text-gray-300">{task.dailyGoal}회</div>
                            <div className="col-span-2 text-center text-gray-300">{task.weeklyDays}일</div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <button 
                                    className="p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTask(task.id);
                                        onEditTask(task);
                                    }}
                                    title="편집"
                                >
                                    편집
                                </button>
                                <button 
                                    className="p-1.5 text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 rounded text-xs transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                    }}
                                    title="삭제"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};