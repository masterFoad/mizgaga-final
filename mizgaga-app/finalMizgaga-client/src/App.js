import React from 'react';
import './App.css';
import Splitscreen from "./components/SplitScreen";
import {serverUrl} from "./common/server-const";
import {ModelRotator, PlayGround} from "./scripts/app/view/PurePlayGround";
import {SensorDataHandler} from "./scripts/app/model/motion_sensor/SensorDataHandler";
import {ConnectToSensor} from "./scripts/app/model/motion_sensor/ConnectionManager";
import {css} from "@emotion/core";
import {
    PuffLoader,
    RingLoader
} from "react-spinners";

const override = css`
  position: fixed;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
`;

const calibrating = css`
  position: fixed;
  top: 45%;
  left: 25%;
  transform: translate(-50%, -50%);
  z-index: 100;
`;

export default class App extends React.Component {

    constructor() {
        super();
        this.state = {
            sensorIp: '',
            connectionReady: false,
            sensor: null,
            currentFace: 0,
            isSettingMpu: false
        };

        let PlayGround = null;
    }

    setSensorState = (sensor, isReady) => {
        this.setState({sensor: sensor, connectionReady: isReady});
    };

    setCurrentFace = (face) => {
        this.setState({currentFace: face});
    };

    settingUpMpu = (bool) => {
        this.setState({isSettingMpu: bool});
    };

    async componentWillMount() {
        this.reConnectionInterval = setInterval(async () => {
            let sensorIp = await this.getSensorIp();
            // console.log(' current Sensor ip :' + (sensorIp === '' ? 'connecting' : sensorIp));
            this.setState({sensorIp: sensorIp, connectionReady: sensorIp !== ''});
        }, 3000);
    }

    componentWillUnmount() {
        // clearing the intervals
        console.log("closing reconnecting scheduler");
        if (this.reConnectionInterval) {
            clearInterval(this.reConnectionInterval);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log("will update");
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        // console.log(nextState);
        // Reconnection state
        if (this.state.sensorIp !== '' && nextState.sensorIp === '' && this.state.sensor) {
            window.location.reload(true);
        }
        //
        // on connection event
        if (!this.PlayGround && nextState.sensor && nextState.connectionReady === true) {
            if (nextState.sensorIp !== '') {
                let webSocketIp = 'ws://' + nextState.sensorIp + ':81/';
                if (nextState.connectionReady === true) {
                    // init data handler
                    let sensorDataHandler = new SensorDataHandler(webSocketIp, this.settingUpMpu, nextState.sensorIp);
                    sensorDataHandler.start(nextState.sensor);

                    // init rotator
                    let modelRotator = new ModelRotator(webSocketIp);
                    modelRotator.initSensorListener(webSocketIp);

                    // init 3d app
                    this.PlayGround = new PlayGround(webSocketIp, {DOM: '3dApp'});
                    this.PlayGround.initSensorListener(modelRotator);
                    this.PlayGround.initStateUpdater(this.setCurrentFace);
                    this.PlayGround.startMotionTracking();
                }
            }
        }
    }

    getSensorIp = async () => {
        const res = await fetch(
            serverUrl + 'api/get-sensor-address');
        return await res.text();
    };

    render() {
        // console.log(this.state.sensorIp);
        // console.log(this.state.connectionReady);
        // console.log(this.state.currentFace);
        return (
            <div id="root">
                <Splitscreen
                    connectionReady={this.state.connectionReady}
                    currentFace={this.state.currentFace}/>
                <React.Fragment>
                    {this.state.sensorIp !== '' ?
                     <ConnectToSensor
                         sensorIp={this.state.sensorIp}
                         sensorAddress={'ws://' + this.state.sensorIp + ':81/'}
                         setSensorState={this.setSensorState}/> : null}
                </React.Fragment>
                {this.state.sensorIp !== '' && this.state.connectionReady === true ? null : <div>
                    <PuffLoader
                        css={override}
                        size={80}
                        color={"#123abc"}
                        loading={this.state.sensorIp === ''}
                    />
                    <h4 style={{
                        position: "fixed",
                        top: '55%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>{this.state.sensorIp === '' ? 'Searching for sensor on network...'
                                                   : 'Trying to connect...'}</h4>
                </div>
                }
                {this.state.sensorIp !== '' && this.state.connectionReady === true && this.state.isSettingMpu === false
                 ? <div>
                     <RingLoader
                         css={calibrating}
                         size={80}
                         color={"#123abc"}
                         loading={this.state.isSettingMpu === false}
                     />
                     <h4 style={{
                         position: "fixed",
                         top: '55%',
                         left: '25%',
                         transform: 'translate(-50%, -50%)'
                     }}>{"Calibrating, please wait!"}</h4>
                 </div> : null
                }
            </div>
        );
    }
}
