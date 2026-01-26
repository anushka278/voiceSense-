'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function ForceClearPage() {
  const router = useRouter();
  const { clearAllAccounts } = useStore();
  const [status, setStatus] = useState('Clearing all accounts and data...');

  useEffect(() => {
    // Clear everything immediately
    clearAllAccounts();
    
    // Also do manual clear
    try {
      // Clear all localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key) localStorage.removeItem(key);
      }
      
      // Clear all sessionStorage
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key) sessionStorage.removeItem(key);
      }
      
      // Force remove sage keys many times
      for (let i = 0; i < 200; i++) {
        localStorage.removeItem('sage-users');
        localStorage.removeItem('sage-storage');
        sessionStorage.removeItem('sage-users');
        sessionStorage.removeItem('sage-storage');
      }
      
      // Final clear
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error in manual clear:', e);
    }
    
    // Wait then verify and redirect
    setTimeout(() => {
      const checkUsers = localStorage.getItem('sage-users');
      const checkStorage = localStorage.getItem('sage-storage');
      
      if (!checkUsers && !checkStorage) {
        setStatus('✅ ALL ACCOUNTS DELETED! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setStatus('⚠️ Clearing again...');
        // One more aggressive clear
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }, 500);
  }, [clearAllAccounts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-sand)] via-white to-[var(--color-sage-light)]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8BA888] to-[#5A7A57] rounded-2xl transform rotate-3 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#C4846C] to-[#A66B53] rounded-2xl transform -rotate-3 opacity-60 animate-pulse" />
        </div>
        <p className="text-[#9B918A] font-medium text-lg">{status}</p>
      </div>
    </div>
  );
}
