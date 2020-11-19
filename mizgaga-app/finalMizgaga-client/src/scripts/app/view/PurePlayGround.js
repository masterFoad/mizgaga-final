import eventHandlerInstance from '../../libs/EventHandler';
import {Utils} from '../../common/Utils';

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import {getMTL, getOBJ, getTextures} from '../../common/LoadersUtil';
import {serverUrl} from "../../../common/server-const";
import axios from 'axios';

export class ModelRotator {
    constructor(sensorAddress) {
        // Very Good
        // this.rotation_dt = 0.0003
        // this.alpha = 2 * Math.PI / (2 * Math.PI + this.rotation_dt)
        // this.acc_dt = 1 - this.alpha
        // this.const = this.alpha

        this.countRotations = 0;
        this.prevRatio = [];
        this.sessionStatus = "session_awaiting";
        this.prevSessionStatus = "session_awaiting";
        this.sensorAddress = sensorAddress;
        this.sessionRefQuaternion = null;
        this.countQuaternions = 0;
        this.sumQuaternions = 0;
        this.streamAvg = [];
        this.requestsToSend = [];

        this.rotation_dt = 0.0003;
        this.alpha = 2 * Math.PI / (2 * Math.PI + this.rotation_dt);
        this.acc_dt = 1 - this.alpha;
        this.const = this.alpha;
        this.read = {rx: 0, ry: 0, rz: 0, ax: 0, ay: 0, az: 0, qw: 0, qx: 0, qy: 0, qz: 0};
        eventHandlerInstance.addEventListener('rotateX' + this.sensorAddress, (e) => {
            this.read.rx = e();
        });

        eventHandlerInstance.addEventListener('rotateY' + this.sensorAddress, (e) => {
            // console.log('e()' + e())
            // console.log('ready' + this.read.ry)
            this.read.ry = e();
        });

        eventHandlerInstance.addEventListener('rotateZ' + this.sensorAddress, (e) => {
            this.read.rz = e();
        });

        eventHandlerInstance.addEventListener('gForceX' + this.sensorAddress, (e) => {
            this.read.ax = e();
        });

        eventHandlerInstance.addEventListener('gForceY' + this.sensorAddress, (e) => {
            this.read.ay = e();
        });

        eventHandlerInstance.addEventListener('gForceZ' + this.sensorAddress, (e) => {
            this.read.az = e();
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

    getFixedNumber(x) {
        // return Number(num.toFixed(5));
        // return Math.floor(x * 1000) / 1000;
        return x;
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
        model.rotation.order = 'YXZ';

        // let constant = new THREE.Quaternion( 0.5, 0.5, -0.5,  0.5);

        let quaternion = new THREE.Quaternion(this.getFixedNumber(this.read.qy),
                                              -this.getFixedNumber(this.read.qx),
                                              this.getFixedNumber(this.read.qz),
                                              -this.getFixedNumber(this.read.qw));

        // .normalize()
        // .inverse();

        const a = new THREE.Euler();
        a.setFromQuaternion(quaternion, 'YXZ');
        let quaternionFromEuler = new THREE.Quaternion();
        // quaternionFromEuler.setFromEuler(a);
        // quaternion = quaternionFromEuler;

        // console.log(a.z * 180 / Math.PI)
        // let quaternion = new THREE.Quaternion(-this.getFixedNumber(this.read.qx),
        //     this.getFixedNumber(this.read.qy),
        //     this.getFixedNumber(-this.read.qz),
        //     this.getFixedNumber(this.read.qw))
        // .conjugate();
        // debugger;
        // quaternion.slerp(constant, 0.1);

        let filterOutThisQuaternion = this.handleSession(quaternion);

        if (!filterOutThisQuaternion) {
            if (this.sessionStatus === "session_in_progress") {
                this.requestsToSend.push({
                                             timestamp: Math.floor(Date.now() / 1000),
                                             x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w,
                                         });
            } else {
                if (this.prevSessionStatus === "session_in_progress" && this.sessionStatus === "session_awaiting") {
                    this.prevSessionStatus = "session_awaiting";
                    const url = "/api/save_session";

                    axios({method: 'post', url: url, data: this.requestsToSend}).then((res) => {
                        this.requestsToSend = [];
                    });
                }
            }

            model.quaternion.slerp(quaternion, 0.1);
        }

        return model;
    }

    handleSession(quaternion) {
        const slowCount = 75;
        const fastCount = 25;
        const fastAvgSize = 5;
        const slowAvgSize = 15;
        let currentAvgSize = fastAvgSize;
        let currentSessionTypeCounter = fastCount;
        let filterOutThisQuaternion = false;
        if (this.sessionStatus === "session_in_progress") {
            currentSessionTypeCounter = slowCount;
            currentAvgSize = slowAvgSize;
        }
        if (this.sessionRefQuaternion === null) {
            this.prevQuaternion = quaternion;
            this.sessionRefQuaternion = quaternion;
        } else {
            // console.log(this.prevQuaternion.angleTo(quaternion) * 180 / Math.PI)
            if (this.prevQuaternion.angleTo(quaternion) * 180 / Math.PI > 180) {
                console.log("Anomaly detected - Filtering anomaly!!");
                filterOutThisQuaternion = true;
            }

            if (!filterOutThisQuaternion) {
                let arr = ["x", "y", "z", "w"];
                this.countQuaternions++;
                arr.forEach(x => this.sumQuaternions += Math.abs(this.sessionRefQuaternion[x] - quaternion[x]));

                this.prevQuaternion = quaternion;
            }
        }

        if (!filterOutThisQuaternion) {

            if (this.countQuaternions === currentSessionTypeCounter) {
                this.streamAvg.push(this.sumQuaternions);
                // console.log(this.sumQuaternions)
                // if ()
                this.countQuaternions = 0;
                this.sumQuaternions = 0;
            }

            if (this.streamAvg.length === currentAvgSize) {
                let vectorAvgDistance = this.streamAvg.reduce((x, y) => x + y) / this.streamAvg.length;
                this.prevSessionStatus = this.sessionStatus;
                this.sessionStatus = vectorAvgDistance > 5.5 ? "session_in_progress" : "session_awaiting";
                console.log(this.sessionStatus);

                this.streamAvg = [];
                this.sessionRefQuaternion = quaternion;
            }
        }

        return filterOutThisQuaternion;
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
                                            child.rotation.x = -Math.PI / 4;
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

                                            cube = new THREE.Mesh(parentGeo, parentMaterial.clone());
                                            cube.material.visible = false;

                                            child = new THREE.Mesh(child.geometry, child.material.clone());

                                            // cube.visible = false;
                                            // cube.material.transparent = true
                                            // cube.material.wireframe = true;
                                            cube.position.x = -Math.PI;
                                            cube.position.y = Math.PI / 2;
                                            cube.position.z = Math.PI / 6;
                                            cube.geometry.computeFaceNormals();
                                            cube.geometry.computeVertexNormals();
                                            cube.geometry.scale(1, 1, 1);
                                            cube.geometry.uvsNeedUpdate = true;
                                            cube.add(child);
                                            cube.name = 'hand';
                                            scene.add(cube);

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

        camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);
        camera.position.z = -75;
        camera.lookAt(0,0,0)
        camera.rotation.order = 'YXZ';
        // camera.rotation.z = Math.PI;
        // camera.setRotationFromQuaternion(new THREE.Quaternion(1,2,3,4))
        // let controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableDamping = true;   //damping
        // controls.dampingFactor = 0.25;   //damping inertia
        // controls.enableZoom = true;      //Zooming
        // controls.maxPolarAngle = Math.PI / 2;
        // controls.enableRotate = true;
        //
        // controls.update();

        // if (model) {
        //   cube.add(model)
        // }
        // scene.add(cube)
        scene.add(light);

        // renderer.render(scene, camera)
        return {scene: scene, renderer: renderer, camera: camera};
    }

    getRealWorldVertices(threeDObject) {
        const realWorldMap = [];

        threeDObject.geometry.vertices.forEach((v) => {
            const vector = v.clone();
            vector.applyMatrix4(threeDObject.matrixWorld);
            realWorldMap.push(vector);
        });
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

    startMotionTracking() {
        // console.log(model)
        let renderer = this.playGroundElements.renderer;
        let scene = this.playGroundElements.scene;
        let camera = this.playGroundElements.camera;
        let model = this.model;
        // camera.rotation.z += 1
        this.resizeCanvasToDisplaySize(camera, renderer);

        if (this.isSet === false && scene.getObjectByName('hand')) {
            this.model = scene.getObjectByName('hand');
            // this.model.setRotationFromQuaternion(new THREE.Quaternion(0, 0, 0, 1));
            console.log(model);
            this.isSet = true;
        }
        if (model) {
            const rw = this.getRealWorldVertices(model);
            // console.log(...rw)
            this.modelRotator.rotateModel(model);
            // this.model.rotation.x += 0.01
            const faceVertices = Utils.KNN.generateDistanceMap(rw, [0, 0, 100], 3);
            // console.log(findFaceForVertices(tetrahedron, faceVertices));
            const temp = faceVertices.map((v) => v.distance);
            const sd = Utils.STATS.standardDeviation(temp);
            // console.log(sd)
            const currentFace = this.findFaceForVertices(model, faceVertices) || 1;
            // console.log('rotx' + model.rotation.x + ' ' + model.rotation.y + ' ' + model.rotation.z)
            if (Math.abs(sd) < 40) {
                // console.log('prev:' + this.prevFace)
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

                // console.log('Lock on face num: ' + this.findFaceForVertices(model, faceVertices))
            } else {
                // console.log('waiting for face lock on....')
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
