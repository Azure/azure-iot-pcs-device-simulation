[![Build][build-badge]][build-url]
[![Issues][issues-badge]][issues-url]
[![Gitter][gitter-badge]][gitter-url]

Azure IoT Device Simulation
========
[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://www.azureiotsolutions.com/Accelerators#solutions/types/DS)


<div align="center">
<img src="https://user-images.githubusercontent.com/33666587/39657377-33612fc8-4fbc-11e8-98a8-58906236238a.png" width="600" height="auto"/>
</div>

Overview
========

Device simulation helps you create simulated devices that look and behave like the real thing. It simulates IoT devices and the way they send messages to Azure. With Device simulation you can gather, process, analyze and act on data from simulated devices allowing you to test your solutions end to end throughout the development lifecycle. It’s easy to integrate into any solution you want to test. Device Simulation makes it easy for you to configure an [Azure IoT Hub][iot-hub] for the first time, or to add your own pre-existing hub.

Choose from a collection sample devices (chiller, elevator, or truck), or define your own device specs.  Then, define the number of devices to simulate (thousands or more), and the frequency at which they send telemetry.  Scale test and get a preview of your ROI, and control your costs by setting limits on simulated device run time.  

Get started quickly using provided sample devices, create quick custom devices through the UX, or define complex custom devices with a JSON definition file and behavior scripts.

### Documentation
See more documentation [here](https://docs.microsoft.com/en-us/azure/iot-accelerators/quickstart-device-simulation-deploy).

Getting Started
===============

## Deploy a solution
* Deploy using the web interface using the instructions [here](https://docs.microsoft.com/en-us/azure/iot-accelerators/quickstart-device-simulation-deploy).

Common Scenarios
================
## Use a sample device or create a custom device
Once you have a solution up and running, you can simulate sample devices or a custom device(https://docs.microsoft.com/en-us/azure/iot-accelerators/iot-accelerators-device-simulation-custom-model). 

Architecture Overview
=====================
<div align="center">
<img src="simarch.png" width="700" height="auto"/>
</div>

[Learn more](https://docs.microsoft.com/azure/iot-suite/iot-suite-remote-monitoring-sample-walkthrough) about the Remote Monitoring architecture, including the use of microservices and Docker containers.

How-to and Troubleshooting Resources
====================================
* [Developer Reference Guide](https://github.com/Azure/device-simulation-dotnet/wiki/Simulation-Service-Developer-Reference-Guide)

Feedback
========
* If you have feedback, feature requests, or find a problem, you can create
  a new issue in the [GitHub Issues][issues-url]
* We also have a [User Voice](https://feedback.azure.com/forums/321918-azure-iot) channel to receive suggestions for features and future supported scenarios.

Contributing
============
Refer to our [contribution guidelines](docs/CONTRIBUTING.md)

License
=======
Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE) License.

[build-badge]: https://img.shields.io/travis/Azure/azure-iot-pcs-simulation.svg
[build-url]: https://travis-ci.org/Azure/azure-iot-pcs-simulation
[issues-badge]: https://img.shields.io/github/issues/azure/azure-iot-pcs-simulation.svg
[issues-url]: https://github.com/azure/azure-iot-pcs-simulation/issues
[gitter-badge]: https://img.shields.io/gitter/room/azure/iot-solutions.js.svg
[gitter-url]: https://gitter.im/Azure/iot-solutions
