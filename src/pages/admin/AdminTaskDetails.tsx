import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, X, MapPin, Clock, Banknote, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type ApplicationWithUser = Database['public']['Tables']['applications']['Row'] & {
  user: User;
};

const AdminTaskDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [candidates, setCandidates] = useState<ApplicationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();

      const channel = supabase
        .channel(`task-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'applications', filter: `task_id=eq.${id}` },
          () => {
            fetchCandidates();
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'applications', filter: `task_id=eq.${id}` },
          (payload) => {
            console.log('Deleted ID:', payload.old.id);
            setCandidates((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'applications', filter: `task_id=eq.${id}` },
          (payload) => {
            setCandidates((prev) => prev.map((item) => 
              item.id === payload.new.id ? { ...item, ...payload.new } : item 
            ));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const fetchCandidates = async () => {
    if (!id) return;
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*, user:users(*)')
        .eq('task_id', id);

      if (applicationsError) throw applicationsError;
      
      setCandidates((applicationsData as unknown) as ApplicationWithUser[]);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // 1. Fetch Task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // 2. Fetch Candidates
      await fetchCandidates();
      
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const updateData: Database['public']['Tables']['applications']['Update'] = { status: newStatus };
      
      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setCandidates(prev => prev.map(c => 
        c.id === applicationId ? { ...c, status: newStatus } : c
      ));

    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!id) return;
    
    const isConfirmed = window.confirm("Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.");
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      navigate('/admin');
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Ошибка удаления заявки');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 mb-4">Заявка не найдена</div>
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-500 font-medium"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const approvedCount = candidates.filter(c => c.status === 'approved').length;
  const progressPercent = Math.min((approvedCount / task.workers_needed) * 100, 100);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-400 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 truncate pr-4">
          {task.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Progress Bar */}
        <div className="bg-white px-4 pt-4 pb-6 mb-2 border-b border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{approvedCount}</span>
              <span className="text-gray-400 text-lg font-medium">/{task.workers_needed}</span>
            </div>
            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
              approvedCount >= task.workers_needed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {approvedCount >= task.workers_needed ? 'Укомплектовано' : 'В процессе'}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                approvedCount >= task.workers_needed ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Candidates Section */}
        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
            Кандидаты ({candidates.length})
          </h2>
          
          <div className="space-y-3">
            {candidates.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-white rounded-xl border border-gray-100 border-dashed">
                Пока нет откликов
              </div>
            ) : (
              candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className={`bg-white p-3 rounded-xl shadow-sm border ${
                    candidate.status === 'rejected' ? 'border-red-100 opacity-60' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center flex-1 overflow-hidden mr-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm mr-3 shrink-0">
                        {candidate.user.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center mb-0.5">
                          <span className="font-semibold text-gray-900 truncate mr-2">
                            {candidate.user.full_name}
                          </span>
                        </div>
                        <div className="flex gap-1 overflow-hidden">
                          {candidate.user.specialty && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded truncate">
                              {candidate.user.specialty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center">
                      {candidate.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(candidate.id, 'rejected')}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 active:scale-90 transition-transform"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(candidate.id, 'approved')}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-green-50 text-green-600 active:scale-90 transition-transform"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {candidate.status === 'approved' && (
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          Назначен
                        </span>
                      )}

                      {candidate.status === 'rejected' && (
                        <span className="text-sm font-medium text-red-400">
                          Отклонен
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Info Section */}
        <div className="px-4 py-2">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Информация о задаче</h3>
            <div className="space-y-3">
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400 shrink-0" />
                <span>{task.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                <span>{formatDate(task.start_time)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Banknote className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                <span>{task.price} ₽</span>
              </div>
              {task.description && (
                <div className="pt-2 mt-2 border-t border-gray-50 text-sm text-gray-500">
                  {task.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 pb-safe">
          <button 
            onClick={handleDeleteTask}
            className="w-full py-3 text-red-500 font-medium text-sm hover:bg-red-50 rounded-xl transition-colors"
          >
            Отменить заявку
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetails;
