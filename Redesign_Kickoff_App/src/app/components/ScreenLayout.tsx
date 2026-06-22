import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showNav?: boolean;
  rightElement?: React.ReactNode;
  headerBg?: string;
  noPadding?: boolean;
}

function StatusBar() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return (
    <div
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{ height: 52, backgroundColor: 'transparent', paddingTop: 12 }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: '#F0F4FF', letterSpacing: '-0.01em' }}>
        {h}:{m}
      </span>
      <div className="flex items-center gap-1.5">
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 12 }}>
          {[4, 6, 8, 11].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, backgroundColor: '#F0F4FF', borderRadius: 1.5, opacity: i < 3 ? 1 : 0.3 }} />
          ))}
        </div>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 3.8C13.6 1.7 11 0.5 8 0.5C5 0.5 2.4 1.7 0.5 3.8L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" fill="#F0F4FF"/>
          <path d="M8 5.5C9.9 5.5 11.6 6.3 12.8 7.6L14.1 6.1C12.5 4.4 10.4 3.5 8 3.5C5.6 3.5 3.5 4.4 1.9 6.1L3.2 7.6C4.4 6.3 6.1 5.5 8 5.5Z" fill="#F0F4FF"/>
          <circle cx="8" cy="10" r="2" fill="#F0F4FF"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 24, height: 12, border: '1px solid rgba(255,255,255,0.35)', borderRadius: 3, position: 'relative', padding: '1.5px 2px' }}>
            <div style={{ width: '85%', height: '100%', backgroundColor: '#00E676', borderRadius: 1.5 }} />
            <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 6, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: '0 2px 2px 0' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenLayout({
  children,
  title,
  showBack = false,
  showNav = true,
  rightElement,
  headerBg,
  noPadding = false,
}: ScreenLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#09101E', position: 'relative' }}>
      <div style={{ backgroundColor: headerBg || '#09101E', flexShrink: 0 }}>
        <StatusBar />
        {title && (
          <div className="flex items-center justify-between px-4 pb-3" style={{ minHeight: 44 }}>
            <div className="flex items-center gap-3">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center"
                  style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', color: '#F0F4FF' }}
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F0F4FF', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {title}
              </h1>
            </div>
            {rightElement || (
              !showBack && (
                <button
                  style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F4FF' }}
                >
                  <Bell size={16} />
                </button>
              )
            )}
          </div>
        )}
      </div>
      <style>{`
        .ko-scroll { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .ko-scroll::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div className="ko-scroll flex-1" style={{ minHeight: 0 }}>
        {noPadding ? children : <div style={{ padding: '0 0 20px 0' }}>{children}</div>}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
