"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.roughLine = roughLine;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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
function roughLine(x1, y1, x2, y2, opts) {
  // const finalOptions = { ...defaultOptions, ...opts };
  var drawing = _roughLine(x1, y1, x2, y2, opts);

  var path = opsToPath(drawing);
  return path;
}

function opsToPath(drawing) {
  var path = "";
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (
      var _iterator = drawing.ops[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      var item = _step.value;
      var data = item.data;

      switch (item.op) {
        case "move":
          path += "M".concat(data[0], " ").concat(data[1], " ");
          break;

        case "bcurveTo":
          path += "C"
            .concat(data[0], " ")
            .concat(data[1], ", ")
            .concat(data[2], " ")
            .concat(data[3], ", ")
            .concat(data[4], " ")
            .concat(data[5], " ");
          break;

        case "lineTo":
          path += "L".concat(data[0], " ").concat(data[1], " ");
          break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return path.trim();
}

function _roughLine(x1, y1, x2, y2, o) {
  return {
    type: "path",
    ops: _doubleLine(x1, y1, x2, y2, o),
  };
}

function line(x1, y1, x2, y2, options) {
  var d = _roughLine(x1, y1, x2, y2, options);

  return draw(d);
}

function _doubleLine(x1, y1, x2, y2, o) {
  //const singleStroke = o.disableMultiStroke;
  var singleStroke = true;

  var o1 = _line(x1, y1, x2, y2, o, true, false);

  if (singleStroke) {
    return o1;
  }

  var o2 = _line(x1, y1, x2, y2, o, true, true);

  return o1.concat(o2);
}

function _line(x1, y1, x2, y2, o, move, overlay) {
  var lengthSq = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
  var length = Math.sqrt(lengthSq);
  var roughnessGain = 1;

  if (length < 200) {
    roughnessGain = 1;
  } else if (length > 500) {
    roughnessGain = 0.4;
  } else {
    roughnessGain = -0.0016668 * length + 1.233334;
  }

  var offset = o.maxRandomnessOffset || 0;

  if (offset * offset * 100 > lengthSq) {
    offset = length / 10;
  }

  var halfOffset = offset / 2;
  var divergePoint = 0.2 + random(o, x1 + y1 + x2 + y2) * 0.2;
  var midDispX = (o.bowing * o.maxRandomnessOffset * (y2 - y1)) / 200;
  var midDispY = (o.bowing * o.maxRandomnessOffset * (x1 - x2)) / 200;
  midDispX = _offsetOpt(midDispX, o, x1, roughnessGain);
  midDispY = _offsetOpt(midDispY, o, y1, roughnessGain);
  var ops = [];

  var randomHalf = function randomHalf() {
    return _offsetOpt(halfOffset, o, x1, roughnessGain);
  };

  var randomFull = function randomFull() {
    return _offsetOpt(offset, o, x2, roughnessGain);
  };

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

var Random = /*#__PURE__*/ (function() {
  function Random(seed) {
    _classCallCheck(this, Random);

    this.seed = seed;
  }

  _createClass(Random, [
    {
      key: "next",
      value: function next() {
        if (this.seed) {
          return ((Math.pow(2, 31) - 1) & (this.seed = Math.imul(48271, this.seed))) / Math.pow(2, 31);
        } else {
          return Math.random();
        }
      },
    },
  ]);

  return Random;
})();

function random(ops, seed) {
  // if (!ops.randomizer) {
  ops.randomizer = new Random(ops.seed || seed || 0); // }

  return ops.randomizer.next();
}

function _offsetOpt(x, ops, seed) {
  var roughnessGain = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  return _offset(-x, x, ops, seed, roughnessGain);
}

function _offset(min, max, ops, seed) {
  var roughnessGain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  return ops.roughness * roughnessGain * (random(ops, seed) * (max - min) + min);
}
