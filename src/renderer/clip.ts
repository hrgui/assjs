// eslint-disable-next-line import/no-cycle
import { ASSDialogue } from '../types/ASSDialogue.js';
import { ASSStore } from '../types/ASSStore.js';
import { createClipAnimations } from './animation.js';

export function createRectClip(clip: any, sw: number, sh: number) {
  if (!clip.dots) return '';
  const { x1, y1, x2, y2 } = clip.dots;
  const polygon = [
    [x1, y1],
    [x1, y2],
    [x2, y2],
    [x2, y1],
    [x1, y1],
  ]
    .map(([x, y]) => [x / sw, y / sh])
    .concat(
      clip.inverse
        ? [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ]
        : [],
    )
    .map((pair) => pair.map((n) => `${n * 100}%`).join(' '))
    .join(',');
  return `polygon(evenodd, ${polygon})`;
}

function createPathClip(clip: any, sw: number, sh: number, store: ASSStore) {
  if (!clip.drawing) return '';
  const scale = store.scale / (1 << (clip.scale - 1));
  let d = clip.drawing.instructions
    .map(
      ({ type, points }: any) =>
        type + points.map(({ x, y }: any) => `${x * scale},${y * scale}`).join(','),
    )
    .join('');
  if (clip.inverse) {
    d += `M0,0L0,${sh},${sw},${sh},${sw},0,0,0Z`;
  }
  return `path(evenodd, "${d}")`;
}

export function getClipPath(dialogue: ASSDialogue, store: ASSStore) {
  const { clip, animations } = dialogue;
  if (!clip) return {};
  const { width, height } = store.scriptRes;
  const $clipArea = document.createElement('div');
  store.box.insertBefore($clipArea, dialogue.$div);
  $clipArea.append(dialogue.$div);
  $clipArea.className = 'ASS-clip-area';
  $clipArea.style.zIndex = dialogue.$div.style.zIndex;
  $clipArea.style.clipPath = clip.dots
    ? createRectClip(clip, width!, height!)
    : createPathClip(clip, width!, height!, store);
  animations.push(...createClipAnimations($clipArea, dialogue, store));

  return { $div: $clipArea };
}
