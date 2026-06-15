import React from 'react';
import { X, Calendar, MapPin, User, UserRound } from 'lucide-react';
import { useGenealogyStore, type Person } from '../../store/useGenealogyStore';
import { clsx } from 'clsx';

interface PersonBioModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPerson: (personId: number) => void;
}

export const PersonBioModal: React.FC<PersonBioModalProps> = ({ person, isOpen, onClose, onNavigateToPerson }) => {
  const { persons, marriages } = useGenealogyStore();

  if (!isOpen || !person) return null;

  const isMale = person.gender === 'M';

  // Find relationships this member is a partner of
  const memberMarriages = marriages.filter(
    (m) => m.husband_id === person.id || m.wife_id === person.id
  );

  const handleNavigate = (id: number) => {
    onNavigateToPerson(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Thông tin chi tiết</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Top Section: Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className={clsx(
              "w-32 h-32 flex-shrink-0 rounded-2xl flex items-center justify-center text-4xl font-bold overflow-hidden border-4 shadow-sm",
              isMale ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-pink-100 text-pink-600 border-pink-200"
            )}>
              {person.avatar_url ? (
                <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
              ) : (
                isMale ? <User className="w-12 h-12" /> : <UserRound className="w-12 h-12" />
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{person.full_name}</h1>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    isMale ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-pink-100 text-pink-700 border border-pink-200"
                  )}>
                    {isMale ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                {person.other_names && (
                  <p className="text-sm italic text-gray-500">Tên gọi khác: {person.other_names}</p>
                )}
              </div>
              
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {person.birth_year ? person.birth_year : 'Chưa rõ năm sinh'} 
                    {person.death_year ? ` - ${person.death_year}` : (person.status === 'ALIVE' ? ' (Còn sống)' : '')}
                  </span>
                </div>
                {(person.origin_place || person.birth_place) && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{person.origin_place || person.birth_place}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Biography */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Tiểu sử / Lịch sử bản thân</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {person.bio || "Chưa có thông tin tiểu sử chi tiết cho thành viên này."}
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Family Relationships */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Quan hệ gia đình</h3>
            
            {memberMarriages.length > 0 ? (
              <div className="space-y-4">
                {memberMarriages.map((marriage) => {
                  const isHusband = person.gender === 'M';
                  const spouseId = isHusband ? marriage.wife_id : marriage.husband_id;
                  const spouse = persons.find((p) => p.id === spouseId);
                  if (!spouse) return null;

                  // Find children for this marriage
                  // A child belongs to this marriage if father_id == husband_id AND mother_id == wife_id
                  const children = persons.filter(
                    (p) => p.father_id === marriage.husband_id && p.mother_id === marriage.wife_id
                  );

                  return (
                    <div key={marriage.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          {isHusband ? "Vợ:" : "Chồng:"}
                        </span>
                        <button
                          onClick={() => handleNavigate(spouse.id)}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-left",
                            isHusband ? "bg-pink-50 text-pink-700 hover:bg-pink-100" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          )}
                        >
                          {spouse.full_name} {marriage.rank ? `(${marriage.rank})` : ''}
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-500 block mb-2">
                          Con chung ({children.length}):
                        </span>
                        {children.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleNavigate(child.id)}
                                className={clsx(
                                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                                  child.gender === 'M' 
                                    ? "bg-white border-blue-200 text-blue-700 hover:bg-blue-50" 
                                    : "bg-white border-pink-200 text-pink-700 hover:bg-pink-50"
                                )}
                              >
                                {child.full_name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có thông tin con cái</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                Chưa có thông tin kết hôn.
              </p>
            )}
            
            {/* If there are children where this person is the ONLY known parent (no marriage record) */}
            {(() => {
              const unknownMarriageChildren = persons.filter(
                (p) => 
                  (person.gender === 'M' && p.father_id === person.id && !p.mother_id) ||
                  (person.gender === 'F' && p.mother_id === person.id && !p.father_id)
              );
              
              if (unknownMarriageChildren.length === 0) return null;
              
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-medium text-gray-500 block mb-2">
                      Con cái (Chưa rõ thông tin vợ/chồng) ({unknownMarriageChildren.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {unknownMarriageChildren.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavigate(child.id)}
                          className={clsx(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                            child.gender === 'M' 
                              ? "bg-white border-blue-200 text-blue-700 hover:bg-blue-50" 
                              : "bg-white border-pink-200 text-pink-700 hover:bg-pink-50"
                          )}
                        >
                          {child.full_name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
};
