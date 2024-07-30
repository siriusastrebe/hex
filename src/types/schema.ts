export type GamePiece = {
  id: number;
  q: number;
  r: number;
  z: number;
  spin: number;
  type: string;
  subtype: string;
}

export type ChatMessage = {
  id: number;
  author: number;
  contents: string;
  created: number;
}