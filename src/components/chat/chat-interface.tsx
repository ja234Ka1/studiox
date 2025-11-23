
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, User, Sparkles } from 'lucide-react';
import { chat, type ChatInput } from '@/ai/flows/chat';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import LoadingLink from '../loading-link';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5">
        <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
    </div>
);

const WelcomeScreen = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const prompts = [
        "Suggest a sci-fi movie from the 90s",
        "What are some popular comedy TV shows?",
        "Find me a thriller with a plot twist",
        "What should I watch if I like historical dramas?",
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <motion.div 
                className="p-4 bg-primary/10 rounded-full mb-6 filter-glow"
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.2 } }}
            >
                <Image src="https://upload.wikimedia.org/wikipedia/commons/7/7a/A-symmetrical-silhouette-of-a-tree-with-many-branches-and-leaves-cutouts-png.svg" alt="Willow logo" width={64} height={64} className="h-16 w-16" />
            </motion.div>
            <motion.h1 
                className="text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }}
            >
                Hello! How can I help you today?
            </motion.h1>
            <motion.p 
                className="text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } }}
            >
                Ask me to find movies, suggest shows, or anything else.
            </motion.p>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6 } }}
            >
                {prompts.map((prompt, i) => (
                    <Button
                        key={i}
                        variant="outline"
                        className="text-left justify-start h-auto py-3 bg-background/50"
                        onClick={() => onPromptClick(prompt)}
                    >
                        <p className="text-sm font-normal text-muted-foreground whitespace-normal">{prompt}</p>
                    </Button>
                ))}
            </motion.div>
        </div>
    );
};


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  }, []);

  useEffect(() => {
    if(messages.length > 0) {
        scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { message: messageText };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  const handlePromptClick = (prompt: string) => {
      sendMessage(prompt);
  }

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-lg border shadow-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
            <WelcomeScreen onPromptClick={handlePromptClick} />
        ) : (
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
                        className={cn('flex items-start gap-3',
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.sender === 'ai' && (
                        <Avatar className="w-8 h-8 border-2 border-primary/50">
                            <AvatarFallback className="bg-primary/20 text-primary">
                                <Sparkles className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        )}
                        <div
                            className={cn('max-w-md rounded-2xl px-4 py-3 text-sm md:text-base',
                                'prose prose-sm prose-invert prose-p:my-0 prose-a:text-accent prose-strong:text-foreground',
                                message.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-background text-card-foreground rounded-bl-none'
                            )}
                        >
                            <ReactMarkdown
                                components={{
                                    a: ({node, ...props}) => <LoadingLink {...props} className="underline" />
                                }}
                            >{message.text}</ReactMarkdown>
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
                        key="typing"
                        layout
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
                        <div className="max-w-md rounded-2xl px-4 py-3 text-sm md:text-base bg-background text-card-foreground rounded-bl-none">
                            <TypingIndicator />
                        </div>
                    </motion.div>
                )}
            </div>
        )}
      </ScrollArea>
      <div className="border-t bg-card/30 p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a movie or TV show..."
            className="flex-1 h-12 rounded-full bg-background/70 pl-4 pr-14"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
