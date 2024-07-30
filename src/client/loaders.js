import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

// We only need one singleton instance of each of these loaders classes, so that all downloads are shared.

class LoadBatcher {
  constructor() {
    this.promises = {}; // this.promises[path] = [resolve, resolve, ...];
  }
  load(path, loadFunction) {
    return new Promise((resolve, reject) => {
      if (this.promises[path]) {
        this.promises[path].push(resolve);
      } else {
        this.promises[path] = [resolve];
        loadFunction(path).then((asset) => {
          this.promises[path].forEach((resolve, i) => resolve(asset, i));
          delete this.promises[path];
        });
      }
    });
  }
}

const LOAD_BATCHER = new LoadBatcher();

class Loader {
  constructor() {
    this.imageBitmapLoader = new THREE.ImageBitmapLoader();
    this.imageBitmapLoader.setOptions({imageOrientation: 'flipY'});
    this.GLTFLoader = new GLTFLoader();

    this.images = {};
    this.modelData = {};

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
    // loader.setDRACOLoader( dracoLoader );
  }
  #loadBitmap(path) {
    return new Promise((resolve, reject) => {
      console.log('Loading Bitmap', path)
      this.imageBitmapLoader.load(path, (imageBitmap) => {
        this.images[path] = imageBitmap;
        resolve(imageBitmap);
      });
    })
  }
  #loadModel(path) {
    return new Promise((resolve, reject) => {
      console.log('Loading model', path);
      fetch(path)
      .then((response) => response.arrayBuffer())
      .then((response) => {
        this.modelData[path] = response;
        resolve(response);
      })

      // this.GLTFLoader.load(path, (gltf) => {
      //     // scene.add(gltf.scene);
      //     gltf.animations; // Array<THREE.AnimationClip>
      //     gltf.scene; // THREE.Group
      //     gltf.scenes; // Array<THREE.Group>
      //     gltf.cameras; // Array<THREE.Camera>
      //     gltf.asset; // Object
      //     this.models[path] = gltf;
      //     resolve(gltf);
      //   },
      //   // called while loading is progressing
      //   function (xhr) {
      //     // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      //     // if (loading) {
      //     //   loading(xhr);
      //     // }
      //   },
      //   // called when loading has errors
      //   function (error) {
      //     console.error('GLTF Loader error', error);
      //     reject(error);
      //   }
      // );
    });
  }
  image(path) {
    return new Promise((resolve, reject) => {
      if (this.images[path]) {
        resolve(this.images[path]);
      } else {
        LOAD_BATCHER.load(path, this.#loadBitmap.bind(this)).then((image) => {
          resolve(image);
        });
      }
    })
  }
  material(path) {
    return new Promise((resolve, reject) => {
      this.image(path).then((image) => {
        const texture = new THREE.CanvasTexture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide, transparent: true});
        resolve(material);
      });
    })
  }
  model(path) {
    return new Promise((resolve, reject) => {
      if (this.modelData[path]) {
        // We need to parse modelData each time because Three.js has a bug with GLTF Loader that causes cloned scenes to 
        // keep references to the original scene when cloned
        this.GLTFLoader.parse(this.modelData[path], path, (gltf) => {
          resolve(gltf.scene);
        });
      } else {
        LOAD_BATCHER.load(path, this.#loadModel.bind(this)).then((modelData, i) => {
          this.GLTFLoader.parse(modelData, path, (gltf) => {
            resolve(gltf.scene);
          });
        });
      }
    })
  }
  remove() {
    Object.values(this.images).forEach((image) => { image.close() });
    // Object.values(this.materials).forEach((material) => { material.dispose() });
  }
}




export const LOADER = new Loader();