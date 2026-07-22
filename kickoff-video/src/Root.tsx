import { Composition, registerRoot } from 'remotion';
import { Showcase, TOTAL_DURATION } from './Showcase';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showcase"
        component={Showcase}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
