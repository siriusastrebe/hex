import { Preview3d } from "./art";
import { HexGrid2d } from "./geometry";
import { shorthandTime } from "./helpers";
import knight from './svg/knight.svg';
import eraser from './svg/eraser.svg';
import flameo from './svg/flameo.svg';
import characters from './characters.json';

export class EditorMenuControls {
  constructor() {
    this.editTileMenu = new TileMenu(this);
    this.editCursorMenu = new CursorMenu(this);
    this.editCharacterMenu = new CharacterMenu(this);
    this.editOrnamentMenu = new OrnamentMenu(this);
    this.eraserMenu = new EraserMenu(this);

    this.mode = 'tile';

    this.editCharacterMenuPreviews = [];
  }
  keydown(event) {
    switch (event.key) {
      case "Escape":
        this.menu = !this.menu;
        break;
    }
  }
  keyup(event) {
    switch (event.key) {
      case "Escape":
        this.menu = !this.menu;
        break;
    }
  }
  unselectAll() {
    this.editTileMenu.unselectAll();
    this.editCharacterMenu.unselectAll();
  }
  createEditorButtons() {
    const editTileButton = document.createElement('div');
    editTileButton.style.width = '100px';
    editTileButton.style.height = '100px';
    editTileButton.style.position = 'fixed';
    editTileButton.style.left = 20 + 'px';
    editTileButton.style.zIndex = '1';
    editTileButton.style.bottom = 20 + 'px';
    editTileButton.style.cursor = 'pointer';
    editTileButton.style.borderRadius = '8px';
    editTileButton.style.backgroundColor = 'black';

    editTileButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.toggleEditTileMenu();
    });

    editTileButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    const editTileSVG = svgElement(100, 100);
    svgHex(100, 100).forEach(line => editTileSVG.appendChild(line));

    editTileButton.appendChild(editTileSVG);
    document.body.appendChild(editTileButton);

    const editCursorButton = document.createElement('div');
    editCursorButton.style.width = '100px';
    editCursorButton.style.height = '100px';
    editCursorButton.style.position = 'fixed';
    editCursorButton.style.left = 20 + 'px';
    editCursorButton.style.zIndex = '1';
    editCursorButton.style.bottom = 140 + 'px';
    editCursorButton.style.cursor = 'pointer';
    editCursorButton.style.borderRadius = '8px';
    editCursorButton.style.backgroundColor = 'black';

    const editCursorSVG = svgElement(100, 100);
    editCursorSVG.appendChild(svgLine({x: 60, y: 100}, {x: 43, y: 60}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 43, y: 60}, {x: 25, y: 75}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 25, y: 75}, {x: 25, y: 0}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 25, y: 0}, {x: 75, y: 55}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 75, y: 55}, {x: 50, y: 57}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 50, y: 57}, {x: 67, y: 96}, '#CCCCCC', 2));
    editCursorSVG.appendChild(svgLine({x: 67, y: 96}, {x: 60, y: 100}, '#CCCCCC', 2));

    editCursorButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.toggleEditCursorMenu();
    });
    editCursorButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    editCursorButton.appendChild(editCursorSVG);
    document.body.appendChild(editCursorButton);

    const editCharactersButton = document.createElement('div');
    editCharactersButton.style.width = '100px';
    editCharactersButton.style.height = '100px';
    editCharactersButton.style.position = 'fixed';
    editCharactersButton.style.left = 20 + 'px';
    editCharactersButton.style.zIndex = '1';
    editCharactersButton.style.bottom = 260 + 'px';
    editCharactersButton.style.cursor = 'pointer';
    editCharactersButton.style.borderRadius = '8px';
    editCharactersButton.style.backgroundColor = 'black';

    const svgImg = document.createElement('img'); 
    svgImg.src = knight;
    svgImg.alt = 'Edit characters';
    svgImg.style.width = 100 + 'px';
    svgImg.style.height = 100 + 'px';

    editCharactersButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.toggleEditCharacterMenu();
    });
    editCharactersButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    editCharactersButton.appendChild(svgImg);
    document.body.appendChild(editCharactersButton);

    const eraserButton = document.createElement('div');
    eraserButton.style.width = '100px';
    eraserButton.style.height = '100px';
    eraserButton.style.position = 'fixed';
    eraserButton.style.left = 20 + 'px';
    eraserButton.style.zIndex = '1';
    eraserButton.style.bottom = 500 + 'px';
    eraserButton.style.cursor = 'pointer';
    eraserButton.style.borderRadius = '8px';
    eraserButton.style.backgroundColor = '#ccc';

    const eraserSvg = document.createElement('img'); 
    eraserSvg.src = eraser;
    eraserSvg.alt = 'Erase';
    eraserSvg.style.width = 100 + 'px';
    eraserSvg.style.height = 100 + 'px';

    eraserButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.toggleEraserMenu();
    });
    eraserButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    eraserButton.appendChild(eraserSvg);
    document.body.appendChild(eraserButton);

    const editOrnamentButton = document.createElement('div');
    editOrnamentButton.style.width = '100px';
    editOrnamentButton.style.height = '100px';
    editOrnamentButton.style.position = 'fixed';
    editOrnamentButton.style.left = 20 + 'px';
    editOrnamentButton.style.zIndex = '1';
    editOrnamentButton.style.bottom = 380 + 'px';
    editOrnamentButton.style.cursor = 'pointer';
    editOrnamentButton.style.borderRadius = '8px';
    editOrnamentButton.style.backgroundColor = '#ccc';

    const ornamentButtonSvg = document.createElement('img'); 
    ornamentButtonSvg.src = flameo;
    ornamentButtonSvg.alt = 'Edit ornaments';
    ornamentButtonSvg.style.width = 96 + 'px';
    ornamentButtonSvg.style.height = 96 + 'px';

    editOrnamentButton.appendChild(ornamentButtonSvg);

    editOrnamentButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.toggleEditOrnamentMenu();
    });
    editOrnamentButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    document.body.appendChild(editOrnamentButton);
  }

  closeEraserMenu() { this.eraserMenu.close(); }
  openEraserMenu() { this.eraserMenu.open(); }
  toggleEraserMenu() {
    if (this.eraserMenu.opened === true) {
      this.closeEraserMenu();
    } else {
      this.closeAll();
      this.openEraserMenu();
    }
  }

  openEditCharacterMenu() { this.editCharacterMenu.open(this); }
  closeEditCharacterMenu() { this.editCharacterMenu.close(); }
  toggleEditCharacterMenu() {
    if (this.editCharacterMenu.opened === true) {
      this.closeEditCharacterMenu();
    } else {
      this.closeAll();
      this.openEditCharacterMenu();
    }
  }

  openEditTileMenu() { this.editTileMenu.open(this); }
  closeEditTileMenu() { this.editTileMenu.close(); }
  toggleEditTileMenu() {
    if (this.editTileMenu.opened === true) {
      this.closeEditTileMenu();
    } else {
      this.closeAll();
      this.openEditTileMenu();
    }
  }

  openEditCursorMenu() { this.editCursorMenu.open(); }
  closeEditCursorMenu() { this.editCursorMenu.close(); }
  toggleEditCursorMenu() {
    if (this.editCursorMenu.opened === true) {
      this.closeEditCursorMenu();
    } else {
      this.closeAll();
      this.openEditCursorMenu();
    }
  }

  openEditOrnamentMenu() { this.editOrnamentMenu.open(this); }
  closeEditOrnamentMenu() { this.editOrnamentMenu.close(); }
  toggleEditOrnamentMenu() {
    if (this.editOrnamentMenu.opened === true) {
      this.closeEditOrnamentMenu();
    } else {
      this.closeAll();
      this.openEditOrnamentMenu();
    }
  }

  closeAll() {
    this.closeEditTileMenu();
    this.closeEditCursorMenu();
    this.closeEditCharacterMenu();
    this.closeEraserMenu();
    this.closeEditOrnamentMenu();
  }

  editTileSelected() { return this.editTileMenu.selected; }
  editTileDistance() { return this.editCursorMenu.distance(); }
  editCharacterSelected() { return this.editCharacterMenu.selected; }
  editOrnamentSelected() { return this.editOrnamentMenu.selected; }
}

class CharacterMenu {
  constructor(editorMenuControls) {
    this.opened = false;
    this.previews = [];
    this.selected = undefined;
    this.editorMenuControls = editorMenuControls;
  }
  open() {
    if (this.opened) return;
    this.opened = true;
    const menu = document.createElement('div');
    menu.id = 'editCharacterMenu';
    menu.style.left = 140 + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '1';
    menu.style.bottom = 260 + 'px';
    menu.style.paddingLeft = 10 + 'px';
    menu.style.paddingRight = 10 + 'px';
    menu.style.backgroundColor = '#EEF8FF';

    menu.style.borderRadius = '10px';

    characters.forEach((character) => {
      this.createButton("/public/assets/" + character.path).then(div => menu.appendChild(div));
    });
    // this.createButton('/public/assets/knight.glb').then(div => menu.appendChild(div));
    // this.createButton('/public/assets/aerith__low-poly_model.glb').then(div => menu.appendChild(div));
    // this.createButton('/public/assets/cloud_low-poly_model.glb').then(div => menu.appendChild(div));
    // this.createButton('/public/assets/tifa_dancing.glb').then(div => menu.appendChild(div));
    // this.createButton('/public/assets/tifa_-_field_model.glb').then(div => menu.appendChild(div));
    // this.createButton('/public/assets/og_tifa_with_textures.glb').then(div => menu.appendChild(div));

    document.body.appendChild(menu);
  }
  async createButton(path) {
    const div = document.createElement('div');
    div.id = path;
    div.classList.add('editCharactersButton');
    div.style.border = '2px solid transparent';
    div.style.display = 'inline-block';
    div.style.cursor = 'pointer';
    const preview = new Preview3d(96, 96, 0);
    preview.attachTo(div);
    this.previews.push(preview);
    await preview.loadModel(path);

    div.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.editorMenuControls.unselectAll();
      this.editorMenuControls.mode = 'character';
      this.selected = path;

      const buttons = document.querySelectorAll('.editCharactersButton');
      buttons.forEach((button) => {
        if (button.id === path) {
          button.style.borderColor = '#00ff00';
        } else {
          button.style.borderColor = 'transparent';
        }
      });

      this.close();
    });
    return div;
  }
  unselectAll() {
    this.selected = undefined;
    const buttons = document.querySelectorAll('.editCharactersButton');
    buttons.forEach((button) => {
      button.style.borderColor = 'transparent';
    });
  }
  close() {
    if (this.opened === false) return;
    this.opened = false;

    this.previews.forEach((preview) => {
      preview.remove();
    });
    this.previews.length = 0;

    const menu = document.getElementById('editCharacterMenu');
    if (menu) { 
      menu.remove();
    }
  }
}

class CursorMenu {
  constructor(editorMenuControls) {
    this.opened = false;
    this.editorMenuControls = editorMenuControls;
    this.opened = false;
    this.selected = 'single';
  }
  open() {
    if (this.opened === true) return;
    this.opened = true;
    const menu = document.createElement('div');
    menu.id = 'cursorTileMenu';
    menu.style.left = 140 + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '1';
    menu.style.bottom = 140 + 'px';
    menu.style.paddingLeft = 10 + 'px';
    menu.style.paddingRight = 10 + 'px';
    menu.style.display = 'grid';
    menu.style.gap = 12 + 'px';
    menu.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
    menu.style.backgroundColor = '#EEF8FF';
    menu.style.borderRadius = '10px';

    const singleSvg = svgElement(96, 96);
    singleSvg.classList.add('editCursorButton');
    singleSvg.id = 'single';
    singleSvg.style.border = '2px solid transparent';
    singleSvg.addEventListener('mousedown', (event) => this.select(event, 'single'));
    const singleHex = svgHexagon(96, 96, {x: 48, y: 48}, '#44ff44', 'transparent', 2);
    singleSvg.appendChild(singleHex);
    menu.appendChild(singleSvg);

    const doubleSvg = svgElement(96, 96);
    doubleSvg.classList.add('editCursorButton');
    doubleSvg.style.border = '2px solid transparent';
    doubleSvg.id = 'double';
    new HexGrid2d(true, 16, 0).hexesInRadius(1).forEach((hex) => {
      const doubleHex = svgHexagon(32, 32, {x: hex.center().x + 48, y: hex.center().y + 48}, '#44ff44', 'transparent', 2);
      doubleSvg.appendChild(doubleHex);
    });
    doubleSvg.addEventListener('mousedown', (event) => this.select(event, 'double'));
    menu.appendChild(doubleSvg);

    const tripleSvg = svgElement(96, 96);
    tripleSvg.classList.add('editCursorButton');
    tripleSvg.style.border = '2px solid transparent';
    tripleSvg.id = 'triple';
    new HexGrid2d(true, 10, 0).hexesInRadius(2).forEach((hex) => {
      const tripleHex = svgHexagon(20, 20, {x: hex.center().x + 48, y: hex.center().y + 48}, '#44ff44', 'transparent', 2);
      tripleSvg.appendChild(tripleHex);
    });
    tripleSvg.addEventListener('mousedown', (event) => this.select(event, 'triple'));
    menu.appendChild(tripleSvg);

    const quadrupleSvg = svgElement(96, 96);
    quadrupleSvg.classList.add('editCursorButton');
    quadrupleSvg.style.border = '2px solid transparent';
    quadrupleSvg.id = 'quadruple';
    new HexGrid2d(true, 7, 0).hexesInRadius(3).forEach((hex) => {
      const quadrupleHex = svgHexagon(14, 14, {x: hex.center().x + 48, y: hex.center().y + 48}, '#44ff44', 'transparent', 2);
      quadrupleSvg.appendChild(quadrupleHex);
    });
    quadrupleSvg.addEventListener('mousedown', (event) => this.select(event, 'quadruple'));
    menu.appendChild(quadrupleSvg);

    document.body.appendChild(menu);
  }
  unselectAll() {
    this.selected = undefined;

    const buttons = document.querySelectorAll('.editCursorButton');
    buttons.forEach((button) => {
      button.style.borderColor = 'transparent';
    });
  }
  select(event, option) {
    event.stopPropagation();
    this.selected = option;

    const buttons = document.querySelectorAll('.editCursorButton');
    buttons.forEach((button) => {
      if (button.id === option) {
        button.style.borderColor = '#44ff44';
      } else {
        button.style.borderColor = 'transparent';
      }
    });

    this.close();
  }
  distance() {
    let distance = 0;
    if (this.selected === 'double') {
      distance = 1;
    }
    if (this.selected === 'triple') {
      distance = 2;
    }
    if (this.selected === 'quadruple') {
      distance = 3;
    }

    return distance;
  }
  close() {
    if (this.opened === false) return;
    this.opened = false;
    const menu = document.getElementById('cursorTileMenu');
    if (menu) { 
      menu.remove();
    }
  }
}

class TileMenu {
  constructor(editorMenuControls) {
    this.opened = false;
    this.selected = 'water';
    this.editorMenuControls = editorMenuControls;
  }
  close() {
    if (this.opened === false) return;
    this.opened = false;
    const menu = document.getElementById('editTileMenu').remove();
    if (menu) {
      menu.remove();
    }
  }
  open() {
    if (this.opened === true) return;
    this.opened = true;
    const menu = document.createElement('div');
    menu.id = 'editTileMenu';
    menu.style.left = 140 + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '1';
    menu.style.bottom = 20 + 'px';
    menu.style.paddingLeft = 10 + 'px';
    menu.style.paddingRight = 10 + 'px';
    menu.style.display = 'grid';
    menu.style.gap = 12 + 'px';
    menu.style.gridTemplateColumns = '1fr 1fr';
    menu.style.backgroundColor = '#EEF8FF';
    menu.style.borderRadius = '10px';

    const dirt = svgElement(100, 100);
    dirt.addEventListener('mousedown', (event) => this.select(event, 'dirt'));
    const dirtHex = svgHexagon(100, 100, {x: 50, y: 50}, 'transparent', '#834112', 2);
    dirtHex.classList.add('editTileButton');
    dirtHex.id = 'dirt';
    dirt.appendChild(dirtHex);
    menu.appendChild(dirt);

    const water = svgElement(100, 100);
    water.addEventListener('mousedown', (event) => this.select(event, 'water'));
    const waterHex = svgHexagon(100, 100, {x: 50, y: 50}, 'transparent', '#0021f3', 2);
    waterHex.classList.add('editTileButton');
    waterHex.id = 'water';
    water.appendChild(waterHex);

    menu.appendChild(water);

    document.body.appendChild(menu);
  }
 
  unselectAll() {
    this.selected = undefined;
    const buttons = document.querySelectorAll('.editTileButton');
    buttons.forEach((button) => {
      button.setAttribute('stroke', 'transparent');
    });
  }
  select(event, option) {
    event.stopPropagation();
    this.editorMenuControls.unselectAll();
    this.editorMenuControls.mode = 'tile';
    this.selected = option;

    const buttons = document.querySelectorAll('.editTileButton');
    buttons.forEach((button) => {
      if (button.id === option) {
        button.setAttribute('stroke', '#00ff00');
      } else {
        button.setAttribute('stroke', 'transparent');
      }
    });

    this.close();
  }
}

class OrnamentMenu {
  constructor(editorMenuControls) {
    this.opened = false;
    this.selected = '/public/flames.png';
    this.editorMenuControls = editorMenuControls;
    this.previews = [];
  }
  async open() {
    console.log('opening');
    if (this.opened === true) return;
    this.opened = true;
    const menu = document.createElement('div');
    menu.id = 'editOrnamentMenu';
    menu.style.left = 140 + 'px';
    menu.style.minHeight = 100 + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '1';
    menu.style.bottom = 380 + 'px';
    menu.style.paddingLeft = 10 + 'px';
    menu.style.paddingRight = 10 + 'px';
    menu.style.display = 'grid';
    menu.style.gap = 12 + 'px';
    menu.style.gridTemplateColumns = '1fr 1fr';
    menu.style.backgroundColor = '#EEF8FF';
    menu.style.borderRadius = '10px';

    const flames = createButton('ornamentMenuButton', '/public/flames.png', (event) => this.clickButton(event, '/public/flames.png'));
    const flamesPreview = await createPreviewImage('/public/flames.png');
    flamesPreview.attachTo(flames);
    this.previews.push(flamesPreview);
    menu.appendChild(flames);

    // const flamePreview = new Preview3d(94, 94, Math.PI / 6);
    // flamePreview.attachTo(menu);
    // // preview.loadModel('/public/assets/knight.glb').then(() => {});
    // flamePreview.loadImage('/public/flames.png').then(() => {});
    // this.previews.push(flamePreview);

    document.body.appendChild(menu);
  }
  clickButton(event, path) {
    event.stopPropagation();
    this.editorMenuControls.unselectAll();
    this.editorMenuControls.mode = 'ornament';
    this.selected = path;

    const buttons = document.querySelectorAll('.editCharactersButton');
    buttons.forEach((button) => {
      if (button.id === path) {
        button.style.borderColor = '#00ff00';
      } else {
        button.style.borderColor = 'transparent';
      }
    });

    this.close();
  }
  close() {
    if (this.opened === false) return;
    this.opened = false;

    this.previews.forEach((preview) => {
      preview.remove();
    });
    this.previews.length = 0;

    const menu = document.getElementById('editOrnamentMenu');
    if (menu) { 
      menu.remove();
    }
  }
  unselectAll() {}
  select() {}
}

class EraserMenu {
  constructor(editorMenuControls) {
    this.opened = false;
    this.selected = 'character';
    this.editorMenuControls = editorMenuControls;
  }
  open() {
    if (this.opened === true) return;
    this.opened = true;
    const menu = document.createElement('div');
    menu.id = 'eraserMenu';
    menu.style.left = 140 + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '1';
    menu.style.bottom = 500 + 'px';
    menu.style.paddingLeft = 10 + 'px';
    menu.style.paddingRight = 10 + 'px';
    menu.style.display = 'grid';
    menu.style.gap = 12 + 'px';
    menu.style.gridTemplateColumns = '1fr 1fr 1fr';
    menu.style.backgroundColor = '#EEF8FF';
    menu.style.borderRadius = '10px';

    const eraseTileButton = document.createElement('div');
    eraseTileButton.style.width = '100px';
    eraseTileButton.style.height = '100px';
    eraseTileButton.style.cursor = 'pointer';
    eraseTileButton.style.borderRadius = '8px';

    eraseTileButton.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.selected = 'tile';

      this.editorMenuControls.unselectAll();
      this.editorMenuControls.mode = 'erase';

      this.close();
    });
    eraseTileButton.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    const eraseTileSVG = svgElement(100, 100);
    svgHex(100, 100).forEach(line => eraseTileSVG.appendChild(line));

    eraseTileButton.appendChild(eraseTileSVG);
    menu.appendChild(eraseTileButton);

    const characterImg = document.createElement('img'); 
    characterImg.src = knight;
    characterImg.alt = 'Erase characters';
    characterImg.style.width = 100 + 'px';
    characterImg.style.height = 100 + 'px';
    characterImg.style.cursor = 'pointer';

    characterImg.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.selected = 'character';

      this.editorMenuControls.unselectAll();
      this.editorMenuControls.mode = 'erase';

      this.close();
    });
    characterImg.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });

    menu.appendChild(characterImg);

    const ornamentImg = document.createElement('img'); 
    ornamentImg.src = flameo;
    ornamentImg.alt = 'Erase ornaments';
    ornamentImg.style.width = 96 + 'px';
    ornamentImg.style.height = 96 + 'px';
    ornamentImg.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.selected = 'ornament';

      this.editorMenuControls.unselectAll();
      this.editorMenuControls.mode = 'erase';

      this.close();
    });
    ornamentImg.addEventListener('mousemove', (event) => {
      event.stopPropagation();
    });
    menu.appendChild(ornamentImg);

    document.body.appendChild(menu);
  }

  close() {
    if (this.opened === false) return;
    this.opened = false;
    const menu = document.getElementById('eraserMenu').remove();
    if (menu) {
      menu.remove();
    }
  }
  unselectAll() {
    this.selected = undefined;
    const buttons = document.querySelectorAll('.eraserMenu');
    buttons.forEach((button) => {
      button.setAttribute('stroke', 'transparent');
    });
  }
  select(event, option) {
    event.stopPropagation();
    this.editorMenuControls.unselectAll();
    this.editorMenuControls.mode = 'tile';
    this.selected = option;

    const buttons = document.querySelectorAll('.eraserMenuButton');
    buttons.forEach((button) => {
      if (button.id === option) {
        button.setAttribute('stroke', '#00ff00');
      } else {
        button.setAttribute('stroke', 'transparent');
      }
    });

    this.close();
  }
}

export class MessagesMenu {
  constructor(socket) {
    this.opened = false;
    this.socket = socket;
    this.textSizeLimit = Infinity;
    this.logs = [];
    this.duration = 8000;

    this.createTextInput();
    this.createChatLog();
  }
  createTextInput() {
    this.inputContainer = document.createElement('div');
    this.inputContainer.id = 'messagesOverlay';
    this.inputContainer.style.position = 'fixed';
    this.inputContainer.style.left = 140 + 'px';
    this.inputContainer.style.bottom = 20 + 'px';
    this.inputContainer.style.right = 140 + 'px';
    this.inputContainer.style.backgroundColor = 'rgba(64, 64, 64, 0.4)';
    this.inputContainer.style.borderRadius = '2px';
    this.inputContainer.style.height = '40px';
    this.inputContainer.style.display = 'flex';
    this.inputContainer.style.justifyContent = 'space-between';

    this.inputContainer.addEventListener('mousedown', (event) => { if (event) event.stopPropagation() });
    this.inputContainer.addEventListener('click', (event) => { if (event) event.stopPropagation() });


    const textInput = document.createElement('input');
    textInput.id = 'textInput';
    textInput.type = 'text';
    textInput.placeholder = '';
    textInput.style.flexGrow = '1';
    textInput.style.marginRight = '10px';
    textInput.style.paddingLeft = '7px';
    textInput.style.backgroundColor = 'transparent';
    textInput.style.border = 'none';
    textInput.style.color = 'white';
    textInput.style.fontSize = '16px';
    // textInput.addEventListener('focus', (event) => this.openExpandedOverlay(event));
    // textInput.addEventListener('mousedown', (event) => this.openExpandedOverlay(event));
    textInput.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        this.submit();
      } else {
        this.createSendButton();
      }
    });

    textInput.addEventListener('change', (event) => {
      if (event.key === 'Enter') {
        this.submit();
      } else {
        this.createSendButton();
      }
    });

    const expandButton = document.createElement('div');
    expandButton.style.height = '100%';
    expandButton.style.minWidth = '18px';
    expandButton.style.paddingLeft = '10px';
    expandButton.style.paddingRight = '10px';
    expandButton.style.display = 'flex';
    expandButton.style.justifyContent = 'center';
    expandButton.style.alignItems = 'center';
    expandButton.style.fontSize = 24;
    expandButton.style.color = '#888';
    expandButton.style.border = '1px solid #688';
    expandButton.style.borderRadius = '2px';
    expandButton.innerHTML = '↑';
    expandButton.addEventListener('mousedown', (event) => this.toggleExpandedOverlay(event));
    this.expandButton = expandButton;

    this.inputContainer.appendChild(textInput);
    this.inputContainer.appendChild(expandButton);

    document.body.appendChild(this.inputContainer);
  }
  createChatLog() {
    const chatlog = document.createElement('div');
    this.chatlog = chatlog;
    chatlog.id = 'chatlog';
    chatlog.style.left = 140 + 'px';
    chatlog.style.position = 'fixed';
    chatlog.style.zIndex = '1';
    chatlog.style.bottom = 80 + 'px';
    chatlog.style.left = 140 + 'px';
    chatlog.style.right = 140 + 'px';
    chatlog.style.maxHeight = 'calc(100vh - 100px)';
    chatlog.style.overflowY = 'auto';
    chatlog.style.backgroundColor = 'transparent';
    chatlog.style.border = '1px solid transparent';
    chatlog.style.borderRadius = '2px';
    document.body.appendChild(chatlog);
  }
  addToChatlog(message) {
    const log = new Log(message);
    setTimeout(() => {
      if (this.opened === false) {
        log.hide();
      }
    }, this.duration);
    this.logs.push(log);
    document.getElementById('chatlog').appendChild(log.element);
  }

  submit() {
    const input = document.getElementById('textInput');
    const text = input.value;
    if (text.length > this.textSizeLimit) {
      console.error('Text too long', text.length);
      return;
    }
    if (text !== '') {
      console.log('texting', text, text.length);
      this.socket.emit('message', text);
      input.value = '';
    }
    this.removeSendButton();
    input.blur();
  }
  createSendButton() {
    if (document.getElementById('sendButton') === null) {
      const sendButton = document.createElement('button');
      sendButton.id = 'sendButton';
      sendButton.textContent = 'Send';
      sendButton.style.padding = '8px 16px';
      sendButton.style.backgroundColor = 'rgba(64, 128, 96, 0.5)';
      sendButton.style.border = 'none';
      sendButton.style.borderRadius = '4px';
      sendButton.style.color = '#aaa';
      sendButton.style.marginRight = '3px';
      sendButton.addEventListener('click', () => this.submit());
      this.sendButton = sendButton;
      this.inputContainer.insertBefore(sendButton, this.expandButton);
    }
  }
  removeSendButton() {
    if (document.getElementById('sendButton') !== null) {
      document.getElementById('sendButton').remove();
    }
  }
  keydown(event) {
    const input = document.getElementById('textInput');
    if (event.key === 'Enter' && document.activeElement !== input) {
      input.focus();
    }
  }
  closeExpandedOverlay() {
    this.opened = false;
    this.logs.forEach((log) => {
      if (log.shown < new Date().getTime() - this.duration) {
        log.hide(true);
      }
    });
    this.chatlog.style.backgroundColor = 'transparent';
    this.chatlog.style.border = '1px solid transparent';
    this.expandButton.innerHTML = '↑';
  }
  openExpandedOverlay(event) {
    if (event) {
      event.stopPropagation();
    }

    this.opened = true;
    this.chatlog.style.backgroundColor = 'rgba(0, 0, 0, 1)';
    this.chatlog.style.border = '1px solid darkolivegreen';
    this.logs.forEach((log) => {
      log.show();
    });
    this.expandButton.innerHTML = '↓';
    this.chatlog.scrollTop = this.chatlog.scrollHeight;
  }
  toggleExpandedOverlay(event) {
    if (this.logs.length > 0) {
      if (this.opened) {
        this.closeExpandedOverlay();
      } else {
        this.openExpandedOverlay();
      }
    }
  }
}

class Log {
  constructor(message) {
    this.shown = new Date().getTime();
    this.element = document.createElement('div');
    this.element.style.transition = 'opacity 4s';
    this.hidden = false;

    const log = document.createElement('span');
    log.id = `chatlog-${message.room}-${message.id}`;
    log.style.paddingLeft = '6px';
    log.style.paddingRight = '6px';
    log.style.color = '#ccc';
    log.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    log.style.borderRadius = '2px';

    const time = document.createElement('span');
    time.style.marginRight = '7px';
    time.innerHTML = shorthandTime(message.created);
    log.appendChild(time);

    const author = document.createElement('span');
    author.style.marginRight = '7px';
    author.style.fontWeight = 'bold';
    author.innerHTML = message.author + ':';
    log.appendChild(author);

    const contents = document.createElement('span');
    contents.innerHTML = message.contents;
    log.appendChild(contents);

    this.element.appendChild(log);
  }
  hide(immediate) {
    this.hidden = true;
    if (immediate) {
      this.element.style.display = 'none';
    } else {
      this.element.style.opacity = 0;
      setTimeout(() => {
        if (this.hidden === true) {
          this.element.style.display = 'none';
          this.element.style.opacity = 1;
        }
      }, 4000);
    }
  }
  show() {
    this.hidden = false;
    this.element.style.opacity = 1;
    this.element.style.display = 'block';
  }
}

export class SharedStateMenu {
  constructor() {
    this.state = {};
    this.elements = {};
    this.createMenu();
  }
  createMenu() {
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '5px';
    menu.style.right = '5px';
    menu.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    menu.style.fontSize = '10px';
    menu.style.color = 'white';
    menu.style.padding = '5px';
    document.body.appendChild(menu);
    this.menu = menu;
  }
  setEntry(key, value) {
    console.log('Shared state menu setting', key, value)
    if (this.state[key]) {
      this.elements[key].value.innerHTML = value;
    } else {
      const container = document.createElement('div');
      const keyElement = document.createElement('span');
      keyElement.style.marginRight = '5px';
      keyElement.innerHTML = key + ':';
      const valueElement = document.createElement('span');
      valueElement.innerHTML = value;
      container.appendChild(keyElement);
      container.appendChild(valueElement);
      this.menu.appendChild(container);
      this.elements[key] = {
        container: container,
        key: keyElement,
        value: valueElement,
      }
    }
    this.state[key] = value;
  }
}


export function svgPolygon(points, stroke, fill, strokeWidth) {
  const polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
  polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
  polygon.setAttribute("stroke", stroke);
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke-width", strokeWidth)
  return polygon;
}
export function svgLine(start, end, color, width) {
  const newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  newLine.setAttribute('x1', start.x);
  newLine.setAttribute('y1', start.y);
  newLine.setAttribute('x2', end.x);
  newLine.setAttribute('y2', end.y);
  newLine.setAttribute("stroke", color)
  newLine.setAttribute("stroke-width", width)
  return newLine;
}
function svgHexagon(width, height, center, stroke, fill, strokeWidth) {
  const points = [];
  for (let i=0; i<7; i++) {
    const x1 = width / 2 * Math.cos(i * Math.PI / 3) + center.x;
    const y1 = height / 2 * Math.sin(i * Math.PI / 3) + center.y;
    points.push({x: x1, y: y1});
  }
  return svgPolygon(points, stroke, fill, strokeWidth);
}
function svgElement(width, height) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  return svg;
}
function svgHexagonOutline(width, height, center) {
  const lines = [];
  for (let i=0; i<7; i++) {
    const x1 = width / 2 * Math.cos(i * Math.PI / 3) + center.x;
    const y1 = height / 2 * Math.sin(i * Math.PI / 3) + center.y;

    const x2 = width / 2 * Math.cos(i * Math.PI / 3 + Math.PI / 3) + center.x;
    const y2 = height / 2 * Math.sin(i * Math.PI / 3 + Math.PI / 3) + center.y;

    const line = svgLine({x: x1, y: y1}, {x: x2, y: y2}, '#44ff44', 2); 
    lines.push(line);
  }
  return lines;
}
function svgHex(width, height) {
  const hat = svgHexagonOutline(width, height / 2, {x: width / 2, y: height * 1 / 4});

  const butt = svgHexagonOutline(width, height / 2, {x: width / 2, y: height * 3 / 4});

  const sides = [];
  for (let i=0; i<6; i++) {
    const x1 = width / 2 * Math.cos(i * Math.PI / 3) + width / 2;
    const y1 = height / 4 * Math.sin(i * Math.PI / 3) + height * 1 / 4;
 
    const x2 = width / 2 * Math.cos(i * Math.PI / 3) + width / 2;
    const y2 = height / 4 * Math.sin(i * Math.PI / 3) + height * 3 / 4;

    const line = svgLine({x: x1, y: y1}, {x: x2, y: y2}, '#44ff44', 2); 
    sides.push(line);
  }
  return [...hat, ...butt, ...sides];
}

function createButton(className, id, callback) {
  const div = document.createElement('div');
  div.id = id;
  div.classList.add(className);
  div.style.border = '2px solid transparent';
  div.style.display = 'inline-block';
  div.style.cursor = 'pointer';

  div.addEventListener('mousedown', (event) => {
    event.stopPropagation();
    callback(event);
  });

  return div;
}
async function createPreviewModel(path) {
  // Remember to call .remove() on the preview when you're done with it
  const preview = new Preview3d(96, 96, 0);
  await preview.loadModel(path);
  return preview;
}
async function createPreviewImage(path) {
  // Remember to call .remove() on the preview when you're done with it
  const preview = new Preview3d(96, 96, 0);
  await preview.loadImage(path);
  return preview;
}