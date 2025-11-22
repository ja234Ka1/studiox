
"use client";

import { useEffect, useState } from "react";
import { Clapperboard, Compass, Film, List, Menu, Radio, Search, Settings, Tv } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingLink from "./loading-link";
import { AuthButton } from "./auth-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/tv-shows", label: "Shows", icon: Tv },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/live-tv", label: "Live TV", icon: Radio },
  { href: "/watchlist", label: "Watchlist", icon: List },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isStreamPage = pathname.startsWith('/stream');

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
        setIsMobileMenuOpen(false);
      }
    }
  };

  if (isStreamPage) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-sm border-b border-border" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <LoadingLink href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Clapperboard className="h-6 w-6 text-accent" />
              <span className="font-bold sm:inline-block text-lg">Willow</span>
            </LoadingLink>
            <div className="flex flex-col space-y-2 mt-6">
                {navItems.map((item) => (
                    <Button
                        key={item.label}
                        variant="ghost"
                        asChild
                        className={cn(
                            "justify-start text-base",
                             pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                            ? "text-primary bg-secondary"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                    <LoadingLink href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.label}
                    </LoadingLink>
                    </Button>
                ))}
            </div>
          </SheetContent>
        </Sheet>

        <LoadingLink href="/" className="mr-6 flex items-center space-x-2">
          <Clapperboard className="h-6 w-6 text-accent" />
          <span className="hidden font-bold sm:inline-block text-lg">Willow</span>
        </LoadingLink>
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
              <LoadingLink href={item.href}>
                {item.label}
              </LoadingLink>
            </Button>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild variant="ghost" size="icon">
             <LoadingLink href="/search">
                <Search />
             </LoadingLink>
          </Button>
          <Button asChild variant="ghost" size="icon">
             <LoadingLink href="/settings">
                <Settings />
             </LoadingLink>
          </Button>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
