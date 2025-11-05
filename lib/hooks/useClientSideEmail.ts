'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

export function useClientSideEmail(user: User | null) {
  const [clientEmail, setClientEmail] = useState<string>('');

  useEffect(() => {
    if (user?.email) {
      setClientEmail(user.email);
    }
  }, [user]);

  return clientEmail;
}