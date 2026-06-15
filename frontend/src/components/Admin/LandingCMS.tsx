import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = 'http://localhost:8000/api';

export const LandingCMS: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = useAuthStore(state => state.token);
  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    about_content: '',
    feature1_title: '',
    feature1_desc: '',
    feature2_title: '',
    feature2_desc: '',
    feature3_title: '',
    feature3_desc: '',
    footer_text: '',
    primary_color: '#d97706'
  });

  useEffect(() => {
    fetch(`${API_URL}/settings/landing`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          hero_title: data.hero_title || '',
          hero_subtitle: data.hero_subtitle || '',
          hero_image_url: data.hero_image_url || '',
          about_content: data.about_content || '',
          feature1_title: data.feature1_title || 'Ghi chép lịch sử',
          feature1_desc: data.feature1_desc || 'Hệ thống lưu trữ phả hệ, gia huấn, và những dấu ấn lịch sử đáng tự hào của các thế hệ cha ông.',
          feature2_title: data.feature2_title || 'Kết nối dòng tộc',
          feature2_desc: data.feature2_desc || 'Gắn kết con cháu khắp nơi trên thế giới, cùng nhau hướng về cội nguồn, giữ gìn truyền thống gia phong.',
          feature3_title: data.feature3_title || 'Phả đồ trực quan',
          feature3_desc: data.feature3_desc || 'Cây gia phả tương tác thông minh, giúp dễ dàng tra cứu, thêm mới và quan sát tổng thể cấu trúc các thế hệ.',
          footer_text: data.footer_text || 'Hệ thống Quản trị Gia phả DTGen',
          primary_color: data.primary_color || '#d97706'
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings/landing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Đã lưu cấu hình thành công!');
      } else {
        alert('Có lỗi xảy ra khi lưu!');
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Cấu hình Landing Page (Trang chủ)</h2>
          <p className="text-sm text-gray-500">Thay đổi nội dung hiển thị ở trang giới thiệu dòng họ ngoài cùng</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Hero Section settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Khu vực Ảnh Bìa (Hero)</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chính (Tên dòng họ)</label>
                <input 
                  type="text" 
                  name="hero_title"
                  value={formData.hero_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="VD: GIA PHẢ HỌ NGUYỄN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề (Châm ngôn)</label>
                <input 
                  type="text" 
                  name="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="VD: Uống nước nhớ nguồn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Ảnh nền (Image URL)</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      name="hero_image_url"
                      value={formData.hero_image_url}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {formData.hero_image_url && (
                  <div className="mt-3 aspect-video max-w-sm rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative flex items-center justify-center">
                    <span className="absolute text-sm text-gray-400">Đường dẫn ảnh không hợp lệ hoặc đang tải...</span>
                    <img 
                      src={formData.hero_image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover relative z-10 transition-opacity duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '1';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About Section settings */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Khu vực Giới thiệu (Nguồn cội)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài viết (Hỗ trợ xuống dòng)</label>
              <textarea 
                name="about_content"
                value={formData.about_content}
                onChange={handleChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nhập nội dung lịch sử hình thành..."
              />
            </div>
          </div>

          {/* Features Section settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Khu vực Tính năng (3 Thẻ)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-sm text-gray-800 mb-3">Thẻ 1</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input type="text" name="feature1_title" value={formData.feature1_title} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea name="feature1_desc" value={formData.feature1_desc} onChange={handleChange} rows={3} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-sm text-gray-800 mb-3">Thẻ 2</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input type="text" name="feature2_title" value={formData.feature2_title} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea name="feature2_desc" value={formData.feature2_desc} onChange={handleChange} rows={3} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-sm text-gray-800 mb-3">Thẻ 3</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input type="text" name="feature3_title" value={formData.feature3_title} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea name="feature3_desc" value={formData.feature3_desc} onChange={handleChange} rows={3} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & General Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Cài đặt chung & Chân trang</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo (Primary Color - HEX)</label>
                <div className="flex space-x-2 items-center">
                  <input type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                  <input type="text" name="primary_color" value={formData.primary_color} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase" placeholder="#D97706" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dòng chữ bản quyền (Footer)</label>
                <input type="text" name="footer_text" value={formData.footer_text} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="VD: Hệ thống Quản trị Gia phả DTGen" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
