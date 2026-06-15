import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Download, Upload, User, ChevronDown, Activity, X, Edit2 } from 'lucide-react';
import { useGenealogyStore } from '../../store/useGenealogyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { clsx } from 'clsx';
export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { familyTrees, currentFamilyTreeId, setCurrentFamilyTreeId, updateFamilyTree, persons, setFocusedPerson, setDisplayGenerations } = useGenealogyStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditTreeModalOpen, setIsEditTreeModalOpen] = useState(false);
  const [editTreeName, setEditTreeName] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditTreeName = () => {
    if (!currentFamilyTreeId) return;
    const currentTree = familyTrees.find(t => t.id === currentFamilyTreeId);
    if (!currentTree) return;
    
    setEditTreeName(currentTree.name);
    setIsEditTreeModalOpen(true);
  };

  const submitEditTreeName = async () => {
    if (!currentFamilyTreeId) return;
    const currentTree = familyTrees.find(t => t.id === currentFamilyTreeId);
    if (!currentTree) return;

    if (editTreeName && editTreeName.trim() !== "" && editTreeName !== currentTree.name) {
      await updateFamilyTree(currentFamilyTreeId, { name: editTreeName.trim() });
    }
    setIsEditTreeModalOpen(false);
  };

  const searchResults = persons.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.other_names && p.other_names.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 8); // limit to 8 results

  return (
    <header className="h-14 bg-white border-b border-[var(--color-card-border)] flex items-center justify-between px-4 shadow-sm z-50 relative">
      {/* Left */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-[var(--color-primary)] font-bold text-xl cursor-pointer" onClick={() => window.location.href='/tree'}>
          <Activity className="w-6 h-6" />
          <span>DTGen</span>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        
        <div className="relative group">
          <select 
            value={currentFamilyTreeId || ''}
            onChange={(e) => setCurrentFamilyTreeId(Number(e.target.value))}
            className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors w-[220px] truncate"
          >
            {familyTrees.length === 0 && <option value="">Đang tải...</option>}
            {familyTrees.map(tree => (
              <option key={tree.id} value={tree.id}>{tree.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={handleEditTreeName}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Sửa tên Gia phả"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm thành viên (Nhập tên)..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-gray-50 border border-gray-300 text-sm rounded-full pl-10 pr-10 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <ul className="max-h-[300px] overflow-y-auto">
                  {searchResults.map(person => (
                    <li 
                      key={person.id}
                      onClick={() => {
                        setFocusedPerson(person.id);
                        setDisplayGenerations(2);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{person.full_name}</div>
                        <div className="text-xs text-gray-500">
                          {person.birth_year ? `Sinh năm ${person.birth_year}` : 'Không rõ năm sinh'}
                          {person.origin_place && ` • ${person.origin_place}`}
                        </div>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Đời {person.generation}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Không tìm thấy thành viên nào phù hợp.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3">
        <a href="/admin" className="flex items-center space-x-2 border border-gray-300 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm text-gray-700 transition-colors">
          <User className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-600">Quản trị viên</span>
        </a>
        
        <a href="/events" className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm text-gray-700 transition-colors">
          <Calendar className="w-4 h-4" />
          <span>Lịch</span>
          {/* We can dynamically fetch event count in the future, for now mock it to 1 */}
          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">1</span>
        </a>

        <div className="flex space-x-1 border border-gray-300 rounded-md overflow-hidden">
          <button className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors" title="Nhập dữ liệu">
            <Upload className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300"></div>
          <button className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors" title="Xuất dữ liệu">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Tree Name Modal */}
      {isEditTreeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Sửa tên Gia phả</h3>
              <button 
                onClick={() => setIsEditTreeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Gia phả
              </label>
              <input 
                type="text" 
                value={editTreeName}
                onChange={(e) => setEditTreeName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Ví dụ: Gia phả họ Nguyễn"
              />
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
              <button 
                onClick={() => setIsEditTreeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={submitEditTreeName}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:brightness-110 transition-colors shadow-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
