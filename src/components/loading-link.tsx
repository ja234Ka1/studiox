
"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loading-provider";
import React from "react";

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LoadingLink = ({ children, href, className, onClick, ...props }: LoadingLinkProps) => {
  const { startLoading } = useLoading();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    // Check if the href is an external link or just a hash link on the same page
    const targetUrl = href.toString();
    const isSamePage = pathname === targetUrl.split('#')[0];
    const isHashLink = targetUrl.startsWith('#');

    // Only start the loading animation if navigating to a truly different page.
    if (!isSamePage && !isHashLink) {
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
