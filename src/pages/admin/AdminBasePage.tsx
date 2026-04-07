import React, { useState, useEffect } from 'react';
import { Search, Trash2, Check, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';
import AdminBottomNav from '../../components/AdminBottomNav';

type User = Database['public']['Tables']['users']['Row'];

const AdminBasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    phone: '',
    telegram_id: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'worker')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_verified: true } : u
      ));
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Ошибка при подтверждении');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Ошибка при удалении');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.telegram_id) {
        alert('Заполните обязательные поля (Имя и Telegram ID)');
        return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
            full_name: newUser.full_name,
            phone: newUser.phone || null,
            telegram_id: parseInt(newUser.telegram_id),
            role: 'worker',
            is_verified: true
        }])
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => [data, ...prev]);
      setIsModalOpen(false);
      setNewUser({ full_name: '', phone: '', telegram_id: '' });
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Ошибка при добавлении пользователя. Возможно, такой Telegram ID уже существует.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone && user.phone.includes(searchQuery))
  );

  const pendingUsers = filteredUsers.filter(u => !u.is_verified);
  const activeUsers = filteredUsers.filter(u => u.is_verified);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header & Search */}
      <div className="bg-white px-4 pt-6 pb-2 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Исполнители</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Найти по имени или телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-gray-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'requests' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Заявки</span>
            {users.filter(u => !u.is_verified).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                {users.filter(u => !u.is_verified).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Загрузка...</div>
        ) : activeTab === 'requests' ? (
          // Requests List
          pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <div 
                key={user.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                      {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-500">{user.phone || 'Нет телефона'}</p>
                      {user.specialty && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {user.specialty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleApprove(user.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium active:opacity-90 flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Принять</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium active:bg-red-100 flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Отклонить</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              Нет новых заявок
            </div>
          )
        ) : (
          // Active Users List
          activeUsers.length > 0 ? (
            activeUsers.map((user) => (
              <div 
                key={user.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                    {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.full_name}</h3>
                    <div className="flex flex-col text-sm text-gray-500">
                      <span>{user.phone || 'Нет телефона'}</span>
                      {user.specialty && <span className="text-xs text-blue-600">{user.specialty}</span>}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              Список исполнителей пуст
            </div>
          )
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Добавить исполнителя</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
                <input
                  type="number"
                  required
                  value={newUser.telegram_id}
                  onChange={e => setNewUser({...newUser, telegram_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="123456789"
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
};

export default AdminBasePage;
