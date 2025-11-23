
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import React, { useEffect, useState } from "react"
import { updateProfile } from "firebase/auth"
import Image from "next/image"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

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
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings() {
  const { user } = useUser()
  const auth = useAuth()
  const { toast } = useToast();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
    mode: "onChange",
  })
  
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.displayName || "",
        email: user.email || "",
      });
      if (user.photoURL) {
        setAvatarPreview(user.photoURL);
      }
    }
  }, [user, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      form.markAsDirty();
    }
  };

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
      let photoURL = auth.currentUser.photoURL;

      // If a new avatar file was selected, upload it
      if (avatarFile) {
        const storage = getStorage();
        const filePath = `profile-pictures/${auth.currentUser.uid}/${avatarFile.name}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, avatarFile);
        photoURL = await getDownloadURL(uploadResult.ref);
      }
      
      // Update display name and photo URL
      await updateProfile(auth.currentUser, {
        displayName: data.username,
        photoURL: photoURL,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      form.reset(data); // Reset form state to pristine
      setAvatarFile(null); // Clear selected file

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
  const isFormDirty = form.formState.isDirty || !!avatarFile;

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
                    <div className="relative group">
                        <Avatar className="h-24 w-24">
                            {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar preview" />}
                            <AvatarFallback className="text-3xl">
                                {(user?.displayName || user?.email || '').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="h-8 w-8 text-white" />
                        </label>
                        <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
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
                <Button type="submit" disabled={!isFormDirty || isFormSubmitting}>
                    {isFormSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isFormSubmitting ? "Saving..." : "Save"}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
  )
}
