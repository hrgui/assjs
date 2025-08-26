import { getClipPath } from './clip.js';
import { createDialogue } from './dom.js';
import { getPosition } from './position.js';
import { createStyle } from './style.js';
import { setTransformOrigin } from './transform.js';
import { setEffect } from './effect.js';
import { ASSStore } from '../types/ASSStore.js';
import { ASSDialogue } from '../types/ASSDialogue.js';

export function renderer(dialogue: ASSDialogue, store: ASSStore) {
  const { $div, animations } = createDialogue(dialogue, store);
  Object.assign(dialogue, { $div, animations });
  store.box.append($div);
  const { width } = $div.getBoundingClientRect();
  Object.assign(dialogue, { width });
  $div.style.cssText += createStyle(dialogue);
  // height may be changed after createStyle
  const { height } = $div.getBoundingClientRect();
  Object.assign(dialogue, { height });
  const { x, y } = getPosition(dialogue, store);
  Object.assign(dialogue, { x, y });
  $div.style.cssText += `left:${x}px;top:${y}px;`;
  setTransformOrigin(dialogue, store.scale);
  // TODO: refactor to create .clip-area or .effect-area wrappers in `createDialogue`
  Object.assign(dialogue, getClipPath(dialogue, store));
  if (dialogue.effect) {
    Object.assign(dialogue, { $div: setEffect(dialogue, store) });
  }
  return dialogue;
}
