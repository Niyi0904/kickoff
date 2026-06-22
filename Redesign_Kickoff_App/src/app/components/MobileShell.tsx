import React from 'react';

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#040810', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Desktop: phone frame */}
      <div
        className="relative hidden sm:block"
        style={{ width: 393, height: 852 }}
      >
        {/* Outer frame */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: 52,
            border: '10px solid #1A2035',
            boxShadow: '0 0 0 1px #0D1525, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)',
            backgroundColor: '#09101E',
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50"
            style={{ width: 120, height: 34, backgroundColor: '#040810', borderRadius: 20 }}
          />
          {/* Screen */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 42 }}>
            {children}
          </div>
        </div>
        {/* Side button */}
        <div
          className="absolute right-[-12px]"
          style={{ top: 160, width: 4, height: 80, backgroundColor: '#1A2035', borderRadius: '0 4px 4px 0' }}
        />
        {/* Volume buttons */}
        <div
          className="absolute left-[-12px]"
          style={{ top: 140, width: 4, height: 40, backgroundColor: '#1A2035', borderRadius: '4px 0 0 4px' }}
        />
        <div
          className="absolute left-[-12px]"
          style={{ top: 196, width: 4, height: 60, backgroundColor: '#1A2035', borderRadius: '4px 0 0 4px' }}
        />
        <div
          className="absolute left-[-12px]"
          style={{ top: 270, width: 4, height: 60, backgroundColor: '#1A2035', borderRadius: '4px 0 0 4px' }}
        />
      </div>
      {/* Mobile: full screen */}
      <div
        className="sm:hidden fixed inset-0"
        style={{ backgroundColor: '#09101E' }}
      >
        {children}
      </div>
    </div>
  );
}
