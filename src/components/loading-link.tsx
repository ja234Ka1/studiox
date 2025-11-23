
"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loading-provider";
import React, { useEffect } from "react";

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LoadingLink = ({ children, href, className, onClick, ...props }: LoadingLinkProps) => {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();

  // Effect to ensure loading stops if the component unmounts for any reason
  // during a page transition (e.g., user hits the back button).
  useEffect(() => {
    return () => {
      stopLoading();
    };
  }, [stopLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    const targetUrl = href.toString();
    const isSamePage = pathname === targetUrl;

    // Only start the loading animation if navigating to a different page.
    if (!isSamePage) {
      startLoading();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
};

export default LoadingLink;
