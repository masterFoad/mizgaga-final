import ConnectToSensor from './ConnectionManager';
import eventHandlerInstance from '../../../libs/EventHandler';

const average = nums => {
    return nums.reduce((a, b) => (a + b)) / nums.length;
};

export class SensorDataHandler {
    // constructor (sensorAddress, epsilon = 6.0, OFFSET = 200, SLIDING_WINDOW_SIZE = 20, PACKET_AVG_SIZE = 10)
    // VERY GOOD (sensorAddress, epsilon = 2.0, OFFSET = 300, SLIDING_WINDOW_SIZE = 20, PACKET_AVG_SIZE = 10)
    // EXCELLENT (sensorAddress, epsilon = 0.1, OFFSET = 300, SLIDING_WINDOW_SIZE = 3, PACKET_AVG_SIZE = 3)
    constructor(sensorAddress, isMpuReadyCallback, sensorIp, epsilon = 2, OFFSET = 150, SLIDING_WINDOW_SIZE = 1,
                PACKET_AVG_SIZE = 1) {
        this.sensorIp = sensorIp;
        this.sensorAddress = sensorAddress;
        this.epsilon = epsilon;
        this.OFFSET = OFFSET;
        this.SLIDING_WINDOW_SIZE = SLIDING_WINDOW_SIZE;
        this.PACKET_AVG_SIZE = PACKET_AVG_SIZE;
        this.isMPURdy = false;
        // setting up events
        this.CURRENT_OFFSET = null;
        // the running averages which will give us the delta to get the angle.
        this.SLIDING_WINDOW_AVGS = null;
        this.currentReading = null;

        this.rotation_dt = 0.001;
        this.alpha = 2 * Math.PI / (2 * Math.PI + this.rotation_dt);
        this.acc_dt = 1 - this.alpha;
        this.const = this.alpha;

        this.lastXCalls = [];
        this.waitForWindowToBeFilled = true;

        this.angle_pitch = 0;
        this.resetEvents = this.resetEvents.bind(this);
        this.transmitEvents = this.transmitEvents.bind(this);
        this.registerSensorSpecificEvents = this.registerSensorSpecificEvents.bind(this);
        this.dispatchRotationEvent = this.dispatchRotationEvent.bind(this);
        this.SETUP_MPU_DATA = this.SETUP_MPU_DATA.bind(this);
        this.getXPackets = this.getXPackets.bind(this);
        this.getJsonFromDataPacket = this.getJsonFromDataPacket.bind(this);
        this.calculateOffset = this.calculateOffset.bind(this);
        this.start = this.start.bind(this);
        this.cropAngles = this.cropAngles.bind(this);
        // todo -- check the variance of the sliding window, if its bellow a threshold, it means the model is
        // stationary, and start a reset procedure.
        // this.start();
        this.settingUpMpuCallback = isMpuReadyCallback;
        this.settingUpMpuCallback(false);

        this.windowValues = [];
        this.toResetEventCount = 0;
    }

    async getJsonFromDataPacket(data, withOffSet) {
        let filteredString = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i] === '}') {
                filteredString = data.substring(0, i + 1);
                break;
            }
        }
        if (filteredString) {
            let tmp = JSON.parse(filteredString);

            if (tmp === "" || JSON.stringify(filteredString).includes("\"qw\":0,\"qx\":0,\"qy\":0,\"qz\":0")) {
                this.toResetEventCount++;
                if (this.toResetEventCount === 400) { // every 25 ms -> meaning we will get 400 after 10 seconds.
                    this.toResetEventCount = 0;
                    try {
                        await fetch(
                            this.sensorIp + '/restart');
                    } catch (e) {
                        console.log(e);
                    }
                }
            } else {
                this.toResetEventCount = 0;
                this.dispatchRotationEvent(0, tmp.qw, 'qw' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.qx, 'qx' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.qy, 'qy' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.qz, 'qz' + this.sensorAddress, 0);

                this.dispatchRotationEvent(0, tmp.angle_x, 'angle_x' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.angle_y, 'angle_y' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.angle_z, 'angle_z' + this.sensorAddress, 0);
                this.dispatchRotationEvent(0, tmp.qz, 'qz' + this.sensorAddress, 0);
            }
        }

        return {};
    }

    start = (sensorConnector) => {
        this.registerSensorSpecificEvents();
        sensorConnector.onmessage = this.onmessage.bind(this);
    };

    registerSensorSpecificEvents() {
        this.transmitEvents();
        this.resetEvents();
    }

    transmitEvents() {
        eventHandlerInstance.registerEvent('qw' + this.sensorAddress);
        eventHandlerInstance.registerEvent('qx' + this.sensorAddress);
        eventHandlerInstance.registerEvent('qy' + this.sensorAddress);
        eventHandlerInstance.registerEvent('qz' + this.sensorAddress);

        eventHandlerInstance.registerEvent('angle_x' + this.sensorAddress);
        eventHandlerInstance.registerEvent('angle_y' + this.sensorAddress);
        eventHandlerInstance.registerEvent('angle_z' + this.sensorAddress);
    }

    resetEvents() {
        eventHandlerInstance.addEventListener('connectionReset' + this.sensorAddress, (e) => {
            this.isMPURdy = e();
        });
    }

    getXPackets(data, numOfPackets, withOffSet) {
        let temp = data.slice(-numOfPackets);
        return temp;
    }

    getPacketAverages(packets) {
        let avgs = {gx: 0, gy: 0, gz: 0, ax: 0, ay: 0, az: 0, anglePitchAcc: 0, angleRollAcc: 0};
        for (let i = 0; i < packets.length; i++) {
            avgs.gx += packets[i].GyX;
            avgs.gy += packets[i].GyY;
            avgs.gz += packets[i].GyZ;
            avgs.ax += packets[i].AcX;
            avgs.ay += packets[i].AcY;
            avgs.az += packets[i].AcZ;
            if (packets.anglePitchAcc != null && packets.angleRollAcc != null) {
                avgs.anglePitchAcc += packets[i].anglePitchAcc;
                avgs.angleRollAcc += packets[i].angleRollAcc;
            }
        }
        avgs.gx /= packets.length;
        avgs.gy /= packets.length;
        avgs.gz /= packets.length;
        avgs.ax /= packets.length;
        avgs.ay /= packets.length;
        avgs.az /= packets.length;

        if (avgs.anglePitchAcc !== 0 && avgs.angleRollAcc !== 0) {
            avgs.anglePitchAcc /= packets.length;
            avgs.angleRollAcc /= packets.length;
        }
        // console.log('Averages: - ' + avgs.gx + ' ' + avgs.gy + ' ' + avgs.gz)
        // console.log('Averages x: - ' + avgs.gx * 180 / Math.PI)
        return avgs;
    }

    calculateOffset(data, size) {
        return this.getPacketAverages(data.slice(-size));
    }

    SETUP_MPU_DATA({data}) {
        if (this.isMPURdy === false) {
            console.log('Setting up MPU');
            // setting up offset
            if (this.CURRENT_OFFSET === null) {
                this.lastXCalls.push(this.getJsonFromDataPacket(data));
                if (this.lastXCalls.length === this.OFFSET) {
                    this.CURRENT_OFFSET = this.calculateOffset(this.lastXCalls, this.OFFSET);
                    this.lastXCalls = [];
                }
            }
            if (this.CURRENT_OFFSET !== null) {
                this.isMPURdy = true;
                this.settingUpMpuCallback(true);
            }
        }
    }

    cropAngles(angle) {
        return angle;
    }

    onmessage(event) {
        this.SETUP_MPU_DATA(event);

        if (this.isMPURdy === true) {
            this.currentReading = this.getJsonFromDataPacket(event.data, true);
        }
    }

    dispatchRotationEvents(packetAverages) {
        this.dispatchRotationEvent(0, this.cropAngles(packetAverages.GyX) * Math.PI / 180,
                                   'rotateX' + this.sensorAddress, 0);
        this.dispatchRotationEvent(0, this.cropAngles(packetAverages.GyY) * -1 * Math.PI / 180,
                                   'rotateY' + this.sensorAddress, 0);
        this.dispatchRotationEvent(0, this.cropAngles(packetAverages.GyZ) * -1 * Math.PI / 180,
                                   'rotateZ' + this.sensorAddress, 0);
    }

    dispatchRotationEvent(window, packetAxisData, action, defaultVal) {
        // console.log(packetAxisData)
        eventHandlerInstance.dispatchEvent(action, () => packetAxisData);
    }

    getCurrentReading() {
        return this.currentReading;
    }
}
