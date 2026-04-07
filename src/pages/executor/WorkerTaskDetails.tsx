import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Clock, Banknote, CheckCircle, Loader2, XCircle } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import { supabase } from '../../lib/supabase';
import { getOrCreateTestUser } from '../../lib/auth';
import type { Database } from '../../types/database';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  workers_current: number;
};
type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];

const WorkerTaskDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const currentUserId = await getOrCreateTestUser();
        setUserId(currentUserId);

        // 0. Check verification
        const { data: userData } = await supabase
          .from('users')
          .select('is_verified')
          .eq('id', currentUserId)
          .single();
        
        if (userData) {
          setIsVerified(!!userData.is_verified);
        }

        // 1. Fetch task data
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (taskError) throw taskError;
        if (!taskData) throw new Error('Task not found');

        // 2. Fetch approved applications count for workers_current
        const { count: approvedCount, error: countError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', id)
          .eq('status', 'approved');

        if (countError) throw countError;

        setTask({
          ...taskData,
          workers_current: approvedCount || 0
        });

        // 3. Check if current user has applied
        const { data: applicationData } = await supabase
          .from('applications')
          .select('*')
          .eq('task_id', id)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (applicationData) {
          setHasApplied(true);
          setApplicationStatus(applicationData.status);
        }

      } catch (error) {
        console.error('Error fetching task details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const handleApply = async () => {
    if (hasApplied || !id) return;
    if (!isVerified) return;
    
    try {
      setIsApplying(true);
      const userId = await getOrCreateTestUser();
      
      const newApplication: ApplicationInsert = {
        task_id: id,
        user_id: userId,
        status: 'pending'
      };

      const { error } = await supabase
        .from('applications')
        .insert(newApplication);

      if (error) throw error;
      
      setHasApplied(true);
      setApplicationStatus('pending');
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error applying:', error);
      alert('Ошибка при отправке отклика');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 mb-4">Задача не найдена</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 font-medium hover:underline"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const progressPercent = (task.workers_current / task.workers_needed) * 100;
  
  // Format date and time
  const startDate = new Date(task.start_time);
  const dateStr = startDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const timeStr = startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = `${dateStr}, ${timeStr}`;

  // Parse description if it's a string, or split by newlines
  const descriptionItems = task.description 
    ? task.description.split('\n').filter(item => item.trim().length > 0)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      {/* Toast Notification */}
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
        }`}
      >
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm">Заявка успешно отправлена</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3 p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Заявка #{task.id.slice(0, 8)}...</h1>
        </div>
        {userId && <NotificationBell userId={userId} />}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Title & Progress */}
        <div className="bg-white p-5 mb-3 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {task.title}
          </h2>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 font-medium">Набрано</span>
              <span className="font-bold text-blue-600">
                {task.workers_current} из {task.workers_needed}
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-white p-5 mb-3 border-y border-gray-100">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="space-y-1">
              <div className="flex items-center text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Дата и время
              </div>
              <p className="font-semibold text-gray-900 text-lg">{formattedDate}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Длительность
              </div>
              <p className="font-semibold text-gray-900 text-lg">
                {/* Duration is not in DB schema, defaulting to static or calculating if end_time exists */}
                {task.end_time ? 'До завершения' : 'По факту'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Banknote className="w-3.5 h-3.5 mr-1.5" />
                Оплата
              </div>
              <p className="font-bold text-green-600 text-xl">{task.price} ₽</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Доп. час
              </div>
              <p className="font-semibold text-gray-900 text-lg">
                {task.price_overtime ? `${task.price_overtime} ₽/ч` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-5 mb-3 border-y border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            Адрес объекта
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-3 pl-7">
            {task.address}
          </p>
          <button className="text-blue-600 text-sm font-semibold pl-7 hover:underline">
            Показать на карте
          </button>
        </div>

        {/* Description */}
        <div className="bg-white p-5 border-y border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Состав работ</h3>
          {descriptionItems.length > 0 ? (
            <ul className="space-y-3 pl-1">
              {descriptionItems.map((item, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Описание отсутствует</p>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 pb-safe z-20">
        <button 
          onClick={handleApply}
          disabled={hasApplied || isApplying || !isVerified}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
            applicationStatus === 'approved'
              ? 'bg-green-600 text-white shadow-none cursor-default'
              : applicationStatus === 'rejected'
                ? 'bg-red-500 text-white shadow-none cursor-default'
                : hasApplied 
                  ? 'bg-white border-2 border-green-500 text-green-600 shadow-none cursor-default'
                  : !isVerified
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : isApplying
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'
          }`}
        >
          {isApplying ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : applicationStatus === 'approved' ? (
            <>
              <CheckCircle className="w-6 h-6" />
              ВЫ НАЗНАЧЕНЫ
            </>
          ) : applicationStatus === 'rejected' ? (
            <>
              <XCircle className="w-6 h-6" />
              ЗАЯВКА ОТКЛОНЕНА
            </>
          ) : hasApplied ? (
            'ВЫ ОТКЛИКНУЛИСЬ'
          ) : !isVerified ? (
            'Ожидание проверки профиля'
          ) : (
            'ОТКЛИКНУТЬСЯ'
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkerTaskDetails;
