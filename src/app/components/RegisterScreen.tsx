import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { loginAsRole } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      loginAsRole('player');
      navigate('/home');
    }, 1500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '100%', backgroundColor: '#09101E' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex flex-col items-center gap-4">
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(0,230,118,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={44} color="#00E676" />
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase' }}>Account Created!</div>
          <p style={{ fontSize: 14, color: '#7A8699', textAlign: 'center' }}>Welcome to Lagos Premier League</p>
        </motion.div>
      </div>
    );
  }

  const inputStyle = { width: '100%', height: 52, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', paddingLeft: 44, paddingRight: 16, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#09101E' }}>
      <div style={{ padding: '52px 20px 0', flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F4FF' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-1.5 flex-1">
            {[1,2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: s <= step ? '#00E676' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-7" style={{ scrollbarWidth: 'none' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 6 }}>
          {step === 1 ? 'Create Account' : 'Set Password'}
        </div>
        <p style={{ fontSize: 15, color: '#7A8699', marginBottom: 32 }}>
          {step === 1 ? 'Join the Lagos Premier League platform' : 'Secure your account with a strong password'}
        </p>

        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
            </div>
            <button
              onClick={() => form.name && form.email && setStep(2)}
              style={{ width: '100%', height: 54, borderRadius: 14, background: form.name && form.email ? 'linear-gradient(135deg, #00E676, #00C75A)' : '#1B2540', color: form.name && form.email ? '#09101E' : '#5A6880', fontSize: 16, fontWeight: 700, marginTop: 8, transition: 'all 0.2s' }}
            >
              Continue
            </button>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" style={{ ...inputStyle, paddingRight: 44 }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
                <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Repeat password" style={{ ...inputStyle, border: form.confirm && form.confirm !== form.password ? '1px solid rgba(255,61,90,0.5)' : '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              {form.confirm && form.confirm !== form.password && <p style={{ fontSize: 12, color: '#FF3D5A', marginTop: 6 }}>Passwords don't match</p>}
            </div>

            {/* Strength indicator */}
            {form.password && (
              <div>
                <div className="flex gap-1.5 mb-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < (form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : 1) ? '#00E676' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: '#5A6880' }}>
                  {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : form.password.length >= 6 ? 'Fair' : 'Weak'}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !form.password || form.password !== form.confirm}
              style={{ width: '100%', height: 54, borderRadius: 14, background: (!loading && form.password && form.password === form.confirm) ? 'linear-gradient(135deg, #00E676, #00C75A)' : '#1B2540', color: (!loading && form.password && form.password === form.confirm) ? '#09101E' : '#5A6880', fontSize: 16, fontWeight: 700, marginTop: 8, transition: 'all 0.2s' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </motion.div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 32 }}>
          <span style={{ fontSize: 14, color: '#5A6880' }}>Already have an account? </span>
          <button onClick={() => navigate('/login')} style={{ fontSize: 14, color: '#00E676', fontWeight: 600 }}>Sign In</button>
        </div>
      </div>
    </div>
  );
}
