import { Dialogue } from 'ass-compiler';

export type ASSDialogue = Dialogue & {
  align: {
    h: number;
    v: number;
  };
  animations: any;
  $div: HTMLElement;
  width: number;
  height: number;
  x: number;
  y: number;
};
