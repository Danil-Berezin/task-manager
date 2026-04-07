import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, PlusCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    fetchPendingUsersCount();
  }, []);

  const fetchPendingUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'worker')
        .eq('is_verified', false);
      
      if (!error && count !== null) {
        setPendingUsersCount(count);
      }
    } catch (error) {
      console.error('Error fetching pending users count:', error);
    }
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-6">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/admin')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/admin' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <List className="w-6 h-6" />
          <span className="text-[10px] font-medium">Заявки</span>
        </button>
        
        <button 
          onClick={() => navigate('/admin/create')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/admin/create' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PlusCircle className={`w-8 h-8 ${location.pathname === '/admin/create' ? 'text-blue-600' : 'text-blue-500'}`} />
          <span className="text-[10px] font-medium">Создать</span>
        </button>
        
        <button 
          onClick={() => navigate('/admin/base')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/admin/base' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Users className="w-6 h-6" />
            {pendingUsersCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                {pendingUsersCount}
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium">База</span>
        </button>
      </div>
    </div>
  );
};

export default AdminBottomNav;
