import { type CSSProperties } from 'react';

interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
  style?: CSSProperties;
}

const HEIGHT_MAP = { sm: 5, md: 8, lg: 14 };

const ProgressBar = ({
  value,
  size = 'sm',
  showLabel = false,
  color,
  style,
}: ProgressBarProps) => {
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
  const barColor = color || (clampedValue === 100 ? '#27ae60' : '#FF6B00');
  const height = HEIGHT_MAP[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, ...style }}>
      <div
        style={{
          flex: 1,
          height,
          background: 'var(--color-progress-bg, var(--color-bg-muted, #e0e0e0))',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            background: size === 'lg'
              ? `linear-gradient(90deg, ${barColor}, ${barColor}cc)`
              : barColor,
            borderRadius: 99,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: size === 'lg' ? 13 : 11,
            fontWeight: 700,
            color: barColor,
            whiteSpace: 'nowrap',
          }}
        >
          {clampedValue}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
