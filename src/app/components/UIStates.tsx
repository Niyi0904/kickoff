import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { RefreshCw, Home, WifiOff, CheckCircle2 } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';

// Loading Screen
export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5" style={{ height: '100%', backgroundColor: '#09101E' }}>
      {/* Animated ball */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(0,230,118,0.15)', borderTopColor: '#00E676', position: 'absolute', inset: 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>⚽</div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{message}</div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#00E676' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty State
export function EmptyState({ title, message, icon, action, actionLabel }: {
  title: string;
  message: string;
  icon: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 gap-4" style={{ textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#131B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 4, border: '1px solid rgba(255,255,255,0.05)' }}>{icon}</div>
      </motion.div>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 14, color: '#7A8699', lineHeight: 1.6 }}>{message}</p>
      </div>
      {action && actionLabel && (
        <button onClick={action} style={{ height: 48, paddingLeft: 24, paddingRight: 24, borderRadius: 12, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 15, fontWeight: 700, marginTop: 4 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Error State
export function ErrorState({ title = 'Something went wrong', message, onRetry }: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 gap-4" style={{ textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,61,90,0.12)', border: '1px solid rgba(255,61,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WifiOff size={36} color="#FF3D5A" />
        </div>
      </motion.div>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 14, color: '#7A8699', lineHeight: 1.6 }}>{message || 'An error occurred. Please check your connection and try again.'}</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {onRetry && (
          <button onClick={onRetry} style={{ height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Try Again
          </button>
        )}
        <button onClick={() => navigate('/home')} style={{ height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', color: '#F0F4FF', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Home size={16} /> Go Home
        </button>
      </div>
    </div>
  );
}

// Success State
export function SuccessState({ title, message, onContinue, continueLabel = 'Continue' }: {
  title: string;
  message?: string;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 gap-5" style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,230,118,0.25) 0%, rgba(0,230,118,0.05) 70%)', border: '2px solid rgba(0,230,118,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.3 }}>
            <CheckCircle2 size={48} color="#00E676" />
          </motion.div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 8 }}>{title}</div>
        {message && <p style={{ fontSize: 14, color: '#7A8699', lineHeight: 1.6 }}>{message}</p>}
      </motion.div>
      {onContinue && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onContinue}
          style={{ height: 52, paddingLeft: 32, paddingRight: 32, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700 }}
        >
          {continueLabel}
        </motion.button>
      )}
    </div>
  );
}

// Skeleton loader
export function SkeletonCard() {
  return (
    <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 10 }}>
      <div className="flex items-center gap-3">
        <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1B2540' }} />
        <div style={{ flex: 1 }}>
          <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            style={{ height: 14, width: '65%', backgroundColor: '#1B2540', borderRadius: 6, marginBottom: 8 }} />
          <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            style={{ height: 11, width: '45%', backgroundColor: '#1B2540', borderRadius: 5 }} />
        </div>
        <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          style={{ width: 36, height: 36, backgroundColor: '#1B2540', borderRadius: 8 }} />
      </div>
    </div>
  );
}

// Full loading screen as page
export function LoadingPage() {
  return (
    <ScreenLayout showNav={false}>
      <LoadingScreen />
    </ScreenLayout>
  );
}

// 404 screen
export function NotFoundScreen() {
  const navigate = useNavigate();
  return (
    <ScreenLayout title="Not Found" showBack showNav={false}>
      <div className="flex flex-col items-center justify-center px-8 py-16 gap-5" style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}>404</div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase' }}>Page Not Found</div>
          <p style={{ fontSize: 14, color: '#7A8699', marginTop: 8 }}>The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <button onClick={() => navigate('/home')} style={{ height: 52, paddingLeft: 28, paddingRight: 28, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Home size={18} /> Go to Home
        </button>
      </div>
    </ScreenLayout>
  );
}
