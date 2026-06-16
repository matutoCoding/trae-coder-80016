import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full mx-4 ${sizeClasses[size]} animate-slide-up`}>
        <div className="flex items-center justify-between p-6 border-b border-walnut-100">
          <h3 className="font-display text-xl font-bold text-walnut-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-walnut-400 hover:text-walnut-600 hover:bg-walnut-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
        
        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-walnut-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
