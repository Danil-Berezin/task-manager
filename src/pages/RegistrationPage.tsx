import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, UserPlus, Loader2 } from 'lucide-react';

interface RegistrationPageProps {
  telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  onSuccess: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ telegramUser, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
    phone: '',
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simple phone mask logic: keep only numbers and +, max length check
    let value = e.target.value;
    
    // Allow only digits and plus sign at start
    value = value.replace(/[^\d+]/g, '');
    
    // Basic formatting aid - if user starts typing 7 or 8, add +7
    if (value.length === 1 && (value === '7' || value === '8')) {
      value = '+7';
    }

    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('users')
        .insert([{
          telegram_id: telegramUser.id,
          full_name: formData.full_name,
          phone: formData.phone,
          specialty: null, // Admin will assign this later
          role: 'worker',
          is_verified: false
        }]);

      if (error) throw error;

      // Successfully registered
      onSuccess();
    } catch (err) {
      console.error('Error registering user:', err);
      alert('Ошибка при регистрации. Возможно, пользователь уже существует.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-500 text-sm max-w-[250px]">
            Для доступа к заданиям, пожалуйста, заполните небольшую анкету
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Ваше имя
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="block w-full bg-gray-50 border-0 rounded-xl py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none"
                placeholder="Иван Иванов"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Телефон
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                className="block w-full bg-gray-50 border-0 rounded-xl py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none"
                placeholder="+7 (999) 000-00-00"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 transition-all duration-200 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
