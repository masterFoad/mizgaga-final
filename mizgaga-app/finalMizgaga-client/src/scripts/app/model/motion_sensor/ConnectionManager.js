import eventHandlerInstance from '../../../libs/EventHandler';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as React from "react";
import {serverUrl} from "../../../../common/server-const";

const typeOptions = {
    WebSocket: undefined, // WebSocket constructor, if none provided, defaults to global WebSocket
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    reconnectionDelayGrowFactor: 1.3,
    minUptime: 5000,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    maxEnqueuedMessages: 1000,
    startClosed: false,
    debug: false
};

export class ConnectToSensor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sensorConnection: ""
        };
    }

    initSensorWebsocketConnection = () => {
        if (this.props.sensorAddress !== '') {
            console.log('Connecting to ' + this.props.sensorAddress);
        } else {
            console.log('Searching for sensor ip');
        }

        // this.sensorName = sensorName;
        this.sensorAddress = this.props.sensorAddress;
        // this.getSensorAddress = this.getSensorAddress.bind(this);

        // 'ws://' + "192.168.43.173" + ':81/', null, typeOptions)
        this.server = new ReconnectingWebSocket(this.sensorAddress, null, typeOptions);
        eventHandlerInstance.registerEvent('connectionReset' + this.sensorAddress);

        this.server.addEventListener('open', () => {
            console.log('Connection is open to: ' + this.props.sensorAddress);
            this.props.setSensorState(this.server, true);
        });

        this.server.addEventListener('error', () => {
            console.log('Error connecting to: ' + this.props.sensorAddress);
            this.props.setSensorState(null, false);
            // try {
            //     fetch(
            //         this.props.sensorIp + '/restart');
            // } catch (e) {
            //     console.log(e);
            // }
        });
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.state.sensorConnection !== nextState.sensorConnection || nextProps.sensorIp === "";
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.sensorConnection === "DISCONNECTED") {
            if (this.server && this.server.close) {
                console
                    .log("disconnected!!@$R!@#$");
                this.props.setSensorState(null, false);
                this.server.close();
                this.server = null;
            }
        }

        if (this.state.sensorConnection === "CONNECTED") {
            if (!this.server) {
                console.log("CONNECTED AA?");
                this.initSensorWebsocketConnection();
            }
        }
    }

    getSensorHeartbeat = async () => {
        const res = await fetch(
            serverUrl + 'api/get-sensor-heartbeat');
        return await res.text();
    };

    async componentWillMount() {
        this.initSensorWebsocketConnection();

        this.reConnectionInterval = setInterval(async () => {
            let connectionStatus = await this.getSensorHeartbeat();
            console.log(' current Sensor status :' + (connectionStatus === '' ? 'connecting' : connectionStatus));
            this.setState({sensorConnection: connectionStatus});
        }, 3000);

        // await monitorSensorHeartbeat((status) => this.setConnectionState(status));
    }

    componentWillUnmount() {
        // clearing the intervals
        if (this.reConnectionInterval) {
            clearInterval(this.reConnectionInterval);
        }
    }

    render() {
        return false;
    }
}
