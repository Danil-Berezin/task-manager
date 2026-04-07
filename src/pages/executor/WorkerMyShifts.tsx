import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, Banknote } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type ApplicationWithTask = Database['public']['Tables']['applications']['Row'] & {
  task: Database['public']['Tables']['tasks']['Row'] | null;
};

import WorkerBottomNav from '../../components/WorkerBottomNav';

const WorkerMyShifts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [applications, setApplications] = useState<ApplicationWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const currentUserId = localStorage.getItem('my_user_id');
      
      if (!currentUserId) {
        console.error('User not logged in');
        return;
      }
      setUserId(currentUserId);

      const { data, error } = await supabase
        .from('applications')
        .select('*, task:tasks(*)')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data because TypeScript might not infer the joined relation correctly 
      // without more complex type setup
      setApplications(data as unknown as ApplicationWithTask[]);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    if (!confirm('Вы уверены, что хотите отменить отклик?')) return;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      console.error('Error canceling application:', err);
      alert('Не удалось отменить отклик');
    }
  };

  const handleContact = () => {
    alert('Функция чата в разработке');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter applications
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  // We can also handle 'rejected' if needed, but user said maybe later.

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-2 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Мои задачи</h1>
          {userId && <NotificationBell userId={userId} />}
        </div>
        
        {/* Segmented Control */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'active' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'history' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            История
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : activeTab === 'active' ? (
          <>
            {/* Approved Section */}
            {approvedApplications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Назначенные ({approvedApplications.length})
                </h2>
                <div className="space-y-3">
                  {approvedApplications.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {app.task?.title || 'Задач удалена'}
                        </h3>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{app.task ? formatDate(app.task.start_time) : '-'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Banknote className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{app.task?.price} ₽</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-50">
                        <button 
                          onClick={handleContact}
                          className="w-full border border-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          Связаться с заказчиком
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Section */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-2">
                Ожидают подтверждения ({pendingApplications.length})
              </h2>
              {pendingApplications.length === 0 && approvedApplications.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">
                  У вас нет активных откликов
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApplications.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {app.task?.title || 'Задача удалена'}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg whitespace-nowrap">
                          На проверке
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{app.task ? formatDate(app.task.start_time) : '-'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Banknote className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{app.task?.price} ₽</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-50">
                        <button 
                          onClick={() => handleCancelApplication(app.id)}
                          className="w-full text-red-500 font-medium py-2 text-sm hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Отменить отклик
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            История пуста (В разработке)
          </div>
        )}
      </div>

      <WorkerBottomNav />
    </div>
  );
};

export default WorkerMyShifts;
