import React, { useMemo, useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useGenealogyStore, type Person, type Marriage } from '../../store/useGenealogyStore';
import { MemberNode } from './MemberNode';
import { PersonEditModal } from './PersonEditModal';
import { PersonAddChildModal } from './PersonAddChildModal';
import { PersonAddSpouseModal } from './PersonAddSpouseModal';
import { PersonBioModal } from './PersonBioModal';
import { MarriageConnector } from './MarriageBlock';
import { getKinship } from '../../utils/kinship';
import { sortChildren, sortSpouses } from '../../utils/sortChildren';
import './GenealogyTree.css';

interface TreeNodeProps {
  person: Person;
  persons: Person[];
  marriages: Marriage[];
  focusedPersonId: number | null;
  treeMode: 'full' | 'traditional' | 'male_only';
  referencePerson?: Person;
  onEdit?: (person: Person, marriage?: Marriage) => void;
  onAddChild?: (person: Person) => void;
  onViewBio?: (person: Person) => void;
  onAddSpouse?: (person: Person) => void;
  onDelete?: (person: Person) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ person, persons, marriages, focusedPersonId, treeMode, referencePerson, onEdit, onAddChild, onViewBio, onAddSpouse, onDelete }) => {
  // If traditional mode and female, hide spouse and children
  if (treeMode === 'traditional' && person.gender === 'F') {
    return (
      <div className="flex flex-col items-center">
        <MemberNode person={person} isFocused={person.id === focusedPersonId} onEdit={onEdit} onAddChild={onAddChild} onViewBio={onViewBio} onAddSpouse={onAddSpouse} onDelete={onDelete} />
        <div className="mt-2 bg-pink-50 text-pink-500 text-[10px] px-3 py-1 rounded-md border border-pink-100 max-w-[240px] text-center">
          Nhánh hôn phối và con cái của con gái đang ẩn theo chế độ truyền thống.
        </div>
      </div>
    );
  }

  const { displayGenerations, setFocusedPerson, setDisplayGenerations } = useGenealogyStore();
  const currentGen = person.generation || 1;
  const rootPerson = persons.find(p => p.id === focusedPersonId) || persons.find(p => p.generation === 1 && p.gender === 'M') || persons[0];
  const rootGen = rootPerson?.generation || 1;
  const isAtGenerationLimit = (currentGen - rootGen + 1) >= displayGenerations;
  const [isExpanded, setIsExpanded] = useState(true);

  // Find spouses
  const personMarriages = marriages.filter(m => m.husband_id === person.id || m.wife_id === person.id);
  
  const spousesUnsorted = personMarriages.map(m => {
    const spouseId = m.husband_id === person.id ? m.wife_id : m.husband_id;
    const spouse = persons.find(p => p.id === spouseId);
    return { spouse, marriage: m };
  }).filter(s => s.spouse !== undefined);

  // Sort vợ theo rank truyền thống: VỢ CẢ → VỢ THỨ → VỢ KẾ
  let spouses = sortSpouses(spousesUnsorted);
  if (treeMode === 'male_only') {
    spouses = []; // Hide all spouses in male only mode
  }

  // All children of this person (regardless of spouse)
  let allChildren = isAtGenerationLimit 
    ? [] 
    : sortChildren(persons.filter(p => p.father_id === person.id || p.mother_id === person.id));

  if (treeMode === 'male_only') {
    allChildren = allChildren.filter(c => c.gender === 'M');
  }

  // Group children by mother/father to clearly distinguish them
  const childrenGroups: { label: string; children: Person[]; colorClass: string }[] = [];

  if (allChildren.length > 0) {
    if (treeMode === 'male_only') {
      childrenGroups.push({
        label: '', // No label needed for male only mode
        children: allChildren,
        colorClass: ''
      });
    } else if (person.gender === 'M') {
      spouses.forEach(s => {
        const motherChildren = allChildren.filter(c => c.mother_id === s.spouse!.id);
        if (motherChildren.length > 0) {
          let bgClass = "bg-pink-50 text-pink-700 border-pink-200";
          if (s.marriage.rank === 'VỢ THỨ') bgClass = "bg-orange-50 text-orange-700 border-orange-200";
          if (s.marriage.rank === 'VỢ KẾ') bgClass = "bg-amber-50 text-amber-700 border-amber-200";
          
          childrenGroups.push({
            label: `Con ${s.marriage.rank} (${s.spouse!.full_name})`,
            children: motherChildren,
            colorClass: bgClass
          });
        }
      });
      const unknownMotherChildren = allChildren.filter(c => !c.mother_id);
      if (unknownMotherChildren.length > 0) {
        childrenGroups.push({
          label: `Con (không rõ mẹ)`,
          children: unknownMotherChildren,
          colorClass: "bg-gray-50 text-gray-600 border-gray-200"
        });
      }
    } else {
      // Female node
      spouses.forEach(s => {
        const fatherChildren = allChildren.filter(c => c.father_id === s.spouse!.id);
        if (fatherChildren.length > 0) {
          childrenGroups.push({
            label: `Con với ${s.spouse!.full_name}`,
            children: fatherChildren,
            colorClass: "bg-blue-50 text-blue-700 border-blue-200"
          });
        }
      });
      const unknownFatherChildren = allChildren.filter(c => !c.father_id);
      if (unknownFatherChildren.length > 0) {
        childrenGroups.push({
          label: `Con (không rõ cha)`,
          children: unknownFatherChildren,
          colorClass: "bg-gray-50 text-gray-600 border-gray-200"
        });
      }
    }
  }

  // If there's only 1 group and no spouses, we might not need a label, but keeping it is fine for consistency.
  // If node is extremely deep and shouldn't render beyond itself
  if (isAtGenerationLimit && allChildren.length > 0) {
    return (
      <div className="flex flex-col items-center">
        <MemberNode 
          person={person} 
          spouseNames={spousesUnsorted.map(s => s.spouse?.full_name).filter(Boolean).join(', ')}
          childrenCount={allChildren.length}
          isFocused={person.id === focusedPersonId} 
          onClick={() => { setFocusedPerson(person.id); setDisplayGenerations(2); }}
          kinship={getKinship(person, referencePerson, persons, marriages)}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onViewBio={onViewBio}
          onAddSpouse={onAddSpouse}
          onDelete={onDelete}
        />
        <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium border border-gray-200">
          Còn {allChildren.length} hậu duệ...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Primary Row: Husband and all wives on the same horizontal row */}
      <div className="flex flex-row items-center justify-center relative z-20">
        <MemberNode 
          person={person} 
          spouseNames={spousesUnsorted.map(s => s.spouse?.full_name).filter(Boolean).join(', ')}
          childrenCount={allChildren.length}
          isFocused={person.id === focusedPersonId} 
          onClick={() => { setFocusedPerson(person.id); setDisplayGenerations(2); }}
          kinship={getKinship(person, referencePerson, persons, marriages)}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onViewBio={onViewBio}
          onAddSpouse={onAddSpouse}
          onDelete={onDelete}
        />
        
        {spouses.map((s) => (
          <React.Fragment key={s.marriage.id}>
            <MarriageConnector 
              marriage={s.marriage} 
              childrenCount={0} 
              isExpanded={true}
              onToggle={() => {}}
              totalSpouses={spouses.length}
            />
            <MemberNode 
              person={s.spouse!} 
              isSpouse 
              spouseRank={s.marriage.rank} 
              totalSpouses={spouses.length}
              marriage={s.marriage}
              childrenCount={allChildren.filter(c => c.mother_id === s.spouse!.id || c.father_id === s.spouse!.id).length}
              isFocused={s.spouse!.id === focusedPersonId} 
              onClick={() => { setFocusedPerson(s.spouse!.id); setDisplayGenerations(2); }}
              kinship={getKinship(s.spouse!, referencePerson, persons, marriages)}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onViewBio={onViewBio}
              onAddSpouse={onAddSpouse}
              onDelete={onDelete}
            />
          </React.Fragment>
        ))}
      </div>

      {/* If no spouses but has children (single parent), draw a short vertical connector */}
      {spouses.length === 0 && allChildren.length > 0 && isExpanded && (
        <div className="w-[2px] h-4 bg-[#d1d5db]" />
      )}

      {/* Children Block: Grouped by spouse */}
      {isExpanded && allChildren.length > 0 && (
        <div className="tree-children relative z-10 w-full">
          {childrenGroups.map((group, idx) => (
            <div key={idx} className="tree-child flex flex-col items-center">
              {/* Badge for the group */}
              {group.label && (
                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm z-20 mb-2 whitespace-nowrap ${group.colorClass}`}>
                  {group.label}
                </div>
              )}
              
              {/* The children of this group */}
              <div className="tree-children pt-2">
                {group.children.map(child => (
                  <div key={child.id} className="tree-child">
                    <TreeNode 
                      person={child} 
                      persons={persons} 
                      marriages={marriages} 
                      focusedPersonId={focusedPersonId}
                      treeMode={treeMode}
                      referencePerson={referencePerson}
                      onEdit={onEdit} 
                      onAddChild={onAddChild} 
                      onViewBio={onViewBio} 
                      onAddSpouse={onAddSpouse}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const GenealogyTree: React.FC = () => {
  const { persons, marriages, familyTrees, currentFamilyTreeId, loading, error, focusedPersonId, treeMode, deletePerson, setFocusedPerson, setDisplayGenerations, createPerson } = useGenealogyStore();
  const [editingPerson, setEditingPerson] = useState<{person: Person, marriage?: Marriage} | null>(null);
  const [addingChildTo, setAddingChildTo] = useState<Person | null>(null);
  const [addingSpouseTo, setAddingSpouseTo] = useState<Person | null>(null);
  const [viewingBio, setViewingBio] = useState<Person | null>(null);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [rootName, setRootName] = useState('');
  
  const rootPerson = useMemo(() => {
    if (persons.length === 0) return null;
    if (focusedPersonId) {
      const focused = persons.find(p => p.id === focusedPersonId);
      if (focused) return focused;
    }
    return persons.find(p => p.generation === 1 && p.gender === 'M') || persons[0];
  }, [persons, focusedPersonId]);

  const maxGen = useMemo(() => {
    if (persons.length === 0) return 1;
    return Math.max(...persons.map(p => p.generation || 1));
  }, [persons]);

  if (!rootPerson) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f9fafb]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có dữ liệu gia phả</h2>
          <p className="text-gray-500 mb-6 text-sm">Hãy bắt đầu bằng cách khởi tạo vị Khởi tổ (người đứng đầu dòng họ) để xây dựng cây phả hệ.</p>
          
          {isCreatingRoot ? (
            <div className="w-full space-y-4">
              <input 
                type="text" 
                value={rootName}
                onChange={e => setRootName(e.target.value)}
                placeholder="Nhập họ tên Khởi tổ..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && rootName.trim()) {
                    await createPerson({
                      family_tree_id: familyTrees[0]?.id || 1,
                      full_name: rootName.trim(),
                      gender: 'M',
                      generation: 1,
                      status: 'DECEASED'
                    });
                    setIsCreatingRoot(false);
                  }
                }}
              />
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsCreatingRoot(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={async () => {
                    if (rootName.trim()) {
                      await createPerson({
                        family_tree_id: familyTrees[0]?.id || 1,
                        full_name: rootName.trim(),
                        gender: 'M',
                        generation: 1,
                        status: 'DECEASED'
                      });
                      setIsCreatingRoot(false);
                    }
                  }}
                  disabled={!rootName.trim()}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Tạo
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingRoot(true)}
              className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg shadow-sm hover:bg-amber-700 hover:shadow transition-all"
            >
              Khởi tạo dòng họ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f9fafb] overflow-hidden relative">
      {focusedPersonId && (
        <button 
          onClick={() => {
            setFocusedPerson(null);
            setDisplayGenerations(maxGen);
          }}
          className="absolute top-6 left-6 z-50 px-4 py-2.5 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex items-center space-x-2 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Quay lại Xem toàn bộ</span>
        </button>
      )}
      <TransformWrapper
        key={rootPerson.id}
        initialScale={0.8}
        minScale={0.1}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
      >
        <TransformComponent wrapperClass="w-full h-full" wrapperStyle={{ width: "100%", height: "100%" }} contentClass="p-32">
          <div className="generation-tree-wrapper">
            {/* Tree content */}
            <div className="generation-tree-content">
              <TreeNode 
                person={rootPerson} 
                persons={persons} 
                marriages={marriages} 
                focusedPersonId={focusedPersonId}
                treeMode={treeMode}
                onEdit={(p, m) => setEditingPerson({person: p, marriage: m})} 
                onAddChild={(p) => setAddingChildTo(p)} 
                onViewBio={(p) => setViewingBio(p)} 
                onAddSpouse={(p) => setAddingSpouseTo(p)}
                onDelete={async (p) => {
                  await deletePerson(p.id);
                }}
              />
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {editingPerson && (
        <PersonEditModal 
          person={editingPerson.person} 
          marriage={editingPerson.marriage}
          isOpen={!!editingPerson}
          onClose={() => setEditingPerson(null)} 
        />
      )}
      {addingChildTo && (
        <PersonAddChildModal 
          parent={addingChildTo} 
          isOpen={!!addingChildTo}
          onClose={() => setAddingChildTo(null)} 
        />
      )}
      {addingSpouseTo && (
        <PersonAddSpouseModal 
          person={addingSpouseTo} 
          isOpen={!!addingSpouseTo}
          onClose={() => setAddingSpouseTo(null)} 
        />
      )}
      {viewingBio && (
        <PersonBioModal 
          person={viewingBio} 
          isOpen={!!viewingBio}
          onClose={() => setViewingBio(null)} 
          onNavigateToPerson={(id) => {
            setFocusedPerson(id);
            const nextPerson = persons.find(p => p.id === id);
            if (nextPerson) setViewingBio(nextPerson);
          }}
        />
      )}
    </div>
  );
};
