import * as THREE from 'three';
import Stats from 'stats.js';
import { spinToRadians } from './helpers.js';
import { LOADER } from './loaders.js';

// We determine Z is up Following the hex-grid convention of laying flat on an x-y plane
// This alters default up for ALL Three objects. 
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);

export class Stage {
  constructor(shadows) {
    this.scene;
    this.camera;
    this.renderer;
    this.shadows = shadows;
    this.stats;
    this.lasttick;
    this.XYPlane;
    this.light = {light: null, position: {x: 0, y: 0, z: 100}};
    this.target = {x: 0, y: 0, z: 0};
    this.azimuth = Math.PI * 1 / 2; // Relative to the target
    this.inclination = Math.PI / 4;
    this.distance = 15;
    this.cursor;
    this.initialize();
  }
  initialize() {
    const width = window.innerWidth, height = window.innerHeight;
    // init
    this.scene = new THREE.Scene();


    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    // this.camera = new THREE.OrthographicCamera( -aspect * 30, aspect * 30, 30 / aspect, -30 / aspect, 1, 1000);
    this.camera.position.z = this.distance;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
    this.light.light = directionalLight;

    if (this.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

      directionalLight.castShadow = true; // default false

      //Set up shadow properties for the light
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 1000;
    }

    this.scene.add(directionalLight);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.renderer.setSize( width, height );
    document.body.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    this.workloadDashboard = new WorkloadDashboard();

    this.XYPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));

    this.renderer.render(this.scene, this.camera);                                                                                                                                                                             
    this.cursor = new CursorWireframe(this);

    this.lasttick = new Date().getTime();
    // this.test(this.board);
  }
  test() {
    // const hex = new Hex(0, 0, true, 2);
  }

  animate(board, ripples, keyControls, mouseControls, editorMenuControls) {
    this.stats.begin();
    const now = new Date().getTime();
    const delta = (now - this.lasttick) / 1000;

    ripples.forEach((ripple, index) => {
      if (ripple.time < now - 3000) {
        ripples.splice(index, 1);
      }
    });

    // console.log(board.allObjects().length, board.allObjects()[0]);

    board.allObjects().forEach((hexObject) => {
      // ---------------- Water physics ----------------
      if (hexObject.type === 'tile' && hexObject.subtype === 'water') {
        hexObject.wave = 0;
        if (hexObject.velocity === undefined) {
          hexObject.acceleration = {x: 0, y: 0, z: 0}
          hexObject.velocity = {x: 0, y: 0, z: 0}
          hexObject.position = {z: 0}
        }
        ripples.forEach((ripple, key) => {
          const d = now - ripple.time;
          const propagationTime = 200;
          const distance = ripple.hex.distance(hexObject.piece);

          if (distance < 15 && distance < d / propagationTime) {
            const t = Math.floor(d / propagationTime);
            const wave = -Math.cos(Math.PI / 2 * (distance - t)) / (distance + 1);
            hexObject.wave += wave * 0.04;

            if (distance === 0 && t === 0) {
              hexObject.velocity.z = -0.04; // For some extra splash
            }
          }
        });

        // This creates the the "wave" effect
        hexObject.acceleration.z += hexObject.wave * delta || 0;

        let oscilationScalar = -0.2 * hexObject.position.z * delta;
        if (Math.sign(hexObject.velocity.z) === Math.sign(oscilationScalar)) {
          oscilationScalar = -oscilationScalar * 0.33; // Dampening effect
        }
        const oscilation = new THREE.Vector3(0, 0, oscilationScalar);
        hexObject.acceleration.add(oscilation); 
        hexObject.acceleration.multiplyScalar(1 - (4 * delta)); // friction

        hexObject.velocity.add(hexObject.acceleration);
        hexObject.velocity.multiplyScalar(1 - (4 * delta)); // friction
        hexObject.position.add(hexObject.velocity);

        if (Math.abs(hexObject.acceleration.z) > 10) hexObject.acceleration.z = 0;
        if (Math.abs(hexObject.velocity.z) > 10) hexObject.velocity.z = 0;
        if (Math.abs(hexObject.position.z) > 10) hexObject.position.z = 0;

        const sign = Math.sign(hexObject.position.z); 
        if (sign > 0) {
          const color = lerpColor(hexObject.assets[0].color, '#ffffff', hexObject.position.z * 0.4)
          hexObject.assets.forEach(asset => {
            asset.mesh.material.color.set(color);
          });
        } else if (sign < 0) {
          const color = lerpColor(hexObject.assets[0].color, '#05014a', -hexObject.position.z * 0.4)
          hexObject.assets.forEach(asset => {
            asset.mesh.material.color.set(color);
          });
        } else if (sign === 0) {
          hexObject.assets.forEach(asset => {
            asset.mesh.material.color.set(asset.color);
          });
        }

        hexObject.assets.forEach(asset => {
          asset.mesh.position.z = hexObject.position.z - hexObject.assets[0].height / 2;
        });
      }
    });

    if (keyControls.leftArrowDown && !keyControls.rightArrowDown) { this.target.x -= 1; }
    if (!keyControls.leftArrowDown && keyControls.rightArrowDown) { this.target.x += 1; }
    if (keyControls.leftArrowDown && keyControls.rightArrowDown) { this.target.x = 0; }
    if (keyControls.upArrowDown && !keyControls.downArrowDown) { this.target.y -= 1; }
    if (!keyControls.upArrowDown && keyControls.downArrowDown) { this.target.y += 1; }
    if (keyControls.upArrowDown && keyControls.downArrowDown) { this.target.y = 0; }
 
    if (mouseControls.middleMouseDown) {
      if (this.referenceAzimuth === undefined) this.referenceAzimuth = this.azimuth;
      if (this.referenceInclination === undefined) this.referenceInclination = this.inclination;
      this.azimuth = this.referenceAzimuth - (mouseControls.cursor.x - mouseControls.clickStart.x) * 1;
      this.inclination = this.referenceInclination - (mouseControls.cursor.y - mouseControls.clickStart.y) * 1;
    } else if (this.referenceAzimuth || this.referenceInclination) {
      this.referenceAzimuth = undefined;
      this.referenceInclination = undefined;
    }

    if (mouseControls.rightMouseDown) {
      if (this.referenceTarget === undefined) {
        this.referenceTarget = {x: this.target.x, y: this.target.y};
      }
      const deltaX = (mouseControls.cursor.x - mouseControls.clickStart.x);
      const deltaY = (mouseControls.cursor.y - mouseControls.clickStart.y);
      this.target.x = this.referenceTarget.x + Math.sin(this.azimuth) * deltaX * this.distance + Math.cos(this.azimuth) * deltaY * this.distance;
      this.target.y = this.referenceTarget.y - Math.cos(this.azimuth) * deltaX * this.distance + Math.sin(this.azimuth) * deltaY * this.distance;
    } else if (this.referenceTarget) {
      this.referenceTarget = undefined;
    }


    this.light.position = {x: Math.sin(now / 10000) * 100, y: Math.cos(now / 6000) * 100, z: this.light.position.z};
    this.light.light.position.set(this.light.position.x, this.light.position.y, this.light.position.z);

    const cameraPosition = new THREE.Vector3(
      this.distance * Math.cos(this.azimuth) * Math.cos(this.inclination) + this.target.x, 
      this.distance * Math.sin(this.azimuth) * Math.cos(this.inclination) + this.target.y, 
      this.distance * Math.sin(this.inclination) + this.target.z
    );

    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    this.camera.lookAt(this.target.x, this.target.y, this.target.z);
    // this.camera.rotateZ((this.azimuth - Math.PI * 3 / 2));

    const hovered = this.pixelToXYIntercept(mouseControls.cursor, this);
    if (hovered) {
      const hoveredHex = board.pixelToCube({x: hovered.x, y: hovered.y});
      this.cursor.animate(board, editorMenuControls, hoveredHex, mouseControls);
    }

    this.renderer.render(this.scene, this.camera);
    this.lasttick = now;

    this.workloadDashboard.update(this.renderer);
    this.stats.end();
    requestAnimationFrame(() => this.animate(board, ripples, keyControls, mouseControls, editorMenuControls));
  }
  zoom(delta) {
    this.distance -= delta * 0.06;
  }
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  pixelToXYIntercept(pixel) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pixel, this.camera);
    raycaster.ray.intersectPlane(this.XYPlane, new THREE.Vector3());

    const intersection = raycaster.ray.intersectPlane(this.XYPlane, new THREE.Vector3());
    return intersection;
  }
}

export class Preview3d {
  constructor(width, height, angle) {
    this.scene = new THREE.Scene();
    this.width = width;
    this.height = height;
    this.renderer;
    this.assets = [];
    this.images = [];
    this.angle = angle;
 
    const aspect = width / height;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);

    const ambientLight = new THREE.AmbientLight(0x444444);
    ambientLight.intensity = 3;
    this.scene.add(ambientLight);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.position.set(0, -2, 1);
    this.scene.add(directionalLight);

    this.camera.position.y = Math.cos(this.angle) * -1;
    this.camera.position.z = Math.sin(this.angle) + 0.5;
    this.camera.lookAt(0, 0, 0.5);

    this.renderer.setSize(width, height);
  }
  loadModel(path) {
    return new Promise((resolve, reject) => {
      LOADER.model(path).then((asset) => {
        this.assets.push(asset);

        const box = new THREE.Box3().setFromObject(asset); 
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 1 / size.y;
        asset.rotation.x = Math.PI / 2;
        asset.scale.set(scaleFactor, scaleFactor, scaleFactor);
        asset.position.z = -box.min.y * scaleFactor;

        //; console.log('adjust', -box.min.z)
        // const distance = Math.max(size.x, size.y, size.z) * 2;

        // this.camera.position.z = Math.cos(this.angle) * 5;
        // this.camera.position.y = Math.sin(this.angle) * 5;

        this.scene.add(asset);
        this.renderer.render(this.scene, this.camera);                                                                                                                                                                             
        resolve(asset);
      });
    });
  }
  loadImage(path) {
    return new Promise((resolve, reject) => {
      // this.assets.push(imageMaterial);
      LOADER.material(path).then((material) => {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 6, 1, true); 
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0.5;
  
        mesh.rotation.x = Math.PI / 2;
        // mesh.rotation.y = this.hex.flat ? Math.PI / 6 : 0;

        this.scene.add(mesh);
        this.assets.push(mesh);
        this.renderer.render(this.scene, this.camera);                                                                                                                                                                             
        resolve(mesh);
      }, function (p) {
        console.log(p);
      }, function (e) {
        console.log(e);
      });
    })
  }
  attachTo(parent) {
    parent.appendChild(this.renderer.domElement);
  }
  remove() {
    this.assets.forEach((asset) => {
      this.scene.remove(asset);
    });
    this.assets.length = 0;
  }
}


export class HexagonalOutline {
  constructor(hex, size, stage, color = '#44ff44') {
    this.hex = hex;
    this.material = new THREE.LineBasicMaterial({color: color});
    this.stage = stage;

    const points = [];
    for (let i=0; i<7; i++) {
      points.push(new THREE.Vector3(Math.sin(i * Math.PI / 3 + (hex.flat ? Math.PI / 6 : 0)) + hex.center().x, Math.cos(i * Math.PI / 3 + (hex.flat ? Math.PI / 6 : 0)) + hex.center().y, 0));
      // points.push(new THREE.Vector3(Math.sin(i * Math.PI / 3) + hex.center().x, Math.cos(i * Math.PI / 3) + hex.center().y, -size));
      // points.push(new THREE.Vector3(Math.sin(i * Math.PI / 3) + hex.center().x, Math.cos(i * Math.PI / 3) + hex.center().y, 0));
    }

    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.line = new THREE.Line(this.geometry, this.material);

    stage.scene.add(this.line);
  }
  remove() {
    this.line.geometry.dispose();
    this.line.material.dispose();
    this.stage.scene.remove(this.line);
  }
  moveTo(hex) {
    this.hex = hex;
    // https://discourse.threejs.org/t/how-to-animate-three-line-objects-from-startpoint-to-endpoint/6626/13
    const pos = this.geometry.getAttribute('position');
    const pa = this.geometry.getAttribute('position').array;

    for (let i=0; i<7; i++) {
      const point = new THREE.Vector3(Math.sin(i * Math.PI / 3 + (hex.flat ? Math.PI / 6 : 0)) + hex.center().x, Math.cos(i * Math.PI / 3 + (hex.flat ? Math.PI / 6 : 0)) + hex.center().y, 0);

      pa[3 * i] = point.x;
      pa[3 * i + 1] = point.y;
      pa[3 * i + 2] = point.z;
    }
    pos.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
  color(color) {
    this.material.color.set(color);
  }
}
export class Hex3d {
  constructor(stage, hex, color, options = {}) {
    this.hex = hex;
    this.position = new THREE.Vector3(hex.center().x, hex.center().y, hex.z);
    this.color = color;
    this.stage = stage;
    this.height = 1;
    this.wireframe = options.wireframe;
    this.onLoadListeners = [];
    this.rotation = this.hex.flat ? Math.PI / 6 : 0;
    this.opacity = options.opacity || 1;

    if (this.wireframe) {
      this.material = new THREE.MeshBasicMaterial({ color: this.color, wireframe: true });
    } else {
      this.material = new THREE.MeshPhongMaterial({ color: this.color, shininess: 100, specular: 0x888888});
    }

    // Can't get the reflections working right on the lathe geometry
    // const points = [new THREE.Vector2(this.size, 0), new THREE.Vector2(0, 0)];
    // this.geometry = new THREE.LatheGeometry(points, 6); 
    // May be worth attempting this: view-source:https://threejs.org/examples/webgl_buffergeometry_indexed.html

    this.geometry = new THREE.CylinderGeometry(this.hex.size, this.hex.size, this.height, 6, 1, options.openEnded); 
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    if (stage.shadows && options.shadows) {
      this.mesh.castShadow = true; // default is false
      this.mesh.receiveShadow = true; // default
    }

    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y;
    this.mesh.position.z = -this.height / 2 + this.position.z; // The top of the hex is at z=0

    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.rotation.y = this.rotation;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.wave = 0;

    stage.scene.add(this.mesh);
  }
  loadImage(path) {
    return new Promise((resolve, reject) => {
      LOADER.material(path).then((material) => {
        this.material.dispose();
        this.material = material;
        if (this.wireframe) this.material.wireframe = true;
        if (this.opacity !== 1) this.material.opacity = this.opacity;

        this.mesh.traverse((element) => {
          if (element?.material?.type != undefined) {
            let targetMaterial = material;
            targetMaterial.map.needsUpdate = true;
            element.material = targetMaterial;
            targetMaterial.map.needsUpdate = false;
          }
        });
        resolve(material);
      });
    });
  }
  remove() {
    // This only removes the 3d assetes. Don't forget to remove the hex from the board data structure
    this.geometry.dispose();
    this.material.dispose();
    this.stage.scene.remove(this.mesh);
  }
  rotateTo(radians) {
    this.rotation = radians + Math.PI / 2 + (this.hex.flat ? Math.PI / 6 : 0);
    this.mesh.rotation.y = this.rotation;
  }
  showWireframe(color) {
    this.wireframe = true;
    this.material.wireframe = true;
  }
  hideWireframe() {
    this.wireframe = false;
    this.material.wireframe = false;
  }
}

export class Model3d {
  constructor(stage, board, piece, color) {
    this.hex = board.newHex(piece.q, piece.r, piece.z);
    this.path = piece.subtype; // This ought to change to a path
    this.stage = stage;
    this.board = board;
    this.placeholder = piece.placeholder;
    this.assets = [];
    this.color = color;
    this.rotation = spinToRadians(piece.spin) + Math.PI / 2 || Math.PI / 2;
    this.onLoadListeners = [];
    this.visible = true;

    this.load(this.path, this.placeholder).then((asset) => {});
  }
  load(path, wireframe) {
    return new Promise((resolve, reject) => {
      LOADER.model(path).then((asset) => {
        this.assets.push(asset);

        const box = new THREE.Box3().setFromObject(asset); 
        const size = box.getSize(new THREE.Vector3());

        const scaleFactor = 2.5 / size.y;
        asset.rotation.x = Math.PI / 2;
        asset.scale.set(scaleFactor, scaleFactor, scaleFactor);

        asset.rotation.y = this.rotation;

        asset.position.x = this.hex.center().x;
        asset.position.y = this.hex.center().y;
        asset.position.z = -box.min.y * scaleFactor;

        if (wireframe) {
          asset.traverse((node) => {
            if (!node.isMesh) return;
            node.material.wireframe = true;
            node.material.color.set(this.color ? this.color : '#00ff00');
            // node.material.needsUpdate = true; // not sure if this is needed?
          });
        }

        if (this.stage.shadows) {
          asset.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true; //default is false
              node.receiveShadow = true; //default
            }
          })
        }

        if (this.visible === false) {
          this.hide();
        }

        this.stage.scene.add(asset);
        resolve(asset);
        this.onLoadListeners.forEach(callback => callback());
        this.onLoadListeners.length = 0;
      });
    });
  }
  onLoad(callback) {
    this.onLoadListeners.push(callback);
  }
  remove() {
    this.assets.forEach((asset) => {
      this.stage.scene.remove(asset);
    });
  }
  rotateTo(radians) {
    this.assets.forEach((asset) => {
      this.rotation = radians + Math.PI / 2;
      asset.rotation.y = this.rotation;
    });
  }
  moveTo(hex) {
    this.hex = hex;
    this.assets.forEach((asset) => {
      asset.position.x = hex.center().x;
      asset.position.y = hex.center().y;
    });
  }
  setColor(color) {
    if (color !== this.color) {
      this.color = color;
      this.assets.forEach((asset) => {
        asset.traverse((node) => {
          if (!node.isMesh) return;
          node.material.color.set(this.color ? this.color : '#00ff00');
        });
      });
    }
  }
  showWireframe(color) {
    if (color) this.color = color;
    this.wireframe = true;
    this.assets.forEach(asset => {
      asset.traverse((node) => {
        if (!node.isMesh) return;
        node.material.wireframe = true;
        node.material.color.set(this.color ? this.color : '#00ff00');
        // node.material.needsUpdate = true; // not sure if this is needed?
      });
    });
  }
  hideWireframe() {
    this.wireframe = false;
    this.assets.forEach(asset => {
      asset.traverse((node) => {
        if (!node.isMesh) return;
        this.color = "#ffffff"
        node.material.wireframe = false;
        node.material.color.set(this.color);
        // node.material.color.set(this.color ? this.color : '#00ff00');
        // node.material.needsUpdate = true; // not sure if this is needed?
      });
    });
  }
  show() {
    this.visible = true;
    this.assets.forEach((asset) => {
      asset.visible = true;
    });
  }
  hide() {
    this.visible = false;
    this.assets.forEach((asset) => {
      asset.visible = false;
    });
  }
}
export class CursorWireframe {
  constructor(stage) {
    this.stage = stage;
    this.hex;
    this.wireframeTiles = [];
    this.wireframeAssets = [];
    this.models = [];
    this.modelsSubtype;
    this.latestMode;
  }
  animate(board, editorMenuControls, hoveredHex, mouseControls) {
    let subtype;
    if (editorMenuControls.mode === 'character') subtype = editorMenuControls.editCharacterSelected();
    if (editorMenuControls.mode === 'tile') subtype = editorMenuControls.editTileSelected();

    // if (!hoveredHex) {
    //   this.wireframeTiles.forEach(wireframe => wireframe.remove());
    //   return;
    // }

    const hexes = board.hexesInRadius(editorMenuControls.editTileDistance(), hoveredHex.q, hoveredHex.r);
    const negative = editorMenuControls.mode === 'erase';

    if (this.latestMode !== editorMenuControls.mode) {
      this.deleteWireframeAssets();
      this.deleteTileWireframes();
      this.deleteModelWireframes();
    }

    if (this.wireframeTiles.length !== hexes.length) {
      this.deleteTileWireframes();
      this.createTileWireframes(hexes, negative, board, editorMenuControls);
    }

    if (this.hex && !hoveredHex.equals(this.hex)) {
      this.updateTileWireframes(hexes, board, editorMenuControls, negative);
    }

    if (editorMenuControls.mode === 'character') {
      if (this.models.length !== hexes.length || this.modelsSubtype !== subtype) {
        this.deleteModelWireframes();
        this.createModelWireframes(hexes, subtype, board, editorMenuControls, negative);
        this.modelsSubtype = subtype;
      }

      if (this.hex && !hoveredHex.equals(this.hex)) {
        this.updateModelWireframes(hexes, board, editorMenuControls, mouseControls, negative);
      }
    } else if (editorMenuControls.mode === 'erase') {
      const active = [];
      this.wireframeAssets.forEach(hexObject => {
        if (!hexes.find(hex => hex.equals(hexObject.piece))) {
          hexObject.assets.forEach(model => {
            if (model.wireframe) {
              model.hideWireframe();
            }
          });
        } else {
          active.push(hexObject);
        }
      });

      this.wireframeAssets = active;

      hexes.forEach(hex => {
        const occupied = this.occupied(hex, board, editorMenuControls);
        if (occupied) {
          if (this.wireframeAssets.indexOf(occupied) === -1) {
            occupied.assets.forEach(model => {
              model.showWireframe('#ff0000');
            });
            this.wireframeAssets.push(occupied);
          }
        }
      });
    }

    this.hex = hoveredHex;
    this.latestMode = editorMenuControls.mode;
  }
  createTileWireframes(hexes, negative, board, editorMenuControls) {
    hexes.forEach((hex) => {
      const occupied = this.occupied(hex, board, editorMenuControls);
      const color = !!occupied !== !!negative ? '#ff0000' : '#44ff44';
      const outline = new HexagonalOutline(hex, board.size, this.stage, color);
      this.wireframeTiles.push(outline);
    });
  }
  updateTileWireframes(hexes, board, editorMenuControls, negative) {
    hexes.forEach((hex, i) => {
      const wireframe = this.wireframeTiles[i];
      if (wireframe.hex !== hex) {
        wireframe.moveTo(hex);
      }

      const occupied = this.occupied(hex, board, editorMenuControls);
      const color = !!occupied !== !!negative ? '#ff0000' : '#44ff44';

      wireframe.color(color);
    });
  }
  deleteModelWireframes() {
    this.models.forEach(wireframe => wireframe.remove());
    this.models.length = 0;
  }
  deleteModelWireframe(wireframe) {
    const index = this.models.indexOf(wireframe);

    console.log('deleting model wireframe');

    this.models.splice(index, 1);
    wireframe.remove();
  }
  createModelWireframes(hexes, subtype, board, editorMenuControls, negative, spin = 0) {
    this.models.forEach(wireframe => wireframe.remove());
    this.models.length = 0;
    hexes.forEach((hex) => {
      const occupied = this.occupied(hex, board, editorMenuControls);
      const color = occupied ? '#ff0000' : '#44ff44';

      const piece = {q: hex.q, r: hex.r, z: 0, spin: spin, type: 'character', subtype: subtype};
      const model3d = new Model3d(this.stage, board, {...piece, placeholder: true}, color); 

      if (!!occupied !== !!negative) {
        model3d.hide();
      }

      this.models.push(model3d);
    });
  }
  updateModelWireframes(hexes, board, editorMenuControls, mouseControls, negative) {
    const hideAll = mouseControls.leftMouseDown || mouseControls.rightMouseDown || mouseControls.middleMouseDown;

    hexes.forEach((hex, i) => {
      const wireframe = this.models[i];
      if (wireframe.hex !== hex) {
        wireframe.moveTo(hex);
      }

      const occupied = this.occupied(hex, board, editorMenuControls);

      if (wireframe.visible && (!!occupied !== !!negative || hideAll)) {
        wireframe.hide();
      } else if (!!occupied === !!negative && !hideAll && !wireframe.visible) {
        wireframe.show();
      }
    });
  }
  deleteTileWireframes() {
    this.wireframeTiles.forEach(wireframe => wireframe.remove());
    this.wireframeTiles.length = 0;
  }
  deleteWireframeAssets() {
    this.wireframeAssets.forEach(wireframe => {
      wireframe.assets.forEach(model => {
        model.hideWireframe();
      });
    })
    this.wireframeAssets.length = 0;
  }
  occupied(hex, board, editorMenuControls) {
    let modes;
    if (editorMenuControls.mode === 'tile') {
      modes = ['tile'];
    } else if (editorMenuControls.mode === 'character') {
      modes = ['character'];
    } else if (editorMenuControls.mode === 'ornament') {
      modes = ['ornament'];
    } else if (editorMenuControls.mode === 'erase') {
      if (editorMenuControls.eraserMenu.selected === 'tile') {
        modes = ['tile'];
      } else if (editorMenuControls.eraserMenu.selected === 'character') {
        modes = ['character'];
      } else if (editorMenuControls.eraserMenu.selected === 'ornament') {
        modes = ['ornament'];
      }
    }

    return board.getObjects(hex.q, hex.r).find(o => modes.indexOf(o.type) !== -1) || board.getPlaceholders(hex.q, hex.r).find((o => modes.indexOf(o.type) !== -1));
  }
}
// export class HexEffect {
//   constructor(stage, board, piece) {
//     this.piece = piece;
//     this.stage = stage;
//     this.board = board;
//     this.assets = [];
//     this.hex;
//     this.image;
//   }
//   load() {
//     new THREE.ImageBitmapLoader().load('/public/land_ocean_ice_cloud_2048.png', function (image) {
//       this.image = image;
//       const texture = new THREE.CanvasTexture(image);
//       texture.colorSpace = THREE.SRGBColorSpace;
//       const material = new THREE.MeshBasicMaterial({map: texture});
// 
//       /* ImageBitmap should be disposed when done with it
//          Can't be done until it's actually uploaded to WebGLTexture */
//       // imageBitmap.close();
// 
//       this.hex = new Hex3d(this.stage, this.board, this.piece, material);
// 
//       assets.push(this.hex);
//     }, function (p) {
//       console.log(p);
//     }, function (e) {
//       console.log(e);
//     });
//   }
//   remove() {
//     this.image.close();
//   }
// }
export class WorkloadDashboard {
  constructor() {
    const workloadDiagnostics = document.createElement('div');
    workloadDiagnostics.id = 'workload';
    workloadDiagnostics.style.position = 'absolute';
    workloadDiagnostics.style.top = 0;
    workloadDiagnostics.style.left = 100 + 'px';
    workloadDiagnostics.style.zIndex = 1;
    workloadDiagnostics.style.color = 'white';
    workloadDiagnostics.style.fontFamily = 'monospace';
    workloadDiagnostics.style.fontSize = '8px';
    workloadDiagnostics.style.lineHeight = '8px';
    const table = document.createElement('table');
    table.style.gap = 0;
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    ['calls', 'triangles', 'points', 'lines'].forEach((label) => {
      const tr = document.createElement('tr');
      tbody.appendChild(tr);

      const th = document.createElement('th');
      th.innerHTML = label;

      const td = document.createElement('td');
      td.id = 'workload-' + label;
      tr.appendChild(th);
      tr.appendChild(td);
    });
    workloadDiagnostics.appendChild(table);
    document.body.appendChild(workloadDiagnostics);

    this.element = workloadDiagnostics;
  }
  update(renderer) {
    ['calls', 'triangles', 'points', 'lines'].forEach((label) => {
      const workload = renderer.info.render;
      document.getElementById('workload-' + label).innerText = workload[label];
    });
    // if (new Date().getTime() - this.lastUpdate > 1000) {
    //   let gl;
    //   let debugInfo;
    //   let vendor;
    //   let renderer2;

    //   try {
    //     gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    //   } catch (e) {
    //     console.warn('Web GL Context not available')
    //   }
    //   if (gl) {
    //     debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    //     vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    //     renderer2 = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    //   }

    //   console.log('GL', gl, debugInfo, vendor, renderer2);
    //   this.lastGLQuery = new Date().getTime();
    // }
  }
}




/**
 * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
 * A linear interpolator for hexadecimal colors
 * @param {String} a
 * @param {String} b
 * @param {Number} amount
 * @example
 * // returns #7F7F7F
 * lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
export function lerpColor(a, b, amount) { 
    if (amount > 1) amount = 1;
    if (amount < 0) amount = 0;

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}