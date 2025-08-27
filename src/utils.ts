import GLOBAL_CSS from './global.css?raw';
export function alpha2opacity(a: string): number {
  return 1 - parseInt(a, 16) / 255;
}

export function color2rgba(c: string): string {
  const t = c.match(/(\w\w)(\w\w)(\w\w)(\w\w)/);
  if (!t) return '';
  const a = alpha2opacity(t[1]);
  const b = parseInt(t[2], 16);
  const g = parseInt(t[3], 16);
  const r = parseInt(t[4], 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createSVGEl(name: string, attrs: [string, string][] = []): SVGElement {
  const $el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (let i = 0; i < attrs.length; i += 1) {
    const attr = attrs[i];
    $el.setAttributeNS(
      attr[0] === 'xlink:href' ? 'http://www.w3.org/1999/xlink' : null,
      attr[0],
      attr[1],
    );
  }
  return $el;
}

export function addGlobalStyle(container: HTMLElement): void {
  const rootNode = (container.getRootNode ? container.getRootNode() : document) as
    | Document
    | ShadowRoot;
  const styleRoot = rootNode === document ? document.head : rootNode;
  let $style = (styleRoot as HTMLElement | Document).querySelector(
    '#ASS-global-style',
  ) as HTMLStyleElement | null;
  if (!$style) {
    $style = document.createElement('style');
    $style.type = 'text/css';
    $style.id = 'ASS-global-style';
    $style.append(document.createTextNode(GLOBAL_CSS));
    (styleRoot as HTMLElement | Document).append($style);
  }
}

export function initAnimation(
  $el: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options?: number | KeyframeAnimationOptions,
): Animation {
  const animation = $el.animate(keyframes, options);
  animation.pause();
  return animation;
}

export function batchAnimate(dia: { animations?: Animation[] }, action: keyof Animation): void {
  (dia.animations || []).forEach((animation) => {
    (animation[action] as Function).call(animation);
  });
}
