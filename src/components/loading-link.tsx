
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    const targetUrl = href.toString();
    const isSamePage = pathname === targetUrl;
    const isStreamLink = targetUrl.startsWith('/stream');
    const isExternal = targetUrl.startsWith('http');

    // Only start loading for internal, non-streaming, different-page navigations.
    if (!isSamePage && !isStreamLink && !isExternal) {
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
