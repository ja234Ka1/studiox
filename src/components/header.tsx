
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clapperboard, Film, List, Search, Settings, Tv } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/tv-shows", label: "Shows", icon: Tv },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/watchlist", label: "Watchlist", icon: List },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (pathname.startsWith('/stream')) {
        setIsScrolled(true);
        return;
      }
      setIsScrolled(window.scrollY > 10);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);
  
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value;
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-sm border-b border-border" : "bg-transparent",
        pathname.startsWith('/stream') && "bg-background/95 backdrop-blur-sm border-b border-border"
      )}
    >
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Clapperboard className="h-6 w-6 text-accent" />
          <span className="hidden font-bold sm:inline-block text-lg">Willow</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Link href={item.href}>
                
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 rounded-full"
              onKeyDown={handleSearch}
            />
          </div>
          <Button asChild variant="ghost" size="icon">
             <Link href="/settings">
                <Settings />
             </Link>
          </Button>
          <Button variant="ghost">Login</Button>
        </div>
      </div>
    </header>
  );
}
