
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { LoginDialog } from './login-dialog';
import { usePathname } from 'next/navigation';

const PROMPT_DELAY = 15000; // 15 seconds
const PROMPT_DISMISSED_KEY = 'willow-login-prompt-dismissed';

export function LoginPromptDialog() {
  const { user, isUserLoading } = useUser();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hasDismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY);

    if (isUserLoading || hasDismissed || pathname.startsWith('/stream')) {
      return;
    }

    const timer = setTimeout(() => {
      // Only show the prompt if the user is anonymous (a guest)
      if (user?.isAnonymous) {
        setIsLoginDialogOpen(true);
      }
    }, PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [user, isUserLoading, pathname]);

  const handleOpenChange = (isOpen: boolean) => {
    setIsLoginDialogOpen(isOpen);
    // If the dialog is being closed, mark it as dismissed for this session.
    if (!isOpen) {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    }
  };

  // The dialog will only render if the user is a guest and the timer has triggered it.
  return (
    <LoginDialog
      isOpen={isLoginDialogOpen}
      onOpenChange={handleOpenChange}
    />
  );
}
