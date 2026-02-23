import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Trash2, CheckCircle2, Clock, Edit2, X, 
  Search, LogOut, CheckSquare, Moon, Sun, 
  LayoutGrid, AlertCircle, Circle, ListTodo, Menu, ChevronRight,
  Calendar, Tag, Zap, AlertTriangle, CheckCircle
} from "lucide-react";

function Dashboard({ user, onLogout, darkMode = false, onToggleTheme }) {
  const [taskStatusFilter, setTaskStatusFilter] = useState("ALL");
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState("DASHBOARD");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ 
    title: "", description: "", deadline: "", status: "PENDING", priority: "NORMAL", tags: "" 
  });

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const showToast = (type, message, timeout = 4000) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), timeout);
  };

  const API = process.env.REACT_APP_API_URL + "/api/tasks";
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // FIX: Token identifies the user automatically on backend
      const response = await fetch(API, {
        headers: authHeaders,
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const data = await response.json();
        // Backend sorts by Order field
        setTasks(Array.isArray(data) ? data : []);
      } else {
        if (response.status === 403) onLogout(); // Token expired
        setTasks([]);
      }
    } catch (err) { 
      console.error("Fetch error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    // Add smooth transitions for theme switching
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (taskStatusFilter === "PENDING") {
      filtered = filtered.filter(t => t.status === "PENDING" || (!t.status && !t.completed));
    } else if (taskStatusFilter === "COMPLETED") {
      filtered = filtered.filter(t => t.status === "COMPLETED" || t.completed);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const titleMatch = t.title?.toLowerCase().includes(query);
        const descriptionMatch = t.description?.toLowerCase().includes(query);
        const tagsMatch = t.tags?.toLowerCase().includes(query);
        return titleMatch || descriptionMatch || tagsMatch;
      });
    }
    return filtered;
  }, [tasks, searchQuery, taskStatusFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "COMPLETED" || t.completed).length;
    const inProgress = tasks.filter(t => t.status === "PENDING" || (!t.status && !t.completed)).length;
    const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "COMPLETED" && !t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, overdue, completionRate };
  }, [tasks]);

  // Recent tasks: top 3 from the ordered list
  const getCreatedAt = (t) => {
    if (!t) return null;
    const keys = ['createdAt','created_at','createdOn','createdDate','addedAt','added_at','timestamp','timeCreated'];
    for (const k of keys) {
      if (t[k]) return t[k];
    }
    return null;
  };

  const formatCreatedAt = (t) => {
    const v = getCreatedAt(t);
    if (!v) return null;
    // handle numeric timestamps (seconds or milliseconds)
    if (typeof v === 'number') {
      const ms = v > 1e12 ? v : (v > 1e9 ? v * 1000 : v);
      return new Date(ms).toLocaleString();
    }
    // handle numeric string
    if (/^\d+$/.test(String(v))) {
      const n = parseInt(v, 10);
      const ms = n > 1e12 ? n : (n > 1e9 ? n * 1000 : n);
      return new Date(ms).toLocaleString();
    }
    const parsed = Date.parse(v);
    if (isNaN(parsed)) return null;
    return new Date(parsed).toLocaleString();
  };

  const recentTasks = useMemo(() => {
    return tasks.slice(0, 3);
  }, [tasks]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('warning', 'Task title is required');
      return;
    }
    
    try {
      let url, method;
      
      if (editingTask) {
        url = `${API}/${editingTask.id}`;
        method = "PUT";
      } else {
        // FIX: No longer need userId param - token identifies user
        url = `${API}/create`;
        method = "POST";
      }
      
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormData({ title: "", description: "", deadline: "", status: "PENDING", priority: "NORMAL", tags: "" });
        fetchTasks();
        showToast('success', `Task ${editingTask ? 'updated' : 'created'} successfully!`);
      } else {
        const responseText = await response.text();
        showToast('error', `Error: ${response.status} - ${responseText}`);
      }
    } catch (err) { 
      console.error("Save error:", err);
      showToast('error', `Failed to save task: ${err.message}`);
    }
  };

  const requestDeleteTask = (id) => {
    setConfirmDeleteId(id);
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        fetchTasks();
        showToast('success', 'Task deleted');
      } else {
        showToast('error', 'Failed to delete task');
      }
    } catch (err) { 
      console.error("Delete error:", err);
      showToast('error', 'Failed to delete task');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // --- DRAG AND DROP LOGIC (IMPROVED) ---
  const onDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(index)); } catch (_) {}
    try {
      const el = e.currentTarget;
      if (e.dataTransfer.setDragImage && el) {
        e.dataTransfer.setDragImage(el, 20, 20);
      }
    } catch (err) {
      // ignore
    }
    setDraggingIndex(index);
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const onDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === dropIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder locally first
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(draggingIndex, 1);
    newTasks.splice(dropIndex, 0, movedTask);
    
    setTasks(newTasks);
    setDraggingIndex(null);
    setDragOverIndex(null);

    // Send new order to backend
    const taskIds = newTasks.map(t => t.id);
    try {
      await fetch(`${API}/reorder`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(taskIds),
        signal: AbortSignal.timeout(5000)
      });
    } catch (err) {
      console.error("Failed to save order", err);
      showToast('error', 'Failed to save new order');
    }
  };

  const toggleTaskCompletion = async (task) => {
    const isCurrentlyCompleted = task.status === 'COMPLETED';
    const newStatus = isCurrentlyCompleted ? 'PENDING' : 'COMPLETED';

    // Optimistic update so animation plays immediately
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ ...task, status: newStatus }),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        // revert on failure
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
        showToast('error', 'Failed to update task');
      }
    } catch (err) { 
      console.error("Toggle error:", err);
      // revert
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
      showToast('error', 'Failed to update task');
    }
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* SIDEBAR - Elegant Monochrome Design */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} transition-all duration-300 overflow-y-auto ${darkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-slate-50 border-slate-200'} border-r flex flex-col shrink-0 hidden md:flex`}>
        
        {/* LOGO SECTION */}
        <div className={`px-6 py-8 border-b ${darkMode ? 'border-neutral-900' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-300'}`}>
                  <CheckSquare size={22} className={darkMode ? 'text-slate-100' : 'text-slate-900'} />
                </div>
                <div>
                  <h1 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>TaskFlow</h1>
                  <p className={`text-xs font-medium ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>v1.0</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-900 text-slate-700' : 'hover:bg-slate-200 text-slate-400'}`}
            >
              <ChevronRight size={20} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-8 space-y-1">
          {sidebarOpen && (
            <p className={`px-2 mb-6 text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-slate-700' : 'text-slate-400'}`}>
              Navigation
            </p>
          )}
          
          <SidebarNavItem 
            icon={<LayoutGrid size={20}/>} 
            label="Dashboard" 
            active={activeView === "DASHBOARD"} 
            onClick={() => setActiveView("DASHBOARD")}
            darkMode={darkMode}
            sidebarOpen={sidebarOpen}
          />
          <SidebarNavItem 
            icon={<ListTodo size={20}/>} 
            label="My Tasks" 
            active={activeView === "MY_TASKS"} 
            onClick={() => setActiveView("MY_TASKS")}
            darkMode={darkMode}
            sidebarOpen={sidebarOpen}
          />
        </nav>

        {/* DIVIDER */}
        <div className={`mx-4 h-px ${darkMode ? 'bg-neutral-900' : 'bg-slate-200'}`}></div>

        {/* USER SECTION */}
        <div className="px-4 py-8 space-y-6">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              darkMode
                ? 'text-slate-700 hover:text-slate-400 hover:bg-neutral-900/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && (
              <span className="text-sm font-medium">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* User Profile */}
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${darkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}>
                {user?.name?.substring(0, 1).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {user?.name || "User"}
                </p>
                <button 
                  onClick={() => setIsLogoutModalOpen(true)} 
                  className={`flex-shrink-0 transition-colors ${darkMode ? 'text-slate-700 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <header className={`h-16 px-6 flex items-center justify-between border-b transition-colors duration-300 ${darkMode ? 'bg-black border-neutral-900' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-700' : 'text-slate-400'}`} />
              <input 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveView('MY_TASKS');
                  }
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none transition-all ${
                  darkMode 
                    ? 'bg-neutral-900 border-neutral-800 text-slate-100 placeholder-slate-700 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20'
                }`}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-6">
            <button 
              onClick={() => { setEditingTask(null); setFormData({ title: "", description: "", deadline: "", status: "PENDING", priority: "NORMAL", tags: "" }); setIsModalOpen(true); }}
              className={`hidden md:flex px-4 py-2.5 rounded-lg text-sm font-semibold items-center gap-2 transition-all ${
                darkMode 
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  : 'bg-slate-900 text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Plus size={18} /> New Task
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-white'}`}>
          <div className="p-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-300/30 border-t-slate-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>Loading tasks...</p>
                </div>
              </div>
            ) : activeView === "DASHBOARD" ? (
              <div className="space-y-8">
                {/* Greeting */}
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>{dateStr}</p>
                  <h2 className={`text-4xl font-bold mt-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{greeting}</h2>
                  <p className={`text-base mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Here's your productivity overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="Total Tasks" 
                    value={stats.total} 
                    icon={<ListTodo size={24}/>} 
                    iconBg={darkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'} 
                    iconColor={darkMode ? 'text-indigo-400' : 'text-indigo-600'}
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="Completed" 
                    value={stats.completed} 
                    icon={<CheckCircle2 size={24}/>} 
                    iconBg={darkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'} 
                    iconColor={darkMode ? 'text-emerald-400' : 'text-emerald-600'}
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="In Progress" 
                    value={stats.inProgress} 
                    icon={<Clock size={24}/>} 
                    iconBg={darkMode ? 'bg-amber-600/20' : 'bg-amber-100'} 
                    iconColor={darkMode ? 'text-amber-400' : 'text-amber-600'}
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="Overdue" 
                    value={stats.overdue} 
                    icon={<AlertCircle size={24}/>} 
                    iconBg={darkMode ? 'bg-rose-600/20' : 'bg-rose-100'} 
                    iconColor={darkMode ? 'text-rose-400' : 'text-rose-600'}
                    darkMode={darkMode}
                  />
                </div>

                {/* Completion Rate & Recent Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Progress */}
                  <div className={`lg:col-span-1 p-6 rounded-xl border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className={`text-lg font-semibold mb-8 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Completion Rate</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                          {/* Background circle */}
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            strokeWidth="8" 
                            className={darkMode ? 'stroke-neutral-800' : 'stroke-slate-200'}
                          />
                          {/* Progress circle */}
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            strokeWidth="8"
                            stroke="url(#progressGradient)"
                            strokeDasharray={`${(stats.completionRate / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            style={{
                              transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className={`text-4xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.completionRate}%</p>
                          <p className={`text-xs font-semibold uppercase tracking-widest mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tasks */}
                  <div className={`lg:col-span-2 p-6 rounded-xl border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Recent Tasks</h3>
                      {tasks.length > 3 && (
                        <button 
                          onClick={() => setActiveView("MY_TASKS")}
                          className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'}`}
                        >
                          View all →
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {recentTasks.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>No tasks yet</p>
                      ) : (
                        recentTasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`p-4 rounded-lg border flex items-center justify-between gap-3 transition-all duration-500 ${darkMode ? 'border-neutral-800 hover:bg-neutral-800/50' : 'border-slate-200 hover:bg-slate-100/50'} ${(task.completed || task.status === "COMPLETED") ? (darkMode ? 'bg-neutral-800/40' : 'bg-slate-100/40') : ''}`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button 
                                onClick={() => toggleTaskCompletion(task)}
                                className="shrink-0 transition-all duration-300 hover:scale-110"
                              >
                                {task.completed || task.status === "COMPLETED" ? (
                                  <CheckCircle2 size={24} className={`${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
                                ) : (
                                  <Circle size={24} strokeWidth={1.5} className={`${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="relative w-full overflow-hidden">
                                  <p className={`text-sm font-semibold truncate transition-all duration-500 ${ (task.completed || task.status === "COMPLETED") ? (darkMode ? 'text-slate-600' : 'text-slate-400') : (darkMode ? 'text-slate-100' : 'text-slate-900') }`}>{task.title}</p>
                                  {/* animated strike bar */}
                                  <span className={`absolute left-0 top-1/2 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-500 transform -translate-y-1/2 transition-all duration-500 ${ (task.completed || task.status === "COMPLETED") ? 'w-full' : 'w-0' }`} />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-nowrap shrink-0">
                              <button onClick={() => {setEditingTask(task); setFormData(task); setIsModalOpen(true);}} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-600 hover:bg-indigo-500/20 hover:text-indigo-400' : 'text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}><Edit2 size={16}/></button>
                              <button onClick={() => requestDeleteTask(task.id)} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-600 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-500 hover:bg-red-100 hover:text-red-600'}`}><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-4xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>My Tasks</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex gap-2">
                      {[
                        { label: "All", value: "ALL" },
                        { label: "Pending", value: "PENDING" },
                        { label: "Completed", value: "COMPLETED" }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setTaskStatusFilter(opt.value)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200 focus:outline-none ${
                            taskStatusFilter === opt.value
                              ? darkMode
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                : 'bg-indigo-600 text-white border-indigo-500 shadow'
                              : darkMode
                                ? 'bg-neutral-900 text-slate-400 border-neutral-700 hover:bg-neutral-800'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <span className={`text-xs ml-2 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>{filteredTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}{searchQuery && <span className={`ml-2 ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>(filtered)</span>}</span>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className={`p-12 rounded-xl border-2 border-dashed text-center ${darkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-slate-50 border-slate-300'}`}>
                    <ListTodo size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                    <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {searchQuery ? 'No tasks matching' : 'No tasks yet'}
                    </p>
                    <p className={`text-base mb-6 ${darkMode ? 'text-slate-600' : 'text-slate-600'}`}>
                      {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
                    </p>
                    {!searchQuery && (
                      <button 
                        onClick={() => { setEditingTask(null); setFormData({ title: "", description: "", deadline: "", status: "PENDING", priority: "NORMAL", tags: "" }); setIsModalOpen(true); }}
                        className={`px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all ${
                          darkMode 
                            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                            : 'bg-slate-900 text-slate-100 hover:bg-slate-800'
                        }`}
                      >
                        <Plus size={18} /> Create First Task
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task, idx) => {
                      const isCompleted = task.completed || task.status === "COMPLETED";
                      const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isCompleted;
                      const taskIndex = tasks.findIndex(t => t.id === task.id);
                      
                      return (
                        <div 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => onDragStart(e, taskIndex)}
                          onDragOver={(e) => onDragOver(e, taskIndex)}
                          onDrop={(e) => onDrop(e, taskIndex)}
                          className={`group transition-all duration-300 ${draggingIndex === taskIndex ? 'opacity-60 scale-95' : ''} ${dragOverIndex === taskIndex && draggingIndex !== taskIndex ? 'ring-2 ring-dashed ring-indigo-400' : ''}`}
                        >
                          {/* Premium Card Design */}
                          <div className={`rounded-xl border p-6 flex flex-col transition-all duration-300 ${
                            isCompleted
                              ? darkMode ? 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/40' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              : darkMode ? 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/5' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-300/20'
                          }`}>
                            
                            {/* Top Row - Drag Handle, Checkbox, Title, and Badges */}
                            <div className="flex items-center justify-between gap-3 mb-4 w-full">
                              {/* Left Section - Checkbox and Title */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Drag Handle */}
                                <button
                                  title="Drag to reorder"
                                  className={`shrink-0 p-1.5 rounded transition-all cursor-grab active:cursor-grabbing ${darkMode ? 'text-slate-700 hover:text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                >
                                  <Menu size={18} />
                                </button>

                                {/* Checkbox */}
                                <button 
                                  onClick={() => toggleTaskCompletion(task)}
                                  className={`shrink-0 transition-all duration-300 hover:scale-110`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={24} className={`${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
                                  ) : (
                                    <Circle size={24} strokeWidth={1.5} className={`${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                  )}
                                </button>

                                {/* Title */}
                                <div className="relative min-w-0 flex-1 overflow-hidden">
                                  <p className={`text-base font-bold leading-tight truncate ${
                                    isCompleted 
                                      ? (darkMode ? 'text-slate-600' : 'text-slate-400')
                                      : (darkMode ? 'text-slate-50' : 'text-slate-900')
                                  }`}>
                                    {task.title}
                                  </p>
                                  <span className={`absolute left-0 top-1/2 h-[2.5px] bg-gradient-to-r from-emerald-400 to-emerald-500 transform -translate-y-1/2 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
                                </div>
                              </div>

                              {/* Right Section - Priority, Deadline, Tags, and Action Buttons */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0 justify-end ml-auto">
                                {/* Priority Badge */}
                                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors gap-1 whitespace-nowrap ${
                                  task.priority === 'HIGH' 
                                    ? darkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'
                                    : task.priority === 'LOW' 
                                    ? darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : darkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}>
                                  {task.priority === 'HIGH' && <AlertTriangle size={11} />}
                                  {task.priority === 'NORMAL' && <Zap size={11} />}
                                  {task.priority === 'LOW' && <CheckCircle size={11} />}
                                  {task.priority}
                                </span>

                                {/* Deadline Badge */}
                                {task.deadline && (
                                  <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border inline-flex items-center gap-1 whitespace-nowrap ${
                                    isOverdue
                                      ? darkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-600 border-red-200'
                                      : darkMode ? 'bg-slate-800/50 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    <Calendar size={12} />
                                    Due {(() => {
                                      try {
                                        const date = new Date(task.deadline);
                                        if (isNaN(date.getTime())) {
                                          return 'Invalid Date';
                                        }
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                      } catch (e) {
                                        return 'Invalid Date';
                                      }
                                    })()}
                                  </span>
                                )}

                                {/* Tags Badges - Limited to first 2 tags for space */}
                                {task.tags && task.tags.trim().length > 0 && task.tags.split(',').slice(0, 2).map((tag, i) => {
                                  const trimmed = tag.trim();
                                  if (!trimmed) return null;
                                  return (
                                    <span key={i} className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border inline-flex items-center gap-1 whitespace-nowrap ${
                                      darkMode 
                                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                                        : 'bg-purple-100 text-purple-700 border-purple-200'
                                    }`}>
                                      <Tag size={11} />
                                      {trimmed}
                                    </span>
                                  );
                                })}

                                {/* Action Buttons - Edit and Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button 
                                    onClick={() => {setEditingTask(task); setFormData(task); setIsModalOpen(true);}} 
                                    className={`p-2 rounded-lg transition-all ${
                                      darkMode 
                                        ? 'text-slate-600 hover:bg-indigo-500/20 hover:text-indigo-400' 
                                        : 'text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'
                                    }`}
                                  >
                                    <Edit2 size={16}/>
                                  </button>
                                  <button 
                                    onClick={() => requestDeleteTask(task.id)} 
                                    className={`p-2 rounded-lg transition-all ${
                                      darkMode 
                                        ? 'text-slate-600 hover:bg-red-500/20 hover:text-red-400' 
                                        : 'text-slate-500 hover:bg-red-100 hover:text-red-600'
                                    }`}
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Description Row with Created At Date/Time */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                              {/* Description */}
                              {task.description && (
                                <p className={`text-sm pl-10 leading-relaxed flex-1 ${
                                  isCompleted ? (darkMode ? 'text-slate-700' : 'text-slate-400') : (darkMode ? 'text-slate-400' : 'text-slate-600')
                                }`}>
                                  {task.description}
                                </p>
                              )}

                              {/* Created At Date/Time on the right */}
                              {getCreatedAt(task) && (() => {
                                try {
                                  const date = new Date(getCreatedAt(task));
                                  if (isNaN(date.getTime())) return null;
                                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                  return (
                                    <span className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                                      isCompleted 
                                        ? (darkMode ? 'text-slate-700' : 'text-slate-400')
                                        : (darkMode ? 'text-slate-400' : 'text-slate-600')
                                    }`}>
                                      Created at {dateStr} • {timeStr}
                                    </span>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'}`}>
            <div className={`px-6 py-6 border-b ${darkMode ? 'border-neutral-800 bg-gradient-to-r from-neutral-900/80 to-neutral-800/40' : 'border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <p className={`text-xs font-semibold uppercase tracking-widest mt-1.5 ${darkMode ? 'text-slate-500' : 'text-indigo-700'}`}>
                    {editingTask ? "Update your task details below" : "Add a new task to your growing list"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'}`}
                >
                  <X size={24}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Task Title *</label>
                <input 
                  placeholder="What needs to be done?" 
                  required
                  autoFocus
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all text-base font-medium ${
                    darkMode 
                      ? 'bg-neutral-800 border-neutral-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                  }`}
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority Selector */}
                <div className="space-y-2">
                  <label className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Priority Level</label>
                  <div className="flex gap-2">
                    {['LOW', 'NORMAL', 'HIGH'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({...formData, priority: level})}
                        className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2 ${
                          formData.priority === level
                            ? level === 'HIGH'
                              ? darkMode ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-100 border-red-400 text-red-700'
                              : level === 'LOW'
                              ? darkMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-emerald-100 border-emerald-400 text-emerald-700'
                              : darkMode ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-indigo-100 border-indigo-400 text-indigo-700'
                            : darkMode ? 'bg-neutral-800 border-neutral-700 text-slate-400 hover:border-slate-600' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {level === 'HIGH' && <AlertTriangle size={14} className="mr-1" />}
                        {level === 'NORMAL' && <Zap size={14} className="mr-1" />}
                        {level === 'LOW' && <CheckCircle size={14} className="mr-1" />}
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selector */}
                <div className="space-y-2">
                  <label className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Due Date</label>
                  <div className="relative group">
                    <input 
                      type="date"
                      className={`w-full px-4 py-2.5 pr-12 rounded-lg border-2 outline-none transition-all text-base font-medium ${
                        darkMode 
                          ? 'bg-neutral-800 border-neutral-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 group-hover:border-slate-600' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 group-hover:border-slate-400'
                      }`}
                      value={formData.deadline} 
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tags</label>
                <input
                  placeholder="e.g. personal, office, urgent"
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all text-base ${
                    darkMode
                      ? 'bg-neutral-800 border-neutral-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                  }`}
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.split(',').filter(t => t.trim()).map((tag, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          darkMode 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                            : 'bg-purple-100 text-purple-700 border border-purple-300'
                        }`}
                      >
                        <Tag size={12} />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                <textarea 
                  placeholder="Add details..." 
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none h-28 resize-none transition-all text-base font-medium ${
                    darkMode 
                      ? 'bg-neutral-800 border-neutral-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                  }`}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className={`flex gap-3 pt-4 border-t ${darkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all text-base ${darkMode ? 'bg-neutral-800 text-slate-300 hover:bg-neutral-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all text-base ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-slate-100 hover:bg-slate-800'}`}
                >
                  {editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border text-center ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Logout?</h3>
            <p className={`text-sm mb-6 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)} 
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors text-sm ${darkMode ? 'bg-neutral-800 text-slate-300 hover:bg-neutral-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Cancel
              </button>
              <button 
                onClick={onLogout} 
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border text-center ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Delete task?</h3>
            <p className={`text-sm mb-6 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)} 
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors text-sm ${darkMode ? 'bg-neutral-800 text-slate-300 hover:bg-neutral-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteTask(confirmDeleteId)} 
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-6 top-6 z-[999] w-[320px]">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${toast.type === 'success' ? 'bg-green-600 text-white border-green-700' : toast.type === 'error' ? 'bg-red-600 text-white border-red-700' : 'bg-amber-600 text-white border-amber-700'}`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}</p>
                <p className="text-sm mt-0.5 opacity-90">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-white opacity-80 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNavItem({ icon, label, active = false, onClick, darkMode = false, sidebarOpen = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
        active 
          ? darkMode 
            ? 'bg-slate-800/50 text-slate-100 border-l-2 border-slate-600' 
            : 'bg-slate-200/50 text-slate-900 border-l-2 border-slate-600'
          : darkMode 
            ? 'text-slate-600 hover:text-slate-400 hover:bg-neutral-900/50' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      }`}
      title={!sidebarOpen ? label : ''}
    >
      {icon}
      {sidebarOpen && <span>{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon, iconBg, iconColor, darkMode = false }) {
  return (
    <div className={`p-5 rounded-xl border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;