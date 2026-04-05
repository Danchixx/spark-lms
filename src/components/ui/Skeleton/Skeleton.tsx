import { CSSProperties } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton = ({ width, height, borderRadius, style, className = '', variant = 'rectangular' }: SkeletonProps) => {
  const baseStyle: CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : 'auto'),
    borderRadius: borderRadius !== undefined ? borderRadius : (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px'),
    ...style,
  };

  return <div className={`skeleton ${className} variant-${variant}`} style={baseStyle} />;
};

export default Skeleton;
