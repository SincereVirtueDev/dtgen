import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useGenealogyStore, type Person, type Marriage } from '../../store/useGenealogyStore';

interface PersonEditModalProps {
  person: Person | null;
  marriage?: Marriage;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonEditModal: React.FC<PersonEditModalProps> = ({ person, marriage, isOpen, onClose }) => {
  const { updatePerson, updateMarriage, persons, marriages } = useGenealogyStore();
  const [formData, setFormData] = useState<Partial<Person>>({});
  const [marriageData, setMarriageData] = useState<Partial<Marriage>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (person) {
      setFormData(person);
    }
    if (marriage) {
      setMarriageData(marriage);
    }
  }, [person, marriage]);

  const potentialMothers = React.useMemo(() => {
    if (!person || !person.father_id) return [];
    const fatherMarriages = marriages.filter(m => m.husband_id === person.father_id);
    const wifeIds = fatherMarriages.map(m => m.wife_id);
    return persons.filter(p => wifeIds.includes(p.id));
  }, [person, persons, marriages]);

  if (!isOpen || !person) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('marriage_')) {
      const fieldName = name.replace('marriage_', '');
      setMarriageData(prev => ({
        ...prev,
        [fieldName]: value === '' ? undefined : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' && name !== 'full_name' ? undefined : 
                (name === 'birth_year' || name === 'death_year' || name === 'mother_id') ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (marriage && Object.keys(marriageData).length > 0) {
        await Promise.all([
          updatePerson(person.id, formData),
          updateMarriage(marriage.id, marriageData)
        ]);
      } else {
        await updatePerson(person.id, formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Sửa thông tin thành viên</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <form id="edit-person-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tên gọi khác (Tự/Hiệu)</label>
                <input 
                  type="text" 
                  name="other_names"
                  value={formData.other_names || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="Nhập tên gọi khác nếu có"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender || 'M'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="M">Nam</option>
                  <option value="F">Nữ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status || 'ALIVE'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="ALIVE">Còn sống</option>
                  <option value="DECEASED">Đã mất</option>
                  <option value="UNKNOWN">Không rõ</option>
                </select>
              </div>

              {potentialMothers.length > 0 && (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-gray-700">Người mẹ</label>
                  <select
                    name="mother_id"
                    value={formData.mother_id || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  >
                    <option value="">-- Không rõ mẹ --</option>
                    {potentialMothers.map(mother => (
                      <option key={mother.id} value={mother.id}>{mother.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Năm sinh</label>
                <input 
                  type="number" 
                  name="birth_year"
                  value={formData.birth_year || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="Ví dụ: 1950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Năm mất (nếu có)</label>
                <input 
                  type="number" 
                  name="death_year"
                  disabled={formData.status === 'ALIVE'}
                  value={formData.death_year || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Ví dụ: 2020"
                />
              </div>
            </div>

            {marriage && (
              <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold text-pink-800">Thông tin Hôn phối</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Thời gian kết hôn</label>
                    <input 
                      type="text" 
                      name="marriage_start_date"
                      value={marriageData.start_date || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Năm kết hôn (VD: 2010)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Thời gian ly hôn (nếu có)</label>
                    <input 
                      type="text" 
                      name="marriage_end_date"
                      value={marriageData.end_date || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Năm ly hôn (VD: 2020)"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quê quán</label>
              <input 
                type="text" 
                name="origin_place"
                value={formData.origin_place || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Nhập quê quán..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Link Ảnh Đại Diện (Avatar URL)</label>
              <input 
                type="text" 
                name="avatar_url"
                value={formData.avatar_url || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tiểu sử / Ghi chú</label>
              <textarea 
                name="bio"
                rows={4}
                value={formData.bio || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none"
                placeholder="Viết vài dòng tiểu sử hoặc ghi chú quan trọng..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="edit-person-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
