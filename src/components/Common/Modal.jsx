import React from "react";
import { X } from "lucide-react";

const sizeClasses = {
  small: "max-w-md",
  default: "max-w-2xl",
  large: "max-w-4xl",
  full: "max-w-6xl",
};

const Modal = ({
  title,
  isOpen,
  onClose,
  children,
  size = "default",
  showCloseButton = true,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`
          relative w-full ${sizeClasses[size]} transform overflow-hidden 
          rounded-lg bg-white shadow-xl transition-all
        `}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
