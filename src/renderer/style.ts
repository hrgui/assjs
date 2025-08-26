import { ASSDialogue } from '../types/ASSDialogue';

export function createStyle(dialogue: ASSDialogue) {
  const { layer, align, effect, pos, margin, q } = dialogue;
  let cssText = '';
  if (layer) cssText += `z-index:${layer};`;
  cssText += `text-align:${['left', 'center', 'right'][align.h]};`;
  if (!effect) {
    if (q !== 2) {
      cssText += `max-width:calc(100% - var(--ass-scale) * ${margin.left + margin.right}px);`;
    }
    if (!pos) {
      if (align.h !== 0) {
        cssText += `padding-right:calc(var(--ass-scale) * ${margin.right}px);`;
      }
      if (align.h !== 2) {
        cssText += `padding-left:calc(var(--ass-scale) * ${margin.left}px);`;
      }
    }
  }
  return cssText;
}
