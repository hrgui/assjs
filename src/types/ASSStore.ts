import type { CompiledASSStyle, Dialogue } from 'ass-compiler';
export interface ASSStore {
  video: HTMLVideoElement | null;
  box: HTMLDivElement;
  observer: ResizeObserver | null;
  scale: number;
  width: number;
  height: number;
  scriptRes: { width?: number; height?: number };
  layoutRes: { width?: number; height?: number };
  resampledRes: { width?: number; height?: number };
  index: number;
  sbas: boolean;
  styles: {
    [styleName: string]: CompiledASSStyle;
  };
  dialogues: Dialogue[]; // import('ass-compiler').Dialogue[]
  actives: Dialogue[]; // import('ass-compiler').Dialogue[]
  requestId: number;
  currentTime: number;
  space: any[];
  delay: number;
}
