import React from 'react';
import type { Person, Marriage } from '../../store/useGenealogyStore';
import { clsx } from 'clsx';
import { User, UserRound, Edit3, Plus, Info, Heart, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface MemberNodeProps {
  person: Person;
  isSpouse?: boolean;
  spouseRank?: string;
  totalSpouses?: number;
  marriage?: Marriage;
  spouseNames?: string;
  childrenCount?: number;
  isFocused?: boolean;
  kinship?: string;
  onClick?: () => void;
  onEdit?: (person: Person, marriage?: Marriage) => void;
  onAddChild?: (person: Person) => void;
  onViewBio?: (person: Person) => void;
  onAddSpouse?: (person: Person) => void;
  onDelete?: (person: Person) => void;
}

export const MemberNode: React.FC<MemberNodeProps> = ({ 
  person, 
  isSpouse, 
  spouseRank,
  totalSpouses = 1,
  marriage,
  spouseNames,
  childrenCount,
  isFocused,
  kinship,
  onClick,
  onEdit,
  onAddChild,
  onViewBio,
  onAddSpouse,
  onDelete
}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  const isMale = person.gender === 'M';

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-[280px] transition-all hover:shadow-md cursor-pointer group",
        isMale ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-pink-500",
        isFocused && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden border-2",
            isMale ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-pink-100 text-pink-600 border-pink-200"
          )}>
            {person.avatar_url ? (
              <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
            ) : (
              isMale ? <User className="w-5 h-5" /> : <UserRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">
              {person.full_name}
            </h3>
            {person.other_names && (
              <p className="text-[11px] italic text-gray-400 mt-0.5">
                {person.other_names}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {person.birth_year ? person.birth_year : '?'} - {person.status === 'DECEASED' ? (person.death_year || '?') : 'nay'}
            </p>
          </div>
        </div>
        <div className={clsx(
          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
          isMale ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-pink-100 text-pink-700 border border-pink-200"
        )}>
          {isMale ? 'Nam' : 'Nữ'}
        </div>
      </div>

      {/* Body */}
      <div className="text-xs text-gray-500 mb-3 ml-[52px]">
        {person.origin_place || person.birth_place || 'Chưa rõ quê quán'}
        
        {isSpouse && marriage && (marriage.start_date || marriage.end_date) && (
          <div className="mt-1 flex flex-col gap-0.5 text-[11px]">
            {marriage.start_date && (
              <span className="text-pink-600">kết hôn: {marriage.start_date}</span>
            )}
            {marriage.end_date && (
              <span className="text-gray-400">ly hôn: {marriage.end_date}</span>
            )}
          </div>
        )}
      </div>

      {/* Spouses and Children Summary */}
      {(spouseNames || (childrenCount !== undefined && childrenCount > 0)) && (
        <div className="text-[11px] text-gray-600 mb-3 ml-[52px] bg-gray-50 p-1.5 rounded border border-gray-100">
          {spouseNames && (
            <div className="flex items-start mb-0.5">
              <span className="font-medium mr-1 text-gray-500">Hôn phối:</span> 
              <span className="truncate" title={spouseNames}>{spouseNames}</span>
            </div>
          )}
          {childrenCount !== undefined && childrenCount > 0 && (
            <div className="flex items-center">
              <span className="font-medium mr-1 text-gray-500">Số con:</span> 
              <span>{childrenCount} người</span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 ml-[52px]">
        {person.birth_order === 1 && isMale && !isSpouse && (
          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-200">Trưởng nam</span>
        )}
        {person.generation === 1 && !isSpouse && (
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200">Khởi tổ</span>
        )}
        {isSpouse && spouseRank && spouseRank.toUpperCase() !== 'KHÔNG RÕ' && spouseRank.toUpperCase() !== 'CHƯA RÕ' && (
          <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-pink-200">
            {totalSpouses === 1 ? (person.gender === 'F' ? 'VỢ' : 'CHỒNG') : spouseRank}
          </span>
        )}
        {kinship && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">
            {kinship}
          </span>
        )}
        {!isSpouse && !kinship && (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-200">
            Đời {person.generation}
          </span>
        )}
      </div>

      {/* Hover Action Menu */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white border border-gray-200 rounded-full shadow-lg p-1 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onViewBio) onViewBio(person);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full text-purple-600 transition-colors"
          title="Xem chi tiết & Tiểu sử"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              alert("Vui lòng đăng nhập bằng quyền Admin để chỉnh sửa thông tin!");
              window.location.href = '/login';
              return;
            }
            if (onEdit) onEdit(person, marriage);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
          title="Chỉnh sửa thông tin"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        {!isSpouse && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                alert("Vui lòng đăng nhập bằng quyền Admin để thêm thông tin!");
                window.location.href = '/login';
                return;
              }
              if (onAddSpouse) onAddSpouse(person);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full text-pink-500 transition-colors"
            title="Thêm vợ/chồng (hôn phối)"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        )}
        {!isSpouse && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                alert("Vui lòng đăng nhập bằng quyền Admin để thêm thông tin!");
                window.location.href = '/login';
                return;
              }
              if (onAddChild) onAddChild(person);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full text-green-600 transition-colors"
            title="Thêm con cái"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              alert("Vui lòng đăng nhập bằng quyền Admin để xoá thành viên!");
              window.location.href = '/login';
              return;
            }
            if (window.confirm(`Bạn có chắc chắn muốn xoá ${person.full_name}? Hành động này sẽ xoá toàn bộ thông tin liên quan.`)) {
              if (onDelete) onDelete(person);
            }
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full text-red-500 transition-colors"
          title="Xoá thành viên này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
