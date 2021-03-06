import {SensorDataHandler} from '../model/motion_sensor/SensorDataHandler';
import eventHandlerInstance from '../../libs/EventHandler';
import {Utils} from '../../common/Utils';

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import {getOBJ, getTextures, getMTL} from '../../common/LoadersUtil';
import {serverUrl} from "../../../common/server-const";
import axios from 'axios';

let currentFaceClassLocal = -1;

export class ModelRotator {
    constructor(sensorAddress) {
        // Very Good
        // this.rotation_dt = 0.0003
        // this.alpha = 2 * Math.PI / (2 * Math.PI + this.rotation_dt)
        // this.acc_dt = 1 - this.alpha
        // this.const = this.alpha
        this.axisX = new THREE.Vector3(1, 0, 0); // CHANGED
        this.axisZ = new THREE.Vector3(0, 0, 1);
        this.is_anomaly_filter_active = true;
        this.anomaly_angle = 180;
        this.countRotations = 0;
        this.prevRatio = [];
        this.sessionStatus = "session_awaiting";
        this.prevSessionStatus = "session_awaiting";
        this.sensorAddress = sensorAddress;
        this.prevQuaternion = null;
        this.countQuaternions = 0;
        this.sumQuaternions = 0;
        this.streamAvg = [];
        this.requestsToSend = [];
        this.offsetCalibration = [];
        this.offset = null;// w-0.60  x-0.36 y0.42  z-0.57
        this.rotation_dt = 0.0003;
        this.alpha = 2 * Math.PI / (2 * Math.PI + this.rotation_dt);
        this.acc_dt = 1 - this.alpha;
        this.const = this.alpha;
        this.read = {rx: 0, ry: 0, rz: 0, ax: 0, ay: 0, az: 0, qw: 0, qx: 0, qy: 0, qz: 0};
        this.count = 0;
        eventHandlerInstance.addEventListener('angle_x' + this.sensorAddress, (e) => {
            this.read.anglex = e();
        });

        eventHandlerInstance.addEventListener('angle_y' + this.sensorAddress, (e) => {
            this.read.angley = e();
        });

        eventHandlerInstance.addEventListener('angle_z' + this.sensorAddress, (e) => {
            this.read.anglez = e();
        });

        eventHandlerInstance.addEventListener('qw' + this.sensorAddress, (e) => {
            this.read.qw = e();
        });

        eventHandlerInstance.addEventListener('qx' + this.sensorAddress, (e) => {
            this.read.qx = e();
        });

        eventHandlerInstance.addEventListener('qy' + this.sensorAddress, (e) => {
            this.read.qy = e();
        });

        eventHandlerInstance.addEventListener('qz' + this.sensorAddress, (e) => {
            this.read.qz = e();
        });
        this.rotateModel = this.rotateModel.bind(this);
    }

    initSensorListener = (sensorListener) => {
        // this.sensorAddress = new SensorDataHandler(this.sensorAddress).sensorAddress;
        this.sensorAddress = sensorListener;
    };

    getFixedNumber(value) {
        return value.toFixed(4);
        // return Math.floor(x * 1000) / 1000;
    };

    percentageChangeCalculator(v1, v2) {
        if (v1 === 0 || v1 === 0.0) {
            return v2;
        }

        if (v2 === 0 || v2 === 0.0) {
            return v1;
        }

        return (v2 - v1) / Math.abs(v1);
    }

    rotateModel(model) {

        let quaternion;
        quaternion = new THREE.Quaternion(this.getFixedNumber(this.read.qx),
                                          this.getFixedNumber(this.read.qy),
                                          this.getFixedNumber(this.read.qz),
                                          this.getFixedNumber(this.read.qw));

        // rotate quaternion by offset
        quaternion = quaternion
            // .multiply(new THREE.Quaternion()
            //               .setFromEuler(new THREE.Euler(Math.PI/2, 0,0))
            //               .normalize())
            .normalize();

        const currentRotationEulerAngles = new THREE.Euler();
        currentRotationEulerAngles.setFromQuaternion(quaternion);
        // model.rotation.y = this.getFixedNumber(currentRotationEulerAngles.z);
        // model.rotation.x = -this.getFixedNumber(currentRotationEulerAngles.x);
        // model.rotation.z = this.getFixedNumber(currentRotationEulerAngles.y);
        model.quaternion.slerp(quaternion, 1);

        this.handleSession(quaternion);
        let filterOutThisQuaternion = false;

        // if (this.is_anomaly_filter_active) {
        //     if (this.sessionRefQuaternion === null && quaternion) {
        //         this.prevQuaternion = quaternion;
        //         this.sessionRefQuaternion = quaternion;
        //     } else {
        //         // console.log(this.prevQuaternion.angleTo(quaternion) * 180 / Math.PI)
        //         if (this.prevQuaternion.angleTo(quaternion) * 180 / Math.PI > this.anomaly_angle) {
        //             console.log("Anomaly detected - Filtering anomaly!!");
        //             filterOutThisQuaternion = true;
        //         }
        //
        //         if (!filterOutThisQuaternion) {
        //             this.prevQuaternion = quaternion;
        //         }
        //     }
        // }

        if (filterOutThisQuaternion === false) {
            // if (this.sessionStatus === "session_in_progress") {
            //     this.requestsToSend.push({
            //                                  timestamp: new Date(),
            //                                  x: quaternion.x,
            //                                  y: quaternion.y,
            //                                  z: quaternion.z,
            //                                  w: quaternion.w,
            //                                  face: currentFaceClassLocal ? currentFaceClassLocal : 'none'
            //                              });
            // } else {
            //     if (this.prevSessionStatus === "session_in_progress" && this.sessionStatus ===
            // "session_awaiting") { let data = { creation_time: new Date(), x: quaternion.x, y: quaternion.y, z:
            // quaternion.z, w: quaternion.w, status: this.sessionStatus }; const url = "/api/save_session";
            // axios({method: 'post', url: url, data: this.requestsToSend}); // this.requestsToSend = [];
            // console.log(this.requestsToSend); this.prevSessionStatus = "session_awaiting"; } }
        }

        return model;
    }

    handleSession(quaternion) {
        if (this.prevQuaternion === null) {
            this.prevQuaternion = quaternion;
        } else {
            let arr = ["x", "y", "z", "w"];
            this.countQuaternions++;
            arr.forEach(x => this.sumQuaternions += Math.abs(this.prevQuaternion[x] - quaternion[x]));
        }

        if (this.countQuaternions === 100) {
            this.streamAvg.push(this.sumQuaternions);
            // console.log(this.sumQuaternions)
            // if ()
            this.countQuaternions = 0;
            this.sumQuaternions = 0;
        }

        if (this.streamAvg.length === 10) {
            let vectorAvgDistance = this.streamAvg.reduce((x, y) => x + y) / this.streamAvg.length;
            this.prevSessionStatus = this.sessionStatus;
            this.sessionStatus = vectorAvgDistance > 5.5 ? "session_in_progress" : "session_awaiting";
            console.log(this.sessionStatus);

            this.streamAvg = [];
            this.prevQuaternion = quaternion;
        }
    }
}

export var GLOBAL_FACE_STATE = 0;

export class PlayGround {
    constructor(sensorAddress, {DOM, sides = 6, model}) {
        this.model = null;
        this.isSet = false;
        this.sensorAddress = sensorAddress;

        this.prevFace = 0;

        this.initPlayGroundElements = this.initPlayGroundElements.bind(this);
        this.startMotionTracking = this.startMotionTracking.bind(this);
        this.findFaceForVertices = this.findFaceForVertices.bind(this);
        // this.playGroundElements = this.initPlayGroundElements(DOM, model, this.startMotionTracking)
        this.playGroundElements = this.initPlayGroundElements('3dApp', sensorAddress);
        console.log("Attaching 3d app to DOM");
        this.getSensorAddress = this.getSensorAddress.bind(this);
        eventHandlerInstance.registerEvent('modelLoaded' + this.getSensorAddress());
        this.setModel = this.setModel.bind(this);
        eventHandlerInstance.addEventListener('modelLoaded' + sensorAddress, (e) => {
            this.setModel(e());
        });

        eventHandlerInstance.registerEvent('currentFaceLockOn');
        // eventHandlerInstance.addEventListener('currentFaceLockOn' + this.sensorAddress, (e) => {
        //   GLOBAL_FACE_STATE = e()
        //   // console.log(e())
        // })
        eventHandlerInstance.addEventListener('connectionReset' + this.sensorAddress, (e) => {
            // this.model.position.x = -Math.PI
            // this.model.position.y = Math.PI / 2
            // this.model.position.z = Math.PI / 6
        });

        const url = '/api/faceclear';
        // let param = {faceId: currentFace}
        axios({method: 'get', url: url});
    }

    initSensorListener = (modelRotator) => {
        this.modelRotator = modelRotator;
    };

    getSensorAddress() {
        return this.sensorAddress;
    }

    setModel(model) {
        this.model = model;
    }

    resizeCanvasToDisplaySize = (camera, renderer) => {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            // you must pass false here or three.js sadly fights the browser
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            // set render target sizes here
        }
    };

    initPlayGroundElements(DOM, sensorAddress) {
        const texturesSRC = [
            // 'marble.jpg'
        ].map(file => serverUrl + 'api/' + file);

        // https://tontora0model.s3.eu-central-1.amazonaws.com/ourLady2.obj
        const objsSRC = [
            // 'handOfTheKing.obj'
            // 'ourLady2.obj'
            'incBottle.obj'
        ].map(file => serverUrl + 'api/' + file);

        const mtlsSRC = [
            // 'handScaled.mtl'
            // 'handOfTheKing.mtl'
            'incBottle.mtl'
        ].map(file => serverUrl + 'api/' + file);

        Promise.all(getTextures(texturesSRC))
            .then(textures => {
                let texture = textures[0];
                Promise.all(getMTL(mtlsSRC))
                    .then(mtls => {
                        let NEEDEDMTL = mtls[0].materials;
                        NEEDEDMTL = NEEDEDMTL[Object.keys(NEEDEDMTL)[0]];
                        Promise.all(getOBJ(objsSRC, NEEDEDMTL))
                            .then(objs => {
                                objs.forEach(obj => {
                                    obj.position.set(0, 0, 0);
                                    obj.traverse(function (child) {
                                        if (child instanceof THREE.Mesh) {
                                            // const geo = new THREE.Geometry().fromBufferGeometry(child.geometry)
                                            // child.geometry.dispose()
                                            // const object = new THREE.Mesh(geo, NEEDEDMTL)
                                            // object.geometry = geo
                                            child.geometry.dynamic = true;
                                            NEEDEDMTL.flatShading = true;
                                            NEEDEDMTL.map = texture;
                                            NEEDEDMTL.needsUpdate = true;
                                            child.material = NEEDEDMTL;
                                            child.material.emissiveIntensity = 2;
                                            child.castShadow = true;
                                            child.receiveShadow = true;
                                            child.geometry.computeFaceNormals();
                                            child.geometry.computeVertexNormals();
                                            child.geometry.scale(1, 1, 1);
                                            child.geometry.uvsNeedUpdate = true;
                                            // child.rotation.x = Math.PI;
                                            child.rotation.y = 0;
                                            child.rotation.z = 0;
                                            // object.name = 'hand'
                                            // child.scale(10,10,10)
                                            // console.log(child)
                                            let parentMaterial = new THREE.MeshLambertMaterial({
                                                                                                   color: 0x0000ff,
                                                                                                   transparent: true,
                                                                                                   opacity: 0.1
                                                                                               });
                                            // let parentGeo = new THREE.TetrahedronGeometry(
                                            //   50,
                                            //   0)

                                            let parentGeo = new THREE.BoxGeometry(50, 50, 50);
                                            let cube = new THREE.Mesh(
                                                parentGeo,
                                                parentMaterial);
                                            //
                                            cube = new THREE.Mesh(parentGeo, parentMaterial.clone());
                                            //
                                            //
                                            let clone = child.material.clone();
                                            child = new THREE.Mesh(child.geometry, clone);
                                            // child.rotation.x = Math.PI / 2;
                                            // child.rotation.y = Math.PI/2;
                                            // child.rotation.z = Math.PI/2;
                                            //
                                            // cube.visible = false;
                                            cube.material.transparent = true;
                                            // // cube.material.wireframe = true;
                                            // cube.position.x = -Math.PI;
                                            // cube.position.y = Math.PI / 2;
                                            // cube.position.z = 80;
                                            // cube.geometry.computeFaceNormals();
                                            // cube.geometry.computeVertexNormals();
                                            // cube.geometry.scale(1, 1, 1);
                                            // cube.geometry.uvsNeedUpdate = true;

                                            // var cubeMaterial = new THREE.MeshPhongMaterial({
                                            //                                                    ambient: 0xffabe4,
                                            //                                                    color: 0xace3ff,
                                            //                                                    specular: 0xffabe4,
                                            //                                                    shininess: 0,
                                            //                                                    perPixel: true,
                                            //                                                    metal: true
                                            //                                                });
                                            // var cube = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50),
                                            //                           new THREE.MeshNormalMaterial());
                                            cube.material.visible = false;
                                            cube.add(child);
                                            cube.name = 'hand';
                                            cube.useQuaternion = true;
                                            console.log(cube);
                                            // cube.rotation.order = 'ZYX';
                                            scene.add(cube);

                                            // Euler {_x: 1.001257647593464, _y: -0.7426420834512112, _z:
                                            // -2.55498658775335, _order: "ZYX"}

                                            // this.gui.addMaterial('mainModel', cube)
                                        }
                                    });
                                });
                            })
                            .catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));
            })
            .catch(err => console.error(err));

        let ww = window.innerWidth;
        let wh = window.innerHeight;
        let scene = new THREE.Scene(),
            light = new THREE.AmbientLight(0xffffff),
            camera,
            renderer = new THREE.WebGLRenderer({antialias: true});

        const axesHelper = new THREE.AxesHelper(200);
        scene.add(axesHelper);
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            // 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Veste_Oberhaus_%28Passau%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg',
            // 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Veste_Oberhaus_%28Passau%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg/1280px-Veste_Oberhaus_%28Passau%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg',
            // 'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);
                scene.background = rt;
            });

        // directional light
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.1);
        directionalLight1.position.set(1, 0, 0);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
        directionalLight2.position.set(0, 1, 0);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.1);
        directionalLight3.position.set(0, 0, -1);

        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.1);
        directionalLight3.position.set(-1, 0, 0);

        scene.add(directionalLight1);
        scene.add(directionalLight2);
        scene.add(directionalLight3);
        scene.add(directionalLight4);

        // Configure renderer clear color
        renderer.setClearColor('#19ebff');
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(ww, wh);
        // renderer.setSize(ww, wh)
        document.getElementById(DOM).appendChild(renderer.domElement);

        // window.addEventListener('resize', () => {
        //   renderer.setSize(ww, wh)
        // })

        camera = new THREE.PerspectiveCamera(70, 3, 1, 1500);
        // camera.position.x=10

        camera.rotation.order = "XYZ";
        camera.updateProjectionMatrix();
        // camera.position.y= 90;
        camera.position.x = 180;
        // camera.position.z = -90;
        camera.lookAt(0, 0, 0);
        // let controls = new OrbitControls(camera, renderer.domElement);
        // controls.update();
        camera.rotation.x = Math.PI / 2;
        // camera.updateProjectionMatrix();
        // camera.lookAt(0, 0, 0);
        // camera.lookAt(0, 0, 0);
        // camera.rotation.y = 0.035035;
        // camera.rotation.z =2.9;
        // if (model) {
        //   cube.add(model)
        // }
        // scene.add(cube)
        scene.add(light);

        // renderer.render(scene, camera)
        return {
            scene: scene, renderer: renderer, camera: camera,
            // controls: controls
        };
    }

    getRealWorldVertices(threeDObject) {
        const realWorldMap = [];

        threeDObject.geometry.vertices.forEach((v) => {
            const vector = v.clone();
            vector.applyMatrix4(threeDObject.matrixWorld);
            realWorldMap.push(vector);
        });
        // if (threeDObject.isMesh) {
        //
        //     const position = threeDObject.geometry.attributes.position;
        //     const vector = new THREE.Vector3();
        //
        //     for (let i = 0, l = position.count; i < l; i++) {
        //
        //         vector.fromBufferAttribute(position, i);
        //         vector.applyMatrix4(threeDObject.matrixWorld);
        //         console.log(vector);
        //         realWorldMap.push(vector)
        //     }
        //
        // }
        return realWorldMap;
    }

    findFaceForVertices(threeDObject, vertices) {
        // console.log('vertices:')
        // console.log(...vertices)
        // console.log('--------------------')
        const faces = [...threeDObject.geometry.faces];
        // console.log('faces before loop: ')
        // console.log(...faces)
        // console.log('--------------------')
        let sortedFaceVerticesIndices = [];
        for (let index = 0, len = faces.length; index < len; index++) {
            // console.log(index + ' index ' + faces + 'face')
            // console.log(...faces)
            // console.log('--------------------')
            sortedFaceVerticesIndices = [faces[index].a, faces[index].b, faces[index].c];
            // console.log('before sort vertices' + sortedFaceVerticesIndices)
            // console.log(...sortedFaceVerticesIndices)
            // console.log('--------------------')
            sortedFaceVerticesIndices.sort((a, b) => a <= b ? -1 : 1);
            // console.log('after sort vertices' + sortedFaceVerticesIndices)
            // console.log(...sortedFaceVerticesIndices)
            // console.log('--------------------')
            vertices.sort((a, b) => a.index - b.index);
            if (vertices[0].index === sortedFaceVerticesIndices[0] &&
                vertices[1].index === sortedFaceVerticesIndices[1] &&
                vertices[2].index === sortedFaceVerticesIndices[2]) {
                return index;
            }
        }

        return null;
    }

    initStateUpdater = (stateUpdater) => {
        this.faceUpdater = stateUpdater;
    };

    calculateCurrentFace = (rw, point) => {
        const faceVertices = Utils.KNN.generateDistanceMap(rw, point, 3);
        // console.log(findFaceForVertices(tetrahedron, faceVertices));
        const temp = faceVertices.map((v) => v.distance);
        const sd = Utils.STATS.standardDeviation(temp);
        // console.log(sd)
        if (Math.abs(sd) < 70) {
            const currentFace = this.findFaceForVertices(this.model, faceVertices);
            return currentFace;
        }
        return -1;
    };

    startMotionTracking() {
        // console.log(model)
        let renderer = this.playGroundElements.renderer;
        let scene = this.playGroundElements.scene;
        let camera = this.playGroundElements.camera;
        let model = this.model;

        console.log(camera.rotation);

        this.resizeCanvasToDisplaySize(camera, renderer);

        if (this.isSet === false && scene.getObjectByName('hand')) {
            this.model = scene.getObjectByName('hand');
            // console.log(model);
            this.isSet = true;
        }
        if (model) {
            // const a = new THREE.Euler( 0,0,  Math.PI / 2, 'ZYX' );

            // camera.position.x  -=1;
            // camera.position.z += 1;
            // camera.lookAt(0,0,0)
            // model.rotation.z = 3.14/2
            // model.rotation.y = 3.14/4
            // model.rotation.y += 0.01
            // model.setRotationFromEuler(a)
            // console.log(model);
            const rw = this.getRealWorldVertices(model);
            // console.log(...rw)
            this.modelRotator.rotateModel(model);
            // this.model.rotation.x += 0.01
            const facesHash = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const faceCalc1 = this.calculateCurrentFace(rw, [150, 0, -20]);
            const faceCalc2 = this.calculateCurrentFace(rw, [150, 0, 20]);
            const faceCalc3 = this.calculateCurrentFace(rw, [150, 20, 0]);
            const faceCalc4 = this.calculateCurrentFace(rw, [150, -20, 0]);
            const faceCalc5 = this.calculateCurrentFace(rw, [150, 14, 14]);
            const faceCalc6 = this.calculateCurrentFace(rw, [150, -14, 14]);
            const faceCalc7 = this.calculateCurrentFace(rw, [150, 14, -14]);
            const faceCalc8 = this.calculateCurrentFace(rw, [150, -14, -14]);
            const faceCalc9 = this.calculateCurrentFace(rw, [150, 0, 0]);

            const facesSelection = [faceCalc1, faceCalc2, faceCalc3, faceCalc4, faceCalc5, faceCalc6, faceCalc7,
                                    faceCalc8, faceCalc9];
            // console.log(facesSelection);
            facesSelection.filter(f => f > 0).forEach(f => facesHash[f]++);
            const currentFace = facesHash.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            if (currentFace) {
                currentFaceClassLocal = currentFace;
            }
            // console.log('rotx' + model.rotation.x + ' ' + model.rotation.y + ' ' + model.rotation.z)

            if (currentFace && currentFace !== this.prevFace) {
                console.log('Lock on face num: ' + currentFace);
                this.prevFace = currentFace;
                eventHandlerInstance.dispatchEvent('currentFaceLockOn', () => currentFace);
                GLOBAL_FACE_STATE = currentFace;
                this.faceUpdater(currentFace);
                // console.log(GLOBAL_FACE_STATE);
                const url = 'api/face';
                let param = {faceId: currentFace};
                // axios({method: 'get', url: (serverUrl + url + '/' + currentFace)})
                //     .then(data => axios.get(serverUrl + '/api/face').then(res => console.log(res)))
                //     .catch(err => console.log(err));
            }

            // console.log(JSON.stringify(bombModel.rotation) + ' x in degrees:' +
            // Utils.STATS.radians_to_degrees(bombModel.rotation.x) + ' y in deg ' +
            // Utils.STATS.radians_to_degrees(bombModel.rotation.y) + ' z in deg' +
            // Utils.STATS.radians_to_degrees(bombModel.rotation.z))

            // this.playGroundElements.controls.update();
        }

        renderer.render(scene, camera);
        window.requestAnimationFrame(this.startMotionTracking.bind(this));
    }
}
