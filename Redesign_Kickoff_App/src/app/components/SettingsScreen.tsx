import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: on ? '#00E676' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10, marginTop: 4 }}>{title}</div>;
}

function Row({ icon, label, value, onPress, danger, toggle }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean; toggle?: boolean }) {
  const [on, setOn] = useState(toggle ?? false);
  return (
    <button
      onClick={onPress || (toggle !== undefined ? () => setOn(v => !v) : undefined)}
      style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: danger ? 'rgba(255,61,90,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 15, color: danger ? '#FF3D5A' : '#F0F4FF', fontWeight: 500 }}>{label}</span>
      {toggle !== undefined ? (
        <Toggle on={on} onToggle={() => setOn(v => !v)} />
      ) : value ? (
        <span style={{ fontSize: 13, color: '#5A6880', marginRight: 4 }}>{value}</span>
      ) : null}
      {toggle === undefined && <ChevronRight size={15} color="#5A6880" />}
    </button>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { logout } = useApp();

  const sections = [
    {
      title: 'Notifications',
      items: [
        { icon: '⚽', label: 'Match Alerts', toggle: true },
        { icon: '📊', label: 'Score Updates', toggle: true },
        { icon: '📋', label: 'League News', toggle: false },
        { icon: '🔔', label: 'Admin Alerts', toggle: false },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { icon: '🌙', label: 'Dark Mode', value: 'Always', toggle: undefined as boolean | undefined },
        { icon: '🌐', label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '🔒', label: 'Change Password' },
        { icon: '📧', label: 'Email Preferences' },
        { icon: '🛡️', label: 'Privacy Settings' },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        { icon: '🗑️', label: 'Delete Account', danger: true },
      ],
    },
  ];

  return (
    <ScreenLayout title="Settings" showBack showNav={false}>
      {sections.map(section => (
        <div key={section.title} className="px-4 mb-4">
          <SectionHeader title={section.title} />
          <div style={{ backgroundColor: '#131B2E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {section.items.map((item, idx) => (
              <div key={item.label}>
                <Row
                  icon={item.icon}
                  label={item.label}
                  value={(item as any).value}
                  toggle={typeof (item as any).toggle === 'boolean' ? (item as any).toggle : undefined}
                  danger={(item as any).danger}
                />
                {idx < section.items.length - 1 && <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginLeft: 64 }} />}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="px-4 mb-8">
        <button
          onClick={() => { logout(); navigate('/welcome'); }}
          style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: 'rgba(255,61,90,0.1)', border: '1px solid rgba(255,61,90,0.2)', color: '#FF3D5A', fontSize: 15, fontWeight: 600 }}
        >
          Sign Out
        </button>
      </div>
    </ScreenLayout>
  );
}
