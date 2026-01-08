import { Composition, staticFile } from 'remotion';
import { MyComposition } from './Composition';
import { MyCompositionPlanB } from './CompositionPlanB';
import { MyCompositionPlanC } from './CompositionPlanC';
import { MyCompositionPlanD } from './CompositionPlanD';
import { MyCompositionPlanE } from './CompositionPlanE';
import { MyCompositionPlanF } from './CompositionPlanF';
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
      <Composition
        id="MyComp-PlanB"
        component={MyCompositionPlanB}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanC"
        component={MyCompositionPlanC}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanD"
        component={MyCompositionPlanD}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanE"
        component={MyCompositionPlanE}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanF"
        component={MyCompositionPlanF}
        durationInFrames={9300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
