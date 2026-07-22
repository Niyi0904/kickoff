export function ColorGrade({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: 1920, height: 1080 }}>
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(8, 22, 32, 0.05)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </div>
  );
}
