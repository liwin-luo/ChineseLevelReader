'use client';

import React, { useState, useEffect } from 'react';

interface LanguageToggleProps {
  onLanguageChange?: (view: 'both' | 'chinese' | 'english') => void;
  defaultView?: 'both' | 'chinese' | 'english';
}

export function LanguageToggle({ onLanguageChange, defaultView = 'both' }: LanguageToggleProps) {
  const [currentView, setCurrentView] = useState<'both' | 'chinese' | 'english'>(defaultView);

  useEffect(() => {
    // 更新根元素的类名以控制语言显示
    const root = document.documentElement;
    root.classList.remove('lang-zh', 'lang-en');
    
    if (currentView === 'chinese') {
      root.classList.add('lang-zh');
    } else if (currentView === 'english') {
      root.classList.add('lang-en');
    }
    // 对于 'both' 情况，不添加特定的语言类，显示所有内容
    
    if (onLanguageChange) {
      onLanguageChange(currentView);
    }
  }, [currentView, onLanguageChange]);

  const handleViewChange = (view: 'both' | 'chinese' | 'english') => {
    setCurrentView(view);
    if (onLanguageChange) {
      onLanguageChange(view);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
            currentView === 'both' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => handleViewChange('both')}
        >
          中英对照
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-t border-b ${
            currentView === 'chinese' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => handleViewChange('chinese')}
        >
          仅中文
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
            currentView === 'english' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => handleViewChange('english')}
        >
          仅英文
        </button>
      </div>
    </div>
  );
}