import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, LogOut, Loader2 } from 'lucide-react';
import AdminBottomNav from '../../components/AdminBottomNav';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type TaskWithStats = Database['public']['Tables']['tasks']['Row'] & {
  workers_current?: number;
  pending_count?: number;
  applications?: Database['public']['Tables']['applications']['Row'][];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'full'>('active');

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('admin-dashboard-tasks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          setTasks(prev => prev.map(task => 
            task.id === payload.new.id 
              ? { ...task, ...payload.new } 
              : task
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, applications(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedTasks = (data || []).map((task: any) => {
        const apps: any[] = task.applications || [];
        // If workers_current is not yet in DB, we calculate it. 
        // If pending_count is in DB, we use it, otherwise fallback to calculation (though now it should be in DB)
        return {
          ...task,
          workers_current: task.workers_current !== undefined ? task.workers_current : apps.filter(a => a.status === 'approved').length,
          pending_count: task.pending_count !== undefined ? task.pending_count : apps.filter(a => a.status === 'pending').length
        } as TaskWithStats;
      });

      setTasks(processedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear any local storage if needed (e.g. role)
    localStorage.removeItem('userRole');
    // Navigate to role selection screen
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'active') {
      return task.status === 'open';
    } else {
      return task.status === 'full' || task.status === 'completed';
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 sticky top-0 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Мои заявки</h1>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'full'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Укомплектованные
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {activeTab === 'active' 
              ? 'Нет активных заявок.' 
              : 'Нет укомплектованных заявок.'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const approvedCount = task.workers_current || 0;
            const isFull = approvedCount >= task.workers_needed;
            const pendingCount = task.pending_count || 0;
            
            return (
              <div 
                key={task.id} 
                onClick={() => navigate(`/admin/task/${task.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform duration-100 cursor-pointer"
              >
                {/* Top Row: Title & Status Badge */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight flex-1 mr-2">
                    {task.title}
                  </h3>
                  <span 
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                      isFull 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isFull ? 'Укомплектовано' : `Набор: ${approvedCount}/${task.workers_needed}`}
                  </span>
                </div>

                {/* Middle Row: Date */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{formatDate(task.start_time)}</span>
                </div>

                {/* Bottom Row: Responses Status */}
                <div className="flex items-center pt-3 border-t border-gray-50">
                  {pendingCount > 0 ? (
                    <div className="flex items-center text-blue-600">
                      <Bell className="w-4 h-4 mr-2 fill-current" />
                      <span className="text-sm font-medium">
                        Откликов: {pendingCount} (Требуют проверки)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 pl-1">
                      Новых откликов нет
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
};

export default AdminDashboard;
