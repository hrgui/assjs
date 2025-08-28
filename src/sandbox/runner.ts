import ASS from '../index';
import { compile } from 'ass-compiler';

import JASSUB from 'jassub';
import workerUrl from 'jassub/dist/jassub-worker.js?url';
import wasmUrl from 'jassub/dist/jassub-worker.wasm?url';

export function comparisonTool({
  subContent,
  startTime = 0,
  isPaused = false,
}: {
  subContent: string;
  startTime?: number;
  isPaused?: boolean;
}) {
  const res = compile(subContent, {});

  console.log('Loaded content', res);
  const dialogues = res.dialogues || [];
  const lastDialogue = dialogues[dialogues.length - 1];
  const maxTime = lastDialogue.end;

  const kanassRenderer = new ASS({
    subContent: subContent,
    container: document.getElementById('subtitleCanvas') as HTMLCanvasElement,
    disableAnimations: true,
  });

  const jassubRenderer = new JASSUB({
    canvas: document.getElementById('subtitleCanvas2') as HTMLCanvasElement,
    subContent: subContent,
    workerUrl,
    wasmUrl,
    useLocalFonts: true,
  });

  let pos = startTime;
  const playPauseButton = document.getElementById('playPauseButton') as HTMLButtonElement;
  const slider = document.getElementById('slider') as HTMLInputElement;
  const numberInput = document.getElementById('numberInput') as HTMLInputElement;

  if (!slider || !numberInput || !playPauseButton) {
    return;
  }
  numberInput.max = maxTime + '';
  slider.max = maxTime + '';
  let currentPlayInterval = 0;

  function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }

  function setPositionByInput(e: Event) {
    const newPosition = +(e.target as HTMLInputElement).value;
    pos = newPosition;
    setPosition(newPosition);
  }

  function setPosition(pos: number) {
    kanassRenderer.setCurrentTime(pos);
    jassubRenderer.setCurrentTime(true, pos);
    slider!.value = pos + '';
    numberInput!.value = pos + '';
  }

  function setPlayLoop(_isPaused: boolean) {
    if (_isPaused) {
      clearInterval(currentPlayInterval);
    } else {
      currentPlayInterval = setInterval(() => {
        pos = roundToDecimalPlaces(pos + 0.1, 2);
        if (pos > maxTime) {
          pos = startTime;
        }

        setPosition(pos);
      }, 100);
    }
  }

  function setPauseState(_isPaused: boolean) {
    playPauseButton.textContent = _isPaused ? 'Play' : 'Pause';
    setPlayLoop(_isPaused);
    isPaused = _isPaused;
  }

  playPauseButton.addEventListener('click', () => {
    setPauseState(!isPaused);
  });

  slider.addEventListener('input', setPositionByInput);
  numberInput.addEventListener('input', setPositionByInput);

  setPauseState(isPaused);
  setPosition(pos);

  (window as any).jimaku = kanassRenderer;
  (window as any).renderer = jassubRenderer;
}
