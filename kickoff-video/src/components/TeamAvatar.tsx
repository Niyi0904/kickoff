import { FONT_DISPLAY } from '../styles';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'FC';
}

export function TeamAvatar({
  name,
  color,
  size = 28,
  border = true,
}: {
  name: string;
  color?: string;
  size?: number;
  border?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: color ?? '#2a7b4f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        ...(border ? { border: '1px solid rgba(255,255,255,0.1)' } : {}),
      }}
    >
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: Math.max(8, size * 0.35),
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
