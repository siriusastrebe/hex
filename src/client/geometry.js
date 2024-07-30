import { spinToRadians, radiansToSpin } from "./helpers.js";

export class Hex {
  constructor(q, r, z = 0, flat, size, gap) {
    this.q = q;
    this.r = r;
    this.s = -q - r; 
    this.z = z;

    this.flat = flat;
    this.size = size;
    this.gap = gap;
  }
  validate() {
    return this.q + this.r + this.s === 0
  }
  equals(hex, includeZ = false) {
    if (!includeZ) {
      return this.q === hex.q && this.r === hex.r && this.s === hex.s;
    } else {
      return this.q === hex.q && this.r === hex.r && this.s === hex.s && this.z === hex.z;
    }
  }
  add(hex) {
    return new Hex(this.q + hex.q, this.r + hex.r, this.z + hex.z, this.flat, this.size, this.gap);
  }
  subtract(hex) {
    return new Hex(this.q - hex.q, this.r - hex.r, this.z - hex.z, this.flat, this.size, this.gap);
  }
  multiply(hex) {
    return new Hex(this.q * hex.q, this.r * hex.r, this.z * hex.z, this.flat, this.size, this.gap);
  }
  distance(hex) {
    // Does it make any sense to have Z in this distance calculation?
    var difference = this.subtract(hex);
    return (Math.abs(difference.q) + Math.abs(difference.r) + Math.abs(difference.s)) / 2;
  }
  center() {
    if (this.flat) {
      return new Vector2(
        (this.size + this.gap) * (3 / 2 * this.q),
        (this.size + this.gap) * (Math.sqrt(3) / 2 * this.q + Math.sqrt(3) * this.r)
      );
    } else {
      return new Vector2(
        (this.size + this.gap) * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r),
        (this.size + this.gap) * (3 / 2 * this.r)
      );
    }
  }
  corners() {
    const center = this.center();
    return [0, 1, 2, 3, 4, 5].map((corner) => {
      const angle = 2 * Math.PI / 6 * (corner + (this.flat ? 0 : 0.5));
      return new Vector2(center.x + (this.size + this.gap) * Math.cos(angle), center.y + (this.size + this.gap) * Math.sin(angle));
    });
  }
}
export class Cube {
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r; 
  }
}
export class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(v) {
    this.x += v.x; 
    this.y += v.y;
    this.z += v.z;
  }
  multiplyScalar(scalar) {
    this.x *= scalar; 
    this.y *= scalar;
    this.z *= scalar;
  }
}

export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
  }
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }
  sortByClosest(points) {
    const distances = points.map((p, i) => {
      return [i, Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2))];
    });
    const sorted = distances.sort((a, b) => {
      return b[1] - a[1];
    });
    return sorted.map((s) => {
      return points[s[0]];
    });
  }
  radianExtent(points) {
    const angles = points.map((p, i) => {
      const v = new Vector2(p.x - this.x, p.y - this.y);
      let angle = Math.atan2(v.y, v.x);
      return angle;
    });
    return angles.sort((a, b) => {
      return Math.abs(a) - Math.abs(b);
    });
  }
}

export function cube_round(frac) {
  var q = Math.round(frac.q)
  var r = Math.round(frac.r)
  var s = Math.round(frac.s)

  var q_diff = Math.abs(q - frac.q)
  var r_diff = Math.abs(r - frac.r)
  var s_diff = Math.abs(s - frac.s)

  if (q_diff > r_diff && q_diff > s_diff) {
    q = -r-s
  } else if (r_diff > s_diff) {
    r = -q-s
  } else {
    s = -q-r
  }

  return new Cube(q, r, s)
}
export function axial_round(hex) {
  return cube_to_axial(cube_round(axial_to_cube(hex)));
}
export function cube_to_axial(cube) {
  let q = cube.q
  let r = cube.r
  return new Hex(q, r)
}

export function axial_to_cube(hex) {
  var q = hex.q
  var r = hex.r
  var s = -q-r
  return new Cube(q, r, s)
}


export class HexGrid2d {
  constructor(flat, size, gap) {
    // Flat-top indicates the hexagon's orientation along the x-y plane.
    this.flat = flat;
    // Hex tiles are variable height, but the same width and length.
    this.size = size;
    this.gap = gap;
    this.center = new Vector2(0, 0);
    this.countByRadius = [1, 7, 19, 37, 61, 91, 127, 169, 217, 271, 331, 397, 469, 547, 631, 721, 817, 919, 1027, 1141, 1261, 1387, 1519, 1657, 1801, 1951, 2107, 2269, 2437, 2611, 2791, 2977, 3169, 3367, 3571, 3781, 3997, 4219, 4447, 4681, 4921, 5167, 5419, 5677, 5941, 6211, 6487, 6769, 7057, 7351, 7651, 7957, 8269, 8587, 8911, 9241, 9577, 9919, 10267, 10621, 10981, 11347, 11719, 12097, 12481, 12871, 13267, 13669, 14077, 14491, 14911, 15337, 15769, 16207, 16651, 17101, 17557, 18019, 18487, 18961, 19441, 19927, 20419, 20917, 21421, 21931, 22447, 22969, 23497, 24031, 24571, 25117, 25669, 26227, 26791, 27361, 27937, 28519, 29107, 2970];
  }
  hexesInRadius (radius, startQ, startR) {
    if (startQ === undefined) startQ = 0;
    if (startR === undefined) startR = 0;

    const hexes = [];
    for (let q=-radius; q<=radius; q++) {
      for (let r=Math.max(-radius, -q - radius); r<=Math.min(radius, -q + radius); r++) {
        const start = this.newHex(startQ, startR);
        const hex = start.add(this.newHex(q, r));
        hexes.push(this.newHex(hex.q, hex.r));
      }
    }
    return hexes;
  }
  pixelToCube(point) {
    const x = point.x - this.center.x;
    const y = point.y - this.center.y;
    if (this.flat) {
      var q = (2/3 * x) / (this.size + this.gap);
      var r = (-1/3 * x + Math.sqrt(3)/3 * y) / (this.size + this.gap);
      return axial_round(this.newHex(q, r));
    } else {
      var q = (Math.sqrt(3)/3 * x  -  1/3 * y) / (this.size + this.gap);
      var r = (2/3 * y) / (this.size + this.gap);
      return axial_round(this.newHex(q, r));
    }
  }
  newHex(q, r, z = 0) {
    if (q.q !== undefined && q.r !== undefined) {
      return new Hex(q.q, q.r, q.z, this.flat, this.size, this.gap);
    } else {
      return new Hex(q, r, z, this.flat, this.size, this.gap);
    }
  }
}

export class HexObject {
  constructor(piece, assets, spin = 0) {
    this.piece = piece;
    this.type = piece.type;
    this.subtype = piece.subtype;
    this.assets = assets;

    this.acceleration = new Vector3(0, 0, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.position = new Vector3(0, 0, 0);
 
    // spin is stored as 0 = up. Each integer above that is 60 degrees counterclockwise.
    this.spin = spin;
  }
  rotate(spin) {
    if (spin === undefined) spin = 0;
    this.spin += spin;
    this.rotateTo();
  }
  rotateTo(spin) {
    if (spin !== undefined) {
      this.spin = spin;
    }
    this.assets.forEach((asset) => {
      asset.rotateTo(spinToRadians(this.spin));
    });
  }
  remove() {
    this.assets.forEach((asset) => {
      asset.remove();
    });
  }
}

export class HexBoard extends HexGrid2d {
  constructor(flat, size, gap) {
    super(flat, size, gap);
    // access pattern: this.objects[q][r].forEach((object) => {});
    // Objects are stored in Z order for hex q, r
    this.objects = {};

    // Placeholders are not subject to the same physics and interactions as objects.
    this.placeholders = {};
  }
  setObject(piece, hexObject) {
    const hex = this.newHex(piece.q, piece.r, piece.z);

    this.expand(hex);
    const objects = this.objects[hex.q][hex.r];
    for (let i=0; i<objects.length; i++) {
      // Preserve Z ordering
      if (objects[i].piece.z > hex.z) {
        console.log('splicing', objects.length);
        objects.splice(i, 0, hexObject);
        return hexObject;
      }
    }
    this.objects[hex.q][hex.r].push(hexObject);
    return hexObject;
  }
  getObjects(q, r, z) {
    if (this.objects[q] && this.objects[q][r]) {
      if (z === undefined) {
        return this.objects[q][r];
      } else {
        return this.objects[q][r].filter(o => o.piece.z === z);
      }
    }
    return []
  }
  allObjects () {
    let all = [];
    Object.keys(this.objects).forEach((q) => {
      Object.keys(this.objects[q]).forEach((r) => {
        all = [...all, ...this.objects[q][r]];
      });
    });
    return all;
  }
  setPlaceholder(piece, hexObject) {
    this.expand(piece, this.placeholders);
    const placeholders = this.placeholders[piece.q][piece.r];
    for (let i=0; i<placeholders.length; i++) {
      // Preserve Z ordering
      if (placeholders[i].piece.z > piece.z) {
        console.log('splicing', placeholders.length);
        placeholders.splice(i, 0, hexObject);
        return hexObject;
      }
    }
    this.placeholders[piece.q][piece.r].push(hexObject);
    return hexObject;
  }
  getPlaceholders(q, r, z) {
    if (this.placeholders[q] && this.placeholders[q][r]) {
      if (z === undefined) {
        return this.placeholders[q][r];
      } else {
        return this.placeholders[q][r].filter(o => o.piece.z === z);
      }
    }
    return [];
  }
  allPlaceholders() {
    let all = [];
    Object.keys(this.placeholders).forEach((q) => {
      Object.keys(this.placeholders[q]).forEach((r) => {
        all = [...all, ...this.placeholders[q][r]];
      });
    });
    return all;
  }
  removePlaceholder(object, keepAssets = false) {
    this.getPlaceholders(object.piece.q, object.piece.r, object.piece.z).forEach((placeholder) => {
      if (placeholder.type === object.type && placeholder.subtype === object.subtype) {
        if (!keepAssets) {
          placeholder.remove();
        }
        this.placeholders[object.piece.q][object.piece.r].splice(this.placeholders[object.piece.q][object.piece.r].indexOf(placeholder), 1);
      }
    });
  }
  expand(hex, targetVariable) {
    if (targetVariable === undefined) targetVariable = this.objects;
    targetVariable[hex.q] = targetVariable[hex.q] || {};
    targetVariable[hex.q][hex.r] = targetVariable[hex.q][hex.r] || [];
  }
  remove(object) {
    const piece = object.piece;
    const hex = this.newHex(piece.q, piece.r, piece.z);

    object.assets.forEach((asset) => {
      asset.remove();
    });

    const index = this.objects[hex.q][hex.r].indexOf(object);
    if (index !== -1) {
      this.objects[hex.q][hex.r].splice(index, 1);
    }
  }
}
