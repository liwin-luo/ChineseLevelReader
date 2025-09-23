'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyLevel, SearchFilters } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';
import { useDebounce } from '@/hooks';

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  availableTags?: string[];
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onFiltersChange,
  initialFilters = {},
  availableTags = [],
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(initialFilters.difficulty);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || []);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: initialFilters.dateRange?.start ? initialFilters.dateRange.start.toISOString().split('T')[0] : '',
    end: initialFilters.dateRange?.end ? initialFilters.dateRange.end.toISOString().split('T')[0] : ''
  });
  const [source, setSource] = useState(initialFilters.source || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // 防抖搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 当筛选条件改变时更新父组件
  useEffect(() => {
    const filters: SearchFilters = {
      searchTerm: debouncedSearchTerm || undefined,
      difficulty,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      source: source || undefined,
      dateRange: dateRange.start && dateRange.end ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      } : undefined
    };

    onFiltersChange(filters);
  }, [debouncedSearchTerm, difficulty, selectedTags, source, dateRange, onFiltersChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDifficulty(undefined);
    setSelectedTags([]);
    setDateRange({ start: '', end: '' });
    setSource('');
  };

  const hasActiveFilters = debouncedSearchTerm || difficulty || selectedTags.length > 0 || dateRange.start || dateRange.end || source;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 基础搜索 */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文章标题、内容..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent chinese-text"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isExpanded ? '收起筛选' : '高级筛选'}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 高级筛选 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* 难度级别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 chinese-text">
              难度级别
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDifficulty(undefined)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !difficulty
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {Object.values(DifficultyLevel).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level === difficulty ? undefined : level)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors difficulty-${level} ${
                    difficulty === level ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {DIFFICULTY_CONFIG[level].name}
                </button>
              ))}
            </div>
          </div>

          {/* 文章标签 */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 chinese-text">
                文章标签
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 日期范围和来源 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 chinese-text">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 chinese-text">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 chinese-text">
                文章来源
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="如：极客公园"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 chinese-text"
              />
            </div>
          </div>
        </div>
      )}

      {/* 活跃筛选条件显示 */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 chinese-text">当前筛选：</span>
            
            {debouncedSearchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded chinese-text">
                搜索: {debouncedSearchTerm}
              </span>
            )}
            
            {difficulty && (
              <span className={`px-2 py-1 text-xs rounded difficulty-${difficulty}`}>
                {DIFFICULTY_CONFIG[difficulty].name}
              </span>
            )}
            
            {selectedTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded chinese-text">
                {tag}
              </span>
            ))}
            
            {source && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded chinese-text">
                来源: {source}
              </span>
            )}
            
            {(dateRange.start || dateRange.end) && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                日期: {dateRange.start || '开始'} ~ {dateRange.end || '结束'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};