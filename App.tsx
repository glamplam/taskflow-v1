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
import { SupabaseSetup } from './components/SupabaseSetup';
import { SettingsModal } from './components/SettingsModal';
import { authService } from './services/authService';
import { isConfigured, resetSupabaseConfig } from './services/supabase';
import { LayoutDashboard, CheckSquare, LogOut, Loader2, Settings } from 'lucide-react';

type ViewMode = 'management' | 'dashboard';

function App() {
  // 0. Check Configuration First
  if (!isConfigured) {
    return <SupabaseSetup />;
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('management');
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // View State for Task Detail (Calendar/Stats Month)
  const [viewDate, setViewDate] = useState(new Date());

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Check Session on Mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          loadTasks(); // Load data if logged in
        }
      } catch (error) {
        console.error("Session check failed", error);
      }
    };
    checkUser();
  }, []);

  // 2. Load Tasks from Server
  const loadTasks = async () => {
    setIsLoadingData(true);
    try {
        const loadedTasks = await authService.loadUserTasks();
        setTasks(loadedTasks);
        if (loadedTasks.length > 0) {
            setSelectedTaskId(loadedTasks[0].id);
        } else {
            setSelectedTaskId(null);
        }
    } catch (e) {
        console.error("Failed to load tasks", e);
        setTasks([]);
    } finally {
        setIsLoadingData(false);
    }
  };

  // 3. Save Tasks to Server (Debounced or on key actions)
  const saveTasks = async (newTasks: Task[]) => {
    await authService.saveUserTasks(newTasks);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Reset view date to today when switching tasks
  useEffect(() => {
    if (selectedTaskId) {
      setViewDate(new Date());
    }
  }, [selectedTaskId]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadTasks();
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setTasks([]);
  };

  const handleResetConnection = () => {
    if (window.confirm('서버 연결 설정을 기본값으로 초기화하시겠습니까?')) {
        resetSupabaseConfig();
    }
  };

  const handleAddTask = (task: Task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    if (!selectedTaskId) {
        setSelectedTaskId(task.id);
    }
    saveTasks(newTasks);
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    if (selectedTaskId === id) {
      setSelectedTaskId(newTasks.length > 0 ? newTasks[0].id : null);
    }
    saveTasks(newTasks);
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
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
    handleCloseEditModal();
    saveTasks(newTasks);
  };

  const handleUpdateLog = (date: string, delta: number) => {
    if (!selectedTaskId) return;

    const newTasks = tasks.map(task => {
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
    });

    setTasks(newTasks);
    saveTasks(newTasks); // Save to DB
  };

  if (!currentUser) {
    return (
        <div className="relative">
             <AuthForm onLoginSuccess={handleLoginSuccess} />
             <div className="fixed bottom-4 right-4 flex gap-4">
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                 >
                    <Settings className="w-3 h-3" /> API 설정
                 </button>
                 <button 
                    onClick={handleResetConnection}
                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                 >
                    <Settings className="w-3 h-3" /> 서버 재설정
                 </button>
             </div>
             <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
  }

  if (isLoadingData) {
      return (
          <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-gray-400">데이터를 불러오는 중...</p>
              </div>
          </div>
      );
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
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{currentUser.name}님</span>
                </div>
                
                {/* Settings Button */}
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                    title="설정"
                >
                    <Settings className="w-5 h-5" />
                </button>

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

      {/* Modals */}
      <TaskEditModal 
        isOpen={isEditModalOpen} 
        task={editingTask} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveEditedTask}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;