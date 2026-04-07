import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronRight, Loader2, Clock } from 'lucide-react';
import WorkerBottomNav from '../../components/WorkerBottomNav';
import NotificationBell from '../../components/NotificationBell';
import { supabase } from '../../lib/supabase';
import { getOrCreateTestUser } from '../../lib/auth';
import type { Task } from '../../types/database';

const WorkerJobFeed: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    checkVerification();
    fetchTasks();

    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            if (newTask.status === 'open') {
              setTasks(prev => [newTask, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            if (updatedTask.status !== 'open') {
              setTasks(prev => prev.filter(t => t.id !== updatedTask.id));
            } else {
              setTasks(prev => {
                const exists = prev.some(t => t.id === updatedTask.id);
                if (exists) {
                  return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
                }
                return [updatedTask, ...prev];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkVerification = async () => {
    try {
      const id = await getOrCreateTestUser();
      setUserId(id);
      const { data } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', id)
        .single();
      
      if (data) {
        setIsVerified(!!data.is_verified);
      }
    } catch (err) {
      console.error('Error checking verification:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Verification Alert */}
      {!isVerified && (
        <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Ваш профиль на проверке</h3>
              <p className="text-sm text-yellow-700 mt-0.5">
                Вы сможете откликаться на заявки после одобрения администратором.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header & Search Section */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Биржа Задач</h1>
          {userId && <NotificationBell userId={userId} />}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск задач..."
            className="w-full bg-gray-100 text-gray-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Scrollable Job List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Нет доступных задач
          </div>
        ) : (
          tasks.map((job) => (
            <div 
              key={job.id} 
              onClick={() => navigate(`/executor/task/${job.id}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform duration-100 cursor-pointer"
            >
              {/* Top Row: Title & Price */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 leading-tight flex-1 mr-2">
                  {job.title}
                </h3>
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                  {job.price} ₽
                </span>
              </div>

              {/* Middle Row: Date & Address */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{formatDate(job.start_time)}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{job.address}</span>
                </div>
              </div>

              {/* Bottom Row: People & Action */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                  Нужно {job.workers_needed} чел
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <WorkerBottomNav />
    </div>
  );
};

export default WorkerJobFeed;
