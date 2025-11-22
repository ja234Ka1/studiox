
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
    // Stop loading when the new page is rendered
    stopLoading();
  }, [pathname, stopLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    const isSamePage = pathname === href.toString();
    const isStreamLink = href.toString().startsWith('/stream');

    if (!isSamePage && !isStreamLink) {
      startLoading();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} scroll={false} {...props}>
      {children}
    </Link>
  );
};

export default LoadingLink;
