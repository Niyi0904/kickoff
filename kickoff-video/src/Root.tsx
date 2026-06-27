import "./index.css";
import { Composition } from "remotion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";
import { Scene9 } from "./scenes/Scene9";
import { LaunchFilm, LAUNCH_FILM_DURATION } from "./LaunchFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchFilm"
        component={LaunchFilm}
        durationInFrames={LAUNCH_FILM_DURATION}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene1"
        component={Scene1}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene2"
        component={Scene2}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene3"
        component={Scene3}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene4"
        component={Scene4}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene5"
        component={Scene5}
        durationInFrames={480}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene6"
        component={Scene6}
        durationInFrames={510}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene7"
        component={Scene7}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene8"
        component={Scene8}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Scene9"
        component={Scene9}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
