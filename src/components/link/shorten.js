/* eslint-disable */

/**
 * RETURN SHORTER LINE FROM ORIGINAL COORDINATES
 * https://stackoverflow.com/questions/23369705/html5-canvas-draw-a-line-and-make-it-shorter
 */

export function shorterLine(p1, p2, a, b) {
  var sp1 = { x: 0, y: 0 };
  var sp2 = { x: 0, y: 0 };

  const unitVector = buildUnitVector(p1, p2);
  sp1.x = p1.x + unitVector.x * a;
  sp1.y = p1.y + unitVector.y * a;
  sp2.x = p2.x - unitVector.x * b;
  sp2.y = p2.y - unitVector.y * b;
  return { x1: sp1.x, y1: sp1.y, x2: sp2.x, y2: sp2.y };
}

function buildUnitVector(p1, p2) {
  let uVect = { x: 0, y: 0 };
  uVect.x = p2.x - p1.x;
  uVect.y = p2.y - p1.y;
  var vectorNorm = Math.sqrt(sq(uVect.x) + sq(uVect.y));
  uVect.x /= vectorNorm;
  uVect.y /= vectorNorm;
  return uVect;
}

function sq(x) {
  return x * x;
}
