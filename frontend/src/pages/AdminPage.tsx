import React, { useEffect, useState } from 'react';
import { useGenealogyStore } from '../store/useGenealogyStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Users, LayoutTemplate, LogOut, Heart } from 'lucide-react';
import { LandingCMS } from '../components/Admin/LandingCMS';

export const AdminPage: React.FC = () => {
  const { persons, fetchData, deletePerson, loading } = useGenealogyStore();
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'landing'>('members');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá thành viên này? Tất cả dữ liệu liên quan có thể bị ảnh hưởng.')) {
      await deletePerson(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị Hệ Thống</h1>
          <p className="text-sm text-gray-500">Quản lý thành viên và cấu hình giao diện</p>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Đăng xuất
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button 
          onClick={() => setActiveTab('members')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Users className="w-4 h-4 mr-2" />
          Thành viên
        </button>
        <button 
          onClick={() => setActiveTab('landing')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'landing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Landing Page
        </button>
      </div>

      {activeTab === 'members' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Thêm thành viên
            </button>
          </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Họ và tên</th>
                  <th className="px-6 py-3 font-medium">Giới tính</th>
                  <th className="px-6 py-3 font-medium">Thế hệ (Đời)</th>
                  <th className="px-6 py-3 font-medium">Năm sinh - mất</th>
                  <th className="px-6 py-3 font-medium">Quê quán</th>
                  <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {persons.map(person => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{person.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{person.gender === 'M' ? 'Nam' : 'Nữ'}</td>
                    <td className="px-6 py-4 text-gray-600">Đời {person.generation}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {person.birth_year || '?'} - {person.status === 'DECEASED' ? (person.death_year || '?') : 'nay'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{person.origin_place || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-2 transition-colors" title="Sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(person.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" 
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {persons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Chưa có dữ liệu thành viên
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        <LandingCMS />
      )}

      {/* Footer / Donate Banner */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-orange-100 shadow-sm">
          <div className="flex items-start md:items-center space-x-4 mb-6 md:mb-0">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600 hidden md:block">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                Cảm ơn bạn đã sử dụng DTGen!
                <Heart className="w-4 h-4 text-orange-500 fill-current ml-2 md:hidden" />
              </h3>
              <p className="text-sm text-gray-600 max-w-xl mt-2 leading-relaxed">
                Phần mềm được phát triển với mong muốn giúp các dòng họ lưu giữ và truyền lại các giá trị cội nguồn. Nếu DTGen mang lại giá trị cho dòng họ của bạn, xin hãy cân nhắc ủng hộ nhóm phát triển một ly cà phê để chúng tôi có thêm động lực duy trì và nâng cấp phần mềm ngày một hoàn thiện hơn.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center space-x-5 min-w-[320px]">
              <div className="flex-1 text-right">
                <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Thông tin ủng hộ</p>
                <p className="font-bold text-gray-800 text-sm">TPBank</p>
                <p className="text-lg font-mono font-bold text-orange-600 my-0.5">89325010618</p>
                <p className="text-xs font-semibold text-gray-600">NGUYEN DUC THANH</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-lg border border-gray-100 p-1 flex-shrink-0 shadow-sm">
                <img 
                  src="https://img.vietqr.io/image/tpbank-89325010618-qr_only.png?amount=0&addInfo=Donate%20DTGen&accountName=NGUYEN%20DUC%20THANH" 
                  alt="Mã QR Chuyển khoản" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
