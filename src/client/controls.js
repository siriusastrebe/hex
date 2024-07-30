import { Vector2, HexObject } from './geometry.js';
import { Hex3d, Model3d } from './art.js';
import { pixelToHex, spinBetweenHexes } from './helpers.js';

export class MouseControls {
  constructor(keyControls) {
    this.drawMode = 'tile';
    this.leftMouseDown = false;
    this.middleMouseDown = false;
    this.rightMouseDown = false;
    this.cursor = {x: 0, y: 0};
    this.clickStart;
    this.movements = [];
    this.keyControls = keyControls;
  }
  mousedown(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    this.clickStart = {x, y};
    this.cursor = {x, y};
    const button = this.getMouseButton(event);
    if (button === 'left' && !event.metaKey) {
      this.leftMouseDown = true;
    }
    if (button === 'middle' || (button === 'left' &&  event.metaKey)) {
      this.middleMouseDown = true;
    }
    if (button === 'right' || (button === 'left' && event.ctrlKey)) {
      this.rightMouseDown = true;
    }

    return {x, y, left: this.leftMouseDown, middle: this.middleMouseDown, right: this.rightMouseDown};
  }
  mouseup(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    this.cursor = {x, y};
    const button = this.getMouseButton(event);
    if (button === 'left') {
      this.leftMouseDown = false;
      this.middleMouseDown = false; // Incase they used metaKey to rotate
      this.rightMouseDown = false; // Incase they used ctrl to drag
    }
    if (button === 'middle') {
      this.middleMouseDown = false;
    }
    if (button === 'right') {
      this.rightMouseDown = false;
    }

    return {x, y, left: this.leftMouseDown, middle: this.middleMouseDown, right: this.rightMouseDown};
  }
  mousemove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    this.trackMovement(x, y);
    this.cursor = {x, y};
    return {x, y};
  }
  getMouseButton(event) {
    switch (event.which) {
      case 1: return 'left';
      case 2: return 'middle';
      case 3: return 'right'; 
    }
  }
  touchstart(event) {
    const x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    const y = -((event.touches[0].clientY / window.innerHeight) * 2 - 1);
    this.cursor = {x, y};
    this.leftMouseDown = true;
    return {x, y};
  }
  touchmove(event) {
    const x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    const y = -((event.touches[0].clientY / window.innerHeight) * 2 - 1);
    this.clickStart = {x, y};
    this.cursor = {x, y};
    this.trackMovement(x, y);
    return {x, y};
  }
  touchend(event) {
    const x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    const y = -((event.touches[0].clientY / window.innerHeight) * 2 - 1);
    this.cursor = {x, y};
    this.leftMouseDown = false;
    return {x, y};
  }
  trackMovement(x, y) {
    for (let i = 0; i < this.movements.length; i++) {
      if (this.movements[i].t > new Date().getTime() - 1000) {
        this.movements = this.movements.slice(i);
        break;
      }
    }
    this.movements.push({x, y, t: new Date().getTime()});
  }
}

export class DrawTileMode {
  constructor(stage, board, editorMenuControls, mouseControls, socket) {
    this.stage = stage;
    this.board = board;
    this.editorMenuControls = editorMenuControls;
    this.mouseControls = mouseControls;
    this.socket = socket;
  }
  mousemove(pixel) {
    const hex = pixelToHex(pixel, this.stage, this.board);
    if (hex) {
      if (this.mouseControls.leftMouseDown) {
        this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), hex.q, hex.r).forEach((hex) => {
          const objects = this.board.getObjects(hex.q, hex.r, hex.z);
          const placeholders = this.board.getPlaceholders(hex.q, hex.r, hex.z).filter(e => e.type === 'tile');
          if (objects.length === 0 && placeholders.length === 0) {
            const piece = {q: hex.q, r: hex.r, z: hex.z, type: 'tile', subtype: this.editorMenuControls.editTileSelected()}
            this.socket.emit('draw', piece);
            console.log('mousemove draw', piece);

            let color = '#ffffff';
            if (piece.subtype === 'water') color = '#0021f3';
            else if (piece.subtype === 'dirt') color = '#834112';

            const hex3d = new Hex3d(this.stage, hex, color, {wireframe: true});
            const hexObject = new HexObject(piece, [hex3d], piece.spin);
            this.board.setPlaceholder(piece, hexObject);
          }
        });
      }
    }
  }
  mousedown(pixel) {
    if (this.mouseControls.leftMouseDown) {
      const target = pixelToHex(pixel, this.stage, this.board);
      this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), target.q, target.r).forEach((hex) => {
        const objects = this.board.getObjects(hex.q, hex.r, hex.z);
        const placeholders = this.board.getPlaceholders(hex.q, hex.r, hex.z).filter(e => e.type === 'tile');
        if (objects.length === 0 && placeholders.length === 0) {
          const piece = {q: hex.q, r: hex.r, z: hex.z, type: 'tile', subtype: this.editorMenuControls.editTileSelected()}

          this.socket.emit('draw', piece);
          console.log('mousedown draw', piece);

          let color = '#ffffff';
          if (piece.subtype === 'water') color = '#0021f3';
          else if (piece.subtype === 'dirt') color = '#834112';

          const hex3d = new Hex3d(this.stage, hex, color, {wireframe: true});
          const hexObject = new HexObject(piece, [hex3d], piece.spin);
          this.board.setPlaceholder(piece, hexObject);
        }
      });
    }
  }
  touchstart(pixel) {
    const intersection = this.stage.pixelToXYIntercept(pixel, this.stage);
    const hex = this.board.pixelToCube(new Vector2(intersection.x, intersection.y), board.flat);

    if (board.getObjects(hex.q, hex.r, hex.z).length === 0) {
      this.socket.emit('draw', {q: hex.q, r: hex.r, type: 'tile', subtype: this.editorMenuControls.editTileSelected()});
      console.log('emitting draw tile');
    }
  }
  touchmove(pixel) {
    const intersection = this.stage.pixelToXYIntercept(pixel, y, stage);
    if (intersection) {
      const hex = this.board.pixelToCube(new Vector2(intersection.x, intersection.y), board.flat);
      if (this.board.getObjects(hex.q, hex.r, hex.z).length === 0) {
        this.socket.emit('draw', {q: hex.q, r: hex.r, type: 'tile', subtype: this.editorMenuControls.editTileSelected()});
        console.log('emitting draw tile');
      }
    }
  }
}

export class DrawCharacterMode {
  constructor(stage, board, editorMenuControls, mouseControls, socket) {
    this.stage = stage;
    this.board = board;
    this.editorMenuControls = editorMenuControls;
    this.mouseControls = mouseControls;
    this.socket = socket;
    this.activeHex = null;
    this.activePlaceholders = [];
  }
  mousedown(pixel) {
    if (this.mouseControls.leftMouseDown) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      if (hex) {
        this.activeHex = hex;
        this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), hex.q, hex.r).forEach((hex) => {
          const objects = this.board.getObjects(hex.q, hex.r, hex.z);
          const placeholders = this.board.getPlaceholders(hex.q, hex.r, hex.z).filter(e => e.type === 'character');
          if (!objects.find(o => o.type === 'character') && placeholders.length === 0 && this.editorMenuControls.editCharacterSelected()) {
            const piece = {q: hex.q, r: hex.r, z: hex.z, type: 'character', subtype: this.editorMenuControls.editCharacterSelected()}
            const model3d = new Model3d(this.stage, this.board, {...piece, placeholder: true}, '#7bfafc'); 
            const hexObject = new HexObject(piece, [model3d]);
            this.board.setPlaceholder(piece, hexObject);
            this.activePlaceholders.push(hexObject);
          }
        });
      }
    }
  } 
  mousemove(pixel) {
    if (this.activePlaceholders.length > 0) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      const spin = spinBetweenHexes(this.activeHex, hex);
      this.activePlaceholders.forEach(placeholder => {
        placeholder.rotateTo(spin);
      });
    }
  }
  mouseup(pixel) {
    if (this.activePlaceholders.length > 0) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      const spin = spinBetweenHexes(this.activeHex, hex);
      this.activePlaceholders.forEach(placeholder => {
        const piece = { q: placeholder.piece.q, r: placeholder.piece.r, z: placeholder.piece.z, spin: spin, type: 'character', subtype: placeholder.subtype };
        this.socket.emit('draw', piece);
        console.log('emitting draw character', piece);
      });
      this.activePlaceholders.length = 0;
    }
  }
}

export class DrawOrnamentMode {
  constructor(stage, board, editorMenuControls, mouseControls, socket) {
    this.stage = stage;
    this.board = board;
    this.editorMenuControls = editorMenuControls;
    this.mouseControls = mouseControls;
    this.socket = socket;
    this.activeHex = null;
    this.activePlaceholders = [];
  }
  mousedown(pixel) {
    if (this.mouseControls.leftMouseDown) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      if (hex) {
        this.activeHex = hex;
        this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), hex.q, hex.r).forEach((hex) => {
          if (this.editorMenuControls.editOrnamentSelected()) {
            hex.z = hex.z + 1; // Ornaments sit on top of tiles
            const piece = {q: hex.q, r: hex.r, z: hex.z, type: 'ornament', subtype: this.editorMenuControls.editOrnamentSelected()};
            const hex3d = new Hex3d(this.stage, hex, '#ffffff', {openEnded: true, shadows: false, opacity: 0.3});
            hex3d.loadImage(piece.subtype).then(() => {});
            const hexObject = new HexObject(piece, [hex3d]);
            this.board.setPlaceholder(piece, hexObject);
            this.activePlaceholders.push(hexObject);
          }
        });
      }
    }
  } 
  mousemove(pixel) {
    if (this.activePlaceholders.length > 0) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      const spin = spinBetweenHexes(this.activeHex, hex);
      this.activePlaceholders.forEach(placeholder => {
        placeholder.rotateTo(spin);
      });
    }
  }
  mouseup(pixel) {
    if (this.activePlaceholders.length > 0) {
      const hex = pixelToHex(pixel, this.stage, this.board);
      const spin = spinBetweenHexes(this.activeHex, hex);
      console.log('active placeho', this.activePlaceholders.length);
      this.activePlaceholders.forEach(placeholder => {
        const piece = {...placeholder.piece, spin: spin};
        this.socket.emit('draw', piece);
        console.log('emitting draw character', piece);
      });
      this.activePlaceholders.length = 0;
    }
  }
}


export class EraserMode {
  constructor(stage, board, editorMenuControls, mouseControls, socket) {
    this.stage = stage;
    this.board = board;
    this.editorMenuControls = editorMenuControls;
    this.mouseControls = mouseControls;
    this.socket = socket;
    this.activeHex = null;
    this.activePlaceholders = [];
  }
  mousedown(pixel) {
    console.log('mousedown', pixel);
    const hex = pixelToHex(pixel, this.stage, this.board);
    const hexes = this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), hex.q, hex.r);
    hexes.forEach((hex) => {
      this.board.getObjects(hex.q, hex.r).forEach((object) => {
        if (object.type === this.editorMenuControls.eraserMenu.selected) {
          console.log('Erasing', object.piece.id)
          this.socket.emit('erase', {id: object.piece.id});
        }
      });
    });
  }
  mousemove(pixel) {
    const hex = pixelToHex(pixel, this.stage, this.board);
    const hexes = this.board.hexesInRadius(this.editorMenuControls.editTileDistance(), hex.q, hex.r);
    hexes.forEach((hex) => {
      this.board.getObjects(hex.q, hex.r).forEach((object) => {
        if (object.type === this.editorMenuControls.eraserMenu.selected) {
          console.log('Erasing', object.piece.id)
          this.socket.emit('erase', {id: object.piece.id});
        }
      });
    });
  }
}

export class KeyControls {
  constructor() {
    this.leftArrowDown = false;
    this.rightArrowDown = false;
    this.upArrowDown = false;
    this.downArrowDown = false;
  }
  keydown(event) {
    switch (event.key) {
      case "ArrowLeft":
        this.leftArrowDown = true;
        break;
      case "ArrowRight":
        this.rightArrowDown = true;
        break;
      case "ArrowUp":
        this.upArrowDown = true;
        break;
      case "ArrowDown":
        this.downArrowDown = true;
        break;
    }
  }
  keyup(event) {
    // if (event.altKey === false || event.which === 18) this.altKey = false;
    // if (event.metaKey === false || event.which === 224) this.metaKey = false;
    // if (event.ctrlKey === false || event.which === 17) this.crtlKey = false;
    switch (event.key) {
      case "ArrowLeft":
        this.leftArrowDown = false;
        break;
      case "ArrowRight":
        this.rightArrowDown = false;
        break;
      case "ArrowUp":
        this.upArrowDown = false;
        break;
      case "ArrowDown":
        this.downArrowDown = false;
        break;
    }
  }
}
