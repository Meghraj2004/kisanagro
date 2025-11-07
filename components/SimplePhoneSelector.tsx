'use client';

import { useState } from 'react';
import { FiPhone, FiChevronDown, FiX, FiUser } from 'react-icons/fi';
import { siteConfig } from '@/lib/config';

interface SimplePhoneSelectorProps {
  className?: string;
}

export default function SimplePhoneSelector({ className = '' }: SimplePhoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumbers = siteConfig.phoneNumbers || [
    { name: 'Jinedra Ajmera', number: '7249261176', isPrimary: true }
  ];

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
    setIsOpen(false);
  };

  // If only one number, call directly
  if (phoneNumbers.length === 1) {
    return (
      <button
        onClick={() => handleCall(phoneNumbers[0].number)}
        className={className}
      >
        <FiPhone className="w-4 h-4" />
        Call
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        type="button"
      >
        <FiPhone className="w-4 h-4" />
        Call
        <FiChevronDown className={`ml-1 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Contact</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contact List */}
            <div className="p-2">
              {phoneNumbers.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => handleCall(contact.number)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.isPrimary 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <FiUser className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      {contact.isPrimary && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" />
                      {contact.number}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Tap on any contact to call them directly
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
