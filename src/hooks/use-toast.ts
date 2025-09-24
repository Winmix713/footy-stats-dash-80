import React, { createContext, useContext, useState } from 'react';
import { addToast as heroUIAddToast } from '@heroui/react';

// Toast types
export type ToastType = 'info' | 'success' | 'warning' | 'error';

// Toast interface
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

// Toast context interface
interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: React.ReactNode;
}

// Generate unique ID
const generateId = () => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Map toast type to HeroUI severity
const mapTypeToSeverity = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    case 'info':
    default:
      return 'primary';
  }
};

// Map toast type to icon
const mapTypeToIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'lucide:check-circle';
    case 'warning':
      return 'lucide:alert-triangle';
    case 'error':
      return 'lucide:x-circle';
    case 'info':
    default:
      return 'lucide:info';
  }
};

// Toast provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show toast
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast = { ...toast, id };
    
    // Add to internal state
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Use HeroUI toast
    heroUIAddToast({
      title: toast.title,
      description: toast.description,
      icon: mapTypeToIcon(toast.type),
      severity: mapTypeToSeverity(toast.type),
      timeout: toast.duration || 5000,
      shouldShowTimeoutProgress: true,
      onClose: () => hideToast(id)
    });
    
    // Auto-hide after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  };

  // Hide toast
  const hideToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Hide all toasts
  const hideAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, hideAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    // Fallback implementation if used outside provider
    return {
      toasts: [],
      showToast: (toast: Omit<Toast, 'id'>) => {
        console.warn('useToast used outside of ToastProvider, falling back to HeroUI toast');
        heroUIAddToast({
          title: toast.title,
          description: toast.description,
          icon: mapTypeToIcon(toast.type),
          severity: mapTypeToSeverity(toast.type),
          timeout: toast.duration || 5000,
          shouldShowTimeoutProgress: true
        });
        return generateId();
      },
      hideToast: () => {},
      hideAllToasts: () => {}
    };
  }
  
  return context;
};

// Hook to create a toast outside of React components
export const createToast = (toast: Omit<Toast, 'id'>) => {
  heroUIAddToast({
    title: toast.title,
    description: toast.description,
    icon: mapTypeToIcon(toast.type),
    severity: mapTypeToSeverity(toast.type),
    timeout: toast.duration || 5000,
    shouldShowTimeoutProgress: true
  });
};
