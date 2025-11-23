
"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loading-provider";
import React, { useEffect } from "react";

interface LoadingLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, LinkProps {
  children: React.ReactNode;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ children, href, className, onClick, ...props }, ref) => {
    const { startLoading, stopLoading } = useLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e);
      }
      
      const targetUrl = href.toString();
      const isSamePage = pathname === targetUrl.split('#')[0];
      const isHashLink = targetUrl.startsWith('#');

      if (!isSamePage && !isHashLink) {
        startLoading();
      }
    };

    useEffect(() => {
      // Ensure loading stops if the component unmounts for any reason
      // during navigation (e.g., user hits back button quickly).
      return () => {
        stopLoading();
      };
    }, [stopLoading]);


    return (
      <Link ref={ref} href={href} onClick={handleClick} className={className} {...props}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';

export default LoadingLink;
