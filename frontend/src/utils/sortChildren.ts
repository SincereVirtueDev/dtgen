import type { Person, Marriage } from '../store/useGenealogyStore';

/**
 * Sort con cái theo thứ tự truyền thống phụ hệ Việt Nam:
 *   1. Con trai (gender='M') trước con gái (gender='F')
 *   2. Trong cùng giới: sort theo birth_order ASC (nếu có)
 *   3. Fallback: sort theo birth_year ASC
 *   4. Fallback cuối: sort theo id ASC
 */
export function sortChildren(children: Person[]): Person[] {
  return [...children].sort((a, b) => {
    // 1. Con trai trước con gái
    if (a.gender !== b.gender) {
      return a.gender === 'M' ? -1 : 1;
    }

    // 2. Sort theo birth_order (nhỏ = trưởng = bên trái)
    const aOrder = a.birth_order ?? Infinity;
    const bOrder = b.birth_order ?? Infinity;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // 3. Fallback: birth_year
    const aYear = a.birth_year ?? Infinity;
    const bYear = b.birth_year ?? Infinity;
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    // 4. Fallback cuối: id
    return a.id - b.id;
  });
}

/**
 * Rank priority cho sort vợ theo thứ tự truyền thống:
 *   VỢ CẢ (1) → VỢ THỨ (2) → VỢ KẾ (3) → CHỒNG (4) → KHÔNG RÕ (5)
 */
const RANK_ORDER: Record<string, number> = {
  'VỢ CẢ': 1,
  'VỢ THỨ': 2,
  'VỢ KẾ': 3,
  'CHỒNG': 4,
  'KHÔNG RÕ': 5,
};

/**
 * Sort danh sách hôn phối theo rank truyền thống.
 * Vợ Cả luôn đứng đầu (hiển thị đầu tiên / bên trái nhất).
 */
export function sortSpouses(
  spouses: { spouse: Person | undefined; marriage: Marriage }[]
): { spouse: Person | undefined; marriage: Marriage }[] {
  return [...spouses].sort((a, b) => {
    const aRank = RANK_ORDER[a.marriage.rank] ?? 99;
    const bRank = RANK_ORDER[b.marriage.rank] ?? 99;
    return aRank - bRank;
  });
}
