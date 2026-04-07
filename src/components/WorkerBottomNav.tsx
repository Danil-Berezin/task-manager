import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Briefcase, User } from 'lucide-react';

const WorkerBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-2 pb-safe z-50">
      <div className="flex justify-around items-center">
        <button 
          onClick={() => navigate('/executor')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/executor' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Поиск</span>
        </button>

        <button 
          onClick={() => navigate('/executor/shifts')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/executor/shifts' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium">Мои смены</span>
        </button>

        <button 
          onClick={() => navigate('/executor/profile')}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${
            location.pathname === '/executor/profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Профиль</span>
        </button>
      </div>
    </div>
  );
};

export default WorkerBottomNav;
