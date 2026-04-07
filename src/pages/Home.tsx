import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Loader2 } from 'lucide-react';
import { getOrCreateTestUser } from '../lib/auth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleExecutorClick = async () => {
    try {
      setLoading(true);
      await getOrCreateTestUser();
      navigate('/executor');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Ошибка входа. Проверьте консоль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Биржа Задач</h1>
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <Link
          to="/admin"
          className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Shield className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-medium text-gray-700">Я Администратор</span>
        </Link>
        <button
          onClick={handleExecutorClick}
          disabled={loading}
          className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          ) : (
            <User className="w-6 h-6 text-green-500" />
          )}
          <span className="text-lg font-medium text-gray-700">
            {loading ? 'Вход...' : 'Я Исполнитель'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Home;
