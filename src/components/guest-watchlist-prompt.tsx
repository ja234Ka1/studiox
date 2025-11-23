
'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './login-dialog';

export function GuestWatchlistPrompt() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  return (
    <>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Your watchlist is stored locally.</AlertTitle>
        <div className="flex items-center justify-between">
          <AlertDescription>
            Sign in to sync across devices.
          </AlertDescription>
          <Button onClick={() => setIsLoginDialogOpen(true)} size="sm">
            Sign In
          </Button>
        </div>
      </Alert>
      <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
    </>
  );
}
