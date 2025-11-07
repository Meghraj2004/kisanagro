'use client';

import { useState } from 'react';
import { FiPhone, FiUser } from 'react-icons/fi';
import { siteConfig } from '@/lib/config';

interface CompactPhoneSelectorProps {
  className?: string;
  iconOnly?: boolean;
}

export default function CompactPhoneSelector({ 
  className = '', 
  iconOnly = false 
}: CompactPhoneSelectorProps) {
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
      <a 
        href={`tel:${phoneNumbers[0].number}`}
        className={`inline-flex items-center justify-center ${className}`}
        title={`Call ${phoneNumbers[0].name}`}
      >
        <FiPhone className="w-5 h-5" />
        {!iconOnly && <span className="ml-2">Call</span>}
      </a>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center"
        type="button"
        title="Choose number to call"
      >
        <FiPhone className="w-5 h-5" />
        {!iconOnly && <span className="ml-2">Call</span>}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="py-1">
              {phoneNumbers.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => handleCall(contact.number)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    contact.isPrimary 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <FiUser className="w-3 h-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {contact.number}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}