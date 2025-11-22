
"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loading-provider";
import React, { useEffect } from "react";

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

const LoadingLink = ({ children, href, className, ...props }: LoadingLinkProps) => {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Stop loading when the new page is rendered
    stopLoading();
  }, [pathname, stopLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isSamePage = pathname === href.toString();
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
