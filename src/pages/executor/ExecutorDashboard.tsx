import React from 'react';
import { MOCK_TASKS } from '../../lib/mockData';

const ExecutorDashboard: React.FC = () => {
  const availableTasks = MOCK_TASKS.filter(t => t.status === 'open');

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Доступные задания</h1>
      <div className="space-y-4">
        {availableTasks.length > 0 ? (
          availableTasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{task.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-medium text-blue-600">{task.price} ₽</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform">
                  Взять в работу
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">Нет доступных заданий</p>
        )}
      </div>
    </div>
  );
};

export default ExecutorDashboard;
