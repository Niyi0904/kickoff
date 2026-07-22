export function FormDot({ result }: { result: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    W: { bg: '#26c267', text: '#06110d' },
    D: { bg: '#f5c84b', text: '#102018' },
    L: { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.7)' },
  };
  const c = colors[result] ?? colors.L;
  return (
    <span
      style={{
        display: 'flex',
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        backgroundColor: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 800,
        fontFamily: '"Teko", "Oswald", sans-serif',
        lineHeight: 1,
      }}
    >
      {result}
    </span>
  );
}
