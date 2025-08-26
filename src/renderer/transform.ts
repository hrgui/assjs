import { ASSDialogue } from '../types/ASSDialogue';
import { ASSTag } from '../types/ASSTag';

export const rotateTags = ['frx', 'fry', 'frz'];
export const scaleTags = ['fscx', 'fscy'];
export const skewTags = ['fax', 'fay'];

export function createTransform(tag: ASSTag) {
  return [
    ...[...rotateTags, ...skewTags].map((x) => [
      `--ass-tag-${x}`,
      `${tag[x as keyof ASSTag] || 0}`,
    ]),
    ...scaleTags.map((x) => [
      `--ass-tag-${x}`,
      tag.p ? 1 : (Number(tag[x as keyof ASSTag]) || 100) / 100,
    ]),
  ];
}

export function setTransformOrigin(dialogue: ASSDialogue, scale: number) {
  const { align, width, height, x, y, $div } = dialogue;
  const orgX = (dialogue.org ? dialogue.org.x * scale : x) + [0, width / 2, width][align.h];
  const orgY = (dialogue.org ? dialogue.org.y * scale : y) + [height, height / 2, 0][align.v];
  for (let i = $div.childNodes.length - 1; i >= 0; i -= 1) {
    const node = $div.childNodes[i] as any;
    if (node.dataset && node.dataset.rotate === '') {
      // It's not extremely precise for offsets are round the value to an integer.
      const tox = orgX - x - node.offsetLeft;
      const toy = orgY - y - node.offsetTop;
      node.style.cssText += `transform-origin:${tox}px ${toy}px;`;
    }
  }
}
