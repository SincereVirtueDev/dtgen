import type { Person, Marriage } from '../store/useGenealogyStore';

export function getKinship(target: Person, source: Person | undefined | null, persons: Person[], marriages: Marriage[]): string {
  if (!source) return '';
  if (target.id === source.id) return 'Bản thân';

  // Direct parents
  if (target.id === source.father_id) return 'Cha';
  if (target.id === source.mother_id) return 'Mẹ';

  // Direct children
  if (target.father_id === source.id || target.mother_id === source.id) {
    return target.gender === 'M' ? 'Con trai' : 'Con gái';
  }

  // Spouses
  const isSpouse = marriages.some(m => 
    (m.husband_id === source.id && m.wife_id === target.id) ||
    (m.wife_id === source.id && m.husband_id === target.id)
  );
  if (isSpouse) return target.gender === 'M' ? 'Chồng' : 'Vợ';

  // Siblings
  if ((source.father_id && source.father_id === target.father_id) || 
      (source.mother_id && source.mother_id === target.mother_id)) {
    const targetIsOlder = (() => {
      if (target.birth_order != null && source.birth_order != null) return target.birth_order < source.birth_order;
      if (target.birth_year != null && source.birth_year != null) return target.birth_year < source.birth_year;
      return null;
    })();

    if (targetIsOlder === true) {
      return target.gender === 'M' ? 'Anh trai' : 'Chị gái';
    } else if (targetIsOlder === false) {
      return target.gender === 'M' ? 'Em trai' : 'Em gái';
    }
    return target.gender === 'M' ? 'Anh/Em trai' : 'Chị/Em gái';
  }

  // Grandparents
  const father = persons.find(p => p.id === source.father_id);
  const mother = persons.find(p => p.id === source.mother_id);
  if (father && (target.id === father.father_id || target.id === father.mother_id)) {
    return target.gender === 'M' ? 'Ông nội' : 'Bà nội';
  }
  if (mother && (target.id === mother.father_id || target.id === mother.mother_id)) {
    return target.gender === 'M' ? 'Ông ngoại' : 'Bà ngoại';
  }

  // Grandchildren
  const sourceChildren = persons.filter(p => p.father_id === source.id || p.mother_id === source.id);
  for (const child of sourceChildren) {
    if (target.father_id === child.id || target.mother_id === child.id) {
      return child.gender === 'M' ? 'Cháu nội' : 'Cháu ngoại';
    }
  }

  // Uncle/Aunt
  if (father && ((target.father_id && target.father_id === father.father_id) || 
                 (target.mother_id && target.mother_id === father.mother_id))) {
    const targetIsOlder = (() => {
      if (target.birth_order != null && father.birth_order != null) return target.birth_order < father.birth_order;
      if (target.birth_year != null && father.birth_year != null) return target.birth_year < father.birth_year;
      return null;
    })();

    if (targetIsOlder === true) {
      return target.gender === 'M' ? 'Bác trai (Nội)' : 'Bác gái (Nội)';
    } else if (targetIsOlder === false) {
      return target.gender === 'M' ? 'Chú' : 'Cô';
    }
    return target.gender === 'M' ? 'Bác/Chú' : 'Bác/Cô';
  }
  if (mother && ((target.father_id && target.father_id === mother.father_id) || 
                 (target.mother_id && target.mother_id === mother.mother_id))) {
    const targetIsOlder = (() => {
      if (target.birth_order != null && mother.birth_order != null) return target.birth_order < mother.birth_order;
      if (target.birth_year != null && mother.birth_year != null) return target.birth_year < mother.birth_year;
      return null;
    })();

    if (targetIsOlder === true) {
      return target.gender === 'M' ? 'Bác trai (Ngoại)' : 'Bác gái (Ngoại)';
    } else if (targetIsOlder === false) {
      return target.gender === 'M' ? 'Cậu' : 'Dì';
    }
    return target.gender === 'M' ? 'Bác/Cậu' : 'Bác/Dì';
  }

  // Default fallback based on generation difference
  const genDiff = target.generation - source.generation;
  if (genDiff === -1) return target.gender === 'M' ? 'Họ hàng (Thế hệ Cha Chú)' : 'Họ hàng (Thế hệ Cô Dì)';
  if (genDiff === -2) return target.gender === 'M' ? 'Ông' : 'Bà';
  if (genDiff === -3) return 'Cụ';
  if (genDiff === -4) return 'Kỵ';
  if (genDiff === 1) return target.gender === 'M' ? 'Cháu trai' : 'Cháu gái';
  if (genDiff === 2) return 'Chắt';
  if (genDiff === 3) return 'Chút';
  if (genDiff === 4) return 'Chít';
  if (genDiff === 0) return 'Họ hàng cùng thế hệ';

  if (genDiff < 0) return 'Tổ tiên';
  if (genDiff > 0) return 'Hậu duệ';
  
  return '';
}
