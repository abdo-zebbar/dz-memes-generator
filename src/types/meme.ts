export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  borderColor: string;
  borderWidth: number;
  fontFamily: string;
}

export interface ImageState {
  url: string | null;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export interface CanvasState {
  width: number;
  height: number;
}
