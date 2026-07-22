const DIGIT_BG = '#102018';
const DIGIT_GREEN = '#26c267';
const DIGIT_TEXT_GREEN = '#06110d';

export function ScoreboardDigit({
  value,
  highlight = false,
  size = 32,
}: {
  value: number;
  highlight?: boolean;
  size?: number;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Teko", "Oswald", sans-serif',
        fontSize: size * 0.55,
        fontWeight: 700,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        backgroundColor: highlight ? DIGIT_GREEN : DIGIT_BG,
        color: highlight ? DIGIT_TEXT_GREEN : '#ffffff',
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.3)',
        borderRadius: 2,
      }}
    >
      {value}
    </span>
  );
}
