import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useApp } from './AppContext';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { loginAsRole } = useApp();

  const handleGuest = () => {
    loginAsRole('guest');
    navigate('/home');
  };

  return (
    <div className="flex flex-col" style={{ height: '100%', background: 'linear-gradient(180deg, #0D1830 0%, #09101E 60%)' }}>
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6">
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', border: '1px solid #00E676', borderRadius: '50%', width: (i + 1) * 120, height: (i + 1) * 120, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* Logo */}
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #00E676, #00B85C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(0,230,118,0.35)' }}>
            <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke="#09101E" strokeWidth="2.5"/>
              <path d="M25 5 L30 18 L43 18 L33 27 L37 40 L25 32 L13 40 L17 27 L7 18 L20 18 Z" fill="#09101E"/>
            </svg>
          </div>

          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 48, fontWeight: 800, color: '#F0F4FF', lineHeight: 0.95, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              YOUR LEAGUE.<br/>
              <span style={{ color: '#00E676' }}>YOUR WAY.</span>
            </div>
            <p style={{ fontSize: 15, color: '#7A8699', marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>
              Follow fixtures, track standings, and manage your team — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Live Fixtures', 'League Standings', 'Player Stats', 'Team Management'].map(f => (
              <div key={f} style={{ fontSize: 12, color: '#7A8699', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px' }}>
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col gap-3 px-5"
        style={{ paddingBottom: 48 }}
      >
        <button
          onClick={() => navigate('/login')}
          className="w-full transition-transform active:scale-[0.98]"
          style={{ height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', fontFamily: "'Inter', sans-serif" }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full transition-transform active:scale-[0.98]"
          style={{ height: 54, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF', fontSize: 16, fontWeight: 600 }}
        >
          Create Account
        </button>
        <button
          onClick={handleGuest}
          style={{ height: 44, color: '#5A6880', fontSize: 14 }}
        >
          Browse as Guest →
        </button>
      </motion.div>
    </div>
  );
}
