import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, style, title }) => {
  return (
    <div className={clsx('glass-card', className)} style={style}>
      {title && <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>}
      {children}
    </div>
  );
};
