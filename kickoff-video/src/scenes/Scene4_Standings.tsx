import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN, GOLD, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_48, WHITE_50, WHITE_62, BG_SECONDARY } from '../styles';
import { PublicHeader } from '../components/SceneHeader';
import { TextCallout } from '../components/TextCallout';
import { TeamAvatar } from '../components/TeamAvatar';
import { FormDot } from '../components/FormDot';
import { FOCUS_STANDINGS } from '../data';

export function Scene4_Standings() {
  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <PublicHeader activeNav="Standings" />

      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '40px 60px',
          overflow: 'auto',
        }}
      >
        {/* Eyebrow + Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: GREEN_LIGHT }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: GREEN_LIGHT }}>Standings</span>
          </div>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 48,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1,
            }}
          >
            League Table
          </h1>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 15,
              color: WHITE_62,
              marginTop: 8,
              maxWidth: 600,
            }}
          >
            The title race at a glance — all teams ranked by points.
          </p>
        </div>

        {/* Standings Table */}
        <div
          style={{
            borderRadius: 6,
            border: `1px solid ${WHITE_10}`,
            backgroundColor: WHITE_05,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 20px',
              borderBottom: `1px solid ${WHITE_10}`,
              backgroundColor: 'rgba(255,255,255,0.06)',
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 700,
              color: WHITE_50,
            }}
          >
            <span style={{ width: 44, textAlign: 'center' }}>#</span>
            <span style={{ flex: 3 }}>Team</span>
            <span style={{ width: 44, textAlign: 'center' }}>P</span>
            <span style={{ width: 40, textAlign: 'center' }}>W</span>
            <span style={{ width: 40, textAlign: 'center' }}>D</span>
            <span style={{ width: 40, textAlign: 'center' }}>L</span>
            <span style={{ width: 52, textAlign: 'center' }}>GD</span>
            <span style={{ width: 140, textAlign: 'center' }}>Form</span>
            <span style={{ width: 64, textAlign: 'center', color: GREEN_LIGHT }}>PTS</span>
          </div>

          {/* Table rows */}
          {FOCUS_STANDINGS.map((row) => (
            <div
              key={row.teamId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: `1px solid rgba(255,255,255,0.08)`,
                fontFamily: FONT_BODY,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 44,
                  textAlign: 'center',
                  fontWeight: 900,
                  color: WHITE_45,
                }}
              >
                {row.position}
              </span>
              <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamAvatar name={row.teamName} color={row.color} size={34} border={true} />
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {row.teamName}
                </span>
              </div>
              <span style={{ width: 44, textAlign: 'center', fontWeight: 600, color: 'rgba(255,255,255,0.78)' }}>
                {row.played}
              </span>
              <span style={{ width: 40, textAlign: 'center', color: 'rgba(255,255,255,0.54)' }}>
                {row.won}
              </span>
              <span style={{ width: 40, textAlign: 'center', color: 'rgba(255,255,255,0.54)' }}>
                {row.drawn}
              </span>
              <span style={{ width: 40, textAlign: 'center', color: 'rgba(255,255,255,0.54)' }}>
                {row.lost}
              </span>
              <span
                style={{
                  width: 52,
                  textAlign: 'center',
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </span>
              <div
                style={{
                  width: 140,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                {row.form.map((r, i) => (
                  <FormDot key={`${r}-${i}`} result={r} />
                ))}
                {row.form.length === 0 && (
                  <span style={{ fontSize: 11, color: WHITE_45 }}>No form</span>
                )}
              </div>
              <div style={{ width: 64, textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(38,194,103,0.18)',
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15,
                    fontWeight: 900,
                    color: GREEN_LIGHT,
                    lineHeight: 1,
                  }}
                >
                  {row.pts}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TextCallout text="Live standings" startFrame={80} />
    </div>
  );
}
