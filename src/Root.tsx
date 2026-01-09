import { Composition, staticFile } from 'remotion';
import { MyComposition } from './Composition';
import { MyCompositionPlanB } from './CompositionPlanB';
import { MyCompositionPlanC } from './CompositionPlanC';
import { MyCompositionPlanD } from './CompositionPlanD';
import { MyCompositionPlanE } from './CompositionPlanE';
import { MyCompositionPlanF } from './CompositionPlanF';
import { MyCompositionPlanG } from './CompositionPlanG';
import { MyCompositionPlanH, planHSchema } from './CompositionPlanH';
import { MyCompositionPlanI } from './CompositionPlanI';
import './style.css';

export const RemotionRoot: React.FC = () => {
  // 5:08.760 = ~309 seconds. 309 * 30 = 9270 frames. Let's add a buffer. 
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanB"
        component={MyCompositionPlanB}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanC"
        component={MyCompositionPlanC}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanD"
        component={MyCompositionPlanD}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanE"
        component={MyCompositionPlanE}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanF"
        component={MyCompositionPlanF}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanG"
        component={MyCompositionPlanG}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp-PlanH"
        component={MyCompositionPlanH}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
        schema={planHSchema}
        defaultProps={{
          soraScale: 2.5,
          soraTop: 30,
          soraLeft: 50,
          nanteScale: 1.5,
          nanteTop: 60,
          nanteLeft: 50,
          wakeScale: 1.0,
          wakeTop: 85,
          wakeLeft: 50,
        }}
      />
      <Composition
        id="MyComp-PlanI"
        component={MyCompositionPlanI}
        durationInFrames={9600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
