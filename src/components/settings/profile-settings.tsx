
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import React, { useEffect, useState } from "react"
import { updateProfile } from "firebase/auth"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser } from "@/firebase"
import { useAuth } from "@/firebase/provider"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"


const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  photoURL: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings() {
  const { user } = useUser()
  const auth = useAuth()
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      photoURL: "",
    },
    mode: "onChange",
  })
  
  const photoURLValue = form.watch("photoURL");

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!auth?.currentUser) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "You must be logged in to update your profile.",
        });
        return;
    }
  
    setIsUploading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: data.username,
        photoURL: data.photoURL,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      form.reset(data); // Reset form state to pristine

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update profile.",
      });
    } finally {
        setIsUploading(false);
    }
  }

  const isFormSubmitting = form.formState.isSubmitting || isUploading;

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is your public display name and avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={photoURLValue || user?.photoURL || undefined} alt="Avatar preview" />
                        <AvatarFallback className="text-3xl">
                            {(user?.displayName || user?.email || '').charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                     <FormDescription className="text-xs">
                      Paste a URL to an image for your profile picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="Your email" {...field} disabled />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your email cannot be changed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={!form.formState.isDirty || isFormSubmitting}>
                    {isFormSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isFormSubmitting ? "Saving..." : "Save"}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
  )
}
