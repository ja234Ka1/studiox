
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, User, Sparkles } from 'lucide-react';
import { chat, type ChatInput } from '@/ai/flows/chat';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 1,
        text: 'Hello! How can I help you discover your next favorite movie or show?',
        sender: 'ai',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { message: input };
      const result = await chat(chatInput);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: result.response,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling chat flow:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <Avatar className="w-8 h-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-sm md:text-base ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none border'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && (
                    <Avatar className="w-8 h-8">
                        {user?.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                        ) : null}
                        <AvatarFallback>
                            <User className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 justify-start"
            >
              <Avatar className="w-8 h-8 border-2 border-primary/50">
                <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-md rounded-2xl px-4 py-3 text-sm md:text-base bg-card text-card-foreground rounded-bl-none border">
                <motion.div
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    Thinking...
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-card/30 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about movies and TV shows..."
            className="flex-1 h-11 rounded-full bg-background/70"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="rounded-full w-11 h-11" disabled={isLoading}>
            <SendHorizonal className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
