import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  LogOut,
  Save,
  Loader2,
  X
} from 'lucide-react';

import WorkerBottomNav from '../../components/WorkerBottomNav';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type UserRow = Database['public']['Tables']['users']['Row'];

const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserRow | null>(null);
  const [stats, setStats] = useState({
    completed: 0,
    earned: 0
  });

  // Edit Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    specialty: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('my_user_id');
      
      if (!userId) {
        console.error('User not logged in');
        navigate('/');
        return;
      }

      // 1. Fetch User Data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        specialty: userData.specialty || ''
      });

      // 2. Fetch Stats
      // Count 'approved' applications as completed for now
      // And sum their prices
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('*, task:tasks(*)')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (appsError) throw appsError;

      if (applications) {
        const completedCount = applications.length;
        // Need to cast because of the join
        const earnedAmount = applications.reduce((sum, app: any) => {
          return sum + (app.task?.price || 0);
        }, 0);

        setStats({
          completed: completedCount,
          earned: earnedAmount
        });
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          specialty: formData.specialty
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? ({
        ...prev,
        full_name: formData.full_name,
        phone: formData.phone || null,
        specialty: formData.specialty || null
      }) : null);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    // We might want to clear user_id too if we want full logout
    // localStorage.removeItem('my_user_id'); 
    navigate('/');
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Пользователь не найден</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 font-medium"
        >
          На главную
        </button>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
        {isEditing && (
          <button 
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <span className="text-blue-600 text-3xl font-bold">
              {initials}
            </span>
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Имя Фамилия</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Специальность</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                  placeholder="Например: Грузчик"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Сохранить</span>
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">{user.full_name}</h2>
              <p className="text-gray-500 mb-3">{user.phone || 'Телефон не указан'}</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {user.specialty ? (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    {user.specialty}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Специальность не указана</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Выполнено заявок</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Заработано</p>
            <p className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {stats.earned.toLocaleString()} ₽
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                <Edit className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium flex-1 text-left">Редактировать анкету</span>
            </button>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-4 text-red-500 font-medium flex items-center justify-center space-x-2 active:opacity-70"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>

      <WorkerBottomNav />
    </div>
  );
};

export default WorkerProfile;