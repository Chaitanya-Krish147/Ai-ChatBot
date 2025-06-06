import React, { useState, useRef, useEffect } from 'react';

interface GuestDropdownProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenAuth: (type: 'signin' | 'signup') => void;
}

const GuestDropdown: React.FC<GuestDropdownProps> = ({ darkMode, toggleDarkMode, onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-200 text-gray-700 w-full"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500">
        </div>
        <span className="font-medium">Guest</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
          <button 
            onClick={() => {
              toggleDarkMode();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Toggle dark mode
          </button>
          <button 
            onClick={() => {
              onOpenAuth('signin');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Login to your account
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestDropdown;
