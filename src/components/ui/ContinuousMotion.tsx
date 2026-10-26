import React from 'react';
import { HTMLMotionProps } from 'framer-motion';

interface ContinuousMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

// Quiet luxury: static, poised container without chaotic infinite bobbing/rotation
export default function ContinuousMotion({ children, className }: ContinuousMotionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
