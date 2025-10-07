import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  isVisible: boolean;
  onClose?: () => void;
}

export default function SuccessAlert({ message, isVisible, onClose }: SuccessAlertProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{message}</p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="ml-3 text-green-400 hover:text-green-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}