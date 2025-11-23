
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
    // When the component unmounts (e.g., page change), ensure loading stops.
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
