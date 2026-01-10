/**
 * Cactus Icon - Custom icon for Cakto integration
 * Follows Lucide icon conventions
 */

import { forwardRef } from 'react';

interface CactusIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const CactusIcon = forwardRef<SVGSVGElement, CactusIconProps>(
  ({ size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {/* Main stem */}
        <path d="M12 22V6" />
        {/* Top rounded */}
        <path d="M12 6C12 4 11 2 12 2C13 2 12 4 12 6" />
        {/* Left arm */}
        <path d="M12 12H8C6 12 6 10 6 9C6 8 6 6 8 6" />
        <path d="M8 6C8 6 8 12 8 12" />
        {/* Right arm */}
        <path d="M12 10H16C18 10 18 8 18 7C18 6 18 4 16 4" />
        <path d="M16 4C16 4 16 10 16 10" />
        {/* Base */}
        <ellipse cx="12" cy="22" rx="3" ry="1" />
      </svg>
    );
  }
);

CactusIcon.displayName = 'CactusIcon';
