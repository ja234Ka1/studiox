
'use client';

import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, List } from 'lucide-react';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginDialog } from './login-dialog';
import LoadingLink from './loading-link';
import { mergeLocalWatchlistToFirebase } from '@/lib/userData';

export function AuthButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    // When user logs in and is not anonymous, merge local watchlist to firebase
    if (user && !user.isAnonymous) {
      mergeLocalWatchlistToFirebase(user.uid);
    }
  }, [user]);

  if (isUserLoading) {
    return <Button variant="ghost" size="sm">Loading...</Button>;
  }

  if (!user) {
    return (
      <>
        <Button variant="ghost" onClick={() => setIsLoginDialogOpen(true)}>
          Login
        </Button>
        <LoginDialog
          isOpen={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
        />
      </>
    );
  }

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
            <AvatarFallback>
              {user.isAnonymous ? <UserIcon /> : (user.displayName || user.email || '').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user.isAnonymous ? (
           <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium leading-none">Guest User</p>
                <Button size="sm" onClick={() => {
                  handleSignOut().then(() => setIsLoginDialogOpen(true));
                }}>Sign In / Sign Up</Button>
              </div>
          </DropdownMenuLabel>
        ) : (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || 'Welcome'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LoadingLink href="/watchlist">
                <List className="mr-2 h-4 w-4" />
                <span>Watchlist</span>
              </LoadingLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
