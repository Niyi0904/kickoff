import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import type { UserRole } from './data';

const DEMO_ROLES: { role: UserRole; label: string; email: string; desc: string; color: string }[] = [
  { role: 'player', label: 'Player', email: 'emeka@lfc.ng', desc: 'View your profile & stats', color: '#4D7EFF' },
  { role: 'manager', label: 'Team Manager', email: 'manager@lfc.ng', desc: 'Manage your team', color: '#FFB800' },
  { role: 'admin', label: 'League Admin', email: 'admin@lagosfa.ng', desc: 'Full admin access', color: '#00E676' },
];

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemos, setShowDemos] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch {
      setError('Invalid credentials. Try a demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role: UserRole) => {
    loginAsRole(role);
    navigate('/home');
  };

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#09101E' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F4FF' }}>
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: 'none' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ marginTop: 28, marginBottom: 36 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Welcome Back
            </div>
            <p style={{ fontSize: 15, color: '#7A8699', marginTop: 6 }}>Sign in to your Kickoff account</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', height: 52, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', paddingLeft: 44, paddingRight: 16, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ width: '100%', height: 52, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', paddingLeft: 44, paddingRight: 44, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(255,61,90,0.12)', border: '1px solid rgba(255,61,90,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FF3D5A' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', height: 54, borderRadius: 14, background: loading ? '#1B2540' : 'linear-gradient(135deg, #00E676, #00C75A)', color: loading ? '#5A6880' : '#09101E', fontSize: 16, fontWeight: 700, marginTop: 4, transition: 'all 0.2s' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Demo accounts */}
          <div style={{ marginTop: 28 }}>
            <button
              onClick={() => setShowDemos(!showDemos)}
              className="flex items-center justify-between w-full"
              style={{ backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ fontSize: 14, color: '#B8C4D8', fontWeight: 500 }}>Try a demo account</span>
              <ChevronDown size={16} style={{ color: '#5A6880', transform: showDemos ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {showDemos && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-2 mt-2">
                {DEMO_ROLES.map(({ role, label, email: dEmail, desc, color }) => (
                  <button
                    key={role}
                    onClick={() => handleDemo(role)}
                    className="flex items-center gap-3 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 16px', border: `1px solid rgba(255,255,255,0.06)`, textAlign: 'left' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 16 }}>{role === 'player' ? '👤' : role === 'manager' ? '🎯' : '⚙️'}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF' }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#5A6880' }}>{desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 12, color }}>Enter →</div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 32 }}>
            <span style={{ fontSize: 14, color: '#5A6880' }}>Don't have an account? </span>
            <button onClick={() => navigate('/register')} style={{ fontSize: 14, color: '#00E676', fontWeight: 600 }}>Register</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
