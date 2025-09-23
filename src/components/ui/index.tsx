'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

// 从shadcn/ui导出组件
export * from './button';
export * from './card';
export * from './input';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center">
        <div className="text-red-400 mr-3">
          ❌
        </div>
        <div className="flex-1">
          <div className="text-red-800 chinese-text">
            {message}
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="link"
              className="mt-2 text-red-600 hover:text-red-800"
            >
              重试
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center">
        <div className="text-green-400 mr-3">
          ✅
        </div>
        <div className="text-green-800 chinese-text">
          {message}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📄', 
  title, 
  description, 
  action, 
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-gray-400 text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2 chinese-text">{title}</h3>
      {description && (
        <p className="text-gray-500 chinese-text mb-6">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = '加载中...', 
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 chinese-text">{message}</p>
    </div>
  );
};

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={`bg-gray-200 rounded h-4 mb-3 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

interface ArticleCardSkeletonProps {
  className?: string;
}

export const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    danger: 'destructive',
    warning: 'default',
    info: 'default'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 chinese-text">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 chinese-text">
          {message}
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={colorClasses[type] as any}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose 
}) => {
  const colorClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${colorClasses[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
        <span className="text-lg">{icons[type]}</span>
        <span className="flex-1 chinese-text">{message}</span>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white hover:text-gray-200 hover:bg-white/20"
        >
          ×
        </Button>
      </div>
    </div>
  );
};