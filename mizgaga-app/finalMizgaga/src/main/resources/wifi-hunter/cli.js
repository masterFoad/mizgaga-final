#!/usr/bin/env node
const [, , ...args] = process.argv;
// console.log(`Connecting this pc and the sensor to the same network: ${args[0]}`);
var wifi = require('node-wifi');
var fetch = require('node-fetch');

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
              iface: null // network interface, choose a random wifi interface if set to null
          });

// Scan networks
wifi.scan((error, networks) => {
    if (error) {
        console.log(error);
    } else {
        // console.log(networks);

        const isNetworkFound = networks.find(network => network.ssid === args[0]);
        if (isNetworkFound) {

            if (networks.filter(network => network.ssid === 'config_me!').length === 0) {
                wifi.connect({ssid: args[0], password: args[1]}, error => {
                    console.log("connected to the same wifi as the sensor " + args[0]);
                    console.log("success");
                });
            } else {
                networks.filter(network => network.ssid === 'config_me!').forEach(network => {
                    wifi.connect({ssid: 'config_me!'}, error => {
                        if (error) {
                            if (error.toString().includes("Duplicate Content-Length")) {
                                console.log("success");
                            } else {
                                console.log('failed to connect to config_me!');
                                console.log(error);
                            }
                        }

                        if (args && args[0] && args[1]) {
                            fetch(`http://192.168.4.1/wifisave?s=${encodeURIComponent(args[0])}&p=${encodeURIComponent(
                                args[1])}`, {
                                      method: 'get',
                                      headers: {
                                          // 'Content-Type': 'text/html'
                                          'Content-Type': 'application/x-www-form-urlencoded',
                                      },
                                  }).then(res => {
                                wifi.connect({ssid: args[0], password: args[1]}, error => {
                                    console.log("connected to the same wifi as the sensor");
                                    console.log("success");
                                });
                            })
                                .catch(err => {
                                    if (err.toString().includes("Duplicate")) {
                                        console.log("sensor is successfully connected to " + args[0]);
                                        wifi.connect({ssid: args[0], password: args[1]}, error => {
                                            console.log("connected to the same wifi as the sensor " + args[0]);
                                            console.log("success");
                                        });
                                    } else {
                                        console.log('failed to connect to config_me!');
                                        console.log(err);
                                    }
                                });
                        }

                        // console.log('Connected');
                    });
                });
            }
        } else {
            console.log("requested network not found");
        }

    }
});
