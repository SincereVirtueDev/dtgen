import React from 'react';
import { GitMerge, List, BookOpen, ZoomIn, ZoomOut, Maximize, Minus, Plus } from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useGenealogyStore } from '../../store/useGenealogyStore';

export const Toolbar: React.FC = () => {
  const { maxGenerations, displayGenerations, setDisplayGenerations, treeMode, setTreeMode } = useGenealogyStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-12 bg-white flex items-center justify-between px-4 shadow-sm z-10 relative">
      {/* Left Tabs */}
      <div className="flex space-x-1">
        <button 
          onClick={() => navigate('/tree')}
          className={clsx(
            "flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm transition-colors",
            location.pathname === '/tree' ? "font-semibold bg-gray-100 text-gray-800" : "font-medium hover:bg-gray-50 text-gray-600"
          )}
        >
          <GitMerge className="w-4 h-4" />
          <span>Phả đồ</span>
        </button>
        <button 
          onClick={() => navigate('/hierarchy')}
          className={clsx(
            "flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm transition-colors",
            location.pathname === '/hierarchy' ? "font-semibold bg-gray-100 text-gray-800" : "font-medium hover:bg-gray-50 text-gray-600"
          )}
        >
          <List className="w-4 h-4" />
          <span>Phả hệ</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className={clsx(
            "flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm transition-colors",
            location.pathname === '/history' ? "font-semibold bg-gray-100 text-gray-800" : "font-medium hover:bg-gray-50 text-gray-600"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Phả ký</span>
        </button>
      </div>

      {/* Center View Modes */}
      <div className="flex border border-gray-300 rounded-md overflow-hidden bg-gray-50 p-0.5">
        <button 
          onClick={() => setTreeMode('traditional')}
          className={clsx(
            "px-4 py-1 text-sm font-medium rounded transition-colors",
            treeMode === 'traditional' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Truyền thống
        </button>
        <button 
          onClick={() => setTreeMode('full')}
          className={clsx(
            "px-4 py-1 text-sm font-medium rounded transition-colors",
            treeMode === 'full' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Đầy đủ
        </button>
        <button 
          onClick={() => setTreeMode('male_only')}
          className={clsx(
            "px-4 py-1 text-sm font-medium rounded transition-colors",
            treeMode === 'male_only' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Nam đinh
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đời hiển thị</span>
          <input 
            type="range" 
            min="1" 
            max={maxGenerations || 10} 
            value={displayGenerations || 1} 
            onChange={(e) => setDisplayGenerations(Number(e.target.value))}
            className="w-24 accent-gray-800" 
          />
          <span className="text-sm font-semibold text-gray-800 w-8 text-right">{displayGenerations}/{maxGenerations || 10}</span>
        </div>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-px h-full bg-gray-300"></div>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
