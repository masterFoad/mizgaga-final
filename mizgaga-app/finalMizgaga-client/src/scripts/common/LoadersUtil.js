import * as THREE from 'three'
import OBJLoader from 'three-obj-loader-es6-module'
import MTLLoader from 'three-react-mtl-loader'

/**
 *
 * @param {Array} texturesSources - List of Strings that represent texture sources
 * @returns {Array} Array containing a Promise for each source
 */
export const getTextures = (texturesSources) => {
  const loader = new THREE.TextureLoader()
  return texturesSources.map(textureSource => {
    return new Promise((resolve, reject) => {
      loader.load(
        textureSource,
        texture => resolve(texture),
        undefined, // onProgress callback not supported from r84
        err => reject(err)
      )
    })
  })
}

export const getOBJ = (ObjSources, materials) => {
  const loader = new OBJLoader()
  return ObjSources.map(ObjSource => {
    return new Promise((resolve, reject) => {
      loader.load(
        ObjSource,
        OBJ => resolve(OBJ),
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        err => reject(err)
      )
    })
  })
}

export const getMTLandTextures = (mtlSources, textureSources) => {
  const loader = new MTLLoader()
  loader.setPath(mtlSources[0])
  loader.setTexturePath(textureSources[0])
  return mtlSources.map(mtlSource => {
    return new Promise((resolve, reject) => {
      loader.load(
        mtlSource,
        MTL => {
          MTL.preload()
          resolve(MTL)
        },
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        err => reject(err)
      )
    })
  })
}

export const getMTL = (mtlSources) => {
  const loader = new MTLLoader()
  return mtlSources.map(mtlSource => {
    return new Promise((resolve, reject) => {
      loader.load(
        mtlSource,
        MTL => {
          MTL.preload()
          resolve(MTL)
        },
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        err => reject(err)
      )
    })
  })
}
