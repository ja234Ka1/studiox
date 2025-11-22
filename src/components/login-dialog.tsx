
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from './ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LoginDialog({ isOpen, onOpenChange }: LoginDialogProps) {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAuthAction = async (action: 'signIn' | 'signUp', data: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setError(null);
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!auth) return;
    setError(null);
    try {
        await signInAnonymously(auth);
        onOpenChange(false);
    } catch(err: any) {
        setError(err.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className='text-center'>
          <DialogTitle className='text-2xl'>Welcome to Willow</DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your watchlist.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <TabsContent value="signin">
                <div className="space-y-4 py-4">
                  <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                              <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <Button 
                    className='w-full' 
                    type="button" 
                    onClick={() => handleAuthAction('signIn', form.getValues())}
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button 
                      className='w-full' 
                      type="button" 
                      onClick={() => handleAuthAction('signUp', form.getValues())}
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
        
        {error && <p className="text-sm text-center text-destructive">{error}</p>}
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleGoogleSignIn} variant="outline">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.25,44,30.551,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Google
          </Button>
           <Button onClick={handleAnonymousSignIn} variant="outline">
            Continue as Guest
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
