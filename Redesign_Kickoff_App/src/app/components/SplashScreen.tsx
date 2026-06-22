import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome'), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: '100%', background: 'linear-gradient(160deg, #09101E 0%, #0D1830 50%, #091820 100%)' }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo mark */}
        <div style={{ width: 90, height: 90, borderRadius: 26, background: 'linear-gradient(135deg, #00E676 0%, #00C75A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(0,230,118,0.4), 0 20px 40px rgba(0,0,0,0.4)' }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke="#09101E" strokeWidth="2.5"/>
            <path d="M25 5 L30 18 L43 18 L33 27 L37 40 L25 32 L13 40 L17 27 L7 18 L20 18 Z" fill="#09101E" strokeWidth="1" stroke="#09101E"/>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, fontWeight: 800, color: '#F0F4FF', letterSpacing: '0.05em', lineHeight: 1, textTransform: 'uppercase' }}>
            KICKOFF
          </div>
          <div style={{ fontSize: 13, color: '#7A8699', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 6 }}>
            Lagos Premier League
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{ position: 'absolute', bottom: 60 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00E676' }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#5A6880' }}>Loading...</div>
      </motion.div>
    </div>
  );
}
