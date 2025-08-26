import { createDrawing } from './drawing.js';
import {
  createAnimatableVars,
  createDialogueAnimations,
  createTagAnimations,
} from './animation.js';
import { createStrokeVars, createStrokeFilter } from './stroke.js';
import { rotateTags, scaleTags, skewTags, createTransform } from './transform.js';
import { createSVGEl } from '../utils.js';
import { ASSStore } from '../types/ASSStore.js';
import { ASSDialogue } from '../types/ASSDialogue.js';
import { ASSTag } from '../types/ASSTag.js';
import { CompiledTag } from 'ass-compiler/types/tags.js';

function encodeText(text: string, q: number) {
  return text
    .replace(/\\h/g, ' ')
    .replace(/\\N/g, '\n')
    .replace(/\\n/g, q === 2 ? '\n' : ' ');
}

export function createDialogue(dialogue: ASSDialogue, store: ASSStore) {
  const { styles } = store;
  const $div = document.createElement('div');
  $div.className = 'ASS-dialogue';
  $div.dataset.wrapStyle = String(dialogue.q);
  const df = document.createDocumentFragment();
  const { align, slices } = dialogue;
  [
    ['--ass-align-h', ['0%', '50%', '100%'][align.h]],
    ['--ass-align-v', ['100%', '50%', '0%'][align.v]],
  ].forEach(([k, v]) => {
    $div.style.setProperty(k, v);
  });
  const animations = [];
  slices.forEach((slice) => {
    const sliceTag = styles[slice.style].tag;
    const borderStyle = styles[slice.style].style.BorderStyle;
    slice.fragments.forEach((fragment) => {
      const { text, drawing } = fragment;
      const tag = { ...sliceTag, ...fragment.tag };
      let cssText = '';
      const cssVars: any[] = [];

      cssVars.push(...createStrokeVars(tag));
      let stroke = null;
      const hasStroke = tag.xbord || tag.ybord || tag.xshad || tag.yshad;
      if (hasStroke && (drawing || tag.a1 !== '00' || tag.xbord !== tag.ybord)) {
        const filter = createStrokeFilter(tag as Required<ASSTag>, store.sbas ? store.scale : 1);
        const svg = createSVGEl('svg', [
          ['width', String(0)],
          ['height', String(0)],
        ]);
        svg.append(filter.el);
        stroke = { id: filter.id, el: svg };
      }

      cssVars.push(...createAnimatableVars(tag));
      if (!drawing) {
        cssText += `font-family:"${tag.fn}";`;
        cssText += tag.b ? `font-weight:${tag.b === 1 ? 'bold' : tag.b};` : '';
        cssText += tag.i ? 'font-style:italic;' : '';
        cssText +=
          tag.u || tag.s
            ? `text-decoration:${tag.u ? 'underline' : ''} ${tag.s ? 'line-through' : ''};`
            : '';
      }
      if (drawing && tag.pbo) {
        const pbo = (-tag.pbo * (tag.fscy || 100)) / 100;
        cssText += `vertical-align:calc(var(--ass-scale) * ${pbo}px);`;
      }

      cssVars.push(...createTransform(tag));
      const tags = [tag, ...(tag.t || []).map((t) => t.tag)];
      const hasRotate = rotateTags.some((x) => tags.some((t) => t[x as keyof CompiledTag]));
      const hasScale = scaleTags.some((x) =>
        tags.some(
          (t) => t[x as keyof CompiledTag] !== undefined && t[x as keyof CompiledTag] !== 100,
        ),
      );
      const hasSkew = skewTags.some((x) => tags.some((t) => t[x as keyof CompiledTag]));

      encodeText(text, dialogue.q)
        .split('\n')
        .forEach((content, idx) => {
          const $span = document.createElement('span');
          const $ssspan = document.createElement('span');
          if (hasScale || hasSkew) {
            if (hasScale) {
              $ssspan.dataset.scale = '';
            }
            if (hasSkew) {
              $ssspan.dataset.skew = '';
            }
            $ssspan.textContent = content;
          }
          if (hasRotate) {
            $span.dataset.rotate = '';
          }
          if (drawing) {
            $span.dataset.drawing = '';
            const obj = createDrawing(fragment, sliceTag, store);
            if (!obj) return;
            $span.style.cssText = obj.cssText;
            $span.append(obj.$svg);
          } else {
            if (idx) {
              const br = document.createElement('div');
              br.dataset.is = 'br';
              br.style.setProperty('--ass-tag-fs', String(tag.fs));
              df.append(br);
            }
            if (!content) return;
            if (hasScale || hasSkew) {
              $span.append($ssspan);
            } else {
              $span.textContent = content;
            }
            const el = hasScale || hasSkew ? $ssspan : $span;
            el.dataset.text = content;
            if (hasStroke) {
              el.dataset.borderStyle = String(borderStyle);
              el.dataset.stroke = 'css';
            }
            if (stroke) {
              el.dataset.stroke = 'svg';
              // TODO: it doesn't support animation
              el.style.filter = `url(#${stroke.id})`;
              el.append(stroke.el);
            }
          }
          $span.style.cssText += cssText;
          cssVars.forEach(([k, v]) => {
            $span.style.setProperty(k, v);
          });
          animations.push(...createTagAnimations($span, fragment, sliceTag));
          df.append($span);
        });
    });
  });
  animations.push(...createDialogueAnimations($div, dialogue));
  $div.append(df);
  return { $div, animations };
}
