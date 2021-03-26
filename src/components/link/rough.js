/* eslint-disable */

/**
 * FUNCTIONS TAKEN FROM ROUGH.JS LIB AND ADAPTED TO OUR NEEDS
 * https://roughjs.com/
 * March 2021
 */

// const defaultOptions = {
//   maxRandomnessOffset: 2,
//   roughness: 1.5,
//   bowing: 5,
//   //stroke: "#000",
//   //strokeWidth: 1,
//   //curveTightness: 0,
//   //curveFitting: 0.95,
//   //curveStepCount: 9,
//   //fillStyle: "hachure",
//   //fillWeight: -1,
//   //hachureAngle: -41,
//   //hachureGap: -1,
//   //dashOffset: -1,
//   //dashGap: -1,
//   //zigzagOffset: -1,
//   //seed: 0,
//   //combineNestedSvgPaths: false,
//   //disableMultiStroke: true,
//   //disableMultiStrokeFill: false,
// };

export function roughLine(x1, y1, x2, y2, opts) {
  // const finalOptions = { ...defaultOptions, ...opts };
  const drawing = _roughLine(x1, y1, x2, y2, opts);
  const path = opsToPath(drawing);
  return path;
}

function opsToPath(drawing) {
  let path = "";
  for (const item of drawing.ops) {
    const data = item.data;
    switch (item.op) {
      case "move":
        path += `M${data[0]} ${data[1]} `;
        break;
      case "bcurveTo":
        path += `C${data[0]} ${data[1]}, ${data[2]} ${data[3]}, ${data[4]} ${data[5]} `;
        break;
      case "lineTo":
        path += `L${data[0]} ${data[1]} `;
        break;
    }
  }
  return path.trim();
}

function _roughLine(x1, y1, x2, y2, o) {
  return { type: "path", ops: _doubleLine(x1, y1, x2, y2, o) };
}

function line(x1, y1, x2, y2, options) {
  const d = _roughLine(x1, y1, x2, y2, options);
  return draw(d);
}

function _doubleLine(x1, y1, x2, y2, o) {
  //const singleStroke = o.disableMultiStroke;
  const singleStroke = true;
  const o1 = _line(x1, y1, x2, y2, o, true, false);
  if (singleStroke) {
    return o1;
  }
  const o2 = _line(x1, y1, x2, y2, o, true, true);
  return o1.concat(o2);
}

function _line(x1, y1, x2, y2, o, move, overlay) {
  const lengthSq = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
  const length = Math.sqrt(lengthSq);
  let roughnessGain = 1;
  if (length < 200) {
    roughnessGain = 1;
  } else if (length > 500) {
    roughnessGain = 0.4;
  } else {
    roughnessGain = -0.0016668 * length + 1.233334;
  }

  let offset = o.maxRandomnessOffset || 0;
  if (offset * offset * 100 > lengthSq) {
    offset = length / 10;
  }
  const halfOffset = offset / 2;
  const divergePoint = 0.2 + random(o, x1 + y1 + x2 + y2) * 0.2;
  let midDispX = (o.bowing * o.maxRandomnessOffset * (y2 - y1)) / 200;
  let midDispY = (o.bowing * o.maxRandomnessOffset * (x1 - x2)) / 200;
  midDispX = _offsetOpt(midDispX, o, x1, roughnessGain);
  midDispY = _offsetOpt(midDispY, o, y1, roughnessGain);
  const ops = [];
  const randomHalf = () => _offsetOpt(halfOffset, o, x1, roughnessGain);
  const randomFull = () => _offsetOpt(offset, o, x2, roughnessGain);
  if (move) {
    if (overlay) {
      ops.push({
        op: "move",
        data: [x1 + randomHalf(), y1 + randomHalf()],
      });
    } else {
      ops.push({
        op: "move",
        data: [x1 + _offsetOpt(offset, o, x2, roughnessGain), y1 + _offsetOpt(offset, o, y2, roughnessGain)],
      });
    }
  }
  if (overlay) {
    ops.push({
      op: "bcurveTo",
      data: [
        midDispX + x1 + (x2 - x1) * divergePoint + randomHalf(),
        midDispY + y1 + (y2 - y1) * divergePoint + randomHalf(),
        midDispX + x1 + 2 * (x2 - x1) * divergePoint + randomHalf(),
        midDispY + y1 + 2 * (y2 - y1) * divergePoint + randomHalf(),
        x2 + randomHalf(),
        y2 + randomHalf(),
      ],
    });
  } else {
    ops.push({
      op: "bcurveTo",
      data: [
        midDispX + x1 + (x2 - x1) * divergePoint + randomFull(),
        midDispY + y1 + (y2 - y1) * divergePoint + randomFull(),
        midDispX + x1 + 2 * (x2 - x1) * divergePoint + randomFull(),
        midDispY + y1 + 2 * (y2 - y1) * divergePoint + randomFull(),
        x2 + randomFull(),
        y2 + randomFull(),
      ],
    });
  }
  return ops;
}

class Random {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    if (this.seed) {
      return ((2 ** 31 - 1) & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31;
    } else {
      return Math.random();
    }
  }
}

function random(ops, seed) {
  // if (!ops.randomizer) {
  ops.randomizer = new Random(ops.seed || seed || 0);
  // }
  return ops.randomizer.next();
}

function _offsetOpt(x, ops, seed, roughnessGain = 1) {
  return _offset(-x, x, ops, seed, roughnessGain);
}

function _offset(min, max, ops, seed, roughnessGain = 1) {
  return ops.roughness * roughnessGain * (random(ops, seed) * (max - min) + min);
}
