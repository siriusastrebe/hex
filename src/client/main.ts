import './style.css'
import { HexBoard, HexGrid2d, HexObject } from './geometry.js';
import { Stage, Hex3d, Model3d } from './art.js';

import { io } from "socket.io-client";
import jsynchronous from './jsynchronous-client.js';
import { MouseControls, KeyControls, DrawTileMode, DrawCharacterMode, DrawOrnamentMode, EraserMode } from './controls.js';
import { EditorMenuControls, MessagesMenu, SharedStateMenu } from './menus.js';
import { pixelToHex } from './helpers.js';

window.z = HexGrid2d

const socket = io();

const board = new HexBoard(true, 0.96, 0.04);
const stage = new Stage(true);

window.jsynchronous = jsynchronous;

jsynchronous.send = (data) => socket.emit('msg', data);
socket.on('msg', (data) => { jsynchronous.onmessage(data) });

const $gameboard = jsynchronous('object', 'gameboard');
const $generalChat = jsynchronous('object', 'chatroom-general');
const $sharedState = jsynchronous('object', 'sharedState');

const sharedStateMenu = new SharedStateMenu($sharedState);
$sharedState.$on('change', '', (data) => { sharedStateMenu.setEntry(data.prop, data.value) });


$gameboard.$on('change', 'pieces', (data) => {
  const op = data.op;
  const pieces = data.variable;
  const piece = data.value;
  const oldPiece = data.oldValue;

  if (op === 'set') {
    console.log('Set', piece.id, piece.q, piece.r, piece.z, piece.type, piece.subtype);
    if (piece.type === 'tile') {
      let color = '#ffffff';
      if (piece.subtype === 'water') color = '#0021f3';
      else if (piece.subtype === 'dirt') color = '#834112';

      const hex3d = new Hex3d(stage, board.newHex(piece), color);
      const hexObject = new HexObject(piece, [hex3d]);
      const placeholders = board.getPlaceholders(piece.q, piece.r, piece.z).filter(e => e.type === piece.type && e.subtype === piece.subtype);

      if (placeholders.length > 0) {
        placeholders.forEach(placeholder => board.removePlaceholder(placeholder))
      }
      board.setObject(piece, hexObject);
    } else if (piece.type === 'character') {
      const model3d = new Model3d(stage, board, piece); 
      const hexObject = new HexObject(piece, [model3d], piece.spin);
      board.setObject(piece, hexObject);

      model3d.onLoad(() => {
        const placeholders = board.getPlaceholders(piece.q, piece.r, piece.z).filter(e => e.type === piece.type && e.subtype === piece.subtype);
        if (placeholders) {
          placeholders.forEach(placeholder => board.removePlaceholder(placeholder))
        }
      });
    } else if (piece.type === 'ornament') {
      const hex3d = new Hex3d(stage, board.newHex(piece), '#ffffff', {openEnded: true, shadows: false});
      hex3d.loadImage(piece.subtype).then(() => {});
      const hexObject = new HexObject(piece, [hex3d]);
      board.setObject(piece, hexObject);

      const placeholders = board.getPlaceholders(piece.q, piece.r, piece.z).filter(e => e.type === piece.type && e.subtype === piece.subtype);
      if (placeholders.length > 0) {
        placeholders.forEach(placeholder => board.removePlaceholder(placeholder))
      }
    }
  } else if (op === 'delete') {
    if (oldPiece) {
      const objects = board.getObjects(oldPiece.q, oldPiece.r, oldPiece.z);
      const existing = objects.find(e => e.type === oldPiece.type && e.subtype === oldPiece.subtype);
      console.log('Deleting existing', existing);
      board.remove(existing);
    }
  }
});

$generalChat.$on('change', 'messages', (data) => {
  console.log('messages', data);
  messagesMenu.addToChatlog(data.value);
});

// $gameboard.$on('changes', (gameboard) => {
//   // TODO: I need some long term solution for synchronizing the differences here. I think it may require
//   // altering jsynchronous to register diffs instead of just the final state.
//   console.log('changes', gameboard);
//   gameboard.pieces.forEach(piece => {
// 
//     const objects = board.getObjects(piece.q, piece.r, piece.z);
//     const existing = objects.find(e => e.type === piece.type && e.subtype === piece.subtype);
// 
//     if (!existing) {
//       // console.log('piece', piece.q, piece.r, piece.z, piece.type, piece.subtype)
//       if (piece.type === 'tile') {
//         const hex3d = new Hex3d(stage, board, piece);
//         const hex = board.newHex(piece.q, piece.r, piece.z);
//         const hexObject = new HexObject(hex, piece, [hex3d]);
//         const placeholders = board.getPlaceholders(piece.q, piece.r, piece.z).filter(e => e.type === piece.type && e.subtype === piece.subtype);
//         if (placeholders) {
//           placeholders.forEach(placeholder => placeholder.remove())
//         }
//         board.setObject(piece, hexObject);
//       } else if (piece.type === 'character') {
//         const model3d = new Model3d(stage, board, piece); 
//         const hex = board.newHex(piece.q, piece.r, piece.z);
//         const hexObject = new HexObject(hex, piece, [model3d], piece.spin);
//         board.setObject(piece, hexObject);
//         model3d.onLoad(() => {
//           const placeholders = board.getPlaceholders(piece.q, piece.r, piece.z).filter(e => e.type === piece.type && e.subtype === piece.subtype);
//           if (placeholders) {
//             placeholders.forEach(placeholder => placeholder.remove())
//           }
//         });
//       }
//     } else if (existing && piece.type !== existing.type || piece.subtype !== existing.subtype) {
//       board.remove(existing);
//       console.log('Removing', existing.type, existing.subtype, existing.hex)
//       // const existing = this.hexes[q][r];
//       // if (existing) {
//       //   existing.remove(stage);
//       //   delete this.hexes[q][r];
//       //   console.log('Deleting', q, r)
//       // } else {
//       //   throw "Cannot remove tile that doesn't exist";
//       // }
// 
//       // board.newHex(tile.q, tile.r, Hex3d, stage, tile.type);
//     }
//   });
// });

// board.drawHexes(true);
const ripples = [];
const keyControls = new KeyControls();
const mouseControls = new MouseControls(keyControls);
const editorMenuControls = new EditorMenuControls();
editorMenuControls.createEditorButtons();
const messagesMenu = new MessagesMenu(socket);
const drawTileMode = new DrawTileMode(stage, board, editorMenuControls, mouseControls, socket);
const drawCharacterMode = new DrawCharacterMode(stage, board, editorMenuControls, mouseControls, socket);
const drawOrnamentMode = new DrawOrnamentMode(stage, board, editorMenuControls, mouseControls, socket);
const eraserMode = new EraserMode(stage, board, editorMenuControls, mouseControls, socket);


window.addEventListener('mousedown', (event) => {
  const { x, y, left } = mouseControls.mousedown(event);
  if (left) {
    if (editorMenuControls.mode === 'tile') {
      drawTileMode.mousedown({x, y});
    } else if (editorMenuControls.mode === 'character') {
      drawCharacterMode.mousedown({x, y});
    } else if (editorMenuControls.mode === 'ornament') {
      drawOrnamentMode.mousedown({x, y});
    } else if (editorMenuControls.mode === 'erase') {
      eraserMode.mousedown({x, y});
    }
  }

  const hex = pixelToHex({x, y}, stage, board);
  if (hex && board.getObjects(hex.q, hex.r, hex.z).find(o => o.subtype === 'water')) {
    if (!ripples.find(ripple => ripple.hex.equals(hex))) {
      const objects = this.board.getObjects(hex.q, hex.r, hex.z);
      if (objects && objects.find(o => o.subtype === 'water')) {
        ripples.push({time: new Date().getTime(), hex: hex});
      }
    }
  }
});

window.addEventListener('mouseup', (event) => {
  const {x, y} = mouseControls.mouseup(event);
  if (editorMenuControls.mode === 'character') {
    drawCharacterMode.mouseup({x, y});
  } else if (editorMenuControls.mode === 'ornament') {
    drawOrnamentMode.mouseup({x, y});
  }
});

window.addEventListener('mousemove', (event) => {
  const {x, y} = mouseControls.mousemove(event);
  if (editorMenuControls.mode === 'tile') {
    drawTileMode.mousemove({x, y});
  } else if (editorMenuControls.mode === 'character') {
    drawCharacterMode.mousemove({x, y});
  } else if (editorMenuControls.mode === 'ornament') {
    drawOrnamentMode.mousemove({x, y});
  }

  const hex = pixelToHex({x, y}, stage, board);
  if (hex && board.getObjects(hex.q, hex.r, hex.z).find(o => o.subtype === 'water')) {
    if (!ripples.find(ripple => ripple.hex.equals(hex))) {
      ripples.push({time: new Date().getTime(), hex: hex});
    }
  }
});

window.addEventListener('touchstart', (event) => {
  const {x, y} = mouseControls.touchstart(event);
  drawTileMode.touchstart({x, y});
});

window.addEventListener('touchmove', (event) => {
  const {x, y} = mouseControls.touchmove(event);
  drawTileMode.touchmove({x, y});
});

window.addEventListener('wheel', (event) => {
  const delta = event.deltaY;
  stage.zoom(delta);
});



window.addEventListener('keydown', (event) => {
  keyControls.keydown(event);
  messagesMenu.keydown(event);
});

window.addEventListener('keyup', (event) => {
  keyControls.keyup(event);
});


window.addEventListener('resize', (event) => {
  stage.resize();
});

document.addEventListener('contextmenu', event => event.preventDefault()); // Prohibit right click context menu

stage.animate(board, ripples, keyControls, mouseControls, editorMenuControls);