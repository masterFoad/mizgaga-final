/**
 * Created By Foad - 23/Jan/2020
 */

import {serverUrl} from "../common/server-const";

const getSensorHeartbeat = async () => {
    const res = await fetch(
        serverUrl + 'api/get-sensor-heartbeat');
    return await res.text();
};

/**
 * creating an inline web worker that will fetch-validate the input csv.
 * @returns {Worker}
 * @constructor
 */
const WorkerCreator = () => {

    const fetchFunction = "setInterval(() => {\n"
                          + "    self.postMessage();\n"
                          + "}, 2000);";

    const blob = new Blob([
                              "onmessage = function(e) { "
                              + fetchFunction + ";\n  "
                              + "}"]);

    const blobURL = window.URL.createObjectURL(blob);

    return new Worker(blobURL);
};

export const monitorSensorHeartbeat = async (callback, reConnectionInterval) => {
    const worker = WorkerCreator();

    // on web worker done - receive message here.
    // when message arrives, process errors.
    // when done - terminate worker.
    worker.onmessage = async (event) => {
        if (event.data) {
            console.log(event);
            // reConnectionInterval = setInterval(async () => {
            //     let connectionStatus = await getSensorHeartbeat();
            //     console.log(' current Sensor status :' + (connectionStatus === '' ? 'connecting' : connectionStatus));
            //     callback();
            // }, 1500);

            // worker.terminate();
        }
    };

    // // start the web worker and send payload.
    // worker.postMessage(status);
};
