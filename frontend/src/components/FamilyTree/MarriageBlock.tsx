import React from 'react';
import { Heart, ChevronDown, ChevronRight } from 'lucide-react';
import type { Marriage } from '../../store/useGenealogyStore';
import { clsx } from 'clsx';

interface MarriageConnectorProps {
  marriage: Marriage;
  childrenCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  totalSpouses?: number;
}

const RANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'VỢ CẢ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'VỢ THỨ': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'VỢ KẾ': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'CHỒNG': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'KHÔNG RÕ': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

/**
 * MarriageConnector — đường nối ngang giữa Chồng và Vợ.
 * Thay thế MarriageBlock cũ (block to riêng) bằng connector nhỏ gọn.
 */
export const MarriageConnector: React.FC<MarriageConnectorProps> = ({ 
  marriage, 
  childrenCount, 
  isExpanded, 
  onToggle,
  totalSpouses
}) => {
  const rankStyle = RANK_COLORS[marriage.rank] || RANK_COLORS['KHÔNG RÕ'];

  return (
    <div className="marriage-connector">
      {/* Đường nối ngang */}
      <div className="marriage-connector-line" />
      
      {/* Nhãn giữa đường nối */}
      <div className="marriage-connector-badge">
        <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
        {marriage.rank && marriage.rank.toUpperCase() !== 'KHÔNG RÕ' && marriage.rank.toUpperCase() !== 'CHƯA RÕ' && (
          <span className={clsx(
            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
            rankStyle.bg, rankStyle.text, rankStyle.border
          )}>
            {totalSpouses === 1 && (marriage.rank.toUpperCase() === 'VỢ CẢ' || marriage.rank.toUpperCase() === 'CHỒNG') 
              ? (marriage.rank.toUpperCase() === 'CHỒNG' ? 'CHỒNG' : 'VỢ') 
              : marriage.rank}
          </span>
        )}
      </div>

      {/* Nút thu gọn/mở con */}
      {childrenCount > 0 && (
        <button 
          onClick={onToggle}
          className="marriage-connector-toggle"
          title={isExpanded ? 'Thu gọn con cái' : `Mở ${childrenCount} con`}
        >
          <span className="text-[9px] font-semibold text-gray-600">{childrenCount}</span>
          {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
        </button>
      )}
    </div>
  );
};

// Keep old export name for backwards compatibility if needed
export const MarriageBlock = MarriageConnector;
