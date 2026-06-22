import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';

export function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    if (user) setUser({ ...user, name: form.name, email: form.email });
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate(-1), 1200);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '100%', backgroundColor: '#09101E' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="flex flex-col items-center gap-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(0,230,118,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={40} color="#00E676" />
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase' }}>Profile Updated</div>
        </motion.div>
      </div>
    );
  }

  const inputStyle = { width: '100%', height: 52, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', padding: '0 16px', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <ScreenLayout title="Edit Profile" showBack showNav={false}>
      {/* Avatar */}
      <div className="flex flex-col items-center py-6 px-4">
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,230,118,0.3), rgba(77,126,255,0.2))', border: '2px solid rgba(0,230,118,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>👤</div>
          <button style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', backgroundColor: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <Camera size={15} color="#09101E" />
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#5A6880' }}>Tap the camera to update your photo</div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {[
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
          { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
          { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+234 xxx xxx xxxx' },
        ].map(field => (
          <div key={field.key}>
            <label style={{ fontSize: 13, color: '#7A8699', fontWeight: 500, display: 'block', marginBottom: 8 }}>{field.label}</label>
            <input
              type={field.type}
              value={(form as any)[field.key]}
              onChange={e => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', height: 54, borderRadius: 14, background: saving ? '#1B2540' : 'linear-gradient(135deg, #00E676, #00C75A)', color: saving ? '#5A6880' : '#09101E', fontSize: 16, fontWeight: 700, marginTop: 8, transition: 'all 0.2s' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => navigate(-1)} style={{ width: '100%', height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', color: '#7A8699', fontSize: 15, marginBottom: 24 }}>
          Cancel
        </button>
      </div>
    </ScreenLayout>
  );
}
