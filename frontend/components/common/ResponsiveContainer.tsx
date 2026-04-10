"use client";

import React from "react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Global responsive container wrapper
 * Ensures consistent max-width and padding across all screen sizes:
 * - Mobile (320px): px-4
 * - Tablet (640px+): px-6
 * - Desktop (768px+): px-8
 * - Large (1024px+): px-12
 *
 * Max-width locked at 1440px on all screens
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  const paddingClass = noPadding ? "" : "px-4 sm:px-6 md:px-8 lg:px-12";

  return (
    <div className={`max-w-[1440px] mx-auto ${paddingClass} w-full ${className}`}>
      {children}
    </div>
  );
};
