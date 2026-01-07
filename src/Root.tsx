import { Composition, staticFile } from 'remotion';
import { MyComposition } from './Composition';
import './style.css';

export const RemotionRoot: React.FC = () => {
  // 5:08.760 = ~309 seconds. 309 * 30 = 9270 frames. Let's add a buffer. 
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
