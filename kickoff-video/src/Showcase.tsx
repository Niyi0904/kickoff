import { useCurrentFrame, interpolate, Audio, staticFile, spring } from 'remotion';
import { Scene1_Directory } from './scenes/Scene1_Directory';
import { Scene2_LeagueHome } from './scenes/Scene2_LeagueHome';
import { Scene3_Matches } from './scenes/Scene3_Matches';
import { Scene4_Standings } from './scenes/Scene4_Standings';
import { Scene5_Teams } from './scenes/Scene5_Teams';
import { Scene6_Stats } from './scenes/Scene6_Stats';
import { Scene7_CreateLeague } from './scenes/Scene7_CreateLeague';
import { WhipPanTransition, WHIP_DURATION } from './transitions/WhipPan';
import { ColorGrade } from './components/ColorGrade';
import { BG } from './styles';

interface SceneConfig {
  component: React.FC;
  duration: number;
}

const SCENES: SceneConfig[] = [
  { component: Scene1_Directory, duration: 366 },    // ~12.2s — beat-aligned
  { component: Scene2_LeagueHome, duration: 260 },    // ~8.7s — beat-aligned
  { component: Scene3_Matches, duration: 275 },        // ~9.2s — beat-aligned
  { component: Scene4_Standings, duration: 275 },      // ~9.2s — beat-aligned
  { component: Scene5_Teams, duration: 230 },           // ~7.7s — beat-aligned
  { component: Scene6_Stats, duration: 244 },           // ~8.1s — beat-aligned
  { component: Scene7_CreateLeague, duration: 298 },    // ~9.9s — beat-aligned
];

const TRANS_DURATION = WHIP_DURATION;

const OFFSCREEN_SCENE_DURATION_ACCUMULATED = SCENES.reduce(
  (acc, s) => acc + s.duration,
  0
);

export const TOTAL_DURATION =
  OFFSCREEN_SCENE_DURATION_ACCUMULATED +
  (SCENES.length - 1) * TRANS_DURATION + 60;

function buildTimeline() {
  const blocks: { type: 'scene' | 'transition' | 'endcard'; start: number; end: number; sceneIndex?: number; fromIndex?: number; toIndex?: number }[] = [];
  let ptr = 0;
  blocks.push({ type: 'scene', start: ptr, end: ptr + SCENES[0].duration, sceneIndex: 0 });
  ptr += SCENES[0].duration;
  for (let i = 1; i < SCENES.length; i++) {
    blocks.push({ type: 'transition', start: ptr, end: ptr + TRANS_DURATION, fromIndex: i - 1, toIndex: i });
    ptr += TRANS_DURATION;
    blocks.push({ type: 'scene', start: ptr, end: ptr + SCENES[i].duration, sceneIndex: i });
    ptr += SCENES[i].duration;
  }
  blocks.push({ type: 'endcard', start: ptr, end: ptr + 60 });
  return blocks;
}

const TIMELINE = buildTimeline();

export function Showcase() {
  const frame = useCurrentFrame();

  const volume = interpolate(frame,
    [0, 90, 600, 1050, 1650, 1950, TOTAL_DURATION],
    [0, 0.88, 0.88, 0.88, 0.88, 0.90, 0.90],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const block = TIMELINE.find((b) => frame >= b.start && frame < b.end);

  let content: React.ReactNode;

  if (block?.type === 'scene') {
    const SceneComponent = SCENES[block.sceneIndex!].component;
    content = <SceneComponent />;
  } else if (block?.type === 'transition') {
    const OutScene = SCENES[block.fromIndex!].component;
    const InScene = SCENES[block.toIndex!].component;
    const transitionFrame = frame - block.start;
    content = (
      <WhipPanTransition
        outgoing={<OutScene />}
        incoming={<InScene />}
        frame={transitionFrame}
      />
    );
  } else if (block?.type === 'endcard') {
    content = <EndCard frame={frame - block.start} />;
  }

  return (
    <ColorGrade>
      <Audio src={staticFile('soundtrack.wav')} volume={volume} />
      {content}
    </ColorGrade>
  );
}

function EndCard({ frame }: { frame: number }) {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        fontFamily: '"Teko", "Oswald", sans-serif',
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '3px solid rgba(38,194,103,0.5)',
          backgroundColor: 'rgba(38,194,103,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 48, color: '#51d884', fontWeight: 700 }}>
          KO
        </span>
      </div>
      <h1
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: '#ffffff',
          margin: 0,
          letterSpacing: '0.04em',
        }}
      >
        KICKOFF
      </h1>
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          marginTop: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Your League. Your Story.
      </p>
      <p
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 32,
          fontFamily: '"Inter", sans-serif',
        }}
      >
        kickoff.vercel.app
      </p>
    </div>
  );
}
