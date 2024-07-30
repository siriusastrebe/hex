import { Vector2 } from './geometry.js';

export function pixelToHex(pixel, stage, board) {
  const intersection = stage.pixelToXYIntercept(pixel, stage);
  if (intersection) {
    const cube = board.pixelToCube(new Vector2(intersection.x, intersection.y));
    const hex = board.newHex(cube.q, cube.r); 
    return hex;
  }
  return null;
}


export function radiansToSpin(radians, round=true) {
  let spin = (radians - Math.PI / 2) * 3 / Math.PI
  if (spin < 0) spin += 6;
  if (spin > 6) spin -= 6;
  if (round) {
    return Math.round(spin);
  }
  return spin;
}

export function spinToRadians(spin) {
  if (spin === undefined) spin = 0;
  return (spin * Math.PI / 3) + Math.PI / 2;
}

export function spinBetweenHexes(hex1, hex2) {
  if (hex1.q === hex2.q && hex1.r === hex2.r) {
    return undefined;
  }
  const angle = Math.atan2(hex2.center().y - hex1.center().y, hex2.center().x - hex1.center().x);
  return radiansToSpin(angle);
}

export function shorthandTime(datetime) {
  // "1:34am"
  const date = new Date(datetime);
  let hour = date.getHours() % 12;
  if (hour === 0) hour = 12;
  return hour + ':' + date.getMinutes() + (date.getHours() >= 12 ? 'pm' : 'am');
}