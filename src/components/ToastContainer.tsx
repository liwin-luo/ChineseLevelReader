"use client";

import React from 'react';
import { Toast } from '@/components/ui';
import { useToast } from '@/hooks';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className=\"fixed top-4 right-4 z-50 space-y-2\">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;