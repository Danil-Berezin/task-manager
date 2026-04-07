import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Minus, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    datetime: '',
    priceShift: '',
    priceExtra: '',
    durationHours: '',
    endTime: '',
    peopleNeeded: 1,
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePeopleChange = (increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      peopleNeeded: increment 
        ? prev.peopleNeeded + 1 
        : Math.max(1, prev.peopleNeeded - 1)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.title || !formData.address || !formData.datetime || !formData.priceShift) {
      setError('Заполните обязательные поля');
      setLoading(false);
      return;
    }

    try {
      const newTask: TaskInsert = {
        title: formData.title,
        address: formData.address,
        start_time: new Date(formData.datetime).toISOString(),
        // end_time: we could calculate this from start_time + durationHours or use the time input
        // For now let's just use start_time as a placeholder or null if schema allows
        // The schema has end_time, let's try to set it if duration is provided
        end_time: formData.endTime ? new Date(`${formData.datetime.split('T')[0]}T${formData.endTime}`).toISOString() : null, 
        price: Number(formData.priceShift),
        price_overtime: formData.priceExtra ? Number(formData.priceExtra) : null,
        workers_needed: formData.peopleNeeded,
        description: formData.description,
        status: 'open'
      };

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(newTask);

      if (insertError) throw insertError;

      navigate('/admin');
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Новая заявка</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 pb-32 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Название заявки <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Например: Разгрузка фуры"
              className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/50"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Адрес объекта <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Москва, ул. Ленина..."
                className="w-full bg-gray-50 text-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/50"
              />
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* DateTime */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Дата и время начала <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              name="datetime"
              required
              value={formData.datetime}
              onChange={handleInputChange}
              className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/50"
            />
          </div>

          {/* Finances Group */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Финансы <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <input
                  type="number"
                  name="priceShift"
                  required
                  value={formData.priceShift}
                  onChange={handleInputChange}
                  placeholder="За смену"
                  className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-500/50"
                />
                <span className="text-xs text-gray-400 ml-1">Руб/смена</span>
              </div>
              <div className="space-y-1">
                <input
                  type="number"
                  name="priceExtra"
                  value={formData.priceExtra}
                  onChange={handleInputChange}
                  placeholder="Доп. час"
                  className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-500/50"
                />
                <span className="text-xs text-gray-400 ml-1">Руб/час</span>
              </div>
            </div>
          </div>

          {/* Duration Group */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Длительность</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <input
                  type="number"
                  name="durationHours"
                  value={formData.durationHours}
                  onChange={handleInputChange}
                  placeholder="Часов"
                  className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-500/50"
                />
                <span className="text-xs text-gray-400 ml-1">Всего часов</span>
              </div>
              <div className="space-y-1">
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-500/50"
                />
                <span className="text-xs text-gray-400 ml-1">До скольки</span>
              </div>
            </div>
          </div>

          {/* People Counter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">Требуется работников</label>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-transparent">
              <button
                type="button"
                onClick={() => handlePeopleChange(false)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <span className="text-2xl font-bold text-gray-900">{formData.peopleNeeded}</span>
              
              <button
                type="button"
                onClick={() => handlePeopleChange(true)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-600 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Состав работ</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Опишите подробно, что нужно сделать..."
              className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/50 resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Публикуем...
                </>
              ) : (
                'Опубликовать заявку'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskPage;
