import React, { useEffect } from 'react';
import { useGenealogyStore } from '../store/useGenealogyStore';

export const HierarchyPage: React.FC = () => {
  const { persons, marriages, fetchData, loading } = useGenealogyStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isSpouse = (p: typeof persons[0]) => {
    // If they have parents in the tree, they are bloodline
    if (p.father_id || p.mother_id) return false;
    // If they are Generation 1 and Male, they are usually the founding patriarch
    if (p.generation === 1 && p.gender === 'M') return false;
    // Otherwise, if they are part of a marriage, they are a spouse
    return marriages.some(m => m.husband_id === p.id || m.wife_id === p.id);
  };

  interface FamilyUnit {
    bloodline: typeof persons[0];
    spouses: typeof persons[0][];
  }

  const generations: Record<number, FamilyUnit[]> = {};

  // 1. Add all bloodline members
  persons.filter(p => !isSpouse(p)).forEach(p => {
    const gen = p.generation || 1;
    if (!generations[gen]) generations[gen] = [];
    generations[gen].push({ bloodline: p, spouses: [] });
  });

  // 2. Attach spouses to their partners
  persons.filter(p => isSpouse(p)).forEach(spouse => {
    const marriage = marriages.find(m => m.husband_id === spouse.id || m.wife_id === spouse.id);
    let attached = false;
    if (marriage) {
      const partnerId = marriage.husband_id === spouse.id ? marriage.wife_id : marriage.husband_id;
      for (const gen in generations) {
        const unit = generations[gen].find(u => u.bloodline.id === partnerId);
        if (unit) {
          unit.spouses.push(spouse);
          attached = true;
          break;
        }
      }
    }
    // Fallback if partner not found
    if (!attached) {
      const gen = spouse.generation || 1;
      if (!generations[gen]) generations[gen] = [];
      generations[gen].push({ bloodline: spouse, spouses: [] });
    }
  });

  const sortedGens = Object.keys(generations).map(Number).sort((a, b) => a - b);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-[#8b0000] mb-8 uppercase border-b-2 border-[#8b0000] pb-4 inline-block mx-auto">
            Phả Hệ Dòng Họ
          </h1>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-8">
              {sortedGens.map(gen => (
                <div key={gen} className="border-l-4 border-wood pl-6">
                  <h2 className="text-xl font-bold text-wood-dark mb-4">Đời thứ {gen}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generations[gen].map(unit => (
                      <div key={unit.bloodline.id} className="flex flex-col gap-3">
                        {/* Bloodline Member */}
                        <div className={`p-4 border rounded-lg ${isSpouse(unit.bloodline) ? 'border-orange-100 bg-orange-50' : 'border-gray-200 bg-white shadow-sm'}`}>
                          <h3 className="font-bold text-gray-900 flex items-center flex-wrap gap-2">
                            {unit.bloodline.full_name}
                            {isSpouse(unit.bloodline) && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-200 text-orange-800 border border-orange-300 uppercase">
                                Hôn phối
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {unit.bloodline.gender === 'M' ? 'Nam' : 'Nữ'}
                            {unit.bloodline.birth_year ? ` • Sinh năm: ${unit.bloodline.birth_year}` : ''}
                          </p>
                          {unit.bloodline.status === 'DECEASED' && (
                            <p className="text-sm text-gray-500">Mất năm: {unit.bloodline.death_year || '?'}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {unit.bloodline.origin_place || unit.bloodline.birth_place || 'Chưa rõ quê quán'}
                          </p>
                        </div>

                        {/* Spouses */}
                        {unit.spouses.length > 0 && (
                          <div className="pl-6 space-y-3 relative">
                            <div className="absolute left-3 top-0 bottom-6 w-px bg-orange-200"></div>
                            {unit.spouses.map(spouse => (
                              <div key={spouse.id} className="p-3 border border-orange-100 bg-orange-50 rounded-lg relative shadow-sm">
                                <div className="absolute -left-3 top-1/2 w-3 h-px bg-orange-200"></div>
                                <h3 className="font-bold text-gray-900 flex items-center flex-wrap gap-2 text-sm">
                                  {spouse.full_name}
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-200 text-orange-800 border border-orange-300 uppercase">
                                    Hôn phối
                                  </span>
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  {spouse.gender === 'M' ? 'Nam' : 'Nữ'}
                                  {spouse.birth_year ? ` • Sinh năm: ${spouse.birth_year}` : ''}
                                </p>
                                {spouse.status === 'DECEASED' && (
                                  <p className="text-xs text-gray-500">Mất năm: {spouse.death_year || '?'}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
