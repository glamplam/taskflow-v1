import React, { useState, useEffect } from 'react';
import { Task, User } from './types';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { StatsCards } from './components/StatsCards';
import { Calendar } from './components/Calendar';
import { ChartSection } from './components/ChartSection';
import { AIAnalysis } from './components/AIAnalysis';
import { TaskEditModal } from './components/TaskEditModal';
import { IntegratedDashboard } from './components/IntegratedDashboard';
import { AuthForm } from './components/AuthForm';
import { authService } from './services/authService';
import { LayoutDashboard, CheckSquare, LogOut, User as UserIcon } from 'lucide-react';

const MOCK_TASK: Task = {
  id: '1',
  name: '인스타그램 릴스제작',
  dailyGoal: 1,
  weeklyDays: 3,
  startDate: '2024-01-01',
  endDate: '2025-12-31',
  logs: [
    { date: '2025-05-15', count: 1 },
    { date: '2025-05-18', count: 1 },
    { date: '2025-05-22', count: 1 },
    { date: '2025-05-25', count: 1 },
    { date: '2025-12-15', count: 1 },
    { date: '2025-12-18', count: 1 },
    { date: '2025-12-20', count: 1 },
    { date: '2025-12-23', count: 1 },
    { date: '2025-12-25', count: 1 },
    { date: '2025-12-28', count: 1 },
  ],
  createdBy: '관리자'
};

type ViewMode = 'management' | 'dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([MOCK_TASK]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(MOCK_TASK.id);
  const [currentView, setCurrentView] = useState<ViewMode>('management');
  
  // View State for Task Detail (Calendar/Stats Month)
  const [viewDate, setViewDate] = useState(new Date());

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // Check for existing session on load
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Reset view date to today when switching tasks
  useEffect(() => {
    if (selectedTaskId) {
      setViewDate(new Date());
    }
  }, [selectedTaskId]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
    if (!selectedTaskId) {
        setSelectedTaskId(task.id);
    }
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    if (selectedTaskId === id) {
      setSelectedTaskId(newTasks.length > 0 ? newTasks[0].id : null);
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveEditedTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    handleCloseEditModal();
  };

  const handleUpdateLog = (date: string, delta: number) => {
    if (!selectedTaskId) return;

    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== selectedTaskId) return task;

      const existingLogIndex = task.logs.findIndex(l => l.date === date);
      let newLogs = [...task.logs];

      if (existingLogIndex >= 0) {
        const newCount = Math.max(0, newLogs[existingLogIndex].count + delta);
        if (newCount === 0) {
          // Remove log if count is 0
          newLogs.splice(existingLogIndex, 1);
        } else {
          newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], count: newCount };
        }
      } else if (delta > 0) {
        newLogs.push({ date, count: delta });
      }

      return { ...task, logs: newLogs };
    }));
  };

  if (!currentUser) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#121212] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8 h-full">
                <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
                <nav className="flex h-full">
                    <button 
                      onClick={() => setCurrentView('management')}
                      className={`flex items-center gap-2 h-full px-4 border-b-2 font-medium transition-colors ${currentView === 'management' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        업무 관리
                    </button>
                    <button 
                      onClick={() => setCurrentView('dashboard')}
                      className={`flex items-center gap-2 h-full px-4 border-b-2 font-medium transition-colors ${currentView === 'dashboard' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        통합 대시보드
                    </button>
                </nav>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                        {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline">{currentUser.name}님</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        {currentView === 'management' ? (
           <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Add Task */}
              <div className="col-span-12 lg:col-span-3">
                <TaskForm onAddTask={handleAddTask} currentUser={currentUser.name} />
              </div>

              {/* Right Column: List & Details */}
              <div className="col-span-12 lg:col-span-9">
                
                {/* Task List */}
                <TaskList 
                  tasks={tasks} 
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleOpenEditModal}
                />

                {/* Selected Task Detail View */}
                {selectedTask && (
                  <div className="animate-fade-in-up">
                      <div className="mb-6 flex items-baseline gap-3 border-b border-gray-800 pb-4">
                          <h2 className="text-2xl font-bold text-white">[{selectedTask.name}] 업무 상세</h2>
                          <div className="flex gap-4 text-sm text-gray-400">
                              <span>일일 목표 <strong className="text-white">{selectedTask.dailyGoal}</strong></span>
                              <span>주간 목표 <strong className="text-white">{selectedTask.dailyGoal * selectedTask.weeklyDays}</strong></span>
                              <span>월간 목표 <strong className="text-white">{selectedTask.dailyGoal * selectedTask.weeklyDays * 4}</strong></span>
                          </div>
                      </div>

                      {/* Stats Cards synced with View Date */}
                      <StatsCards task={selectedTask} currentDate={viewDate} />
                      
                      <AIAnalysis task={selectedTask} />

                      <div className="grid grid-cols-1 gap-6">
                          {/* Calendar controlled by View Date */}
                          <Calendar 
                            task={selectedTask} 
                            currentDate={viewDate}
                            onDateChange={setViewDate}
                            onUpdateLog={handleUpdateLog} 
                          />
                          {/* Chart synced with View Date */}
                          <ChartSection 
                            task={selectedTask} 
                            currentDate={viewDate}
                            onDateChange={setViewDate}
                          />
                      </div>
                  </div>
                )}
              </div>
           </div>
        ) : (
           <div className="animate-fade-in">
             <IntegratedDashboard tasks={tasks} />
           </div>
        )}
      </main>

      {/* Edit Modal */}
      <TaskEditModal 
        isOpen={isEditModalOpen} 
        task={editingTask} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveEditedTask}
      />
    </div>
  );
}

export default App;
