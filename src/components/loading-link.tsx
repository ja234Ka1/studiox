
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

  useEffect(() => {
    // When the path changes, the new page has loaded, so stop the loading indicator.
    stopLoading();
  }, [pathname, stopLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    const targetUrl = href.toString();
    
    // Prevent default navigation if we are going to handle it via router
    // but only for links that should trigger the loading screen.
    const isSamePage = pathname === targetUrl;
    const isStreamLink = targetUrl.startsWith('/stream');
    const isExternal = targetUrl.startsWith('http');
    const isAnchor = targetUrl.startsWith('#');

    // Only start loading for internal, non-streaming, different-page navigations.
    if (!isSamePage && !isStreamLink && !isExternal && !isAnchor) {
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
