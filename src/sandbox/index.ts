import sampleAss from './sample.ass?raw';
// import longContent from '../../long.ass?raw';
// import movContent from '../../mov.ass?raw';
import { comparisonTool } from './runner';

comparisonTool({ startTime: 10.7, subContent: sampleAss, isPaused: true });
//comparisonTool({ startTime: 0, subContent: karaokeContent, isPaused: true });
//comparisonTool({ startTime: 0, subContent: movContent, isPaused: true });
