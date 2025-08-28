/* eslint-disable no-param-reassign */
import { renderer } from './renderer/renderer.js';
import { batchAnimate } from './utils.js';

export function clear(store: any): void {
  const { box } = store;
  while (box.lastChild) {
    box.lastChild.remove();
  }
  store.actives = [];
  store.space = [];
}

function framing(store: any, mediaTime: number): void {
  const { dialogues, actives } = store;
  const vct = mediaTime - store.delay;
  for (let i = actives.length - 1; i >= 0; i -= 1) {
    const dia = actives[i];
    const { end } = dia;
    if (end < vct) {
      dia.$div.remove();
      actives.splice(i, 1);
    }
  }
  while (store.index < dialogues.length && vct >= dialogues[store.index].start) {
    if (vct < dialogues[store.index].end) {
      const dia = renderer(dialogues[store.index], store);
      (dia.animations || []).forEach((animation: any) => {
        animation.currentTime = (vct - dia.start) * 1000;
      });
      actives.push(dia);
      if (!store.video?.paused) {
        !store.disableAnimations && batchAnimate(dia, 'play');
      }
    }
    store.index += 1;
  }
}

export function createSeek(store: any): () => void {
  return function seek(): void {
    clear(store);
    const { video, dialogues } = store;

    if (video) {
      store.currentTime = video.currentTime;
    }

    const vct = store.currentTime - (store.delay || 0);
    store.index = (() => {
      for (let i = 0; i < dialogues.length; i += 1) {
        if (vct < dialogues[i].end) {
          return i;
        }
      }
      return (dialogues.length || 1) - 1;
    })();
    framing(store, store.currentTime);
  };
}

function createFrame(video: any): [Function, Function] {
  const useVFC = video && video.requestVideoFrameCallback;
  return [
    useVFC ? video.requestVideoFrameCallback.bind(video) : requestAnimationFrame,
    useVFC ? video.cancelVideoFrameCallback.bind(video) : cancelAnimationFrame,
  ];
}

export function createPlay(store: any): () => void {
  const { video } = store;
  const [requestFrame, cancelFrame] = createFrame(video);
  return function play(): void {
    let lastCurrentTime = -1;
    const frame = (now: any, metadata: any) => {
      if (video) {
        store.currentTime = video.currentTime;
      }
      const currentTime = metadata?.mediaTime || video?.currentTime || store.currentTime;

      framing(store, currentTime);
      if (lastCurrentTime !== currentTime) {
        store.requestId = requestFrame(frame);
      } else {
        store.requestId = cancelFrame(frame);
      }
      lastCurrentTime = currentTime;
    };
    cancelFrame(store.requestId);
    store.requestId = requestFrame(frame);
    store.actives.forEach((dia: any) => {
      !store.disableAnimations && batchAnimate(dia, 'play');
    });
  };
}

export function createPause(store: any): () => void {
  const [, cancelFrame] = createFrame(store.video);
  return function pause(): void {
    cancelFrame(store.requestId);
    store.requestId = 0;
    store.actives.forEach((dia: any) => {
      !store.disableAnimations && batchAnimate(dia, 'pause');
    });
  };
}

export function createResize(that: any, store: any): () => void {
  const { video, container, box, layoutRes } = store;
  return function resize(): void {
    if (!video && !container) {
      return;
    }

    const cw = video?.clientWidth || container.clientWidth;
    const ch = video?.clientHeight || container.clientHeight;
    const vw = video?.videoWidth || cw;
    const vh = video?.videoHeight || ch;
    const lw = layoutRes.width || vw;
    const lh = layoutRes.height || vh;
    const sw = store.scriptRes.width;
    const sh = store.scriptRes.height;
    let rw = sw;
    let rh = sh;
    const videoScale = Math.min(cw / lw, ch / lh);
    if (that.resampling === 'video_width') {
      rh = (sw / lw) * lh;
    }
    if (that.resampling === 'video_height') {
      rw = (sh / lh) * lw;
    }
    store.scale = Math.min(cw / rw, ch / rh);
    if (that.resampling === 'script_width') {
      store.scale = videoScale * (lw / rw);
    }
    if (that.resampling === 'script_height') {
      store.scale = videoScale * (lh / rh);
    }
    const bw = store.scale * rw;
    const bh = store.scale * rh;
    store.width = bw;
    store.height = bh;
    store.resampledRes = { width: rw, height: rh };

    box.style.cssText = `width:${bw}px;height:${bh}px;top:${(ch - bh) / 2}px;left:${(cw - bw) / 2}px;`;
    box.style.setProperty('--ass-scale', store.scale);
    box.style.setProperty('--ass-scale-stroke', store.sbas ? store.scale : 1);
    const boxScale = vw / lw / (vh / lh);
    if (boxScale > 1) {
      box.style.transform = `scaleX(${boxScale})`;
    }
    if (boxScale < 1) {
      box.style.transform = `scaleY(${1 / boxScale})`;
    }

    createSeek(store)();
  };
}
