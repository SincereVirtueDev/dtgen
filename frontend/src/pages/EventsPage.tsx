import React, { useEffect } from 'react';
import { useGenealogyStore } from '../store/useGenealogyStore';
import { Calendar as CalendarIcon, Plus, Bell } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { events, persons, fetchData, loading } = useGenealogyStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort events by month and day
  const sortedEvents = [...events].sort((a, b) => {
    if (a.lunar_month !== b.lunar_month) return (a.lunar_month || 0) - (b.lunar_month || 0);
    return (a.lunar_day || 0) - (b.lunar_day || 0);
  });

  const getPersonName = (id?: number) => {
    if (!id) return '';
    const p = persons.find(person => person.id === id);
    return p ? p.full_name : '';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Lịch dòng họ
          </h1>
          <p className="text-sm text-gray-500">Quản lý các sự kiện, ngày giỗ, lễ tết quan trọng</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Thêm sự kiện
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu lịch...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Ngày (Âm lịch)</th>
                  <th className="px-6 py-3 font-medium">Tên sự kiện</th>
                  <th className="px-6 py-3 font-medium">Loại</th>
                  <th className="px-6 py-3 font-medium">Liên quan đến</th>
                  <th className="px-6 py-3 font-medium text-right">Lặp lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-red-600">
                      {event.lunar_day}/{event.lunar_month}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.event_type === 'GIỖ' ? 'bg-gray-100 text-gray-800' :
                        event.event_type === 'LỄ TẾT' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {getPersonName(event.related_person_id) || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {event.is_recurring ? 'Hàng năm' : 'Một lần'}
                    </td>
                  </tr>
                ))}
                {sortedEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Chưa có sự kiện nào trong lịch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
