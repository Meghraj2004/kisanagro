'use client';

import { useState, useRef, useEffect } from 'react';
import { FiPhone, FiChevronDown, FiUser } from 'react-icons/fi';
import { siteConfig } from '@/lib/config';

interface PhoneNumber {
  name: string;
  number: string;
  isPrimary: boolean;
}

interface PhoneSelectorProps {
  className?: string;
  children?: React.ReactNode;
  buttonStyle?: 'default' | 'outline' | 'white' | 'custom';
  customButtonClass?: string;
}

export default function PhoneSelector({ 
  className = '', 
  children, 
  buttonStyle = 'default',
  customButtonClass = ''
}: PhoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const phoneNumbers: PhoneNumber[] = siteConfig.phoneNumbers || [
    { name: 'Megharaj Dandgavhal', number: '9421612110', isPrimary: true }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
    setIsOpen(false);
  };

  const getButtonClasses = () => {
    if (customButtonClass) {
      return customButtonClass;
    }

    switch (buttonStyle) {
      case 'outline':
        return 'btn btn-outline';
      case 'white':
        return 'btn border-2 border-white text-white hover:bg-white hover:text-primary-600';
      case 'custom':
        return className;
      default:
        return 'btn btn-primary';
    }
  };

  // If only one phone number, call directly
  if (phoneNumbers.length === 1) {
    return (
      <a 
        href={`tel:${phoneNumbers[0].number}`} 
        className={getButtonClasses()}
      >
        {children || (
          <>
            <FiPhone className="mr-2" />
            Call Now
          </>
        )}
      </a>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${getButtonClasses()} flex items-center justify-center relative`}
        type="button"
      >
        {children || (
          <>
            <FiPhone className="mr-2" />
            Call Now
          </>
        )}
        <FiChevronDown className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-w-[90vw]"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Select Contact Number
              </div>
              {phoneNumbers.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => handleCall(contact.number)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      contact.isPrimary 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FiUser className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" />
                      {contact.number}
                    </p>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiPhone className="w-4 h-4 text-primary-600" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Click on any contact to dial their number
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}