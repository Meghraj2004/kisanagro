'use client';

import { useState, useEffect } from 'react';

export interface PhoneContact {
  name: string;
  number: string;
  isPrimary: boolean;
}

export const usePhoneSelector = () => {
  const [contacts] = useState<PhoneContact[]>([
    {
      name: 'Megharaj Dandgavhal',
      number: '9421612110',
      isPrimary: true
    },
    {
      name: 'Sales Manager',
      number: '9876543210',
      isPrimary: false
    }
  ]);

  const callNumber = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const getPrimaryContact = () => {
    return contacts.find(contact => contact.isPrimary) || contacts[0];
  };

  return {
    contacts,
    callNumber,
    getPrimaryContact
  };
};